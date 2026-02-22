import React, { useContext, useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Chip } from '@mui/material';
import { MdEdit, MdDelete, MdRefresh, MdAdd } from 'react-icons/md';
import { fetchDataFromApi, postData, putData, deleteData } from '../../utils/api';
import { MyContext } from '../../App';

const VariationsManager = ({ productId }) => {
    const [variations, setVariations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generatingVariations, setGeneratingVariations] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [productAttributes, setProductAttributes] = useState([]);
    const [formData, setFormData] = useState({
        sku: '',
        price: '',
        salePrice: '',
        stock: '',
        isActive: true
    });

    const context = useContext(MyContext);

    useEffect(() => {
        if (productId) {
            fetchVariations();
            fetchProductAttributes();
        }
    }, [productId]);

    const fetchProductAttributes = () => {
        fetchDataFromApi(`/api/products/${productId}`).then((res) => {
            if (res?.error === false && res?.data?.attributes) {
                setProductAttributes(res?.data?.attributes || []);
            }
        }).catch(() => {
            console.log("Error fetching product attributes");
        });
    };

    const fetchVariations = () => {
        setLoading(true);
        fetchDataFromApi(`/api/products/${productId}/variations`).then((res) => {
            if (res?.error === false) {
                setVariations(res?.data || []);
            } else {
                context.alertBox("error", "Failed to fetch variations");
            }
            setLoading(false);
        }).catch(() => {
            context.alertBox("error", "Error fetching variations");
            setLoading(false);
        });
    };

    const handleGenerateVariations = () => {
        if (!productAttributes || productAttributes.length === 0) {
            context.alertBox("error", "This product has no attributes defined");
            return;
        }

        setGeneratingVariations(true);
        const payload = {
            attributes: productAttributes.map(attr => ({
                attributeId: attr.attributeId,
                values: attr.values || []
            }))
        };

        postData(`/api/products/${productId}/variations/generate`, payload).then((res) => {
            if (res?.error === false) {
                context.alertBox("success", `Generated ${res?.data?.created || 0} variations successfully!`);
                fetchVariations();
            } else {
                context.alertBox("error", res?.message || "Failed to generate variations");
            }
            setGeneratingVariations(false);
        }).catch((err) => {
            context.alertBox("error", "Error generating variations");
            setGeneratingVariations(false);
        });
    };

    const handleOpenDialog = (variation = null) => {
        if (variation) {
            setEditingId(variation._id);
            setFormData({
                sku: variation.sku,
                price: variation.price,
                salePrice: variation.salePrice || '',
                stock: variation.stock,
                isActive: variation.isActive
            });
        } else {
            setEditingId(null);
            setFormData({
                sku: '',
                price: '',
                salePrice: '',
                stock: '',
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        if (!formData.sku.trim()) {
            context.alertBox("error", "SKU is required");
            return;
        }

        if (!formData.price) {
            context.alertBox("error", "Price is required");
            return;
        }

        if (!formData.stock) {
            context.alertBox("error", "Stock is required");
            return;
        }

        if (editingId) {
            putData(`/api/products/${productId}/variations/${editingId}`, formData).then((res) => {
                if (res?.error === false) {
                    context.alertBox("success", "Variation updated successfully");
                    fetchVariations();
                    handleCloseDialog();
                } else {
                    context.alertBox("error", res?.message || "Failed to update variation");
                }
            }).catch(() => {
                context.alertBox("error", "Error updating variation");
            });
        }
    };

    const handleDelete = (variationId) => {
        if (window.confirm("Are you sure you want to delete this variation?")) {
            deleteData(`/api/products/${productId}/variations/${variationId}`).then((res) => {
                if (res?.error === false) {
                    context.alertBox("success", "Variation deleted successfully");
                    fetchVariations();
                } else {
                    context.alertBox("error", res?.message || "Failed to delete variation");
                }
            }).catch(() => {
                context.alertBox("error", "Error deleting variation");
            });
        }
    };

    const getVariationLabel = (variation) => {
        if (variation.displayName) {
            return variation.displayName;
        }
        if (variation.attributes && variation.attributes.length > 0) {
            return variation.attributes.map(a => a.label).join(' • ');
        }
        return variation.sku;
    };

    return (
        <div className='p-6 bg-gray-50 rounded-lg'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-[28px] font-bold text-gray-800'>Variations Manager</h2>
                <div className='flex gap-3'>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<MdRefresh />}
                        onClick={handleGenerateVariations}
                        disabled={generatingVariations}
                        className='bg-green-600'
                    >
                        {generatingVariations ? 'Generating...' : 'Auto-Generate'}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<MdAdd />}
                        onClick={() => handleOpenDialog()}
                        className='bg-blue-600'
                    >
                        Add Manual
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className='text-center py-10'>
                    <CircularProgress />
                </div>
            ) : variations.length === 0 ? (
                <div className='text-center py-10 bg-white rounded-lg border border-gray-200'>
                    <p className='text-gray-500 mb-4'>No variations found.</p>
                    <p className='text-sm text-gray-400'>Click "Auto-Generate" to create variations from attributes.</p>
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead className='bg-gray-200'>
                            <TableRow>
                                <TableCell className='font-bold'>Variation</TableCell>
                                <TableCell className='font-bold'>SKU</TableCell>
                                <TableCell className='font-bold'>Price</TableCell>
                                <TableCell className='font-bold'>Sale Price</TableCell>
                                <TableCell className='font-bold'>Stock</TableCell>
                                <TableCell className='font-bold'>Status</TableCell>
                                <TableCell className='font-bold'>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {variations.map((variation) => (
                                <TableRow key={variation._id} className='hover:bg-gray-50'>
                                    <TableCell>
                                        <div className='flex gap-2 flex-wrap'>
                                            {variation.attributes && variation.attributes.map((attr, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={`${attr.label}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className='font-mono text-sm'>{variation.sku}</TableCell>
                                    <TableCell>${variation.price}</TableCell>
                                    <TableCell>${variation.salePrice || 'N/A'}</TableCell>
                                    <TableCell>
                                        <span className={`px-3 py-1 rounded-full text-sm ${variation.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {variation.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-3 py-1 rounded-full text-sm ${variation.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {variation.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex gap-2'>
                                            <Button
                                                size="small"
                                                startIcon={<MdEdit />}
                                                onClick={() => handleOpenDialog(variation)}
                                                className='text-blue-600'
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<MdDelete />}
                                                onClick={() => handleDelete(variation._id)}
                                                className='text-red-600'
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog for Edit/Manual Add */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle className='bg-blue-600 text-white font-bold'>
                    {editingId ? 'Edit Variation' : 'Add Manual Variation'}
                </DialogTitle>
                <DialogContent className='mt-4'>
                    <TextField
                        fullWidth
                        label="SKU (Stock Keeping Unit)"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        margin="normal"
                        placeholder="e.g., RED-SIZE-M"
                    />

                    <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        margin="normal"
                        inputProps={{ step: "0.01" }}
                    />

                    <TextField
                        fullWidth
                        label="Sale Price (Optional)"
                        name="salePrice"
                        type="number"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        margin="normal"
                        inputProps={{ step: "0.01" }}
                    />

                    <TextField
                        fullWidth
                        label="Stock Quantity"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions className='p-4'>
                    <Button onClick={handleCloseDialog} className='text-gray-600'>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" className='bg-blue-600 text-white'>
                        {editingId ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default VariationsManager;
