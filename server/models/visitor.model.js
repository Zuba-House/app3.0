import mongoose from "mongoose";

// ========================================
// VISITOR MODEL - Track site visitors
// ========================================
const visitorSchema = new mongoose.Schema({
    // Session identification
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    
    // Visitor identification (hashed IP for privacy)
    visitorHash: {
        type: String,
        required: true,
        index: true
    },
    
    // Geographic data
    country: {
        type: String,
        default: 'Unknown'
    },
    countryCode: {
        type: String,
        default: 'XX'
    },
    city: {
        type: String,
        default: 'Unknown'
    },
    region: {
        type: String,
        default: 'Unknown'
    },
    
    // Page visit data
    page: {
        type: String,
        required: true
    },
    pageTitle: {
        type: String,
        default: ''
    },
    
    // Referrer (where they came from)
    referrer: {
        type: String,
        default: 'direct'
    },
    referrerDomain: {
        type: String,
        default: 'direct'
    },
    
    // Device information
    userAgent: {
        type: String,
        default: ''
    },
    device: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown'
    },
    browser: {
        type: String,
        default: 'Unknown'
    },
    os: {
        type: String,
        default: 'Unknown'
    },
    
    // Tracking flags
    isNewVisitor: {
        type: Boolean,
        default: true
    },
    isBot: {
        type: Boolean,
        default: false
    },
    
    // Product/Category tracking (for e-commerce insights)
    productId: {
        type: String,
        default: null
    },
    categoryId: {
        type: String,
        default: null
    },
    searchQuery: {
        type: String,
        default: null
    },
    
    // Session data
    sessionStart: {
        type: Date,
        default: Date.now
    },
    sessionDuration: {
        type: Number,
        default: 0 // in seconds
    },
    pageViews: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// ========================================
// INDEXES for efficient queries
// ========================================
visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days (cost-effective)
visitorSchema.index({ country: 1, createdAt: -1 });
visitorSchema.index({ page: 1, createdAt: -1 });
visitorSchema.index({ device: 1, createdAt: -1 });
visitorSchema.index({ sessionId: 1, createdAt: -1 });

// Compound indexes for common queries
visitorSchema.index({ 
    createdAt: -1, 
    country: 1 
});

// ========================================
// DAILY STATS MODEL - Aggregated daily data (more efficient)
// ========================================
const dailyStatsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
        // Note: unique + TTL index is created via schema.index() below
    },
    
    // Visitor counts
    totalVisits: {
        type: Number,
        default: 0
    },
    uniqueVisitors: {
        type: Number,
        default: 0
    },
    newVisitors: {
        type: Number,
        default: 0
    },
    returningVisitors: {
        type: Number,
        default: 0
    },
    
    // Page views
    totalPageViews: {
        type: Number,
        default: 0
    },
    
    // Countries breakdown
    countries: [{
        country: String,
        countryCode: String,
        count: Number
    }],
    
    // Top pages
    topPages: [{
        page: String,
        count: Number
    }],
    
    // Devices breakdown
    devices: {
        desktop: { type: Number, default: 0 },
        mobile: { type: Number, default: 0 },
        tablet: { type: Number, default: 0 },
        unknown: { type: Number, default: 0 }
    },
    
    // Browsers breakdown
    browsers: [{
        browser: String,
        count: Number
    }],
    
    // Referrers breakdown
    referrers: [{
        referrer: String,
        count: Number
    }],
    
    // Average session duration
    avgSessionDuration: {
        type: Number,
        default: 0
    },
    
    // Bounce rate (single page visits / total visits)
    bounceRate: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Single index with unique constraint + TTL for auto-deletion after 1 year
dailyStatsSchema.index({ date: 1 }, { unique: true, expireAfterSeconds: 31536000 });

const VisitorModel = mongoose.model('visitor', visitorSchema);
const DailyStatsModel = mongoose.model('dailyStats', dailyStatsSchema);

export { VisitorModel, DailyStatsModel };
export default VisitorModel;

