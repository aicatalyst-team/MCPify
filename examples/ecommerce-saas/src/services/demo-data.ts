export type DemoOrderStatus = 'pending' | 'processing' | 'fulfilled' | 'cancelled' | 'refunded';
export type DemoUserRole = 'customer' | 'admin' | 'agent';
export type DemoTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type DemoTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: DemoUserRole;
  status: 'active' | 'suspended';
  createdAt: Date;
}

export interface DemoOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface DemoOrder {
  id: string;
  customerId: string;
  status: DemoOrderStatus;
  total: number;
  items: DemoOrderItem[];
  createdAt: Date;
  updatedAt: Date;
  agentId?: string;
  refundAmount?: number;
  cancellationReason?: string;
  discountCode?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
}

export interface DemoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'active' | 'archived';
  createdAt: Date;
}

export interface DemoSupportTicket {
  id: string;
  customerId: string;
  orderId?: string;
  subject: string;
  body: string;
  status: DemoTicketStatus;
  priority: DemoTicketPriority;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: string[];
}

const createdAt = new Date('2026-01-15T10:00:00.000Z');

export const demoUsers: DemoUser[] = [
  {
    id: 'user_001',
    email: 'ava@example.com',
    name: 'Ava Customer',
    role: 'customer',
    status: 'active',
    createdAt,
  },
  {
    id: 'agent_001',
    email: 'sam.agent@example.com',
    name: 'Sam Agent',
    role: 'agent',
    status: 'active',
    createdAt,
  },
  {
    id: 'admin_001',
    email: 'admin@example.com',
    name: 'MCPify Admin',
    role: 'admin',
    status: 'active',
    createdAt,
  },
];

export const demoProducts: DemoProduct[] = [
  {
    id: 'prod_keyboard',
    name: 'Mechanical Keyboard',
    description: 'Low-profile keyboard for developer workstations',
    price: 129,
    stock: 12,
    status: 'active',
    createdAt,
  },
  {
    id: 'prod_mouse',
    name: 'Precision Mouse',
    description: 'Wireless mouse with ergonomic grip',
    price: 79,
    stock: 20,
    status: 'active',
    createdAt,
  },
];

export const demoOrders: DemoOrder[] = [
  {
    id: 'order_001',
    customerId: 'user_001',
    status: 'pending',
    total: 208,
    items: [
      { productId: 'prod_keyboard', quantity: 1, price: 129 },
      { productId: 'prod_mouse', quantity: 1, price: 79 },
    ],
    createdAt,
    updatedAt: createdAt,
    paymentStatus: 'unpaid',
  },
  {
    id: 'order_002',
    customerId: 'user_001',
    status: 'fulfilled',
    total: 129,
    items: [{ productId: 'prod_keyboard', quantity: 1, price: 129 }],
    createdAt: new Date('2026-01-20T11:30:00.000Z'),
    updatedAt: new Date('2026-01-20T12:00:00.000Z'),
    paymentStatus: 'paid',
  },
];

export const demoTickets: DemoSupportTicket[] = [
  {
    id: 'ticket_001',
    customerId: 'user_001',
    orderId: 'order_001',
    subject: 'Need help with my order',
    body: 'Can you confirm when this order will ship?',
    status: 'open',
    priority: 'medium',
    createdAt,
    updatedAt: createdAt,
    messages: [],
  },
];

export function _nextId(prefix: string, collectionSize: number): string {
  return `${prefix}_${String(collectionSize + 1).padStart(3, '0')}`;
}

export function _touch<T extends { updatedAt?: Date }>(record: T): T {
  record.updatedAt = new Date();
  return record;
}

export function _compactIncludes(value: string | undefined, query: string): boolean {
  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
}
