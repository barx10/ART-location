/**
 * Cloudflare Worker - CORS Proxy for Carto-Art API
 * TEST VERSION WITH EXTENSIVE LOGGING
 */

const CARTOART_API = 'https://cartoart.net/api/v1/posters/generate';

const ALLOWED_ORIGINS = [
    'https://barx10.github.io',
    'https://art-location.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

function getCorsHeaders(origin) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || (origin && origin.endsWith('.vercel.app'));
    const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
        'Access-Control-Max-Age': '86400',
    };
}

export default {
    async fetch(request, env, ctx) {
        console.log('=== WORKER REQUEST RECEIVED ===');
        console.log('Method:', request.method);
        console.log('URL:', request.url);

        const origin = request.headers.get('Origin') || '';
        console.log('Origin:', origin);

        const corsHeaders = getCorsHeaders(origin);

        if (request.method === 'OPTIONS') {
            console.log('Handling CORS preflight');
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        try {
            // Log ALL headers
            console.log('=== ALL HEADERS ===');
            for (const [key, value] of request.headers.entries()) {
                if (key.toLowerCase().includes('api') || key.toLowerCase().includes('auth')) {
                    console.log(`${key}: ${value.substring(0, 20)}...`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            const bodyText = await request.text();
            console.log('Body length:', bodyText.length);

            // Get API key from X-API-Key header
            const apiKey = request.headers.get('X-API-Key');
            console.log('X-API-Key header:', apiKey ? `${apiKey.substring(0, 10)}... (length: ${apiKey.length})` : 'NOT FOUND');

            if (!apiKey) {
                console.log('ERROR: No X-API-Key header found!');
                return new Response(JSON.stringify({
                    error: 'X-API-Key header is missing',
                    debug: {
                        headers_received: Array.from(request.headers.keys()),
                        expected: 'X-API-Key header with your Carto-Art API key'
                    }
                }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            console.log('Forwarding to Carto-Art API...');
            const response = await fetch(CARTOART_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: bodyText
            });

            console.log('Carto-Art API response status:', response.status);
            const responseData = await response.text();
            console.log('Response data length:', responseData.length);

            return new Response(responseData, {
                status: response.status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            console.error('ERROR:', error);
            return new Response(JSON.stringify({
                error: error.message,
                stack: error.stack
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
