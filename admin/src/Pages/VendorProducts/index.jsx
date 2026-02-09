import React, { useState, useEffect } from 'react';
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import CircularProgress from '@mui/material/CircularProgress';
import { fetchDataFromApi, editData } from '../../utils/api';
import { toast } from 'react-hot-toast';
import SearchBox from '../../Components/SearchBox';
import { FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaImage } from "react-icons/fa";
import { MdStore } from "react-icons/md";

const columns = [
    { id: "product", label: "PRODUCT", minWidth: 200 },
    { id: "vendor", label: "VENDOR", minWidth: 120 },
    { id: "price", label: "PRICE", minWidth: 80 },
    { id: "stock", label: "STOCK", minWidth: 80 },
    { id: "status", label: "APPROVAL STATUS", minWidth: 120 },
    { id: "date", label: "DATE", minWidth: 100 },
    { id: "action", label: "ACTION", minWidth: 200 },
];

const getStatusIcon = (status) => {
    switch (status) {
        case 'APPROVED':
            return <FaCheckCircle className="text-green-500" />;
        case 'REJECTED':
            return <FaTimesCircle className="text-red-500" />;
        case 'PENDING_REVIEW':
            return <FaClock className="text-yellow-500" />;
        default:
            return <FaClock className="text-gray-500" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'bg-green-100 text-green-800';
        case 'REJECTED':
            return 'bg-red-100 text-red-800';
        case 'PENDING_REVIEW':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'Approved';
        case 'REJECTED':
            return 'Rejected';
        case 'PENDING_REVIEW':
            return 'Pending Review';
        default:
            return status;
    }
};

export const VendorProducts = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approvalNotes, setApprovalNotes] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [page, rowsPerPage, statusFilter]);

    useEffect(() => {
        if (searchQuery !== undefined && searchQuery !== null) {
            setPage(0);
            fetchProducts();
        }
    }, [searchQuery]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString()
            });
            
            if (statusFilter) queryParams.append('approvalStatus', statusFilter);
            if (searchQuery && searchQuery.trim()) {
                queryParams.append('search', searchQuery.trim());
            }

            const url = `/api/admin/vendors/products?${queryParams.toString()}`;
            console.log('🔍 Fetching vendor products:', url);
            
            const res = await fetchDataFromApi(url);
            
            if (res?.error === false && res?.data) {
                setProducts(res.data.products || []);
                setTotal(res.data.total || 0);
                setCounts(res.data.counts || { pending: 0, approved: 0, rejected: 0 });
            } else {
                setProducts([]);
                setTotal(0);
                if (res?.message) {
                    toast.error(res.message);
                }
            }
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleApprove = async () => {
        if (!selectedProduct) return;
        
        try {
            const res = await editData(`/api/admin/vendors/products/${selectedProduct._id}/approve`, {
                notes: approvalNotes
            });
            
            if (res?.error === false) {
                toast.success('Product approved successfully');
                fetchProducts();
                setShowApproveModal(false);
                setSelectedProduct(null);
                setApprovalNotes("");
            } else {
                toast.error(res?.message || 'Failed to approve product');
            }
        } catch (error) {
            console.error('Error approving product:', error);
            toast.error('Failed to approve product');
        }
    };

    const handleReject = async () => {
        if (!selectedProduct) return;
        
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        
        try {
            const res = await editData(`/api/admin/vendors/products/${selectedProduct._id}/reject`, {
                reason: rejectionReason,
                notes: approvalNotes
            });
            
            if (res?.error === false) {
                toast.success('Product rejected');
                fetchProducts();
                setShowRejectModal(false);
                setSelectedProduct(null);
                setRejectionReason("");
                setApprovalNotes("");
            } else {
                toast.error(res?.message || 'Failed to reject product');
            }
        } catch (error) {
            console.error('Error rejecting product:', error);
            toast.error('Failed to reject product');
        }
    };

    const openApproveModal = (product) => {
        setSelectedProduct(product);
        setShowApproveModal(true);
    };

    const openRejectModal = (product) => {
        setSelectedProduct(product);
        setShowRejectModal(true);
    };

    const openDetailModal = (product) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
    };

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0]?.url || product.images[0] || '';
        }
        return product.featuredImage || '';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vendor Product Approval</h1>
                    <p className="text-gray-600 text-sm mt-1">Review and approve vendor product submissions</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div 
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                        statusFilter === 'PENDING_REVIEW' 
                            ? 'bg-yellow-100 border-2 border-yellow-500' 
                            : 'bg-yellow-50 hover:bg-yellow-100'
                    }`}
                    onClick={() => { setStatusFilter('PENDING_REVIEW'); setPage(0); }}
                >
                    <div className="flex items-center gap-2">
                        <FaClock className="text-yellow-500 text-xl" />
                        <div>
                            <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
                            <p className="text-sm text-yellow-600">Pending Review</p>
                        </div>
                    </div>
                </div>
                <div 
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                        statusFilter === 'APPROVED' 
                            ? 'bg-green-100 border-2 border-green-500' 
                            : 'bg-green-50 hover:bg-green-100'
                    }`}
                    onClick={() => { setStatusFilter('APPROVED'); setPage(0); }}
                >
                    <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500 text-xl" />
                        <div>
                            <p className="text-2xl font-bold text-green-700">{counts.approved}</p>
                            <p className="text-sm text-green-600">Approved</p>
                        </div>
                    </div>
                </div>
                <div 
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                        statusFilter === 'REJECTED' 
                            ? 'bg-red-100 border-2 border-red-500' 
                            : 'bg-red-50 hover:bg-red-100'
                    }`}
                    onClick={() => { setStatusFilter('REJECTED'); setPage(0); }}
                >
                    <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-red-500 text-xl" />
                        <div>
                            <p className="text-2xl font-bold text-red-700">{counts.rejected}</p>
                            <p className="text-sm text-red-600">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <SearchBox
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        placeholder="Search products by name or SKU..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(0);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                >
                    <option value="">All Status</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Products Table */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <CircularProgress />
                </div>
            ) : (
                <>
                    <TableContainer className="bg-white rounded-lg shadow">
                        <Table>
                            <TableHead>
                                <TableRow className="bg-gray-50">
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            style={{ minWidth: column.minWidth }}
                                            className="font-semibold text-gray-700"
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <TableRow key={product._id} hover>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        {getProductImage(product) ? (
                                                            <img 
                                                                src={getProductImage(product)} 
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <FaImage className="text-gray-400 text-xl" style={{ display: getProductImage(product) ? 'none' : 'block' }} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                                        <div className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MdStore className="text-[#efb291]" />
                                                    <span className="text-sm">{product.vendor?.storeName || product.vendorShopName || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {formatCurrency(product.pricing?.price || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-sm font-medium ${
                                                    (product.inventory?.stock || 0) <= 0 ? 'text-red-600' : 
                                                    (product.inventory?.stock || 0) <= 10 ? 'text-yellow-600' : 'text-green-600'
                                                }`}>
                                                    {product.inventory?.endlessStock ? '∞' : (product.inventory?.stock || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.approvalStatus)}`}>
                                                    {getStatusIcon(product.approvalStatus)}
                                                    {getStatusLabel(product.approvalStatus)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(product.createdAt).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => openDetailModal(product)}
                                                        className="!text-xs"
                                                    >
                                                        <FaEye className="mr-1" /> View
                                                    </Button>
                                                    {product.approvalStatus === 'PENDING_REVIEW' && (
                                                        <>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => openApproveModal(product)}
                                                                className="!text-xs"
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => openRejectModal(product)}
                                                                className="!text-xs"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {product.approvalStatus === 'REJECTED' && (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => openApproveModal(product)}
                                                            className="!text-xs"
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="text-center py-10 text-gray-500">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {products.length > 0 && (
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    )}
                </>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-green-600">Approve Product</h2>
                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">
                                You are about to approve:
                            </p>
                            <p className="font-medium text-lg">{selectedProduct.name}</p>
                            <p className="text-sm text-gray-500">by {selectedProduct.vendor?.storeName || selectedProduct.vendorShopName}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Notes (Optional)</label>
                            <textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="3"
                                placeholder="Add any notes about the approval..."
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedProduct(null);
                                    setApprovalNotes("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleApprove}
                            >
                                Approve & Publish
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-red-600">Reject Product</h2>
                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">
                                You are about to reject:
                            </p>
                            <p className="font-medium text-lg">{selectedProduct.name}</p>
                            <p className="text-sm text-gray-500">by {selectedProduct.vendor?.storeName || selectedProduct.vendorShopName}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-red-600">Rejection Reason *</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="3"
                                placeholder="Explain why this product is being rejected..."
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Additional Notes (Optional)</label>
                            <textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                rows="2"
                                placeholder="Any additional notes..."
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedProduct(null);
                                    setRejectionReason("");
                                    setApprovalNotes("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleReject}
                            >
                                Reject Product
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Product Details</h2>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Product Image */}
                            <div className="col-span-2 md:col-span-1">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {getProductImage(selectedProduct) ? (
                                        <img 
                                            src={getProductImage(selectedProduct)} 
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaImage className="text-gray-400 text-4xl" />
                                    )}
                                </div>
                            </div>
                            
                            {/* Product Info */}
                            <div className="col-span-2 md:col-span-1">
                                <h3 className="text-lg font-semibold mb-2">{selectedProduct.name}</h3>
                                
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500">SKU:</span> {selectedProduct.sku || 'N/A'}</p>
                                    <p><span className="text-gray-500">Vendor:</span> {selectedProduct.vendor?.storeName || selectedProduct.vendorShopName || 'N/A'}</p>
                                    <p><span className="text-gray-500">Category:</span> {selectedProduct.category?.name || 'N/A'}</p>
                                    <p><span className="text-gray-500">Price:</span> {formatCurrency(selectedProduct.pricing?.price || 0)}</p>
                                    <p><span className="text-gray-500">Stock:</span> {selectedProduct.inventory?.endlessStock ? 'Unlimited' : (selectedProduct.inventory?.stock || 0)}</p>
                                    <p>
                                        <span className="text-gray-500">Status:</span> 
                                        <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.approvalStatus)}`}>
                                            {getStatusIcon(selectedProduct.approvalStatus)}
                                            {getStatusLabel(selectedProduct.approvalStatus)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="mt-6 flex gap-2 justify-end">
                            <Button
                                variant="outlined"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Close
                            </Button>
                            {selectedProduct.approvalStatus === 'PENDING_REVIEW' && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            openApproveModal(selectedProduct);
                                        }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            openRejectModal(selectedProduct);
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProducts;

