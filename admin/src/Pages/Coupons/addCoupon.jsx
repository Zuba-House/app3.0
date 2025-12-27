import React, { useState } from 'react';
import { Button, TextField, MenuItem, Switch, FormControlLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { postData } from '../../utils/api';
import { MyContext } from '../../App';

const AddCoupon = () => {
    const navigate = useNavigate();
    const context = React.useContext(MyContext);

    const [formFields, setFormFields] = useState({
        code: '',
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

    const [loading, setLoading] = useState(false);

    const onChangeInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormFields({
            ...formFields,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!formFields.code || !formFields.discountAmount) {
            context?.alertBox("error", "Code and discount amount are required");
            setLoading(false);
            return;
        }

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

            const res = await postData('/api/coupons', payload);

            if (res?.success) {
                context?.alertBox("success", "Coupon created successfully");
                navigate('/coupons');
            } else {
                context?.alertBox("error", res?.error || "Failed to create coupon");
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
            context?.alertBox("error", "Failed to create coupon");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-5">
                <h2 className="text-[24px] font-[700]">Add New Coupon</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-md p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Coupon Code *"
                        name="code"
                        value={formFields.code}
                        onChange={onChangeInput}
                        required
                        fullWidth
                        helperText="Code will be converted to uppercase"
                    />

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
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Coupon'}
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

export default AddCoupon;

