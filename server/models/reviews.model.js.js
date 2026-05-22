import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow guest reviews
        default: null,
        index: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [200, 'Review title cannot exceed 200 characters']
    },
    review: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true,
        maxlength: [2000, 'Review cannot exceed 2000 characters']
    },
    userName: {
        type: String,
        default: ''
    },
    // Additional customer info for email notifications
    customerName: {
        type: String,
        trim: true
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    userAvatar: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'spam'],
        default: 'pending',
        index: true
    },
    isApproved: {
        type: Boolean,
        default: false  // Requires admin approval
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0
    },
    helpfulUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    adminResponse: {
        text: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },
    // Legacy support
    image: {
        type: String,
        default: ''
    }
},{
    timestamps: true
});

// Indexes
reviewsSchema.index({ productId: 1, status: 1 });
reviewsSchema.index({ userId: 1, productId: 1 });
reviewsSchema.index({ rating: -1 });
reviewsSchema.index({ helpfulCount: -1 });
reviewsSchema.index({ createdAt: -1 });
reviewsSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Methods
reviewsSchema.methods.markHelpful = async function(userId) {
    if (!this.helpfulUsers.includes(userId)) {
        this.helpfulUsers.push(userId);
        this.helpfulCount += 1;
        await this.save();
    }
};

reviewsSchema.methods.unmarkHelpful = async function(userId) {
    const index = this.helpfulUsers.indexOf(userId);
    if (index > -1) {
        this.helpfulUsers.splice(index, 1);
        this.helpfulCount = Math.max(0, this.helpfulCount - 1);
        await this.save();
    }
};

// Update product rating when review is approved/rejected
reviewsSchema.methods.updateProductRating = async function() {
    const Product = mongoose.model('Product');
    
    // Get all approved reviews for this product
    const approvedReviews = await this.constructor.find({
        productId: this.productId,
        status: 'approved',
        isApproved: true
    });
    
    if (approvedReviews.length === 0) {
        await Product.findByIdAndUpdate(this.productId, {
            'ratingSummary.average': 0,
            'ratingSummary.count': 0,
            'ratingSummary.distribution': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            rating: 0,
            reviewsCount: 0
        });
        return;
    }
    
    // Calculate average rating
    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / approvedReviews.length;
    
    // Calculate rating breakdown
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach(review => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    
    // Update product
    await Product.findByIdAndUpdate(this.productId, {
        'ratingSummary.average': Math.round(averageRating * 10) / 10,
        'ratingSummary.count': approvedReviews.length,
        'ratingSummary.distribution': distribution,
        rating: Math.round(averageRating * 10) / 10,
        reviewsCount: approvedReviews.length
    });
};

// Hook to update product rating when review is saved
reviewsSchema.post('save', async function(doc) {
    if (doc.status === 'approved' && doc.isApproved) {
        try {
            await doc.updateProductRating();
        } catch (error) {
            console.error('Error updating product rating:', error);
        }
    }
});

// Hook to update product rating when review is removed
reviewsSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        try {
            await doc.updateProductRating();
        } catch (error) {
            console.error('Error updating product rating after removal:', error);
        }
    }
});

const ReviewModel = mongoose.model('reviews', reviewsSchema);

export default ReviewModel;