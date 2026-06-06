// examples/ecommerce-saas/src/services/orders.ts
//
// Example backend service that MCPify analyzes into callable MCP tools.

import {
  _compactIncludes,
  demoOrders,
  demoProducts,
  _nextId,
  _touch,
} from './demo-data.js';
import { sendMessage } from './support.js';

export type OrderStatus = 'pending' | 'processing' | 'fulfilled' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt?: Date;
  agentId?: string;
  refundAmount?: number;
  cancellationReason?: string;
  discountCode?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

/** Retrieves a single order by its ID. */
export async function getOrderById(orderId: string): Promise<Order | null> {
  return demoOrders.find(order => order.id === orderId) ?? null;
}

/** Lists all orders with a status filter and pagination. */
export async function getOrdersByStatus(
  status: OrderStatus,
  limit: number = 20,
  offset: number = 0
): Promise<Order[]> {
  return demoOrders
    .filter(order => order.status === status)
    .slice(offset, offset + limit);
}

/** Returns the total count of orders grouped by status. */
export async function countOrdersByStatus(): Promise<Record<OrderStatus, number>> {
  return demoOrders.reduce<Record<OrderStatus, number>>((counts, order) => {
    counts[order.status] += 1;
    return counts;
  }, { pending: 0, processing: 0, fulfilled: 0, cancelled: 0, refunded: 0 });
}

/** Searches orders by ID, customer ID, status, or product name. */
export async function searchOrders(query: string): Promise<Order[]> {
  return demoOrders.filter(order => {
    const productNames = order.items
      .map(item => demoProducts.find(product => product.id === item.productId)?.name)
      .filter(Boolean)
      .join(' ');

    return _compactIncludes(order.id, query) ||
      _compactIncludes(order.customerId, query) ||
      _compactIncludes(order.status, query) ||
      _compactIncludes(productNames, query);
  });
}

/** Adds a product to a customer's demo cart. */
export async function addItemToCart(
  customerId: string = 'user_001',
  productId: string = 'prod_keyboard',
  quantity: number = 1
): Promise<Order> {
  const product = demoProducts.find(item => item.id === productId);
  if (!product) throw new Error(`Product not found: ${productId}`);
  if (product.stock < quantity) throw new Error(`Insufficient stock for ${productId}`);

  let cart = demoOrders.find(order => order.customerId === customerId && order.status === 'pending');
  if (!cart) {
    cart = {
      id: _nextId('order', demoOrders.length),
      customerId,
      status: 'pending',
      total: 0,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: 'unpaid',
    };
    demoOrders.push(cart);
  }

  const existing = cart.items.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, price: product.price });
  }

  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  product.stock -= quantity;
  return _touch(cart);
}

/** Applies a discount code to the active cart. */
export async function applyDiscountCode(
  customerId: string = 'user_001',
  code: string = 'HACKATHON10'
): Promise<Order> {
  const cart = demoOrders.find(order => order.customerId === customerId && order.status === 'pending');
  if (!cart) throw new Error(`No pending cart for customer: ${customerId}`);

  cart.discountCode = code;
  if (code.toUpperCase() === 'HACKATHON10') {
    cart.total = Number((cart.total * 0.9).toFixed(2));
  }
  return _touch(cart);
}

/** Converts the active cart into a processing order. */
export async function checkoutCart(customerId: string = 'user_001'): Promise<Order> {
  const cart = demoOrders.find(order => order.customerId === customerId && order.status === 'pending');
  if (!cart) throw new Error(`No pending cart for customer: ${customerId}`);
  cart.status = 'processing';
  return _touch(cart);
}

/** Captures payment for an order in the demo payment ledger. */
export async function processPayment(
  orderId: string = 'order_001',
  amount?: number
): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  order.paymentStatus = 'paid';
  order.total = amount ?? order.total;
  return _touch(order);
}

/** Issues a full or partial refund for an order. */
export async function refundOrder(orderId: string, amount?: number): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  order.status = 'refunded';
  order.paymentStatus = 'refunded';
  order.refundAmount = amount ?? order.total;
  return _touch(order);
}

/** Cancels a pending or processing order. */
export async function cancelOrder(orderId: string, reason: string): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  if (order.status === 'fulfilled') throw new Error(`Cannot cancel fulfilled order: ${orderId}`);
  order.status = 'cancelled';
  order.cancellationReason = reason;
  return _touch(order);
}

/** Updates the fulfillment status of an order. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  order.status = status;
  return _touch(order);
}

/** Assigns an order to a fulfillment agent. */
export async function assignOrderToAgent(orderId: string, agentId: string): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  order.agentId = agentId;
  return _touch(order);
}

/** End-to-end purchase flow used by MCPify workflow detection. */
export async function completePurchase(
  customerId: string = 'user_001',
  productId: string = 'prod_keyboard',
  quantity: number = 1,
  code: string = 'HACKATHON10'
): Promise<Order> {
  await addItemToCart(customerId, productId, quantity);
  await applyDiscountCode(customerId, code);
  const order = await checkoutCart(customerId);
  return processPayment(order.id);
}

/** Refunds an order and sends a customer notification. */
export async function resolveRefund(
  orderId: string = 'order_001',
  customerId: string = 'user_001',
  message: string = 'Your refund has been processed.'
): Promise<{ order: Order; notification: { customerId: string; message: string; sent: true } }> {
  const order = await refundOrder(orderId);
  const notification = await sendMessage(customerId, message);
  return { order, notification };
}
