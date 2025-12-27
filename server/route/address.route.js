import { Router } from "express";
import auth from "../middlewares/auth.js";
import { 
    addAddressController, 
    deleteAddressController, 
    editAddress, 
    getAddressController, 
    getSingleAddressController,
    getDefaultAddress,
    setDefaultAddress,
    validateAddress
} from "../controllers/address.controller.js";

const addressRouter = Router();

// Create new address
addressRouter.post('/add', auth, addAddressController);

// Get all user addresses
addressRouter.get('/get', auth, getAddressController);

// Get default address
addressRouter.get('/default', auth, getDefaultAddress);

// Validate address with Google Places
addressRouter.post('/validate', auth, validateAddress);

// Get single address
addressRouter.get('/:id', auth, getSingleAddressController);

// Update address
addressRouter.put('/:id', auth, editAddress);

// Delete address (soft delete)
addressRouter.delete('/:id', auth, deleteAddressController);

// Set default address
addressRouter.patch('/:id/default', auth, setDefaultAddress);

export default addressRouter;
