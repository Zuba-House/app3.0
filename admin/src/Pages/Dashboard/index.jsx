import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiUsers,
  FiUserPlus,
  FiShoppingBag,
  FiBell,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import {
  groupCountByDate,
  countSinceMonthStart,
  sumOrderRevenueThisMonth,
} from '../../utils/dashboardData';
import { fetchAppActivityFeed, countUnreadActivity } from '../../utils/appActivityFeed';
import {
  loadActiveSessions,
  parseOrdersPayload,
} from '../../utils/activeSessions';

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '—';
  const [local, domain] = email.split('@');
  const visible = local.slice(0, Math.min(3, local.length));
  return `${visible}***@${domain}`;
}

function formatRelative(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="dashboard-metric-card shadow-sm h-full">
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.3, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                mt: 0.5,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              flexShrink: 0,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: { xs: '1rem', sm: '1.15rem' },
              bgcolor: color,
            }}
          >
            <Icon />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalUsers: '—',
    newSignups: '—',
    appOrders: '—',
    pushSent: 0,
    revenue: '—',
    activeSessions: 0,
  });
  const [signupChart, setSignupChart] = useState([]);
  const [ordersChart, setOrdersChart] = useState([]);
  const [chartError, setChartError] = useState({ signups: false, orders: false });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const loadMetrics = async () => {
    context?.setProgress?.(40);
    let totalUsers = '—';
    let newSignups = '—';
    let appOrders = '—';
    let revenue = '—';

    const usersRes = await fetchDataFromApi(
      '/api/user/getAllUsers?page=1&limit=200',
      { silent: true }
    );
    const users = usersRes?.users ?? [];
    if (usersRes) {
      totalUsers =
        usersRes.totalUsersCount ??
        usersRes.total ??
        users.length ??
        '—';
      const monthCount = countSinceMonthStart(users);
      if (monthCount > 0) newSignups = monthCount;
    }

    const orderCount = await fetchDataFromApi('/api/order/count', { silent: true });
    if (orderCount?.count != null) appOrders = orderCount.count;

    const ordersRes = await fetchDataFromApi(
      '/api/order/order-list?page=1&limit=200',
      { silent: true }
    );
    const orders = parseOrdersPayload(ordersRes);
    const monthRev = sumOrderRevenueThisMonth(orders);
    if (monthRev != null) {
      revenue = `$${Number(monthRev).toLocaleString()}`;
    }

    const activity = await fetchAppActivityFeed();
    const activityUnread = countUnreadActivity(activity);
    const activeSessions = await loadActiveSessions(fetchDataFromApi, orders);

    setMetrics({
      totalUsers,
      newSignups,
      appOrders,
      pushSent: activityUnread,
      revenue,
      activeSessions,
    });
    context?.setProgress?.(100);
  };

  const loadCharts = async () => {
    setLoadingCharts(true);
    let signupsErr = true;
    let ordersErr = true;

    const usersRes = await fetchDataFromApi(
      '/api/user/getAllUsers?page=1&limit=200',
      { silent: true }
    );
    const users = usersRes?.users ?? [];
    const signupSeries = groupCountByDate(users, 'createdAt');
    if (signupSeries.length) {
      setSignupChart(signupSeries);
      signupsErr = false;
    }

    const ordersRes = await fetchDataFromApi(
      '/api/order/order-list?page=1&limit=200',
      { silent: true }
    );
    const orders = ordersRes?.data ?? [];
    const orderSeries = groupCountByDate(orders, 'createdAt');
    if (orderSeries.length) {
      setOrdersChart(orderSeries);
      ordersErr = false;
    }

    setChartError({ signups: signupsErr, orders: ordersErr });
    setLoadingCharts(false);
  };

  const loadRecent = async () => {
    const res = await fetchDataFromApi(
      '/api/user/getAllUsers?page=1&limit=5',
      { silent: true }
    );
    const list = res?.users ?? [];
    setRecentUsers(Array.isArray(list) ? list.slice(0, 5) : []);
    const activity = await fetchAppActivityFeed();
    setRecentActivity(activity.slice(0, 5));
  };

  useEffect(() => {
    loadMetrics();
    loadCharts();
    loadRecent();
  }, []);

  const ChartPanel = ({ title, data, errorKey, color }) => {
    const hasError = chartError[errorKey];
    const empty = !data?.length;
    const chartHeight = { xs: 200, sm: 240, md: 220 };
    if (loadingCharts) {
      return (
        <Card className="shadow-sm flex items-center justify-center" sx={{ minHeight: chartHeight }}>
          <Typography color="text.secondary" variant="body2">
            Loading chart…
          </Typography>
        </Card>
      );
    }
    if (hasError || empty) {
      return (
        <Card
          className="shadow-sm flex flex-col items-center justify-center gap-2 p-4"
          sx={{ minHeight: chartHeight }}
        >
          <Typography variant="subtitle2" textAlign="center">
            {title}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            No data available
          </Typography>
          <Button size="small" variant="outlined" onClick={loadCharts}>
            Retry
          </Button>
        </Card>
      );
    }
    const Chart = errorKey === 'signups' ? LineChart : BarChart;
    const Series = errorKey === 'signups' ? Line : Bar;
    return (
      <Card className="shadow-sm h-full">
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
            {title}
          </Typography>
          <Box sx={{ width: '100%', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Series
                type="monotone"
                dataKey="count"
                stroke={color}
                fill={color}
                name="Count"
              />
            </Chart>
          </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box className="dashboard-page w-full max-w-full box-border" sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
        App Control Center
      </Typography>

      <Grid container spacing={{ xs: 1, sm: 1.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MetricCard title="Total App Users" value={metrics.totalUsers} icon={FiUsers} color="#2e7d32" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MetricCard title="New Signups (month)" value={metrics.newSignups} icon={FiUserPlus} color="#1565c0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MetricCard title="App Orders" value={metrics.appOrders} icon={FiShoppingBag} color="#7b1fa2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MetricCard title="New activity" value={metrics.pushSent} icon={FiBell} color="#ef6c00" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MetricCard title="Revenue (month)" value={metrics.revenue} icon={FiDollarSign} color="#00897b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MetricCard title="Active Sessions" value={metrics.activeSessions} icon={FiActivity} color="#757575" />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 1.5, sm: 2 } }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel
            title="Signups (30d)"
            data={signupChart}
            errorKey="signups"
            color="#1565c0"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel
            title="Orders (30d)"
            data={ordersChart}
            errorKey="orders"
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 1.5, sm: 2 } }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card className="shadow-sm h-full">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Recent App Users
                </Typography>
                <Link to="/users" className="text-sm text-[#e8a87c] whitespace-nowrap">
                  View all →
                </Link>
              </Box>
              {recentUsers.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No recent users loaded
                </Typography>
              ) : (
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                  {recentUsers.map((u, i) => (
                    <Box
                      component="li"
                      key={u._id || i}
                      sx={{
                        display: 'flex',
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        alignItems: 'center',
                        gap: 1,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          flexShrink: 0,
                          borderRadius: '50%',
                          bgcolor: '#e8a87c',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {(u.name || u.email || '?').charAt(0).toUpperCase()}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {u.name || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {maskEmail(u.email)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={
                          u.loginMethod?.includes('google') || u.googleId
                            ? 'Google'
                            : 'Email'
                        }
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card className="shadow-sm h-full">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Recent app activity
                </Typography>
                <Link to="/notifications" className="text-sm text-[#e8a87c] whitespace-nowrap">
                  View all →
                </Link>
              </Box>
              {recentActivity.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No activity yet
                </Typography>
              ) : (
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                  {recentActivity.map((n, i) => (
                    <Box
                      component="li"
                      key={n.id || i}
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: '1 1 60%' }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {n.relativeAt || formatRelative(n.at)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={n.type === 'signup' ? 'Signup' : n.type === 'order_received' ? 'Order' : 'Delivery'}
                        color={
                          n.type === 'signup'
                            ? 'primary'
                            : n.type === 'order_received'
                              ? 'success'
                              : 'info'
                        }
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card className="shadow-sm" sx={{ mt: { xs: 1.5, sm: 2 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>
            {[
              { label: '📣 Announcement', path: '/notifications' },
              { label: '🏷️ App Coupon', path: '/app-promotions' },
              { label: '👥 Users', path: '/users' },
              { label: '📊 Analytics', path: '/app-analytics' },
            ].map((action) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={action.path}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: '#1a1a2e',
                    py: { xs: 1, sm: 1.25 },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    textTransform: 'none',
                  }}
                  onClick={() => navigate(action.path)}
                >
                  {action.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
