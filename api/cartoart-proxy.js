/**
 * Vercel Serverless Function - CORS Proxy for Carto-Art API
 * This runs on Vercel, no external workers needed!
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Get API key from header
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            console.error('No API key provided');
            res.status(401).json({
                error: 'X-API-Key header is required',
                info: 'Vercel proxy v1'
            });
            return;
        }

        console.log('Forwarding to Carto-Art API...');

        // Forward to Carto-Art API
        const response = await fetch('https://cartoart.net/api/v1/posters/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(req.body)
        });

        console.log('Carto-Art response:', response.status);

        // Get response data
        const data = await response.json();

        // Return response
        res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: error.message,
            info: 'Vercel proxy v1'
        });
    }
}
