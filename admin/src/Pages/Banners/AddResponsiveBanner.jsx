import React, { useState, useContext } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel } from '@mui/material';
import { MyContext } from '../../App';
import { uploadImages } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';

export const AddResponsiveBanner = () => {
    const [formData, setFormData] = useState({
        type: 'mobile',
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
        order: 0,
        isActive: true,
        backgroundColor: '#d4af37',
        textColor: '#2c3e50',
        ctaColor: '#ff6b35',
        ctaTextColor: '#ffffff'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const context = useContext(MyContext);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!imageFile) {
            context.alertBox("error", "Please select an image");
            return;
        }

        setLoading(true);

        try {
            const formDataObj = new FormData();
            formDataObj.append('banner', imageFile);
            formDataObj.append('type', formData.type);
            formDataObj.append('title', formData.title);
            formDataObj.append('subtitle', formData.subtitle);
            formDataObj.append('ctaText', formData.ctaText);
            formDataObj.append('ctaLink', formData.ctaLink);
            formDataObj.append('order', formData.order.toString());
            
            // Convert color names to hex if needed
            const toHexColor = (color) => {
                if (!color) return '';
                // If already hex, return as is
                if (color.startsWith('#')) return color;
                // Convert common color names to hex
                const colorMap = {
                    'white': '#ffffff',
                    'black': '#000000',
                    'red': '#ff0000',
                    'green': '#008000',
                    'blue': '#0000ff',
                    'yellow': '#ffff00',
                    'orange': '#ffa500',
                    'purple': '#800080',
                    'pink': '#ffc0cb',
                    'gray': '#808080',
                    'grey': '#808080'
                };
                return colorMap[color.toLowerCase()] || color;
            };
            
            formDataObj.append('backgroundColor', toHexColor(formData.backgroundColor));
            formDataObj.append('textColor', toHexColor(formData.textColor));
            formDataObj.append('ctaColor', toHexColor(formData.ctaColor));
            formDataObj.append('ctaTextColor', toHexColor(formData.ctaTextColor));
            formDataObj.append('isActive', formData.isActive.toString());

            const response = await uploadImages('/api/banners/upload', formDataObj);

            if (response?.success && !response?.error) {
                context.alertBox("success", "Banner added successfully!");
                context.setIsOpenFullScreenPanel({ open: false });
            } else {
                const errorMsg = response?.message || response?.details || "Failed to add banner";
                context.alertBox("error", errorMsg);
                console.error('Upload response:', response);
            }
        } catch (error) {
            console.error('Error adding banner:', error);
            context.alertBox("error", "Failed to add banner");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='p-5 bg-gray-50'>
            <form className='form py-1 p-1 md:p-8 md:py-1' onSubmit={handleSubmit}>
                <div className='scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 mb-3 gap-5'>
                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Banner Type *</h3>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={formData.type}
                                    name="type"
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="desktop">Desktop</MenuItem>
                                    <MenuItem value="mobile">Mobile</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Display Order</h3>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className='col sm:col-span-2'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Title</h3>
                            <TextField
                                fullWidth
                                size="small"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Christmas Discount"
                            />
                        </div>

                        <div className='col sm:col-span-2'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Subtitle</h3>
                            <TextField
                                fullWidth
                                size="small"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                placeholder="e.g., Starting Dec 1"
                            />
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>CTA Text</h3>
                            <TextField
                                fullWidth
                                size="small"
                                name="ctaText"
                                value={formData.ctaText}
                                onChange={handleChange}
                                placeholder="e.g., Shop Now"
                            />
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>CTA Link</h3>
                            <TextField
                                fullWidth
                                size="small"
                                name="ctaLink"
                                value={formData.ctaLink}
                                onChange={handleChange}
                                placeholder="e.g., /products"
                            />
                        </div>

                        <div className='col sm:col-span-2'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Banner Image *</h3>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img src={imagePreview} alt="Preview" className="max-w-[300px] max-h-[200px] object-contain rounded" />
                                </div>
                            )}
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Background Color</h3>
                            <input
                                type="color"
                                name="backgroundColor"
                                value={formData.backgroundColor}
                                onChange={handleChange}
                                className="w-full h-[40px] border rounded"
                            />
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Text Color</h3>
                            <input
                                type="color"
                                name="textColor"
                                value={formData.textColor}
                                onChange={handleChange}
                                className="w-full h-[40px] border rounded"
                            />
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>CTA Button Color</h3>
                            <input
                                type="color"
                                name="ctaColor"
                                value={formData.ctaColor}
                                onChange={handleChange}
                                className="w-full h-[40px] border rounded"
                            />
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>CTA Text Color</h3>
                            <input
                                type="color"
                                name="ctaTextColor"
                                value={formData.ctaTextColor}
                                onChange={handleChange}
                                className="w-full h-[40px] border rounded"
                            />
                        </div>

                        <div className='col sm:col-span-2'>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        name="isActive"
                                    />
                                }
                                label="Active (Show on website)"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button
                        variant="outlined"
                        onClick={() => context.setIsOpenFullScreenPanel({ open: false })}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        className="btn-blue"
                    >
                        {loading ? <CircularProgress size={20} /> : 'Add Banner'}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default AddResponsiveBanner;

