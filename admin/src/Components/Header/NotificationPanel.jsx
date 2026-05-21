import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Menu,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { IoClose, IoRefresh } from 'react-icons/io5';
import { FiUserPlus, FiPackage, FiTruck } from 'react-icons/fi';
import {
  fetchAppActivityFeed,
  markAllActivitySeen,
  isActivityUnread,
  APP_ACTIVITY_UPDATED_EVENT,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_COLORS,
} from '../../utils/appActivityFeed';

const TYPE_ICONS = {
  signup: FiUserPlus,
  order_received: FiPackage,
  order_delivery: FiTruck,
};

const NotificationPanel = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = async (force = false) => {
    setLoading(true);
    const list = await fetchAppActivityFeed({ force });
    setItems(list);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      markAllActivitySeen();
      window.dispatchEvent(
        new CustomEvent('admin-notification-badge', { detail: { count: 0 } })
      );
      load(true);
    }
  }, [open]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener(APP_ACTIVITY_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(APP_ACTIVITY_UPDATED_EVENT, refresh);
  }, []);

  const goTo = (link) => {
    onClose();
    navigate(link);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            width: { xs: 'min(100vw - 24px, 400px)', sm: 420 },
            maxHeight: 'min(85vh, 560px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            mt: 1,
            p: 0,
          },
        },
        list: {
          sx: {
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'min(85vh, 560px)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            App activity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Signups, orders &amp; deliveries from the app
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => load(true)} aria-label="Refresh" disabled={loading}>
            <IoRefresh />
          </IconButton>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <IoClose />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      <Box
        className="app-activity-panel-scroll"
        onWheel={(e) => e.stopPropagation()}
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          maxHeight: 'min(60vh, 400px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && items.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No recent app activity yet.
          </Typography>
        )}

        {!loading && items.length > 0 && (
          <List dense disablePadding>
            {items.map((item) => {
              const Icon = TYPE_ICONS[item.type] || FiPackage;
              const unreadItem = isActivityUnread(item);
              return (
                <ListItemButton
                  key={item.id}
                  onClick={() => goTo(item.link)}
                  sx={{
                    alignItems: 'flex-start',
                    py: 1.25,
                    bgcolor: unreadItem ? 'action.hover' : 'transparent',
                  }}
                >
                  <Box
                    sx={{
                      mr: 1.5,
                      mt: 0.25,
                      color: 'primary.main',
                      display: 'flex',
                    }}
                  >
                    <Icon size={18} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {item.relativeAt}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                      {item.message}
                    </Typography>
                    <Chip
                      size="small"
                      label={ACTIVITY_TYPE_LABELS[item.type] || item.type}
                      color={ACTIVITY_TYPE_COLORS[item.type] || 'default'}
                      sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1.25, display: 'flex', gap: 1 }}>
        <Button
          component={Link}
          to="/notifications"
          size="small"
          fullWidth
          onClick={onClose}
        >
          View all activity
        </Button>
        <Button size="small" variant="outlined" onClick={() => goTo('/orders')}>
          Orders
        </Button>
      </Box>
    </Menu>
  );
};

export default NotificationPanel;
