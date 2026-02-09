import React, { useContext, useState, useEffect } from 'react';
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import SearchBox from '../../Components/SearchBox';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData, editData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import { MdStore, MdEmail, MdPhone, MdCalendarToday } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle, FaPauseCircle, FaClock } from "react-icons/fa";
import { toast } from 'react-hot-toast';

const columns = [
    { id: "store", label: "STORE", minWidth: 150 },
    { id: "owner", label: "OWNER", minWidth: 120 },
    { id: "email", label: "EMAIL", minWidth: 150 },
    { id: "status", label: "STATUS", minWidth: 100 },
    { id: "balance", label: "BALANCE", minWidth: 100 },
    { id: "created", label: "CREATED", minWidth: 120 },
    { id: "action", label: "ACTION", minWidth: 200 },
];

const getStatusIcon = (status) => {
    switch (status) {
        case 'APPROVED':
            return <FaCheckCircle className="text-green-500" />;
        case 'REJECTED':
            return <FaTimesCircle className="text-red-500" />;
        case 'SUSPENDED':
            return <FaPauseCircle className="text-orange-500" />;
        case 'PENDING':
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
        case 'SUSPENDED':
            return 'bg-orange-100 text-orange-800';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const Vendors = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [vendorData, setVendorData] = useState({ vendors: [], total: 0, page: 1, pages: 0 });
    const [vendorTotalData, setVendorTotalData] = useState({ vendors: [], total: 0, page: 1, pages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    const context = useContext(MyContext);

    useEffect(() => {
        getVendors(page, rowsPerPage, statusFilter);
    }, [page, rowsPerPage, statusFilter]);

    useEffect(() => {
        // Reset to page 0 when search changes
        if (searchQuery !== undefined && searchQuery !== null) {
            setPage(0);
            getVendors(0, rowsPerPage, statusFilter);
        }
    }, [searchQuery]);

    const getVendors = (pageNum, limit, status = "") => {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
            page: (pageNum + 1).toString(),
            limit: limit.toString()
        });
        if (status) queryParams.append('status', status);
        if (searchQuery && searchQuery.trim()) {
            queryParams.append('search', searchQuery.trim());
        }

        const url = `/api/admin/vendors?${queryParams.toString()}`;
        console.log('🔍 Fetching vendors:', url);
        
        fetchDataFromApi(url).then((res) => {
            if (res?.error === false && res?.data) {
                // Ensure vendors array exists and has safe defaults
                // Filter out any null/undefined vendors first
                const validVendors = (res.data.vendors || []).filter(v => v && v._id);
                
                const safeVendors = validVendors.map(vendor => {
                    // Ensure all string fields are strings, not undefined
                    // This prevents toLowerCase() errors
                    const safeVendor = {
                        ...vendor,
                        _id: String(vendor._id || ''),
                        storeName: String(vendor.storeName || 'N/A'),
                        storeSlug: String(vendor.storeSlug || ''),
                        email: String(vendor.email || ''),
                        status: String(vendor.status || 'PENDING'),
                        availableBalance: Number(vendor.availableBalance || 0),
                        createdAt: vendor.createdAt || new Date(),
                        ownerUser: vendor.ownerUser ? {
                            _id: vendor.ownerUser._id || null,
                            name: String(vendor.ownerUser.name || 'N/A'),
                            email: String(vendor.ownerUser.email || ''),
                            phone: String(vendor.ownerUser.phone || ''),
                            ...vendor.ownerUser
                        } : { name: 'N/A', email: '', phone: '' },
                        categories: Array.isArray(vendor.categories) ? vendor.categories : []
                    };
                    return safeVendor;
                });
                
                const safeData = {
                    vendors: safeVendors,
                    total: Number(res.data.total || 0),
                    page: Number(res.data.page || 1),
                    pages: Number(res.data.pages || 0)
                };
                
                setVendorData(safeData);
                setVendorTotalData(safeData);
            } else {
                // Set empty data structure to prevent crashes
                setVendorData({ vendors: [], total: 0, page: 1, pages: 0 });
                setVendorTotalData({ vendors: [], total: 0, page: 1, pages: 0 });
                if (res?.message) {
                    toast.error(res.message);
                }
            }
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error fetching vendors:', error);
            // Set empty data structure to prevent crashes
            setVendorData({ vendors: [], total: 0, page: 1, pages: 0 });
            setVendorTotalData({ vendors: [], total: 0, page: 1, pages: 0 });
            toast.error('Failed to fetch vendors');
            setIsLoading(false);
        });
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleStatusChange = (vendorId, status) => {
        editData(`/api/admin/vendors/${vendorId}/status`, {
            status: status
        }).then((res) => {
            if (res?.error === false) {
                toast.success(`Vendor status updated to ${status}`);
                getVendors(page, rowsPerPage, statusFilter);
                setShowStatusModal(false);
                setSelectedVendor(null);
            } else {
                toast.error(res?.message || 'Failed to update status');
            }
        }).catch((error) => {
            console.error('Error updating status:', error);
            toast.error('Failed to update vendor status');
        });
    };

    const handleDelete = (vendorId) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            deleteData(`/api/admin/vendors/${vendorId}`).then((res) => {
                if (res?.error === false) {
                    toast.success('Vendor deleted successfully');
                    getVendors(page, rowsPerPage, statusFilter);
                } else {
                    toast.error(res?.message || 'Failed to delete vendor');
                }
            }).catch((error) => {
                console.error('Error deleting vendor:', error);
                toast.error('Failed to delete vendor');
            });
        }
    };

    const openStatusModal = (vendor) => {
        if (!vendor) return;
        setSelectedVendor(vendor);
        setNewStatus(vendor?.status || 'PENDING');
        setShowStatusModal(true);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <SearchBox
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search vendors by store name, email, or slug..."
                />
            </div>

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
                                {vendorData?.vendors?.length > 0 ? (
                                    vendorData.vendors.map((vendor) => (
                                        <TableRow key={vendor._id} hover>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MdStore className="text-[#efb291]" />
                                                    <div>
                                                        <div className="font-medium">{vendor?.storeName || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">/{vendor?.storeSlug || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {vendor?.ownerUser?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MdEmail className="text-gray-400" />
                                                    <span className="text-sm">{vendor?.email || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor?.status || 'PENDING')}`}>
                                                    {getStatusIcon(vendor?.status || 'PENDING')}
                                                    {vendor?.status || 'PENDING'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">${((vendor?.availableBalance || 0)).toFixed(2)}</div>
                                                    <div className="text-xs text-gray-500">Available</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MdCalendarToday className="text-gray-400" />
                                                    {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color={(vendor?.status || 'PENDING') === 'APPROVED' ? 'success' : 'primary'}
                                                        onClick={() => openStatusModal(vendor)}
                                                        className="!text-xs"
                                                    >
                                                        {(vendor?.status || 'PENDING') === 'APPROVED' ? 'Change Status' : 'Approve'}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleDelete(vendor?._id)}
                                                        className="!text-xs"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )).filter(Boolean) // Remove any null entries
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="text-center py-10 text-gray-500">
                                            No vendors found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {vendorData?.vendors?.length > 0 && (
                        <TablePagination
                            component="div"
                            count={vendorData.total || 0}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    )}
                </>
            )}

            {/* Status Change Modal */}
            {showStatusModal && selectedVendor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Change Vendor Status</h2>
                        <p className="text-gray-600 mb-4">
                            Store: <strong>{selectedVendor?.storeName || 'N/A'}</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">New Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setSelectedVendor(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                style={{ backgroundColor: '#efb291' }}
                                onClick={() => handleStatusChange(selectedVendor?._id, newStatus)}
                            >
                                Update Status
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;

