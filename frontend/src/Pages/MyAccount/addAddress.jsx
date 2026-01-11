import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { MyContext } from '../../App';
import { deleteData, editData, fetchDataFromApi, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import AddressForm from '../../components/AddressForm';

const AddAddress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [initialAddress, setInitialAddress] = useState(null);
  const context = useContext(MyContext);

  useEffect(() => {
    if (context?.addressMode === "edit" && context?.addressId) {
      fetchAddress(context?.addressId);
    } else {
      setInitialAddress(null);
    }
  }, [context?.addressMode, context?.addressId]);

  const fetchAddress = async (id) => {
    try {
      const res = await fetchDataFromApi(`/api/address/${id}`);
      if (res?.address) {
        setInitialAddress(res.address);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      context.alertBox("error", "Failed to load address");
    }
  };

  const handleAddressSave = async (addressData) => {
    setIsLoading(true);
    
    try {
      if (context?.addressMode === "add") {
        // Add new address
        const response = await postData(`/api/address/add`, {
          ...addressData,
          userId: context?.userData?._id
        }, { withCredentials: true });

        if (response?.error !== true) {
          context.alertBox("success", response?.message || "Address added successfully");
          setTimeout(() => {
            context.setOpenAddressPanel(false);
            setIsLoading(false);
          }, 500);
          context.getUserDetails();
        } else {
          context.alertBox("error", response?.message || "Failed to add address");
          setIsLoading(false);
        }
      } else if (context?.addressMode === "edit") {
        // Update existing address
        const response = await editData(`/api/address/${context?.addressId}`, addressData, { withCredentials: true });

        if (response?.error !== true) {
          context.alertBox("success", response?.message || "Address updated successfully");
          
          // Refresh user data
          const addressRes = await fetchDataFromApi(`/api/address/get?userId=${context?.userData?._id}`);
          setTimeout(() => {
            setIsLoading(false);
            context.setOpenAddressPanel(false);
          }, 500);
          context?.getUserDetails(addressRes?.data);
        } else {
          context.alertBox("error", response?.message || "Failed to update address");
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      context.alertBox("error", "Failed to save address. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 py-3 pb-8 px-4">
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <CircularProgress />
        </div>
      )}
      {!isLoading && (
        <AddressForm
          onAddressSave={handleAddressSave}
          initialAddress={initialAddress}
          mode="account"
        />
      )}
    </div>
  );
};

export default AddAddress;
