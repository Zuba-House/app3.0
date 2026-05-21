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
import { Chip } from '@mui/material';
import {
    giftCardHasMobile,
    giftCardIsAppExclusive,
    giftCardPlatformLabel,
} from '../../utils/giftCardChannels';

const baseColumns = [
    { id: "code", label: "CODE", minWidth: 150 },
    { id: "balance", label: "BALANCE", minWidth: 100 },
    { id: "platform", label: "PLATFORM", minWidth: 100 },
    { id: "recipient", label: "RECIPIENT", minWidth: 150 },
    { id: "status", label: "STATUS", minWidth: 100 },
    { id: "expiry", label: "EXPIRY", minWidth: 120 },
    { id: "usage", label: "USAGE", minWidth: 100 },
    { id: "action", label: "ACTION", minWidth: 150 },
];

export const GiftCards = ({ appOnly = false }) => {
    const listPath = appOnly ? '/app-gift-cards' : '/gift-cards';
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [giftCardData, setGiftCardData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const context = useContext(MyContext);

    useEffect(() => {
        getGiftCards();
    }, []);

    const getGiftCards = async () => {
        setIsLoading(true);
        try {
            const res = await fetchDataFromApi('/api/gift-cards/all', { silent: false });
            if (res?.success && res?.giftCards) {
                setGiftCardData(res.giftCards);
            }
        } catch (error) {
            context?.alertBox("error", "Failed to load gift cards");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gift card?')) {
            return;
        }

        try {
            const res = await deleteData(`/api/gift-cards/${id}`);
            if (res?.success) {
                context?.alertBox("success", "Gift card deleted successfully");
                getGiftCards();
            } else {
                context?.alertBox("error", res?.error || "Failed to delete gift card");
            }
        } catch (error) {
            console.error('Error deleting gift card:', error);
            context?.alertBox("error", "Failed to delete gift card");
        }
    };

    const handleAddBalance = async (id) => {
        const amount = prompt('Enter amount to add:');
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            context?.alertBox("error", "Please enter a valid amount");
            return;
        }

        try {
            const res = await postData(`/api/gift-cards/${id}/add-balance`, { amount: parseFloat(amount) });
            if (res?.success) {
                context?.alertBox("success", "Balance added successfully");
                getGiftCards();
            } else {
                context?.alertBox("error", res?.error || "Failed to add balance");
            }
        } catch (error) {
            console.error('Error adding balance:', error);
            context?.alertBox("error", "Failed to add balance");
        }
    };

    const filteredGiftCards = giftCardData.filter((card) => {
        if (appOnly && !giftCardHasMobile(card)) return false;
        if (searchQuery === "") return true;
        const q = searchQuery.toLowerCase();
        return (
            card.code?.toLowerCase().includes(q) ||
            card.recipientEmail?.toLowerCase().includes(q) ||
            card.recipientName?.toLowerCase().includes(q)
        );
    });

    const appStats = {
        total: filteredGiftCards.length,
        exclusive: filteredGiftCards.filter(giftCardIsAppExclusive).length,
    };

    const formatDate = (date) => {
        if (!date) return 'No expiry';
        return new Date(date).toLocaleDateString();
    };

    const getStatus = (card) => {
        if (!card.isActive) return { text: 'Inactive', color: 'text-red-600' };
        if (card.isRedeemed) return { text: 'Redeemed', color: 'text-gray-600' };
        if (card.currentBalance <= 0) return { text: 'Zero Balance', color: 'text-orange-600' };
        const now = new Date();
        if (card.expiryDate && new Date(card.expiryDate) < now) return { text: 'Expired', color: 'text-red-600' };
        return { text: 'Active', color: 'text-green-600' };
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                        {appOnly ? 'App-Only Gift Cards' : 'Gift Cards'}
                    </h2>
                    {appOnly && (
                        <p className="text-sm text-gray-500 mt-1">
                            Redeemable in the mobile app · Active: {appStats.total} · App exclusive: {appStats.exclusive}
                        </p>
                    )}
                </div>
                <Link to={`${listPath}/add`}>
                    <Button className="btn-org !capitalize flex gap-2 items-center" size="small">
                        <IoMdAdd className="text-[20px]" />
                        {appOnly ? 'Create App Gift Card' : 'Add Gift Card'}
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-md shadow-md p-5">
                <div className="mb-4">
                    <SearchBox
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        placeholder="Search gift cards by code, email, or name..."
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
                                    {baseColumns.map((column) => (
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
                                {filteredGiftCards
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((card) => {
                                        const status = getStatus(card);
                                        return (
                                            <TableRow key={card._id} hover>
                                                <TableCell>
                                                    <span className="font-[600] text-primary">{card.code}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <span className="font-[600] text-green-600">
                                                            {formatCurrency(card.currentBalance)}
                                                        </span>
                                                        <span className="text-[12px] text-gray-500 ml-1">
                                                            / {formatCurrency(card.initialBalance)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={giftCardPlatformLabel(card)}
                                                        color={giftCardIsAppExclusive(card) ? 'secondary' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[12px]">
                                                        {card.recipientName && <div>{card.recipientName}</div>}
                                                        {card.recipientEmail && <div className="text-gray-500">{card.recipientEmail}</div>}
                                                        {!card.recipientName && !card.recipientEmail && <div className="text-gray-400">General Use</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`font-[500] ${status.color}`}>{status.text}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(card.expiryDate)}
                                                </TableCell>
                                                <TableCell>
                                                    {card.usageHistory?.length || 0} uses
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`${listPath}/edit/${card._id}`}>
                                                            <Button className="!min-w-0 !p-2">
                                                                <AiOutlineEdit className="text-[18px] text-blue-600" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            className="!min-w-0 !p-2"
                                                            onClick={() => handleAddBalance(card._id)}
                                                            title="Add Balance"
                                                        >
                                                            <span className="text-[14px] text-green-600 font-[600]">+$</span>
                                                        </Button>
                                                        <Button
                                                            className="!min-w-0 !p-2"
                                                            onClick={() => handleDelete(card._id)}
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

                {filteredGiftCards.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-gray-500">
                        {appOnly
                            ? 'No app gift cards yet. Create one with Mobile channel enabled.'
                            : 'No gift cards found'}
                    </div>
                )}

                <TablePagination
                    component="div"
                    count={filteredGiftCards.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </div>
        </div>
    );
};

export default GiftCards;

