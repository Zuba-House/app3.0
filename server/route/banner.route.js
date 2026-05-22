import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {
    uploadBannerImage,
    updateBannerContent,
    getAllBanners,
    getPublicBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
    toggleBannerStatus
} from '../controllers/banner.controller.js';

const bannerRouter = Router();

// Public route - Get active banners
bannerRouter.get('/public', getPublicBanners);

// Admin routes - require authentication
bannerRouter.post('/upload', auth, upload.single('banner'), uploadBannerImage);
bannerRouter.post('/content', auth, updateBannerContent);
bannerRouter.get('/', auth, getAllBanners);
bannerRouter.get('/:id', auth, getBannerById);
bannerRouter.put('/:id', auth, upload.single('banner'), updateBanner);
bannerRouter.delete('/:id', auth, deleteBanner);
bannerRouter.put('/:type/toggle', auth, toggleBannerStatus);

export default bannerRouter;

