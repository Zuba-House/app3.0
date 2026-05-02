/**
 * Order detail — registered on main stack for navigation from Orders / notifications.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import Colors from '../../constants/colors';

type OrderDetailParams = { OrderDetail: { orderId: string } };

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OrderDetailParams>>();
  const route = useRoute<RouteProp<OrderDetailParams, 'OrderDetail'>>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        if (cancelled) return;
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError(res.message || 'Could not load order');
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load order');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.err}>{error || 'Order not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
          <Text style={styles.btnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = Number((order as any).totalAmt ?? (order as any).total ?? 0);
  const status = (order as any).status || (order as any).order_status || '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Order #{order._id?.toString().slice(-8).toUpperCase()}</Text>
      <Text style={styles.meta}>Status: {status}</Text>
      <Text style={styles.meta}>Total: ${total.toFixed(2)}</Text>
      <Text style={styles.meta}>
        Placed:{' '}
        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  meta: { fontSize: 15, marginBottom: 8, color: '#333' },
  err: { color: '#c00', marginBottom: 16, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '600' },
});

export default OrderDetailScreen;
