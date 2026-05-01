/**
 * Storiom Prerender Service
 * 
 * Renders store pages in headless Chrome for search engine crawlers.
 * Nginx forwards bot requests here; regular users get the normal SPA.
 * 
 * Usage:
 *   cd prerender && npm install && npm start
 *   
 * Runs on port 3030 by default.
 */

const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PRERENDER_PORT || 3030;

// Target: where the actual SPA is served
const TARGET_HOST = process.env.TARGET_HOST || 'http://localhost:4200';

// Cache: URL → { html, timestamp }
const cache = new Map();
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '86400000'); // 24 hours default
const MAX_CACHE_SIZE = parseInt(process.env.MAX_CACHE_SIZE || '5000');

// Puppeteer browser instance (reused)
let browser = null;

async function getBrowser() {
    if (!browser || !browser.isConnected()) {
        browser = await puppeteer.launch({
            headless: 'new',
            // Use system Chrome if available (set CHROME_PATH or auto-detect)
            executablePath: process.env.CHROME_PATH || undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-background-networking',
                '--single-process'
            ]
        });
        console.log('Puppeteer browser launched');
    }
    return browser;
}

async function renderPage(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        // Set a user agent that is NOT in the Nginx bot list
        await page.setUserAgent('Mozilla/5.0 (compatible; StoriomPrerender/1.0)');

        // Block unnecessary resources to speed up rendering
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['font', 'media'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Navigate and wait for network to mostly settle
        await page.goto(url, {
            waitUntil: 'networkidle2',  // 2 connections allowed (more reliable for SPAs)
            timeout: 20000
        });

        // Smart wait: poll until Angular has rendered meaningful content
        // Look for signs that Angular has finished rendering
        try {
            await page.waitForFunction(() => {
                // Check if Angular rendered the store landing, product page, or products list
                const hasStoreContent = document.querySelector('.store-landing, .product-page, .store-products');
                // Check if title was set (Angular sets it dynamically)
                const hasTitle = document.title && document.title.length > 0 && document.title !== 'Storiom';
                // Check if meta description exists
                const hasMeta = document.querySelector('meta[property="og:title"]');
                return hasStoreContent || hasTitle || hasMeta;
            }, { timeout: 10000 });
        } catch (waitErr) {
            // If smart wait times out, use a generous fixed delay
            console.log(`Smart wait timed out for ${url}, using fixed delay`);
        }

        // Extra buffer for any remaining Angular rendering
        await page.waitForTimeout(2000);

        // Get the rendered HTML
        const html = await page.content();
        return html;
    } catch (err) {
        console.error(`Error rendering ${url}:`, err.message);
        return null;
    } finally {
        await page.close();
    }
}

// Health check
app.get('/prerender-health', (req, res) => {
    res.json({
        status: 'ok',
        cacheSize: cache.size,
        uptime: process.uptime()
    });
});

// Cache management endpoint
app.post('/prerender-clear-cache', (req, res) => {
    const storeSlug = req.query.store;
    if (storeSlug) {
        // Clear cache for specific store
        let cleared = 0;
        for (const [key] of cache) {
            if (key.includes(storeSlug) || key.includes(`store`)) {
                cache.delete(key);
                cleared++;
            }
        }
        console.log(`Cleared ${cleared} cached pages for store: ${storeSlug}`);
        res.json({ success: true, cleared });
    } else {
        // Clear all cache
        const size = cache.size;
        cache.clear();
        console.log(`Cleared entire cache: ${size} pages`);
        res.json({ success: true, cleared: size });
    }
});

// Main prerender handler
app.get('*', async (req, res) => {
    // Use the original host (subdomain or custom domain) — forwarded by Nginx
    const host = req.get('host') || req.get('x-forwarded-host') || 'localhost';
    const protocol = req.get('x-forwarded-proto') || 'https';
    const cacheKey = host + req.originalUrl; // cache per domain+path

    // Skip non-HTML requests
    if (cacheKey.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|map|json)$/i)) {
        return res.status(404).send('Not found');
    }

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        res.set('X-Prerender-Cache', 'hit');
        return res.send(cached.html);
    }

    // Build the URL to render using the ORIGINAL domain (not TARGET_HOST)
    const renderUrl = protocol + '://' + host + req.originalUrl;
    console.log(`[RENDERING] ${renderUrl}`);

    const startTime = Date.now();
    const html = await renderPage(renderUrl);
    const duration = Date.now() - startTime;

    if (!html) {
        console.error(`[FAILED] ${renderUrl} after ${duration}ms`);
        return res.status(500).send('Render failed');
    }

    console.log(`[RENDERED] ${cacheKey} in ${duration}ms (${(html.length / 1024).toFixed(1)}KB)`);

    // Evict oldest entry if cache is full
    if (cache.size >= MAX_CACHE_SIZE) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }

    // Store in cache
    cache.set(cacheKey, { html, timestamp: Date.now() });

    res.set('X-Prerender-Cache', 'miss');
    res.set('X-Prerender-Duration', `${duration}ms`);
    res.send(html);
});

// Start server
app.listen(PORT, () => {
    console.log(`Storiom Prerender Service running on port ${PORT}`);
    console.log(`Target: ${TARGET_HOST}`);
    console.log(`Cache TTL: ${CACHE_TTL / 1000}s | Max cache: ${MAX_CACHE_SIZE} pages`);

    // Pre-warm Puppeteer
    getBrowser().then(() => console.log('Puppeteer ready'));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down prerender service...');
    if (browser) await browser.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Shutting down prerender service...');
    if (browser) await browser.close();
    process.exit(0);
});
