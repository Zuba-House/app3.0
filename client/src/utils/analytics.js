// ========================================
// CLIENT-SIDE ANALYTICS TRACKING
// ========================================

const VITE_API_URL = import.meta.env.VITE_API_URL || '';

// Session ID management
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('zuba_session');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem('zuba_session', sessionId);
    }
    return sessionId;
};

// Track page view
export const trackPageView = async (page, pageTitle = '') => {
    try {
        // Don't track if on localhost/development (optional - remove if you want dev tracking)
        // if (window.location.hostname === 'localhost') return;
        
        const sessionId = getSessionId();
        const referrer = document.referrer || 'direct';
        
        const response = await fetch(`${VITE_API_URL}/api/analytics/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page: page || window.location.pathname,
                pageTitle: pageTitle || document.title,
                referrer,
                sessionId
            }),
            // Don't wait for response - fire and forget
            keepalive: true
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.sessionId) {
                sessionStorage.setItem('zuba_session', data.sessionId);
            }
        }
    } catch (error) {
        // Silent fail - don't break the app for analytics errors
        console.debug('Analytics tracking error:', error.message);
    }
};

// Track product view
export const trackProductView = async (productId, productName) => {
    try {
        await trackPageView(`/product/${productId}`, productName);
    } catch (error) {
        console.debug('Product tracking error:', error.message);
    }
};

// Track search
export const trackSearch = async (query) => {
    try {
        await trackPageView(`/search?q=${encodeURIComponent(query)}`, `Search: ${query}`);
    } catch (error) {
        console.debug('Search tracking error:', error.message);
    }
};

// React hook for automatic page tracking
export const usePageTracking = () => {
    // This can be imported and used in App.jsx with useEffect
    // to automatically track page views on route changes
};

export default {
    trackPageView,
    trackProductView,
    trackSearch,
    getSessionId
};

