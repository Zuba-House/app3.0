import express from 'express';
import ProductModel from '../models/product.model.js';
import Category from '../models/category.modal.js';

const router = express.Router();

const SITE_URL = process.env.FRONTEND_URL || 'https://zubahouse.com';

/**
 * GET /api/seo/sitemap.xml
 * Generates a dynamic sitemap for all products and categories
 * 
 * CRITICAL: This endpoint returns RAW XML - no HTML, no JSX, no React
 * Google expects plain XML with Content-Type: application/xml
 */
router.get('/sitemap.xml', async (req, res) => {
    try {
        // Set headers FIRST to ensure proper content type
        res.set({
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            'X-Content-Type-Options': 'nosniff'
        });

        // Fetch all published products
        const products = await ProductModel.find({ 
            status: 'published',
            visibility: { $in: ['visible', 'search'] }
        }).select('_id name seo updatedAt createdAt').lean();

        // Fetch all categories
        const categories = await Category.find({}).select('_id name updatedAt').lean();

        const currentDate = new Date().toISOString().split('T')[0];

        // Generate XML sitemap - plain text, NO HTML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>${SITE_URL}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/products</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${SITE_URL}/about</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${SITE_URL}/faq</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${SITE_URL}/help-center</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${SITE_URL}/shipping-info</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>${SITE_URL}/return-refund-policy</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>${SITE_URL}/terms-of-use</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc>${SITE_URL}/privacy-policy</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
    </url>`;

        // Add category pages
        for (const category of categories) {
            const lastMod = category.updatedAt 
                ? new Date(category.updatedAt).toISOString().split('T')[0]
                : currentDate;
            
            xml += `
    <url>
        <loc>${SITE_URL}/products?category=${encodeURIComponent(category._id)}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }

        // Add product pages
        for (const product of products) {
            const lastMod = product.updatedAt 
                ? new Date(product.updatedAt).toISOString().split('T')[0]
                : currentDate;
            
            xml += `
    <url>
        <loc>${SITE_URL}/product/${product._id}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }

        xml += `
</urlset>`;

        // Send raw XML response
        res.status(200).send(xml);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        // Even errors should return XML format for consistency
        res.status(500).set('Content-Type', 'application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${SITE_URL}/</loc>
    </url>
</urlset>`);
    }
});

/**
 * GET /api/seo/robots.txt
 * Serves robots.txt for search engine crawlers
 */
router.get('/robots.txt', (req, res) => {
    // Set headers FIRST
    res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    });

    const robots = `# Zuba House Robots.txt
# https://zubahouse.com

User-agent: *
Allow: /
Allow: /products
Allow: /product/
Allow: /about
Allow: /faq
Allow: /help-center
Allow: /shipping-info
Allow: /brand/

# Disallow private/auth pages
Disallow: /my-account
Disallow: /my-orders
Disallow: /my-list
Disallow: /cart
Disallow: /checkout
Disallow: /login
Disallow: /register
Disallow: /verify
Disallow: /forgot-password
Disallow: /address
Disallow: /delete-account
Disallow: /order/

# Disallow API endpoints from direct indexing
Disallow: /api/

# Allow SEO endpoints for sitemap discovery
Allow: /api/seo/sitemap.xml
Allow: /sitemap.xml

# Allow images
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.png$
Allow: /*.gif$
Allow: /*.webp$

# Crawl-delay for politeness
Crawl-delay: 1

# Sitemap location (root level - proxied from API)
Sitemap: ${SITE_URL}/sitemap.xml
`;

    res.status(200).send(robots);
});

/**
 * GET /api/seo/product/:id
 * Returns SEO metadata for a specific product (useful for SSR/prerendering)
 */
router.get('/product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await ProductModel.findById(id)
            .select('name shortDescription description brand images featuredImage pricing price oldPrice category catName rating ratingSummary reviewsCount sku barcode tags vendorShopName')
            .populate('category', 'name')
            .lean();

        if (!product) {
            return res.status(404).json({ error: true, message: 'Product not found' });
        }

        const productImage = product.images?.[0]?.url || product.images?.[0] || product.featuredImage || `${SITE_URL}/logo.jpg`;
        const price = product.pricing?.price || product.price || 0;

        const seoData = {
            title: `${product.name} | Zuba House`,
            description: product.shortDescription || product.description?.substring(0, 160) || `Shop ${product.name} at Zuba House`,
            image: productImage,
            url: `${SITE_URL}/product/${product._id}`,
            type: 'product',
            product: {
                name: product.name,
                price: price,
                currency: product.pricing?.currency || 'USD',
                brand: product.brand || 'Zuba House',
                category: product.catName || product.category?.name,
                rating: product.ratingSummary?.average || product.rating || 0,
                reviewCount: product.ratingSummary?.count || product.reviewsCount || 0,
                sku: product.sku || product._id,
                image: productImage
            },
            jsonLd: {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": product.name,
                "description": product.shortDescription || product.description?.substring(0, 300),
                "image": productImage,
                "sku": product.sku || product._id,
                "brand": {
                    "@type": "Brand",
                    "name": product.brand || "Zuba House"
                },
                "offers": {
                    "@type": "Offer",
                    "url": `${SITE_URL}/product/${product._id}`,
                    "priceCurrency": product.pricing?.currency || "USD",
                    "price": price.toFixed(2),
                    "availability": "https://schema.org/InStock",
                    "seller": {
                        "@type": "Organization",
                        "name": product.vendorShopName || "Zuba House"
                    }
                }
            }
        };

        if (product.rating > 0 || product.ratingSummary?.count > 0) {
            seoData.jsonLd.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": (product.ratingSummary?.average || product.rating || 0).toFixed(1),
                "reviewCount": product.ratingSummary?.count || product.reviewsCount || 1
            };
        }

        res.json({ error: false, data: seoData });

    } catch (error) {
        console.error('Error fetching product SEO data:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch SEO data' });
    }
});

/**
 * GET /api/seo/products-feed
 * Google Merchant Center Product Feed (for Google Shopping)
 */
router.get('/products-feed', async (req, res) => {
    try {
        const products = await ProductModel.find({ 
            status: 'published',
            visibility: { $in: ['visible', 'search'] }
        })
        .select('name shortDescription description brand images featuredImage pricing price inventory productType variations catName category tags sku barcode')
        .populate('category', 'name')
        .lean();

        const feed = {
            version: "1",
            title: "Zuba House Product Feed",
            link: SITE_URL,
            description: "African Fashion, Clothing & Accessories",
            updated: new Date().toISOString(),
            products: products.map(product => {
                const productImage = product.images?.[0]?.url || product.images?.[0] || product.featuredImage || '';
                const price = product.pricing?.price || product.price || 0;
                const regularPrice = product.pricing?.regularPrice || product.oldPrice || price;
                
                // Determine availability
                let availability = 'in_stock';
                if (product.productType === 'variable') {
                    const hasStock = product.variations?.some(v => v.isActive !== false && (v.endlessStock || v.stock > 0));
                    availability = hasStock ? 'in_stock' : 'out_of_stock';
                } else {
                    const stock = product.inventory?.stock || 0;
                    availability = stock > 0 || product.inventory?.endlessStock ? 'in_stock' : 'out_of_stock';
                }

                return {
                    id: product._id.toString(),
                    title: product.name,
                    description: product.shortDescription || product.description?.substring(0, 5000) || '',
                    link: `${SITE_URL}/product/${product._id}`,
                    image_link: productImage,
                    price: `${price.toFixed(2)} ${product.pricing?.currency || 'USD'}`,
                    sale_price: regularPrice > price ? `${price.toFixed(2)} ${product.pricing?.currency || 'USD'}` : undefined,
                    availability: availability,
                    brand: product.brand || 'Zuba House',
                    gtin: product.barcode || undefined,
                    mpn: product.sku || product._id.toString(),
                    condition: 'new',
                    product_type: product.catName || product.category?.name || 'Fashion',
                    google_product_category: 'Apparel & Accessories',
                    custom_labels: product.tags?.slice(0, 5) || []
                };
            })
        };

        res.json(feed);

    } catch (error) {
        console.error('Error generating product feed:', error);
        res.status(500).json({ error: true, message: 'Failed to generate product feed' });
    }
});

/**
 * GET /api/seo/test
 * Simple test endpoint to verify SEO routes are working
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'SEO routes are working',
        endpoints: {
            sitemap: '/api/seo/sitemap.xml',
            robots: '/api/seo/robots.txt',
            productFeed: '/api/seo/products-feed',
            productSeo: '/api/seo/product/:id'
        },
        siteUrl: SITE_URL
    });
});

export default router;
