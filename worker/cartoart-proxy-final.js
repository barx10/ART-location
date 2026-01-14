/**
 * Cloudflare Worker - CORS Proxy for Carto-Art API
 * FINAL VERSION - Uses X-API-Key header for reliable CORS handling
 */

const CARTOART_API = 'https://cartoart.net/api/v1/posters/generate';

// Allowed origins (add your domains here)
const ALLOWED_ORIGINS = [
    'https://barx10.github.io',
    'https://art-location.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

function getCorsHeaders(origin) {
    // Check if origin is in allowed list or is a Vercel preview deployment
    const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
                      (origin && origin.endsWith('.vercel.app'));

    const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
    };
}

export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get('Origin') || '';
        const corsHeaders = getCorsHeaders(origin);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        // Only allow POST requests
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        try {
            const bodyText = await request.text();

            // Try to get API key from multiple sources
            let apiKey = request.headers.get('X-API-Key');

            if (!apiKey) {
                const authHeader = request.headers.get('Authorization');
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    apiKey = authHeader.replace('Bearer ', '');
                }
            }

            if (!apiKey) {
                console.log('No API key found in headers');
                return new Response(JSON.stringify({
                    error: 'Missing API key. Expected X-API-Key header or Authorization: Bearer header',
                    received_headers: {
                        'X-API-Key': request.headers.get('X-API-Key') ? 'present' : 'missing',
                        'Authorization': request.headers.get('Authorization') ? 'present' : 'missing'
                    }
                }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            console.log('Forwarding request to CartoArt API...');
            console.log('API Key:', apiKey.substring(0, 8) + '...');

            // Forward request to Carto-Art API with Bearer token
            const response = await fetch(CARTOART_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: bodyText
            });

            console.log('CartoArt API response status:', response.status);

            // Get response data
            const responseData = await response.text();

            // Return response with CORS headers
            return new Response(responseData, {
                status: response.status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': response.headers.get('Content-Type') || 'application/json'
                }
            });

        } catch (error) {
            console.error('Proxy error:', error);
            return new Response(JSON.stringify({
                error: error.message || 'Internal proxy error'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
