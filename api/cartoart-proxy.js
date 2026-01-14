/**
 * Vercel Serverless Function - CORS Proxy for Carto-Art API
 * This runs on Vercel, no external workers needed!
 */

export default async function handler(req, res) {
    console.log('🚀 VERCEL PROXY V2 STARTED');
    console.log('Method:', req.method);
    console.log('Headers:', Object.keys(req.headers));

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        console.log('✅ Preflight handled');
        res.status(204).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        console.log('❌ Wrong method:', req.method);
        res.status(405).json({
            error: 'Method not allowed',
            version: 'Vercel proxy v2'
        });
        return;
    }

    try {
        // Get API key from header (try multiple variations)
        const apiKey = req.headers['x-api-key'] ||
                      req.headers['X-API-Key'] ||
                      req.headers['X-Api-Key'];

        console.log('API Key found:', apiKey ? 'YES (' + apiKey.substring(0, 10) + '...)' : 'NO');

        if (!apiKey) {
            console.error('❌ No API key provided');
            console.log('All headers:', req.headers);
            res.status(401).json({
                error: 'VERCEL V2: X-API-Key header is required',
                received_headers: Object.keys(req.headers),
                version: 'Vercel proxy v2'
            });
            return;
        }

        console.log('✅ Forwarding to Carto-Art API...');

        // Forward to Carto-Art API
        const response = await fetch('https://cartoart.net/api/v1/posters/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(req.body)
        });

        console.log('✅ Carto-Art response:', response.status);

        // Get response data
        const data = await response.json();

        console.log('✅ Returning data to client');
        // Return response
        res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Proxy error:', error);
        res.status(500).json({
            error: 'VERCEL V2: ' + error.message,
            version: 'Vercel proxy v2'
        });
    }
}
