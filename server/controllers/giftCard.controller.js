import GiftCardModel from '../models/giftCard.model.js';
import * as discountService from '../services/discount.service.js';

/**
 * Validate gift card code
 * POST /api/gift-cards/validate
 */
export const validateGiftCard = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId || null;
    const userEmail = req.user?.email || req.body.email || null;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Gift card code is required'
      });
    }

    const result = await discountService.validateGiftCard(code, userId, userEmail);

    if (!result.valid) {
      return res.status(200).json({
        success: false,
        valid: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      valid: true,
      giftCard: result.giftCard
    });

  } catch (error) {
    console.error('Validate gift card error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate gift card'
    });
  }
};

/**
 * Apply gift card to cart
 * POST /api/gift-cards/apply
 */
export const applyGiftCard = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const userId = req.userId || null;
    const userEmail = req.user?.email || req.body.email || null;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Gift card code is required'
      });
    }

    const cartTotalValue = parseFloat(cartTotal) || 0;

    const result = await discountService.applyGiftCard({
      code,
      cartTotal: cartTotalValue,
      userId,
      userEmail
    });

    if (!result.success) {
      return res.status(200).json({
        success: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      giftCard: result.giftCard,
      discount: result.discount
    });

  } catch (error) {
    console.error('Apply gift card error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply gift card'
    });
  }
};

/**
 * Create gift card (Admin only)
 * POST /api/gift-cards
 */
export const createGiftCard = async (req, res) => {
  try {
    const {
      initialBalance,
      currency,
      issuedTo,
      recipientEmail,
      recipientName,
      message,
      expiryDate,
      code
    } = req.body;

    if (!initialBalance || initialBalance <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Initial balance is required and must be greater than 0'
      });
    }

    // Generate code if not provided
    let giftCardCode = code;
    if (!giftCardCode) {
      giftCardCode = await GiftCardModel.generateCode();
    } else {
      giftCardCode = giftCardCode.toUpperCase().trim().replace(/-/g, '');
    }

    // Check if code already exists
    const existingCard = await GiftCardModel.findOne({ code: giftCardCode });
    if (existingCard) {
      return res.status(400).json({
        success: false,
        error: 'Gift card code already exists'
      });
    }

    const giftCard = new GiftCardModel({
      code: giftCardCode,
      initialBalance: parseFloat(initialBalance),
      currentBalance: parseFloat(initialBalance),
      currency: currency || 'USD',
      issuedTo: issuedTo || null,
      issuedBy: req.userId || null,
      recipientEmail: recipientEmail ? recipientEmail.toLowerCase().trim() : null,
      recipientName: recipientName || null,
      message: message || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: true
    });

    await giftCard.save();

    return res.status(201).json({
      success: true,
      message: 'Gift card created successfully',
      giftCard: {
        id: giftCard._id,
        code: giftCard.code,
        initialBalance: giftCard.initialBalance,
        currentBalance: giftCard.currentBalance,
        currency: giftCard.currency,
        expiryDate: giftCard.expiryDate
      }
    });

  } catch (error) {
    console.error('Create gift card error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create gift card'
    });
  }
};

/**
 * Get user's gift cards
 * GET /api/gift-cards/my-cards
 */
export const getMyGiftCards = async (req, res) => {
  try {
    const userId = req.userId;
    const userEmail = req.user?.email;

    if (!userId && !userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Find gift cards issued to user or with matching email
    const query = {
      isActive: true,
      $or: []
    };

    if (userId) {
      query.$or.push({ issuedTo: userId });
    }

    if (userEmail) {
      query.$or.push({ recipientEmail: userEmail.toLowerCase() });
    }

    // Also include cards that can be used by anyone (no restrictions)
    query.$or.push({
      issuedTo: null,
      recipientEmail: null
    });

    const giftCards = await GiftCardModel.find(query)
      .select('code currentBalance initialBalance currency expiryDate createdAt')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      giftCards
    });

  } catch (error) {
    console.error('Get my gift cards error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get gift cards'
    });
  }
};

/**
 * Get all gift cards (Admin only)
 * GET /api/gift-cards/all
 */
export const getAllGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCardModel.find()
      .populate('issuedTo', 'name email')
      .populate('issuedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      giftCards
    });

  } catch (error) {
    console.error('Get all gift cards error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get gift cards'
    });
  }
};

/**
 * Update gift card (Admin only)
 * PUT /api/gift-cards/:id
 */
export const updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating code
    if (updateData.code) {
      delete updateData.code;
    }

    const giftCard = await GiftCardModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: 'Gift card not found'
      });
    }

    return res.json({
      success: true,
      message: 'Gift card updated successfully',
      giftCard
    });

  } catch (error) {
    console.error('Update gift card error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update gift card'
    });
  }
};

/**
 * Add balance to gift card (Admin only)
 * POST /api/gift-cards/:id/add-balance
 */
export const addBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    const giftCard = await GiftCardModel.findById(id);

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: 'Gift card not found'
      });
    }

    await giftCard.addBalance(parseFloat(amount), reason || 'Balance added by admin');

    return res.json({
      success: true,
      message: 'Balance added successfully',
      giftCard: {
        id: giftCard._id,
        code: giftCard.code,
        currentBalance: giftCard.currentBalance
      }
    });

  } catch (error) {
    console.error('Add balance error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add balance'
    });
  }
};

