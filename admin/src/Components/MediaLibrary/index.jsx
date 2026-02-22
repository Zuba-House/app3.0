import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    IconButton,
    Typography,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Chip,
    Tooltip,
    InputAdornment
} from '@mui/material';
import {
    FaTimes as CloseIcon,
    FaSearch as SearchIcon,
    FaTrash as DeleteIcon,
    FaUpload as UploadIcon,
    FaCheckCircle as CheckCircleIcon,
    FaImage as ImageIcon
} from 'react-icons/fa';
import { fetchDataFromApi, postData, deleteData } from '../../utils/api';
import UploadBox from '../UploadBox';
import './MediaLibrary.css';

const MediaLibrary = ({ open, onClose, onSelect, multiple = false, selectedImages = [] }) => {
    // Convert selectedImages array to Set of IDs if they're objects
    const getSelectedIds = () => {
        if (!selectedImages || selectedImages.length === 0) return new Set();
        return new Set(selectedImages.map(img => typeof img === 'string' ? img : img._id || img));
    };
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState(new Set(selectedImages));
    const [sortBy, setSortBy] = useState('uploadedAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch media from API
    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '24',
                search: search,
                sortBy: sortBy,
                sortOrder: sortOrder,
                isActive: 'true'
            });
            
            const response = await fetchDataFromApi(`/api/media?${params}`);
            
            if (response?.success && response?.data) {
                setMedia(response.data.media || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, sortBy, sortOrder]);

    useEffect(() => {
        if (open) {
            fetchMedia();
            setSelected(getSelectedIds());
        }
    }, [open, fetchMedia]);

    // Handle image upload
    const handleUpload = async (previewsArr) => {
        setUploading(true);
        try {
            // The UploadBox component handles the actual upload
            // We just need to refresh the media list
            await fetchMedia();
        } catch (error) {
            console.error('Error uploading media:', error);
        } finally {
            setUploading(false);
        }
    };

    // Handle image selection
    const handleImageSelect = (mediaItem) => {
        if (multiple) {
            const newSelected = new Set(selected);
            if (newSelected.has(mediaItem._id)) {
                newSelected.delete(mediaItem._id);
            } else {
                newSelected.add(mediaItem._id);
            }
            setSelected(newSelected);
        } else {
            setSelected(new Set([mediaItem._id]));
        }
    };

    // Handle confirm selection
    const handleConfirm = () => {
        const selectedMedia = media.filter(item => selected.has(item._id));
        onSelect(selectedMedia);
        onClose();
    };

    // Handle delete
    const handleDelete = async (mediaId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                const response = await deleteData(`/api/media/${mediaId}`);
                if (response?.success) {
                    await fetchMedia();
                    // Remove from selected if it was selected
                    const newSelected = new Set(selected);
                    newSelected.delete(mediaId);
                    setSelected(newSelected);
                }
            } catch (error) {
                console.error('Error deleting media:', error);
                alert('Failed to delete image. It may be in use.');
            }
        }
    };

    // Check if image is selected
    const isSelected = (mediaId) => {
        return selected.has(mediaId);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            className="media-library-dialog"
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Media Library</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                {/* Search and Filters */}
                <Box mb={3} display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        placeholder="Search images..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: '#999' }} />
                                </InputAdornment>
                            )
                        }}
                        style={{ flex: 1, minWidth: 200 }}
                    />
                    
                    <FormControl size="small" style={{ minWidth: 150 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="uploadedAt">Date</MenuItem>
                            <MenuItem value="filename">Name</MenuItem>
                            <MenuItem value="bytes">Size</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl size="small" style={{ minWidth: 120 }}>
                        <InputLabel>Order</InputLabel>
                        <Select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="desc">Newest</MenuItem>
                            <MenuItem value="asc">Oldest</MenuItem>
                        </Select>
                    </FormControl>

                    <Box>
                        <UploadBox
                            name="media"
                            url="/api/media/upload"
                            setPreviewsFun={handleUpload}
                            multiple={true}
                            buttonText="Upload Images"
                            buttonIcon={<UploadIcon />}
                        />
                    </Box>
                </Box>

                {/* Media Grid */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : media.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <ImageIcon style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
                        <Typography variant="body1" color="textSecondary">
                            No images found. Upload some images to get started.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={2}>
                            {media.map((item) => (
                                <Grid item xs={6} sm={4} md={3} key={item._id}>
                                    <Box
                                        className={`media-item ${isSelected(item._id) ? 'selected' : ''}`}
                                        onClick={() => handleImageSelect(item)}
                                        style={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            border: isSelected(item._id) ? '3px solid #1976d2' : '2px solid #e0e0e0',
                                            borderRadius: 8,
                                            overflow: 'hidden',
                                            aspectRatio: '1',
                                        }}
                                    >
                                        <img
                                            src={item.secureUrl || item.url}
                                            alt={item.alt || item.filename}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        
                                        {/* Selection Checkbox */}
                                        <Box
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '50%',
                                                padding: 4
                                            }}
                                        >
                                            {isSelected(item._id) ? (
                                                <CheckCircleIcon style={{ color: '#1976d2' }} />
                                            ) : (
                                                <Box
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        border: '2px solid #999',
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        {/* Delete Button */}
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleDelete(item._id, e)}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    right: 8,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    padding: 4
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" style={{ color: '#d32f2f' }} />
                                            </IconButton>
                                        </Tooltip>

                                        {/* Image Info Overlay */}
                                        <Box
                                            className="media-info-overlay"
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                color: 'white',
                                                padding: '8px',
                                                fontSize: '12px',
                                                transform: 'translateY(100%)',
                                                transition: 'transform 0.2s'
                                            }}
                                        >
                                            <Typography variant="caption" noWrap>
                                                {item.filename || item.originalName}
                                            </Typography>
                                            {item.width && item.height && (
                                                <Typography variant="caption" display="block">
                                                    {item.width} × {item.height}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box display="flex" justifyContent="center" mt={3} gap={1}>
                                <Button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <Typography variant="body2" style={{ alignSelf: 'center' }}>
                                    Page {page} of {totalPages}
                                </Typography>
                                <Button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={selected.size === 0}
                >
                    Select {selected.size > 0 ? `(${selected.size})` : ''}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MediaLibrary;

