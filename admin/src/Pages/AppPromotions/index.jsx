import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';

const isAppOnly = (coupon) => {
  const ch = coupon?.allowedChannels || coupon?.channels || [];
  return Array.isArray(ch) && ch.length === 1 && ch.includes('mobile');
};

const hasMobile = (coupon) => {
  const ch = coupon?.allowedChannels || coupon?.channels || [];
  return Array.isArray(ch) && ch.includes('mobile');
};

const AppPromotions = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    context?.setProgress?.(40);
    fetchDataFromApi('/api/coupon/all')
      .then((res) => {
        const list = res?.coupons ?? res?.data ?? res ?? [];
        const filtered = (Array.isArray(list) ? list : []).filter(hasMobile);
        setCoupons(filtered);
      })
      .catch(() => setCoupons([]))
      .finally(() => {
        setLoading(false);
        context?.setProgress?.(100);
      });
  }, []);

  const stats = useMemo(() => {
    const active = coupons.filter(
      (c) => c.status !== 'inactive' && c.status !== 'expired'
    ).length;
    const used = coupons.reduce((s, c) => s + (c.usedCount || c.used || 0), 0);
    return { active, used, revenue: '—' };
  }, [coupons]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <Typography variant="h5" className="!font-bold">
            App-Only Promotions
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Exclusive deals for your mobile app users
          </Typography>
        </div>
        <Button
          variant="contained"
          onClick={() => navigate('/coupons/add')}
          sx={{ bgcolor: '#1a1a2e' }}
        >
          Create App Coupon
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <span>
          Active app coupons: <strong>{stats.active}</strong>
        </span>
        <span>
          Used this month: <strong>{stats.used}</strong>
        </span>
        <span>
          Revenue from app promos: <strong>{stats.revenue}</strong>
        </span>
      </div>

      <TableContainer className="bg-white rounded-lg shadow-sm">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No app coupons yet. Create one with mobile channel enabled.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((c, i) => (
                <TableRow key={c._id || i}>
                  <TableCell>
                    <strong>{c.code || c.couponCode}</strong>
                    {isAppOnly(c) && (
                      <Chip
                        label="App Exclusive"
                        size="small"
                        color="secondary"
                        className="!ml-2"
                      />
                    )}
                  </TableCell>
                  <TableCell>{c.discountType || c.type || '—'}</TableCell>
                  <TableCell>
                    {c.discount ?? c.discountValue ?? '—'}
                    {c.discountType === 'percentage' ? '%' : ''}
                  </TableCell>
                  <TableCell>
                    {c.usedCount ?? c.used ?? 0}/
                    {c.usageLimit ?? c.limit ?? '∞'}
                  </TableCell>
                  <TableCell>📱 Mobile</TableCell>
                  <TableCell>
                    {c.expiryDate
                      ? new Date(c.expiryDate).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>{c.status || 'active'}</TableCell>
                  <TableCell>
                    <Link to={`/coupons/edit/${c._id}`}>Edit</Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AppPromotions;
