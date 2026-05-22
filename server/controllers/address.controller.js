import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
import axios from 'axios';

/**
 * Advanced Address Controller
 * Supports both new and old address formats
 * Ready for Google Places and Stallion Express integration
 */

// Create new address
export const addAddressController = async (request, response) => {
    try {
        const userId = request.userId || request.body.userId; // Support both auth middleware and body
        
        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const addressData = request.body;

        // Normalize address data - support both old and new formats
        const normalizedData = {
            userId,
            // New format
            contactInfo: addressData.contactInfo || {
                firstName: addressData.firstName || '',
                lastName: addressData.lastName || '',
                phone: addressData.phone || (addressData.mobile ? `+${addressData.mobile}` : ''),
                email: addressData.email || ''
            },
            address: addressData.address || {
                addressLine1: addressData.address_line1 || '',
                addressLine2: addressData.addressLine2 || addressData.landmark || '',
                city: addressData.city || '',
                province: addressData.province || addressData.state || '',
                provinceCode: addressData.provinceCode || addressData.state || '',
                country: addressData.country || 'Canada',
                countryCode: addressData.countryCode || 'CA',
                postalCode: addressData.postalCode || addressData.pincode || ''
            },
            googlePlaces: addressData.googlePlaces || {},
            label: addressData.label || addressData.addressType || '',
            notes: addressData.notes || '',
            isDefault: addressData.isDefault || false,
            // Old format (for backward compatibility)
            addressType: addressData.addressType || 'Home',
            address_line1: addressData.address?.addressLine1 || addressData.address_line1 || '',
            city: addressData.address?.city || addressData.city || '',
            state: addressData.address?.province || addressData.state || '',
            pincode: addressData.address?.postalCode || addressData.pincode || '',
            country: addressData.address?.country || addressData.country || 'Canada',
            mobile: addressData.contactInfo?.phone ? parseInt(addressData.contactInfo.phone.replace(/\D/g, '').substring(0, 15)) : (addressData.mobile || null),
            landmark: addressData.address?.addressLine2 || addressData.landmark || '',
            status: addressData.status !== undefined ? addressData.status : true,
            selected: addressData.selected !== undefined ? addressData.selected : true
        };

        const address = new AddressModel(normalizedData);
        const savedAddress = await address.save();

        // Update user's address_details array
        await UserModel.updateOne(
            { _id: userId },
            { $addToSet: { address_details: savedAddress._id } }
        );

        return response.status(200).json({
            data: savedAddress,
            message: "Address added successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Error creating address:", error);
        return response.status(500).json({
            message: error.message || "Failed to save address",
            error: true,
            success: false
        });
    }
};

// Get all user addresses
export const getAddressController = async (request, response) => {
    try {
        const userId = request.userId || request.query?.userId;
        
        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const addresses = await AddressModel.getUserAddresses(userId);

        return response.status(200).json({
            error: false,
            success: true,
            data: addresses
        });

    } catch (error) {
        console.error("Error fetching addresses:", error);
        return response.status(500).json({
            message: error.message || "Failed to fetch addresses",
            error: true,
            success: false
        });
    }
};

// Get single address
export const getSingleAddressController = async (request, response) => {
    try {
        const id = request.params.id;
        const userId = request.userId;

        const address = await AddressModel.findOne({
            _id: id,
            ...(userId ? { userId } : {})
        });

        if (!address) {
            return response.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            address: address
        });

    } catch (error) {
        console.error("Error fetching address:", error);
        return response.status(500).json({
            message: error.message || "Failed to fetch address",
            error: true,
            success: false
        });
    }
};

// Update address
export const editAddress = async (request, response) => {
    try {
        const id = request.params.id;
        const userId = request.userId || request.body.userId;
        const updateData = request.body;

        // Normalize update data
        const normalizedUpdate = {};
        
        if (updateData.contactInfo) {
            normalizedUpdate.contactInfo = updateData.contactInfo;
        }
        if (updateData.address) {
            normalizedUpdate.address = updateData.address;
        }
        if (updateData.googlePlaces) {
            normalizedUpdate.googlePlaces = updateData.googlePlaces;
        }
        if (updateData.label !== undefined) normalizedUpdate.label = updateData.label;
        if (updateData.notes !== undefined) normalizedUpdate.notes = updateData.notes;
        if (updateData.isDefault !== undefined) normalizedUpdate.isDefault = updateData.isDefault;
        
        // Old format support
        if (updateData.address_line1 !== undefined) normalizedUpdate.address_line1 = updateData.address_line1;
        if (updateData.city !== undefined) normalizedUpdate.city = updateData.city;
        if (updateData.state !== undefined) normalizedUpdate.state = updateData.state;
        if (updateData.pincode !== undefined) normalizedUpdate.pincode = updateData.pincode;
        if (updateData.country !== undefined) normalizedUpdate.country = updateData.country;
        if (updateData.mobile !== undefined) normalizedUpdate.mobile = updateData.mobile;
        if (updateData.landmark !== undefined) normalizedUpdate.landmark = updateData.landmark;
        if (updateData.addressType !== undefined) normalizedUpdate.addressType = updateData.addressType;
        if (updateData.status !== undefined) normalizedUpdate.status = updateData.status;
        if (updateData.selected !== undefined) normalizedUpdate.selected = updateData.selected;

        const address = await AddressModel.findOneAndUpdate(
            { _id: id, ...(userId ? { userId } : {}) },
            normalizedUpdate,
            { new: true, runValidators: true }
        );

        if (!address) {
            return response.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Address updated successfully",
            error: false,
            success: true,
            address: address
        });

    } catch (error) {
        console.error("Error updating address:", error);
        return response.status(500).json({
            message: error.message || "Failed to update address",
            error: true,
            success: false
        });
    }
};

// Delete address (soft delete)
export const deleteAddressController = async (request, response) => {
    try {
        const userId = request.userId;
        const _id = request.params.id;

        if (!_id) {
            return response.status(400).json({
                message: "Address ID is required",
                error: true,
                success: false
            });
        }

        // Soft delete by setting status to false
        const deletedAddress = await AddressModel.findOneAndUpdate(
            { _id: _id, userId: userId },
            { status: false, isDefault: false },
            { new: true }
        );

        if (!deletedAddress) {
            return response.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            });
        }

        // Remove from user's address_details array
        await UserModel.updateOne(
            { _id: userId },
            { $pull: { address_details: _id } }
        );

        return response.json({
            message: "Address removed successfully",
            error: false,
            success: true,
            data: deletedAddress
        });

    } catch (error) {
        console.error("Error deleting address:", error);
        return response.status(500).json({
            message: error.message || "Failed to delete address",
            error: true,
            success: false
        });
    }
};

// Get default address
export const getDefaultAddress = async (request, response) => {
    try {
        const userId = request.userId || request.query?.userId;

        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const address = await AddressModel.getDefaultAddress(userId);

        if (!address) {
            return response.status(404).json({
                message: "No default address found",
                error: true,
                success: false
            });
        }

        return response.json({
            error: false,
            success: true,
            address: address
        });

    } catch (error) {
        console.error("Error fetching default address:", error);
        return response.status(500).json({
            message: error.message || "Failed to fetch default address",
            error: true,
            success: false
        });
    }
};

// Set default address
export const setDefaultAddress = async (request, response) => {
    try {
        const userId = request.userId;
        const addressId = request.params.id;

        const address = await AddressModel.findOne({
            _id: addressId,
            userId: userId,
            status: true
        });

        if (!address) {
            return response.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            });
        }

        address.isDefault = true;
        await address.save(); // Middleware will handle unsetting others

        return response.json({
            message: "Default address updated",
            error: false,
            success: true,
            address: address
        });

    } catch (error) {
        console.error("Error setting default address:", error);
        return response.status(500).json({
            message: error.message || "Failed to set default address",
            error: true,
            success: false
        });
    }
};

// Validate address with Google Places
export const validateAddress = async (request, response) => {
    try {
        const { placeId } = request.body;

        if (!placeId) {
            return response.status(400).json({
                success: false,
                message: 'Place ID is required',
                error: true
            });
        }

        // Use Google Places API to validate
        const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyAXshkwQXMY74fgEi0e02sTz8sKNphLM_U';
        
        const googleResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json`,
            {
                params: {
                    place_id: placeId,
                    fields: 'address_components,formatted_address,geometry',
                    key: googleApiKey
                }
            }
        );

        if (googleResponse.data.status !== 'OK') {
            return response.status(400).json({
                success: false,
                message: 'Invalid address',
                error: true
            });
        }

        return response.json({
            success: true,
            address: googleResponse.data.result,
            error: false
        });

    } catch (error) {
        console.error("Error validating address:", error);
        return response.status(500).json({
            success: false,
            message: 'Failed to validate address',
            error: error.message
        });
    }
};
