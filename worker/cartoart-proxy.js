/**
 * Cloudflare Worker - CORS Proxy for Carto-Art API
 *
 * Deploy instructions:
 * 1. Go to https://workers.cloudflare.com/
 * 2. Create a new worker
 * 3. Paste this code
 * 4. Deploy and get your worker URL (e.g., https://cartoart-proxy.YOUR-SUBDOMAIN.workers.dev)
 * 5. Update PROXY_URL in js/export.js with your worker URL
 */

const CARTOART_API = 'https://cartoart.net/api/v1/posters/generate';

// Allowed origins (add your domains here)
const ALLOWED_ORIGINS = [
    'https://barx10.github.io',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

function getCorsHeaders(origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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
            // Get the request body and Authorization header
            const body = await request.text();
            const authHeader = request.headers.get('Authorization');

            // Validate Authorization header
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(JSON.stringify({
                    error: 'Missing or invalid Authorization header. Expected: Bearer <api_key>'
                }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            console.log('Forwarding request to CartoArt API...');
            console.log('Auth header:', authHeader.substring(0, 20) + '...');

            // Forward request to Carto-Art API with Bearer token
            const response = await fetch(CARTOART_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: body
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
