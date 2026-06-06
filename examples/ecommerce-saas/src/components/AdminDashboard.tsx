import React, { useState } from 'react';

interface AdminDashboardProps {
  refundAction: (orderId: string) => void;
  approveAction: (requestId: string) => void;
  rejectAction: (requestId: string) => void;
  publishAction: () => void;
  exportAction: () => void;
  searchAction: (query: string) => void;
  createTicketAction: () => void;
  sendMessageAction: (userId: string) => void;
  inviteUserAction: () => void;
  deleteRecordAction: (id: string) => void;
  refundWorkflowAction: (orderId: string) => void;
}

export function AdminDashboard({
  refundAction,
  approveAction,
  rejectAction,
  publishAction,
  exportAction,
  searchAction,
  createTicketAction,
  sendMessageAction,
  inviteUserAction,
  deleteRecordAction,
  refundWorkflowAction,
}: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('order_001');
  const [selectedOrder, setSelectedOrder] = useState('order_001');

  return (
    <section className="panel admin-dashboard" aria-labelledby="admin-title">
      <div className="panel-heading">
        <p className="eyebrow">Backend, permissions, workflows</p>
        <h2 id="admin-title">Operator console</h2>
      </div>

      <div className="admin-search">
        {/* MCPify extracts: searchItems */}
        <input
          name="searchQuery"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder="Search orders, customers..."
        />
        <button className="button secondary" onClick={() => searchAction(searchQuery)}>
          Search
        </button>
      </div>

      <label className="field-label" htmlFor="selected-order">
        Selected order
      </label>
      <select
        id="selected-order"
        name="selectedOrder"
        value={selectedOrder}
        onChange={event => setSelectedOrder(event.target.value)}
      >
        <option value="order_001">order_001</option>
        <option value="order_002">order_002</option>
      </select>

      <div className="action-grid">
        {/* MCPify extracts: refundOrder */}
        <button className="button danger" onClick={() => refundAction(selectedOrder)}>
          Refund order
        </button>

        {/* MCPify extracts: exportData */}
        <button className="button ghost" onClick={exportAction}>
          Export CSV
        </button>

        {/* MCPify extracts: approveRequest */}
        <button className="button secondary" onClick={() => approveAction('req_001')}>
          Approve request
        </button>

        {/* MCPify extracts: rejectRequest */}
        <button className="button ghost" onClick={() => rejectAction('req_001')}>
          Reject request
        </button>

        {/* MCPify extracts: publishContent */}
        <button className="button secondary" onClick={publishAction}>
          Publish content
        </button>

        {/* MCPify extracts: createSupportRequest */}
        <button className="button secondary" onClick={createTicketAction}>
          Submit support ticket
        </button>

        {/* MCPify extracts: sendMessage */}
        <button className="button secondary" onClick={() => sendMessageAction('user_001')}>
          Send message
        </button>

        {/* MCPify extracts: inviteUser */}
        <button className="button ghost" onClick={inviteUserAction}>
          Invite user
        </button>

        {/* MCPify extracts: deleteRecord */}
        <button className="button danger ghost" onClick={() => deleteRecordAction('record_001')}>
          Delete record
        </button>

        {/* MCPify extracts: resolveRefundWorkflow */}
        <button className="button primary" onClick={() => refundWorkflowAction(selectedOrder)}>
          Run refund workflow
        </button>
      </div>
    </section>
  );
}
