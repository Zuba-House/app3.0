/**
 * Order detail — production UI with line items, totals, address, and payment.
 */

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import {
  formatOrderDate,
  formatShippingAddress,
  getOrderDiscount,
  getOrderId,
  getOrderLineItems,
  getOrderNumber,
  getOrderPaymentMethod,
  getOrderShippingCost,
  getOrderStatusBadgeColors,
  getOrderStatusLabel,
  getOrderSubtotal,
  getOrderTax,
  getOrderTotal,
  getPaymentStatusLabel,
  type RawOrder,
} from '../../utils/order.mappers';

type OrderDetailParams = { OrderDetail: { orderId: string } };

const PALETTE = {
  background: '#f5f0eb',
  card: '#ffffff',
  primary: '#1a2332',
  accent: '#e8a87c',
  gray: '#6b7280',
};

const paymentBadgeStyle = (status: ReturnType<typeof getPaymentStatusLabel>) => {
  if (status === 'Paid') return styles.paymentPaid;
  if (status === 'Failed') return styles.paymentFailed;
  return styles.paymentPending;
};

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OrderDetailParams>>();
  const route = useRoute<RouteProp<OrderDetailParams, 'OrderDetail'>>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Order Details',
      headerBackTitle: 'Orders',
      headerBackTitleVisible: true,
    });
  }, [navigation]);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError('Could not load order details. Please try again.');
      }
    } catch {
      setError('Could not load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PALETTE.accent} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errTitle}>Order unavailable</Text>
        <Text style={styles.err}>{error || 'Could not load order details. Please try again.'}</Text>
        <TouchableOpacity onPress={() => void loadOrder()} style={styles.btn}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const raw = order as unknown as RawOrder;
  const lineItems = getOrderLineItems(raw);
  const subtotal = getOrderSubtotal(raw);
  const shipping = getOrderShippingCost(raw);
  const tax = getOrderTax(raw);
  const discount = getOrderDiscount(raw);
  const total = getOrderTotal(raw);
  const status = getOrderStatusLabel(raw);
  const statusColors = getOrderStatusBadgeColors(status);
  const paymentStatus = getPaymentStatusLabel(raw);
  const paymentMethod = getOrderPaymentMethod(raw);
  const displayId = getOrderNumber(raw) || getOrderId(raw).slice(-6).toUpperCase();
  const addressText = formatShippingAddress(raw);
  const hasAddress = addressText !== '—' && addressText.trim().length > 0;
  const placedDate = formatOrderDate(raw.createdAt ?? raw.date);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.orderNumber}>Order #{displayId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.backgroundColor }]}>
          <Text style={[styles.statusBadgeText, { color: statusColors.textColor }]}>{status}</Text>
        </View>
        <Text style={styles.placedDate}>Placed {placedDate}</Text>
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items ordered</Text>
        {lineItems.length === 0 ? (
          <Text style={styles.unavailableText}>Item details unavailable</Text>
        ) : (
          lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[styles.lineItem, index < lineItems.length - 1 && styles.lineItemBorder]}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Ionicons name="image-outline" size={22} color="#9aa5b1" />
                </View>
              )}
              <View style={styles.lineBody}>
                <Text style={styles.lineName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.lineMeta}>Qty: {item.quantity}</Text>
                <Text style={styles.lineUnit}>${item.unitPrice.toFixed(2)} each</Text>
              </View>
              <Text style={styles.lineTotal}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}
          </Text>
        </View>
        {tax > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
        ) : null}
        {discount > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>-${discount.toFixed(2)}</Text>
          </View>
        ) : null}
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Delivery */}
      {hasAddress ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery info</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color={PALETTE.accent} style={styles.pinIcon} />
            <Text style={styles.addressText}>{addressText}</Text>
          </View>
        </View>
      ) : null}

      {/* Payment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.summaryLabel}>Status</Text>
          <View style={[styles.paymentBadge, paymentBadgeStyle(paymentStatus)]}>
            <Text style={styles.paymentBadgeText}>{paymentStatus}</Text>
          </View>
        </View>
        {paymentMethod ? (
          <View style={[styles.paymentRow, styles.paymentMethodRow]}>
            <Text style={styles.summaryLabel}>Method</Text>
            <Text style={styles.summaryValue}>{paymentMethod}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const cardShadow = {
  shadowColor: '#1a2332',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.background },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, gap: 16 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: PALETTE.background,
  },
  headerSection: { marginBottom: 4 },
  orderNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: PALETTE.primary,
    letterSpacing: 0.3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 10,
  },
  statusBadgeText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  placedDate: { fontSize: 14, color: PALETTE.gray, marginTop: 8 },
  card: {
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    padding: 16,
    ...cardShadow,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.primary,
    marginBottom: 12,
  },
  unavailableText: { fontSize: 14, color: PALETTE.gray, fontStyle: 'italic' },
  lineItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  lineItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0ebe4' },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#eef2f5' },
  thumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  lineBody: { flex: 1, marginHorizontal: 12 },
  lineName: { fontSize: 15, fontWeight: '700', color: PALETTE.primary },
  lineMeta: { fontSize: 13, color: PALETTE.gray, marginTop: 4 },
  lineUnit: { fontSize: 12, color: PALETTE.gray, marginTop: 2 },
  lineTotal: { fontSize: 15, fontWeight: '700', color: PALETTE.primary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: PALETTE.gray },
  summaryValue: { fontSize: 14, fontWeight: '600', color: PALETTE.primary },
  discountValue: { color: '#15803d' },
  summaryDivider: { height: 1, backgroundColor: '#f0ebe4', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: PALETTE.primary },
  totalValue: { fontSize: 18, fontWeight: '800', color: PALETTE.accent },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  pinIcon: { marginTop: 2, marginRight: 8 },
  addressText: { flex: 1, fontSize: 14, color: PALETTE.primary, lineHeight: 22 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentMethodRow: { marginTop: 10 },
  paymentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  paymentPaid: { backgroundColor: '#dcfce7' },
  paymentPending: { backgroundColor: '#ffedd5' },
  paymentFailed: { backgroundColor: '#fee2e2' },
  paymentBadgeText: { fontSize: 12, fontWeight: '700', color: PALETTE.primary },
  errTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: PALETTE.primary },
  err: { color: PALETTE.gray, marginBottom: 20, textAlign: 'center', lineHeight: 22 },
  btn: {
    backgroundColor: PALETTE.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '600' },
  btnSecondary: { paddingHorizontal: 16, paddingVertical: 8 },
  btnSecondaryText: { color: PALETTE.primary, fontWeight: '600' },
});

export default OrderDetailScreen;
