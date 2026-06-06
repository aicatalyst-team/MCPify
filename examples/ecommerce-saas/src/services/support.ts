// examples/ecommerce-saas/src/services/support.ts

import {
  _compactIncludes,
  demoTickets,
  _nextId,
  _touch,
} from './demo-data.js';

export type TicketStatus    = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority  = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id:         string;
  customerId: string;
  orderId?:   string;
  subject:    string;
  body:       string;
  status:     TicketStatus;
  priority:   TicketPriority;
  agentId?:   string;
  createdAt:  Date;
  updatedAt:  Date;
  messages:    string[];
}

// ── Safe reads ─────────────────────────────────────────────────────────────────

/** List support tickets filtered by status. */
export async function listTicketsByStatus(status: TicketStatus): Promise<SupportTicket[]> {
  return demoTickets.filter(ticket => ticket.status === status);
}

/** Get a single support ticket by ID. */
export async function getTicketById(ticketId: string): Promise<SupportTicket | null> {
  return demoTickets.find(ticket => ticket.id === ticketId) ?? null;
}

/** Search tickets by keyword in subject or body. */
export async function searchTickets(query: string): Promise<SupportTicket[]> {
  return demoTickets.filter(ticket =>
    _compactIncludes(ticket.subject, query) ||
    _compactIncludes(ticket.body, query)
  );
}

// ── Mutations (REQUIRES_CONFIRMATION) ─────────────────────────────────────────

/**
 * Creates a new support ticket.
 * @param customerId - Customer who raised the ticket
 * @param subject    - Ticket subject
 * @param body       - Detailed description
 * @param orderId    - Related order (optional)
 */
export async function createSupportRequest(
  customerId: string,
  subject:    string,
  body:       string,
  orderId?:   string
): Promise<SupportTicket> {
  const now = new Date();
  const ticket: SupportTicket = {
    id: _nextId('ticket', demoTickets.length),
    customerId,
    orderId,
    subject,
    body,
    status: 'open',
    priority: 'medium',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  demoTickets.push(ticket);
  return ticket;
}

/**
 * Sends a reply message to a support ticket.
 */
export async function replyToTicket(ticketId: string, message: string): Promise<SupportTicket> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error(`Ticket not found: ${ticketId}`);
  ticket.messages ??= [];
  ticket.messages.push(message);
  ticket.status = 'in_progress';
  return _touch(ticket);
}

/**
 * Assigns a ticket to a support agent.
 */
export async function assignTicket(ticketId: string, agentId: string): Promise<SupportTicket> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error(`Ticket not found: ${ticketId}`);
  ticket.agentId = agentId;
  ticket.status = 'in_progress';
  return _touch(ticket);
}

/**
 * Escalates a ticket to a higher-tier agent.
 */
export async function escalateTicket(ticketId: string, reason: string): Promise<SupportTicket> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error(`Ticket not found: ${ticketId}`);
  ticket.priority = 'urgent';
  ticket.messages ??= [];
  ticket.messages.push(`Escalated: ${reason}`);
  return _touch(ticket);
}

/**
 * Marks a support ticket as resolved.
 */
export async function resolveTicket(ticketId: string, resolution: string): Promise<SupportTicket> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error(`Ticket not found: ${ticketId}`);
  ticket.status = 'resolved';
  ticket.messages ??= [];
  ticket.messages.push(`Resolution: ${resolution}`);
  return _touch(ticket);
}

/**
 * Sends a direct message to a customer.
 */
export async function sendMessageToCustomer(
  customerId: string,
  message:    string
): Promise<{ customerId: string; message: string; sent: true }> {
  return { customerId, message, sent: true };
}

/** Alias used by frontend intent extraction and workflow detection. */
export async function sendMessage(customerId: string, message: string): Promise<{ customerId: string; message: string; sent: true }> {
  return sendMessageToCustomer(customerId, message);
}
