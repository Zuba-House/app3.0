/**
 * Advanced Search API
 * GET /api/search?q= — products + suggestions, ranked by relevance, popularity, rating
 * POST /api/search/image — image (Lens) search via Google Cloud Vision (optional)
 */

import ProductModel from '../models/product.model.js';
import CategoryModel from '../models/category.modal.js';

const DEFAULT_LIMIT = 50;
const SUGGESTIONS_LIMIT = 8;

/**
 * GET /api/search?q=sandals&limit=50
 * Returns: { products, categories, suggestions }
 * Ranking: text match, then totalSales, then rating
 */
export async function getSearch(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 100);

    if (!q) {
      return res.status(200).json({
        success: true,
        products: [],
        categories: [],
        suggestions: [],
      });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const productFilter = {
      status: 'published',
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { shortDescription: { $regex: regex } },
        { brand: { $regex: regex } },
        { catName: { $regex: regex } },
        { subCat: { $regex: regex } },
        { thirdsubCat: { $regex: regex } },
        { tags: { $regex: regex } },
      ],
    };

    const [products, categoryMatches] = await Promise.all([
      ProductModel.find(productFilter)
        .populate('category')
        .populate('categories')
        .sort({ totalSales: -1, rating: -1 })
        .limit(limit)
        .lean(),
      CategoryModel.find({ name: { $regex: regex } })
        .limit(5)
        .select('_id name')
        .lean(),
    ]);

    const suggestions = [];
    const seen = new Set();
    products.slice(0, 5).forEach((p) => {
      if (p.name && !seen.has(p.name.toLowerCase())) {
        seen.add(p.name.toLowerCase());
        suggestions.push({ type: 'product', text: p.name, id: p._id });
      }
    });
    categoryMatches.forEach((c) => {
      if (c.name && !seen.has(c.name.toLowerCase())) {
        seen.add(c.name.toLowerCase());
        suggestions.push({ type: 'category', text: c.name, id: c._id });
      }
    });

    return res.status(200).json({
      success: true,
      products,
      categories: categoryMatches,
      suggestions: suggestions.slice(0, SUGGESTIONS_LIMIT),
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Search failed',
    });
  }
}

/**
 * POST /api/search/image
 * Body: { image: base64 } or multipart image
 * Uses Google Cloud Vision API to detect labels, then searches products by those terms.
 * Set GOOGLE_VISION_API_KEY or GOOGLE_CLOUD_VISION_API_KEY in env to enable.
 */
export async function imageSearch(req, res) {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'Image search is not configured. Set GOOGLE_VISION_API_KEY.',
      });
    }

    const base64Image = req.body?.image;
    if (!base64Image) {
      return res.status(400).json({
        success: false,
        message: 'Image required (base64 or multipart file).',
      });
    }

    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const response = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image.replace(/^data:image\/\w+;base64,/, '') },
            features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
          },
        ],
      }),
    });
    const data = await response.json();
    if (data.error) {
      console.warn('Vision API error:', data.error);
      return res.status(502).json({
        success: false,
        message: data.error.message || 'Vision API error',
      });
    }

    const labels = (data.responses?.[0]?.labelAnnotations || [])
      .map((a) => a.description)
      .filter(Boolean);
    if (labels.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
        categories: [],
        suggestions: [],
        detected: [],
      });
    }

    const searchTerms = labels.slice(0, 3).join(' ');
    const regex = new RegExp(searchTerms.split(/\s+/).filter(Boolean).join('|'), 'i');
    const products = await ProductModel.find({
      status: 'published',
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { brand: { $regex: regex } },
        { tags: { $regex: regex } },
      ],
    })
      .populate('category')
      .populate('categories')
      .sort({ totalSales: -1, rating: -1 })
      .limit(DEFAULT_LIMIT)
      .lean();

    return res.status(200).json({
      success: true,
      products,
      categories: [],
      suggestions: labels.slice(0, 5).map((t) => ({ type: 'label', text: t })),
      detected: labels,
    });
  } catch (error) {
    console.error('Image search error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Image search failed',
    });
  }
}
