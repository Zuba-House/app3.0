import crypto from 'crypto';
import { VisitorModel } from '../models/visitor.model.js';

// ========================================
// ANALYTICS MIDDLEWARE - Track visitors
// ========================================

// List of bot user agents to filter out
const BOT_PATTERNS = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
    'java', 'perl', 'ruby', 'php', 'node-fetch', 'axios', 'postman',
    'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'slackbot', 'telegrambot', 'whatsapp',
    'applebot', 'duckduckbot', 'semrushbot', 'ahrefsbot', 'mj12bot'
];

// Pages to skip tracking (API endpoints, health checks, etc.)
const SKIP_PATHS = [
    '/api/',  // Skip ALL API endpoints (not just /api/analytics)
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/_next',
    '/static',
    '/assets'
];

// ========================================
// HELPER FUNCTIONS
// ========================================

// Hash IP for privacy
const hashIP = (ip) => {
    if (!ip) return 'unknown';
    return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET_KEY || 'salt').digest('hex').substring(0, 16);
};

// Generate session ID
const generateSessionId = () => {
    return crypto.randomBytes(16).toString('hex');
};

// Detect device type from user agent
const detectDevice = (userAgent) => {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    if (/windows|macintosh|linux|cros/i.test(ua)) return 'desktop';
    
    return 'unknown';
};

// Detect browser from user agent
const detectBrowser = (userAgent) => {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    if (ua.includes('msie') || ua.includes('trident')) return 'IE';
    
    return 'Other';
};

// Detect OS from user agent
const detectOS = (userAgent) => {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os') || ua.includes('macintosh')) return 'macOS';
    if (ua.includes('linux') && !ua.includes('android')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    if (ua.includes('cros')) return 'Chrome OS';
    
    return 'Other';
};

// Check if user agent is a bot
const isBot = (userAgent) => {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return BOT_PATTERNS.some(pattern => ua.includes(pattern));
};

// Extract domain from referrer
const extractDomain = (referrer) => {
    if (!referrer || referrer === '' || referrer === 'direct') return 'direct';
    try {
        const url = new URL(referrer);
        return url.hostname.replace('www.', '');
    } catch {
        return 'direct';
    }
};

// Get client IP from request (handles proxies)
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
};

// ========================================
// IP GEOLOCATION (Free API)
// ========================================
const geoCache = new Map(); // Simple in-memory cache
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const getGeoLocation = async (ip) => {
    // Skip for localhost/private IPs
    if (!ip || ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: 'Local', countryCode: 'LC', city: 'Localhost', region: 'Local' };
    }
    
    // Check cache first
    const cached = geoCache.get(ip);
    if (cached && (Date.now() - cached.timestamp) < GEO_CACHE_TTL) {
        return cached.data;
    }
    
    try {
        // Using ip-api.com (free, no API key needed, 45 requests/minute)
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const geoData = {
                country: data.country || 'Unknown',
                countryCode: data.countryCode || 'XX',
                city: data.city || 'Unknown',
                region: data.regionName || 'Unknown'
            };
            
            // Cache the result
            geoCache.set(ip, { data: geoData, timestamp: Date.now() });
            
            return geoData;
        }
    } catch (error) {
        console.error('Geo lookup error:', error.message);
    }
    
    return { country: 'Unknown', countryCode: 'XX', city: 'Unknown', region: 'Unknown' };
};

// ========================================
// MAIN ANALYTICS MIDDLEWARE
// ========================================
export const analyticsMiddleware = async (req, res, next) => {
    // Skip tracking for certain paths
    const path = req.path || req.url;
    if (SKIP_PATHS.some(skip => path.startsWith(skip))) {
        return next();
    }
    
    // Skip non-GET requests (we only track page views)
    if (req.method !== 'GET') {
        return next();
    }
    
    // Get user agent
    const userAgent = req.headers['user-agent'] || '';
    
    // Skip bots
    if (isBot(userAgent)) {
        return next();
    }
    
    // Don't wait for analytics - proceed immediately
    next();
    
    // Track asynchronously (non-blocking)
    setImmediate(async () => {
        try {
            const ip = getClientIP(req);
            const visitorHash = hashIP(ip);
            
            // Get or create session ID from cookie/header
            let sessionId = req.cookies?.zuba_session || req.headers['x-session-id'];
            let isNewVisitor = false;
            
            if (!sessionId) {
                sessionId = generateSessionId();
                isNewVisitor = true;
            }
            
            // Check if this visitor exists (for returning visitor detection)
            if (!isNewVisitor) {
                const existingVisitor = await VisitorModel.findOne({ visitorHash }).select('_id').lean();
                isNewVisitor = !existingVisitor;
            }
            
            // Get geolocation
            const geo = await getGeoLocation(ip);
            
            // Extract page info
            const page = path;
            const referrer = req.headers['referer'] || req.headers['referrer'] || 'direct';
            const referrerDomain = extractDomain(referrer);
            
            // Extract product/category from URL
            let productId = null;
            let categoryId = null;
            let searchQuery = null;
            
            if (path.includes('/product/')) {
                const match = path.match(/\/product\/([a-zA-Z0-9]+)/);
                if (match) productId = match[1];
            }
            if (path.includes('/category/')) {
                const match = path.match(/\/category\/([a-zA-Z0-9]+)/);
                if (match) categoryId = match[1];
            }
            if (req.query?.search || req.query?.q) {
                searchQuery = req.query.search || req.query.q;
            }
            
            // Create visitor record
            const visitor = new VisitorModel({
                sessionId,
                visitorHash,
                country: geo.country,
                countryCode: geo.countryCode,
                city: geo.city,
                region: geo.region,
                page,
                referrer,
                referrerDomain,
                userAgent,
                device: detectDevice(userAgent),
                browser: detectBrowser(userAgent),
                os: detectOS(userAgent),
                isNewVisitor,
                isBot: false,
                productId,
                categoryId,
                searchQuery
            });
            
            await visitor.save();
            
            // Update session page views if existing session
            if (!isNewVisitor) {
                await VisitorModel.updateMany(
                    { sessionId, createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } }, // Last 30 mins
                    { $inc: { pageViews: 1 } }
                );
            }
            
        } catch (error) {
            // Silent fail - don't break the app for analytics errors
            console.error('Analytics tracking error:', error.message);
        }
    });
};

// ========================================
// CLIENT-SIDE TRACKING ENDPOINT
// ========================================
export const trackPageView = async (req, res) => {
    try {
        const { page, pageTitle, referrer, sessionId: clientSessionId } = req.body;
        
        if (!page) {
            return res.status(400).json({ error: true, message: 'Page is required' });
        }
        
        const ip = getClientIP(req);
        const visitorHash = hashIP(ip);
        const userAgent = req.headers['user-agent'] || '';
        
        // Skip bots
        if (isBot(userAgent)) {
            return res.json({ success: true, tracked: false });
        }
        
        let sessionId = clientSessionId || req.cookies?.zuba_session || generateSessionId();
        
        // Check if new visitor
        const existingVisitor = await VisitorModel.findOne({ visitorHash }).select('_id').lean();
        const isNewVisitor = !existingVisitor;
        
        // Get geolocation
        const geo = await getGeoLocation(ip);
        
        // Create visitor record
        const visitor = new VisitorModel({
            sessionId,
            visitorHash,
            country: geo.country,
            countryCode: geo.countryCode,
            city: geo.city,
            region: geo.region,
            page,
            pageTitle: pageTitle || '',
            referrer: referrer || 'direct',
            referrerDomain: extractDomain(referrer),
            userAgent,
            device: detectDevice(userAgent),
            browser: detectBrowser(userAgent),
            os: detectOS(userAgent),
            isNewVisitor,
            isBot: false
        });
        
        await visitor.save();
        
        return res.json({ 
            success: true, 
            tracked: true,
            sessionId // Return session ID for client to store
        });
        
    } catch (error) {
        console.error('Track page view error:', error);
        return res.status(500).json({ error: true, message: 'Tracking failed' });
    }
};

export default analyticsMiddleware;

