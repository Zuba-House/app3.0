import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import SearchBox from '../../Components/SearchBox';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import { formatCurrency } from '../../utils/currency';

const columns = [
    { id: "code", label: "CODE", minWidth: 120 },
    { id: "description", label: "DESCRIPTION", minWidth: 150 },
    { id: "type", label: "TYPE", minWidth: 100 },
    { id: "amount", label: "DISCOUNT", minWidth: 100 },
    { id: "usage", label: "USAGE", minWidth: 100 },
    { id: "status", label: "STATUS", minWidth: 100 },
    { id: "dates", label: "VALIDITY", minWidth: 150 },
    { id: "action", label: "ACTION", minWidth: 120 },
];

export const Coupons = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [couponData, setCouponData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const context = useContext(MyContext);

    useEffect(() => {
        getCoupons();
    }, []);

    const getCoupons = async () => {
        setIsLoading(true);
        try {
            const res = await fetchDataFromApi('/api/coupons/all');
            if (res?.success && res?.coupons) {
                setCouponData(res.coupons);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            context?.alertBox("error", "Failed to load coupons");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) {
            return;
        }

        try {
            const res = await deleteData(`/api/coupons/${id}`);
            if (res?.success) {
                context?.alertBox("success", "Coupon deleted successfully");
                getCoupons();
            } else {
                context?.alertBox("error", res?.error || "Failed to delete coupon");
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            context?.alertBox("error", "Failed to delete coupon");
        }
    };

    const filteredCoupons = couponData.filter((coupon) =>
        searchQuery === "" ||
        coupon.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDiscount = (coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountAmount}%`;
        } else if (coupon.discountType === 'fixed_cart') {
            return `$${coupon.discountAmount}`;
        } else {
            return `$${coupon.discountAmount} per item`;
        }
    };

    const formatDate = (date) => {
        if (!date) return 'No expiry';
        return new Date(date).toLocaleDateString();
    };

    const getStatus = (coupon) => {
        if (!coupon.isActive) return { text: 'Inactive', color: 'text-red-600' };
        const now = new Date();
        if (coupon.endDate && new Date(coupon.endDate) < now) return { text: 'Expired', color: 'text-red-600' };
        if (coupon.startDate && new Date(coupon.startDate) > now) return { text: 'Scheduled', color: 'text-yellow-600' };
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { text: 'Limit Reached', color: 'text-orange-600' };
        return { text: 'Active', color: 'text-green-600' };
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[24px] font-[700]">Coupons & Promo Codes</h2>
                <Link to="/coupons/add">
                    <Button className="btn-org !capitalize flex gap-2 items-center">
                        <IoMdAdd className="text-[20px]" />
                        Add Coupon
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-md shadow-md p-5">
                <div className="mb-4">
                    <SearchBox
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        placeholder="Search coupons by code or description..."
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <CircularProgress />
                    </div>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            style={{ minWidth: column.minWidth }}
                                            className="font-[600]"
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCoupons
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((coupon) => {
                                        const status = getStatus(coupon);
                                        return (
                                            <TableRow key={coupon._id} hover>
                                                <TableCell>
                                                    <span className="font-[600] text-primary">{coupon.code}</span>
                                                </TableCell>
                                                <TableCell>{coupon.description || '-'}</TableCell>
                                                <TableCell>
                                                    <span className="capitalize">{coupon.discountType?.replace('_', ' ')}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-[600] text-green-600">{formatDiscount(coupon)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`font-[500] ${status.color}`}>{status.text}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[12px]">
                                                        <div>Start: {formatDate(coupon.startDate)}</div>
                                                        <div>End: {formatDate(coupon.endDate)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/coupons/edit/${coupon._id}`}>
                                                            <Button className="!min-w-0 !p-2">
                                                                <AiOutlineEdit className="text-[18px] text-blue-600" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            className="!min-w-0 !p-2"
                                                            onClick={() => handleDelete(coupon._id)}
                                                        >
                                                            <GoTrash className="text-[18px] text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {filteredCoupons.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-gray-500">
                        No coupons found
                    </div>
                )}

                <TablePagination
                    component="div"
                    count={filteredCoupons.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </div>
        </div>
    );
};

export default Coupons;

