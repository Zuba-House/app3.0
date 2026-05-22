import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {
    uploadMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    deleteMedia,
    deleteMultipleMedia
} from '../controllers/media.controller.js';

const mediaRouter = Router();

// Upload media (must be before /:id route)
mediaRouter.post('/upload', auth, upload.array('media'), uploadMedia);

// Delete multiple media (must be before /:id route)
mediaRouter.delete('/multiple/delete', auth, deleteMultipleMedia);

// Get all media (with pagination and filtering)
mediaRouter.get('/', auth, getAllMedia);

// Get single media by ID (parameterized routes should be last)
mediaRouter.get('/:id', auth, getMediaById);

// Update media metadata
mediaRouter.put('/:id', auth, updateMedia);

// Delete single media
mediaRouter.delete('/:id', auth, deleteMedia);

export default mediaRouter;

