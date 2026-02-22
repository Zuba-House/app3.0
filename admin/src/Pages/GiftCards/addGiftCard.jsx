import React, { useState } from 'react';
import { Button, TextField, MenuItem, Switch, FormControlLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { postData } from '../../utils/api';
import { MyContext } from '../../App';

const AddGiftCard = () => {
    const navigate = useNavigate();
    const context = React.useContext(MyContext);

    const [formFields, setFormFields] = useState({
        code: '',
        initialBalance: '',
        currency: 'USD',
        recipientEmail: '',
        recipientName: '',
        message: '',
        expiryDate: ''
    });

    const [loading, setLoading] = useState(false);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields({
            ...formFields,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!formFields.initialBalance || parseFloat(formFields.initialBalance) <= 0) {
            context?.alertBox("error", "Initial balance is required and must be greater than 0");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formFields,
                initialBalance: parseFloat(formFields.initialBalance),
                code: formFields.code || undefined, // Let server generate if empty
                expiryDate: formFields.expiryDate || null,
                recipientEmail: formFields.recipientEmail || null,
                recipientName: formFields.recipientName || null,
                message: formFields.message || null
            };

            const res = await postData('/api/gift-cards', payload);

            if (res?.success) {
                context?.alertBox("success", "Gift card created successfully");
                navigate('/gift-cards');
            } else {
                context?.alertBox("error", res?.error || "Failed to create gift card");
            }
        } catch (error) {
            console.error('Error creating gift card:', error);
            context?.alertBox("error", "Failed to create gift card");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-5">
                <h2 className="text-[24px] font-[700]">Add New Gift Card</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-md p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Gift Card Code"
                        name="code"
                        value={formFields.code}
                        onChange={onChangeInput}
                        fullWidth
                        helperText="Leave empty to auto-generate a unique code"
                    />

                    <TextField
                        label="Initial Balance *"
                        name="initialBalance"
                        type="number"
                        value={formFields.initialBalance}
                        onChange={onChangeInput}
                        required
                        fullWidth
                        inputProps={{ min: 0.01, step: 0.01 }}
                    />

                    <TextField
                        label="Currency"
                        name="currency"
                        value={formFields.currency}
                        onChange={onChangeInput}
                        select
                        fullWidth
                    >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="CAD">CAD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                    </TextField>

                    <TextField
                        label="Expiry Date"
                        name="expiryDate"
                        type="date"
                        value={formFields.expiryDate}
                        onChange={onChangeInput}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText="Leave empty for no expiry"
                    />

                    <TextField
                        label="Recipient Name"
                        name="recipientName"
                        value={formFields.recipientName}
                        onChange={onChangeInput}
                        fullWidth
                        helperText="Optional - for personalized gift cards"
                    />

                    <TextField
                        label="Recipient Email"
                        name="recipientEmail"
                        type="email"
                        value={formFields.recipientEmail}
                        onChange={onChangeInput}
                        fullWidth
                        helperText="Optional - for email delivery"
                    />

                    <TextField
                        label="Message"
                        name="message"
                        value={formFields.message}
                        onChange={onChangeInput}
                        fullWidth
                        multiline
                        rows={3}
                        className="md:col-span-2"
                        helperText="Optional message for the recipient (max 500 characters)"
                        inputProps={{ maxLength: 500 }}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <Button
                        type="submit"
                        className="btn-org"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Gift Card'}
                    </Button>
                    <Button
                        onClick={() => navigate('/gift-cards')}
                        className="btn-outline"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddGiftCard;

