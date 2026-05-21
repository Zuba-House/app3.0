import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import {
  computeNotificationStats,
  loadNotificationHistory,
} from '../../utils/notificationHistory';
import { loadGeoBreakdown } from '../../utils/geoBreakdown';

const PIE_COLORS = ['#1565c0', '#7b1fa2', '#ef6c00', '#00897b'];

const AppAnalytics = () => {
  const context = useContext(MyContext);
  const [totalUsers, setTotalUsers] = useState('—');
  const [platformData, setPlatformData] = useState([]);
  const [authData, setAuthData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const history = useMemo(() => loadNotificationHistory(), []);
  const stats = useMemo(() => computeNotificationStats(history), [history]);

  const channelBreakdown = useMemo(() => {
    const counts = {};
    history.forEach((h) => {
      if (h.status === 'sent' || h.status === 'queued') {
        counts[h.channel] = (counts[h.channel] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [history]);

  const pushOverTime = useMemo(() => {
    const byDay = {};
    history.forEach((h) => {
      const day = (h.sentAt || '').slice(0, 10);
      if (!day) return;
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, count }));
  }, [history]);

  useEffect(() => {
    context?.setProgress?.(30);
    const load = async () => {
      const usersRes = await fetchDataFromApi(
        '/api/user/getAllUsers?page=1&limit=200',
        { silent: true }
      );
      const users = usersRes?.users ?? [];

      if (usersRes) {
        setTotalUsers(
          usersRes.totalUsersCount ?? usersRes.total ?? users.length ?? '—'
        );
      }

      const appUsers = users.filter(
        (u) => u?.pushToken || u?.expoPushToken || u?.platform === 'mobile'
      );
      const webUsers = users.length - appUsers.length;
      setPlatformData([
        { name: 'App users', value: appUsers.length },
        { name: 'Web users', value: Math.max(0, webUsers) },
      ]);

      const google = users.filter(
        (u) => u?.loginMethod?.includes('google') || u?.googleId
      ).length;
      const email = Math.max(0, users.length - google);
      setAuthData([
        { name: 'Google', count: google },
        { name: 'Email', count: email },
      ]);

      const geo = await loadGeoBreakdown(fetchDataFromApi);
      setGeoData(geo);

      context?.setProgress?.(100);
    };
    load();
  }, []);

  const sentTotal = history.filter(
    (h) => h.status === 'sent' || h.status === 'queued'
  ).length;
  const successRate =
    sentTotal > 0
      ? Math.round(
          (history.filter((h) => h.status === 'sent').length / sentTotal) * 100
        )
      : 0;

  const signupCount = useMemo(() => {
    if (totalUsers === '—' || totalUsers == null) return null;
    const n = Number(totalUsers);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [totalUsers]);

  const funnelSteps = useMemo(
    () => [
      { label: 'App opened', count: null },
      { label: 'Reached login screen', count: null },
      { label: 'Completed signup', count: signupCount },
      { label: 'Placed first order', count: null },
      { label: 'Returned (2+ sessions)', count: null },
    ],
    [signupCount]
  );

  const funnelMax = signupCount && signupCount > 0 ? signupCount : 1;

  const formatFunnelCount = (count) =>
    count == null ? '—' : count.toLocaleString();

  const funnelBarPercent = (count) =>
    count != null && count > 0
      ? Math.min(100, Math.round((count / funnelMax) * 100))
      : 0;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <Typography variant="h5" className="!font-bold">
        App Analytics
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Mobile app metrics — separate from web traffic analytics
      </Typography>

      <Grid container spacing={2}>
        {[
          {
            title: 'Total App Downloads',
            value: 'Coming soon',
            note: 'Connect App Store Connect to see live download data',
          },
          { title: 'Total App Users', value: totalUsers },
          { title: 'DAU', value: 'N/A' },
          { title: 'Sessions (month)', value: 'N/A' },
          { title: 'Avg session duration', value: 'N/A (future)' },
          { title: 'Crash-free rate', value: 'N/A (add Sentry)' },
        ].map((m) => (
          <Grid item xs={12} sm={6} md={4} key={m.title}>
            <Card className="shadow-sm h-full">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {m.title}
                </Typography>
                <Typography variant="h6" className="!font-bold">
                  {m.value}
                </Typography>
                {m.note && (
                  <Typography variant="caption" color="text.secondary">
                    {m.note}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card className="shadow-sm">
            <CardContent>
              <Typography variant="subtitle1" className="!font-semibold !mb-2">
                Platform breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={platformData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {platformData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="shadow-sm">
            <CardContent>
              <Typography variant="subtitle1" className="!font-semibold !mb-2">
                Auth method breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={authData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1565c0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card className="shadow-sm">
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Signup funnel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Conversion from first app open through repeat sessions
            </Typography>
          </Box>
          <Box
            component="ul"
            sx={{
              m: 0,
              p: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {funnelSteps.map((step, index) => {
              const hasData = step.count != null;
              const barPct = funnelBarPercent(step.count);
              const prevCount = index > 0 ? funnelSteps[index - 1].count : null;
              const dropoff =
                hasData &&
                prevCount != null &&
                prevCount > 0 &&
                step.count < prevCount
                  ? Math.round((1 - step.count / prevCount) * 100)
                  : null;

              return (
                <Box
                  component="li"
                  key={step.label}
                  sx={{
                    py: 1.5,
                    px: 1.5,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {step.label}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      {hasData ? (
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                        >
                          {formatFunnelCount(step.count)}
                        </Typography>
                      ) : (
                        <Chip
                          size="small"
                          label="Not tracked"
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            borderColor: 'divider',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={barPct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: hasData ? '#e8a87c' : 'grey.400',
                      },
                    }}
                  />
                  {hasData && barPct > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.75, display: 'block' }}
                    >
                      {barPct}% of top step
                      {dropoff != null ? ` · ${dropoff}% drop-off` : ''}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" className="!font-semibold">
        Push notification performance
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption">Total sent</Typography>
              <Typography variant="h6">{sentTotal}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption">Success rate</Typography>
              <Typography variant="h6">{successRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" className="!mb-2">
                By channel
              </Typography>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={channelBreakdown}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef6c00" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" className="!mb-2">
                Sent over time (30d)
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={pushOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#7b1fa2" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card className="shadow-sm">
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Top countries
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Users by shipping country (saved addresses and orders)
            </Typography>
          </Box>
          {geoData.length === 0 ? (
            <Box
              sx={{
                py: 3,
                px: 2,
                borderRadius: 1,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No country data yet. Countries appear when users save an address
                or place an order.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Country
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Users
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', width: 120 }}>
                      Share
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {geoData.map((g, i) => (
                    <TableRow key={g.country || i} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span" sx={{ fontSize: '1.1rem', lineHeight: 1 }}>
                            {g.flag || '🌍'}
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {g.country}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {(g.count ?? g.users ?? 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 1,
                          }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={g.percent ?? 0}
                            sx={{
                              width: 56,
                              height: 5,
                              borderRadius: 3,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: '#e8a87c',
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ minWidth: 32, textAlign: 'right' }}
                          >
                            {g.percent ?? 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppAnalytics;
