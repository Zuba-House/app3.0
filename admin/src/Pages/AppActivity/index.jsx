import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { IoRefresh } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import {
  fetchAppActivityFeed,
  markAllActivitySeen,
  dispatchAppActivityUpdated,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_COLORS,
} from '../../utils/appActivityFeed';

const TYPE_FILTER = [
  { value: 'all', label: 'All' },
  { value: 'signup', label: 'Signups' },
  { value: 'order_received', label: 'New orders' },
  { value: 'order_delivery', label: 'Deliveries' },
];

const AppActivity = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  const load = async (force = false) => {
    setLoading(true);
    setItems(await fetchAppActivityFeed({ force }));
    setLoading(false);
  };

  useEffect(() => {
    load();
    markAllActivitySeen();
  }, []);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return items;
    return items.filter((i) => i.type === typeFilter);
  }, [items, typeFilter]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const week = items.filter((i) => new Date(i.at).getTime() >= weekAgo);
    return {
      total: items.length,
      signups: week.filter((i) => i.type === 'signup').length,
      orders: week.filter((i) => i.type === 'order_received').length,
      deliveries: week.filter((i) => i.type === 'order_delivery').length,
    };
  }, [items]);

  return (
    <Box className="w-full max-w-full box-border">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            App activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Signups, orders, and delivery updates from the mobile app
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={loading ? <CircularProgress size={14} /> : <IoRefresh />}
          onClick={() => {
            dispatchAppActivityUpdated();
            load(true);
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: 2 }}>
        {[
          { label: 'Recent events', value: stats.total },
          { label: 'Signups (7d)', value: stats.signups },
          { label: 'New orders (7d)', value: stats.orders },
          { label: 'Delivery updates (7d)', value: stats.deliveries },
        ].map((s) => (
          <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
            <Card>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <FormControl size="small" sx={{ minWidth: 160, mb: 1.5 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={typeFilter}
              label="Filter"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {TYPE_FILTER.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && filtered.length === 0 && (
            <Typography color="text.secondary" variant="body2">
              No activity yet. New signups and orders from the app will appear here.
            </Typography>
          )}

          {!loading &&
            filtered.map((item) => (
              <Box
                key={item.id}
                sx={{
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.message}
                  </Typography>
                  <Chip
                    size="small"
                    label={ACTIVITY_TYPE_LABELS[item.type]}
                    color={ACTIVITY_TYPE_COLORS[item.type]}
                    sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.relativeAt}
                  </Typography>
                  <Button component={Link} to={item.link} size="small" sx={{ mt: 0.5, minWidth: 0, p: 0 }}>
                    Open
                  </Button>
                </Box>
              </Box>
            ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AppActivity;
