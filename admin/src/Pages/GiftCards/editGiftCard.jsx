import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDataFromApi, putData } from '../../utils/api';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';

const EditGiftCard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const context = React.useContext(MyContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formFields, setFormFields] = useState({
        currency: 'USD',
        recipientEmail: '',
        recipientName: '',
        message: '',
        expiryDate: '',
        isActive: true
    });

    useEffect(() => {
        getGiftCard();
    }, [id]);

    const getGiftCard = async () => {
        try {
            const res = await fetchDataFromApi(`/api/gift-cards/all`);
            if (res?.success && res?.giftCards) {
                const card = res.giftCards.find(c => c._id === id);
                if (card) {
                    setFormFields({
                        currency: card.currency || 'USD',
                        recipientEmail: card.recipientEmail || '',
                        recipientName: card.recipientName || '',
                        message: card.message || '',
                        expiryDate: card.expiryDate ? new Date(card.expiryDate).toISOString().split('T')[0] : '',
                        isActive: card.isActive !== undefined ? card.isActive : true
                    });
                } else {
                    context?.alertBox("error", "Gift card not found");
                    navigate('/gift-cards');
                }
            }
        } catch (error) {
            console.error('Error fetching gift card:', error);
            context?.alertBox("error", "Failed to load gift card");
            navigate('/gift-cards');
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
                expiryDate: formFields.expiryDate || null,
                recipientEmail: formFields.recipientEmail || null,
                recipientName: formFields.recipientName || null,
                message: formFields.message || null
            };

            const res = await putData(`/api/gift-cards/${id}`, payload);

            if (res?.success) {
                context?.alertBox("success", "Gift card updated successfully");
                navigate('/gift-cards');
            } else {
                context?.alertBox("error", res?.error || "Failed to update gift card");
            }
        } catch (error) {
            console.error('Error updating gift card:', error);
            context?.alertBox("error", "Failed to update gift card");
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
                <h2 className="text-[24px] font-[700]">Edit Gift Card</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-md p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />

                    <TextField
                        label="Recipient Email"
                        name="recipientEmail"
                        type="email"
                        value={formFields.recipientEmail}
                        onChange={onChangeInput}
                        fullWidth
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
                        inputProps={{ maxLength: 500 }}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <Button
                        type="submit"
                        className="btn-org"
                        disabled={saving}
                    >
                        {saving ? 'Updating...' : 'Update Gift Card'}
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

export default EditGiftCard;

