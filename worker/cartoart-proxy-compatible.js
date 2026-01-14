/**
 * Cloudflare Worker - CORS Proxy for Carto-Art API
 * BACKWARD COMPATIBLE VERSION - works with both old and new request formats
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
            const authHeader = request.headers.get('Authorization');
            const bodyText = await request.text();

            let apiKey;
            let payload;

            // Try new format first (Authorization header + direct payload)
            if (authHeader && authHeader.startsWith('Bearer ')) {
                console.log('Using NEW format (Authorization header)');
                apiKey = authHeader.replace('Bearer ', '');
                payload = bodyText;
            } else {
                // Fallback to old format (apiKey in body)
                console.log('Using OLD format (apiKey in body)');
                const data = JSON.parse(bodyText);
                apiKey = data.apiKey;
                payload = JSON.stringify(data.cartoArtRequest);

                if (!apiKey || !data.cartoArtRequest) {
                    return new Response(JSON.stringify({
                        error: 'Missing apiKey or cartoArtRequest in body (old format) or Authorization header (new format)'
                    }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
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
                body: payload
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
