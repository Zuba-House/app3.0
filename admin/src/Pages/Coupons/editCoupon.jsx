import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Switch, FormControlLabel } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDataFromApi, putData } from '../../utils/api';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';

const EditCoupon = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const context = React.useContext(MyContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formFields, setFormFields] = useState({
        description: '',
        discountType: 'percentage',
        discountAmount: '',
        minimumAmount: '',
        maximumAmount: '',
        usageLimit: '',
        usageLimitPerUser: '1',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        freeShipping: false,
        excludeSaleItems: false,
        individualUse: false,
        isActive: true
    });

    useEffect(() => {
        getCoupon();
    }, [id]);

    const getCoupon = async () => {
        try {
            const res = await fetchDataFromApi(`/api/coupons/all`);
            if (res?.success && res?.coupons) {
                const coupon = res.coupons.find(c => c._id === id);
                if (coupon) {
                    setFormFields({
                        description: coupon.description || '',
                        discountType: coupon.discountType || 'percentage',
                        discountAmount: coupon.discountAmount || '',
                        minimumAmount: coupon.minimumAmount || '',
                        maximumAmount: coupon.maximumAmount || '',
                        usageLimit: coupon.usageLimit || '',
                        usageLimitPerUser: coupon.usageLimitPerUser || 1,
                        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
                        freeShipping: coupon.freeShipping || false,
                        excludeSaleItems: coupon.excludeSaleItems || false,
                        individualUse: coupon.individualUse || false,
                        isActive: coupon.isActive !== undefined ? coupon.isActive : true
                    });
                } else {
                    context?.alertBox("error", "Coupon not found");
                    navigate('/coupons');
                }
            }
        } catch (error) {
            console.error('Error fetching coupon:', error);
            context?.alertBox("error", "Failed to load coupon");
            navigate('/coupons');
        } finally {
            setLoading(false);
        }
    };

    const onChangeInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormFields({
            ...formFields,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formFields,
                discountAmount: parseFloat(formFields.discountAmount),
                minimumAmount: formFields.minimumAmount ? parseFloat(formFields.minimumAmount) : 0,
                maximumAmount: formFields.maximumAmount ? parseFloat(formFields.maximumAmount) : null,
                usageLimit: formFields.usageLimit ? parseInt(formFields.usageLimit) : null,
                usageLimitPerUser: parseInt(formFields.usageLimitPerUser) || 1,
                endDate: formFields.endDate || null
            };

            const res = await putData(`/api/coupons/${id}`, payload);

            if (res?.success) {
                context?.alertBox("success", "Coupon updated successfully");
                navigate('/coupons');
            } else {
                context?.alertBox("error", res?.error || "Failed to update coupon");
            }
        } catch (error) {
            console.error('Error updating coupon:', error);
            context?.alertBox("error", "Failed to update coupon");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-5">
                <h2 className="text-[24px] font-[700]">Edit Coupon</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-md p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Discount Type *"
                        name="discountType"
                        value={formFields.discountType}
                        onChange={onChangeInput}
                        select
                        required
                        fullWidth
                    >
                        <MenuItem value="percentage">Percentage</MenuItem>
                        <MenuItem value="fixed_cart">Fixed Amount (Cart)</MenuItem>
                        <MenuItem value="fixed_product">Fixed Amount (Per Product)</MenuItem>
                    </TextField>

                    <TextField
                        label="Discount Amount *"
                        name="discountAmount"
                        type="number"
                        value={formFields.discountAmount}
                        onChange={onChangeInput}
                        required
                        fullWidth
                        helperText={formFields.discountType === 'percentage' ? 'Enter percentage (e.g., 20 for 20%)' : 'Enter amount in USD'}
                    />

                    <TextField
                        label="Minimum Purchase Amount"
                        name="minimumAmount"
                        type="number"
                        value={formFields.minimumAmount}
                        onChange={onChangeInput}
                        fullWidth
                        helperText="Minimum cart total required (0 = no minimum)"
                    />

                    <TextField
                        label="Maximum Discount Amount"
                        name="maximumAmount"
                        type="number"
                        value={formFields.maximumAmount}
                        onChange={onChangeInput}
                        fullWidth
                        helperText="Maximum discount amount (leave empty for no limit)"
                    />

                    <TextField
                        label="Usage Limit"
                        name="usageLimit"
                        type="number"
                        value={formFields.usageLimit}
                        onChange={onChangeInput}
                        fullWidth
                        helperText="Total number of times coupon can be used (leave empty for unlimited)"
                    />

                    <TextField
                        label="Usage Limit Per User"
                        name="usageLimitPerUser"
                        type="number"
                        value={formFields.usageLimitPerUser}
                        onChange={onChangeInput}
                        required
                        fullWidth
                        helperText="How many times each user can use this coupon"
                    />

                    <TextField
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={formFields.startDate}
                        onChange={onChangeInput}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="End Date"
                        name="endDate"
                        type="date"
                        value={formFields.endDate}
                        onChange={onChangeInput}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText="Leave empty for no expiry"
                    />

                    <TextField
                        label="Description"
                        name="description"
                        value={formFields.description}
                        onChange={onChangeInput}
                        fullWidth
                        multiline
                        rows={3}
                        className="md:col-span-2"
                    />
                </div>

                <div className="mt-4 space-y-2">
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formFields.freeShipping}
                                onChange={onChangeInput}
                                name="freeShipping"
                            />
                        }
                        label="Free Shipping"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formFields.excludeSaleItems}
                                onChange={onChangeInput}
                                name="excludeSaleItems"
                            />
                        }
                        label="Exclude Sale Items"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formFields.individualUse}
                                onChange={onChangeInput}
                                name="individualUse"
                            />
                        }
                        label="Individual Use Only (Cannot combine with other coupons)"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formFields.isActive}
                                onChange={onChangeInput}
                                name="isActive"
                            />
                        }
                        label="Active"
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <Button
                        type="submit"
                        className="btn-org"
                        disabled={saving}
                    >
                        {saving ? 'Updating...' : 'Update Coupon'}
                    </Button>
                    <Button
                        onClick={() => navigate('/coupons')}
                        className="btn-outline"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditCoupon;

