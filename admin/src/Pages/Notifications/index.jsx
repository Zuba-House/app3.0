import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { IoSend, IoRefresh } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import { sendBroadcastNotification } from '../../utils/sendBroadcastNotification';

const CHANNELS = [
  { value: 'general', label: 'General' },
  { value: 'promotions', label: 'Promotions' },
  { value: 'orders', label: 'Orders' },
  { value: 'cart', label: 'Cart' },
];

const CHANNEL_COLORS = {
  general: 'default',
  promotions: 'secondary',
  orders: 'primary',
  cart: 'warning',
};

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const Notifications = () => {
  const context = useContext(MyContext);
  const [devices, setDevices] = useState({ total: 0, ios: 0, android: 0 });
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('general');
  const [audience, setAudience] = useState('all');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState(null);

  const loadDevices = async () => {
    setDevicesLoading(true);
    const res = await fetchDataFromApi('/api/notifications/devices', {
      silent: true,
    });
    const data = res?.data ?? res;
    if (data && (data.total != null || data.ios != null)) {
      setDevices({
        total: data.total ?? 0,
        ios: data.ios ?? 0,
        android: data.android ?? 0,
      });
    }
    setDevicesLoading(false);
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    const res = await fetchDataFromApi(
      '/api/notifications/history?page=1&limit=30',
      { silent: true }
    );
    const payload = res?.data ?? res;
    const logs = Array.isArray(payload)
      ? payload
      : payload?.logs ?? [];
    if (logs.length) {
      setHistory(logs);
    } else {
      try {
        const local = JSON.parse(
          localStorage.getItem('admin_notification_history') || '[]'
        );
        setHistory(Array.isArray(local) ? local : []);
      } catch {
        setHistory([]);
      }
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadDevices();
    loadHistory();
  }, []);

  const handleSend = async () => {
    setSending(true);
    setAlert(null);

    const res = await postData('/api/notifications/broadcast', {
      title: title.trim(),
      message: message.trim(),
      channel,
      audience,
      data: {},
      imageUrl: imageUrl.trim() || null,
    });

    const apiOk = res?.ok === true || res?.success === true;
    const data = res?.data ?? res;

    if (apiOk && (data?.sent > 0 || data?.status === 'sent' || data?.status === 'partial')) {
      const sent = data.sent ?? 0;
      const total = data.total ?? sent;
      const failed = data.failed ?? 0;
      setAlert({
        severity: 'success',
        text: `Sent to ${sent}/${total} device${total === 1 ? '' : 's'}!${
          failed > 0 ? ` (${failed} failed)` : ''
        }`,
      });
      setTitle('');
      setMessage('');
      setImageUrl('');
      loadHistory();
      loadDevices();
    } else if (apiOk) {
      const fallback = await sendBroadcastNotification({
        title,
        message,
        channel,
        audience,
        sentBy: context?.userData?.email || 'admin',
        imageUrl,
      });
      setAlert({
        severity: fallback.ok ? 'info' : 'error',
        text:
          fallback.message ||
          data?.message ||
          'No devices received the notification. Users must open the app and allow notifications.',
      });
      if (fallback.ok) {
        setTitle('');
        setMessage('');
        loadHistory();
      }
    } else {
      setAlert({
        severity: 'error',
        text:
          res?.message ||
          'Failed to send. Check that the API is running and devices are registered.',
      });
    }

    setSending(false);
  };

  const handleResend = (entry) => {
    setTitle(entry.title || '');
    setMessage(entry.message || entry.body || '');
    setChannel(entry.channel || 'general');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box className="w-full max-w-full box-border">
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Push notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Broadcast to all registered mobile devices via Expo Push
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            label: 'Registered devices',
            value: devicesLoading ? '…' : devices.total,
            warn: !devicesLoading && devices.total === 0,
          },
          { label: 'iOS', value: devicesLoading ? '…' : devices.ios },
          { label: 'Android', value: devicesLoading ? '…' : devices.android },
        ].map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {stat.value}
                </Typography>
                {stat.warn && (
                  <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                    No devices yet — users must open the app and allow notifications.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!devicesLoading && devices.total === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No devices registered yet. Open the mobile dev client, log in, and allow
          notification permissions. Watch Metro for{' '}
          <strong>[Push] Token sent to server ✓</strong>
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Compose notification
          </Typography>
          {alert && (
            <Alert severity={alert.severity} sx={{ mb: 1.5 }} onClose={() => setAlert(null)}>
              {alert.text}
            </Alert>
          )}
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Channel</InputLabel>
                <Select
                  value={channel}
                  label="Channel"
                  onChange={(e) => setChannel(e.target.value)}
                >
                  {CHANNELS.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Audience</InputLabel>
                <Select
                  value={audience}
                  label="Audience"
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <MenuItem value="all">All app users</MenuItem>
                  <MenuItem value="registered">Registered only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={3}
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              className="btn-org"
              disabled={sending || !title.trim() || !message.trim()}
              startIcon={
                sending ? <CircularProgress size={16} color="inherit" /> : <IoSend />
              }
              onClick={handleSend}
            >
              Send notification
            </Button>
            <Button
              size="small"
              component={Link}
              to="/app-activity"
              variant="outlined"
            >
              View app activity
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Send history
            </Typography>
            <Button
              size="small"
              startIcon={
                historyLoading ? <CircularProgress size={14} /> : <IoRefresh />
              }
              onClick={loadHistory}
              disabled={historyLoading}
            >
              Refresh
            </Button>
          </Box>

          {historyLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {!historyLoading && history.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No broadcasts sent yet.
            </Typography>
          )}

          {!historyLoading &&
            history.map((entry) => {
              const sent = entry.successCount ?? entry.recipientCount ?? 0;
              const total = entry.recipientCount ?? sent;
              const failed = entry.failureCount ?? 0;
              const at = entry.sentAt || entry.createdAt;

              return (
                <Box
                  key={entry._id || entry.id}
                  sx={{
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {entry.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {entry.message || entry.body}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={entry.channel || 'general'}
                          color={CHANNEL_COLORS[entry.channel] || 'default'}
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                        <Chip
                          size="small"
                          label={entry.status || 'sent'}
                          color={
                            entry.status === 'failed'
                              ? 'error'
                              : entry.status === 'partial'
                                ? 'warning'
                                : 'success'
                          }
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatRelative(at)}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
                        ✅ {sent}/{total}
                        {failed > 0 ? ` · ❌ ${failed}` : ''}
                      </Typography>
                      <Button size="small" sx={{ mt: 0.5 }} onClick={() => handleResend(entry)}>
                        Resend
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Notifications;
