import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { MyContext } from '../../App';
import { deleteData, fetchDataFromApi } from '../../utils/api';
import toast from 'react-hot-toast';

const columns = [
    { id: "image", label: "IMAGE", minWidth: 150 },
    { id: "type", label: "TYPE", minWidth: 100 },
    { id: "title", label: "TITLE", minWidth: 150 },
    { id: "order", label: "ORDER", minWidth: 80 },
    { id: "status", label: "STATUS", minWidth: 100 },
    { id: "action", label: "ACTION", minWidth: 150 },
];

export const ResponsiveBannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const context = useContext(MyContext);

    useEffect(() => {
        fetchBanners();
    }, [context?.isOpenFullScreenPanel]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await fetchDataFromApi('/api/banners');
            
            if (response?.success && response?.banners) {
                let allBanners = [];
                
                // Handle different response formats
                if (Array.isArray(response.banners)) {
                    allBanners = response.banners;
                } else if (response.banners.all && Array.isArray(response.banners.all)) {
                    allBanners = response.banners.all;
                } else if (response.banners.desktop || response.banners.mobile) {
                    allBanners = [
                        ...(response.banners.desktop ? [response.banners.desktop] : []),
                        ...(response.banners.mobile ? [response.banners.mobile] : [])
                    ];
                }
                
                // Sort by order
                allBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
                setBanners(allBanners);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) {
            return;
        }

        if (context?.userData?.role === "ADMIN") {
            try {
                await deleteData(`/api/banners/${id}`);
                context.alertBox("success", "Banner deleted successfully");
                fetchBanners();
            } catch (error) {
                context.alertBox("error", "Failed to delete banner");
            }
        } else {
            context.alertBox("error", "Only admin can delete banners");
        }
    };

    const handleEdit = (banner) => {
        context.setIsOpenFullScreenPanel({
            open: true,
            model: 'Edit Responsive Banner',
            id: banner._id || banner.id
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p>Loading banners...</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between px-2 py-0 mt-1 md:mt-3">
                <h2 className="text-[18px] font-[600]">
                    Responsive Banners
                    <span className="font-[400] text-[14px] ml-2">({banners.length} banners)</span>
                </h2>

                <div className="col ml-auto flex items-center justify-end gap-3">
                    <Button 
                        className="btn-blue !text-white btn-sm" 
                        onClick={() => context.setIsOpenFullScreenPanel({
                            open: true,
                            model: 'Add Responsive Banner'
                        })}
                    >
                        Add Banner
                    </Button>
                </div>
            </div>

            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader aria-label="banners table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        width={column.minWidth}
                                        align={column.align || 'left'}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {banners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <p className="text-gray-500">No banners found. Click "Add Banner" to create one.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners.map((banner, index) => (
                                    <TableRow key={banner._id || banner.id || index} hover>
                                        <TableCell width={150}>
                                            <div className="w-[120px] h-[80px] rounded-md overflow-hidden">
                                                <img
                                                    src={banner.imageUrl || ''}
                                                    alt={banner.title || 'Banner'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/120x80?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                banner.type === 'desktop' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {banner.type?.toUpperCase() || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{banner.title || 'Untitled'}</p>
                                                {banner.subtitle && (
                                                    <p className="text-xs text-gray-500 mt-1">{banner.subtitle}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{banner.order || 0}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                banner.isActive !== false
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {banner.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell width={150}>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-blue-50 !min-w-[35px]"
                                                    onClick={() => handleEdit(banner)}
                                                    title="Edit Banner"
                                                >
                                                    <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px]" />
                                                </Button>
                                                <Button
                                                    className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-red-50 !min-w-[35px]"
                                                    onClick={() => handleDelete(banner._id || banner.id)}
                                                    title="Delete Banner"
                                                >
                                                    <GoTrash className="text-[rgba(0,0,0,0.7)] text-[18px]" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </>
    );
};

export default ResponsiveBannerManager;

