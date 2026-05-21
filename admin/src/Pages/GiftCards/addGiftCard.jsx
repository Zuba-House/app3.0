import React, { useState } from 'react';
import {
    Button,
    TextField,
    MenuItem,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { postData } from '../../utils/api';
import { MyContext } from '../../App';

const AddGiftCard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const context = React.useContext(MyContext);
    const isAppRoute = location.pathname.includes('/app-gift-cards');
    const listPath = '/app-gift-cards';

    const [formFields, setFormFields] = useState({
        code: '',
        initialBalance: '',
        currency: 'USD',
        recipientEmail: '',
        recipientName: '',
        message: '',
        expiryDate: '',
        allowedChannels: isAppRoute ? ['mobile'] : ['web', 'mobile'],
    });

    const [loading, setLoading] = useState(false);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields({
            ...formFields,
            [name]: value
        });
    };

    const toggleChannel = (channel) => {
        setFormFields((prev) => {
            const has = prev.allowedChannels.includes(channel);
            const next = has
                ? prev.allowedChannels.filter((c) => c !== channel)
                : [...prev.allowedChannels, channel];
            return { ...prev, allowedChannels: next.length ? next : [channel] };
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

        if (!formFields.allowedChannels?.length) {
            context?.alertBox("error", "Select at least one channel (Web or Mobile)");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formFields,
                initialBalance: parseFloat(formFields.initialBalance),
                code: formFields.code || undefined,
                expiryDate: formFields.expiryDate || null,
                recipientEmail: formFields.recipientEmail || null,
                recipientName: formFields.recipientName || null,
                message: formFields.message || null,
                allowedChannels: formFields.allowedChannels,
            };

            const res = await postData('/api/gift-cards', payload);

            if (res?.success) {
                context?.alertBox("success", "Gift card created successfully");
                navigate(listPath);
            } else {
                context?.alertBox("error", res?.error || "Failed to create gift card");
            }
        } catch (error) {
            context?.alertBox("error", "Failed to create gift card");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold">
                    {isAppRoute ? 'Create App Gift Card' : 'Add New Gift Card'}
                </h2>
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

                    <div className="md:col-span-2">
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Redeemable on
                        </Typography>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formFields.allowedChannels.includes('web')}
                                        onChange={() => toggleChannel('web')}
                                    />
                                }
                                label="Web (zubahouse.com)"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formFields.allowedChannels.includes('mobile')}
                                        onChange={() => toggleChannel('mobile')}
                                    />
                                }
                                label="Mobile app (iOS & Android)"
                            />
                        </FormGroup>
                        <Typography variant="caption" color="text.secondary" display="block">
                            App-only gift cards work in the mobile app and not on the website.
                        </Typography>
                    </div>
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
                        onClick={() => navigate(listPath)}
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

