import { useMemo, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { CartPage, type CartItem } from './components/CartPage';
import {
  addItemToCart,
  applyDiscountCode,
  checkoutCart,
  completePurchase,
  getOrdersByStatus,
  refundOrder,
  resolveRefund,
  searchOrders,
} from './services/orders.js';
import {
  createSupportRequest,
  listTicketsByStatus,
  resolveTicket,
  sendMessage,
} from './services/support.js';
import {
  demoOrders,
  demoProducts,
  demoTickets,
  demoUsers,
  type DemoOrder,
  type DemoOrderStatus,
} from './services/demo-data.js';

interface ActivityEntry {
  id: number;
  label: string;
  detail: string;
  surface: 'frontend' | 'backend' | 'api' | 'database' | 'workflow' | 'permission';
}

const featureCards = [
  {
    title: 'Frontend actions',
    detail: 'Buttons and forms become semantic tools such as checkoutCart and applyDiscountCode.',
    tools: ['addItemToCart', 'applyDiscountCode', 'checkoutCart'],
  },
  {
    title: 'Backend operations',
    detail: 'Service functions in src/services execute real demo business logic.',
    tools: ['getOrdersByStatus', 'refundOrder', 'sendMessage'],
  },
  {
    title: 'API exposure',
    detail: 'openapi.json produces API tools that can prepare or execute HTTP requests.',
    tools: ['apiGetOrder', 'apiRefundOrder', 'apiCreateSupportTicket'],
  },
  {
    title: 'Database surface',
    detail: 'Prisma models generate CRUD-style database tools with Prisma or safe demo fallback.',
    tools: ['listProducts', 'getOrdersByStatus', 'createSupportTicket'],
  },
  {
    title: 'Workflows',
    detail: 'Multi-step service flows are exposed as agent-runnable workflow tools.',
    tools: ['completePurchaseWorkflow', 'resolveRefundWorkflow'],
  },
  {
    title: 'Permissions',
    detail: 'Risky mutations require explicit confirmation before execution.',
    tools: ['refundOrder', 'deleteRecord', 'updateUserRole'],
  },
];

export function App() {
  const [revision, setRevision] = useState(0);
  const [pendingRefundOrderId, setPendingRefundOrderId] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([
    {
      id: 1,
      label: 'Demo ready',
      detail: 'The ecommerce UI is connected to the same demo data used by generated MCP handlers.',
      surface: 'frontend',
    },
  ]);

  const pendingCart = useMemo(
    () => demoOrders.find(order => order.customerId === 'user_001' && order.status === 'pending'),
    [revision]
  );

  const cartItems = useMemo<CartItem[]>(() => {
    return (pendingCart?.items ?? []).map(item => {
      const product = demoProducts.find(candidate => candidate.id === item.productId);
      return {
        id: item.productId,
        name: product?.name ?? item.productId,
        price: item.price,
        quantity: item.quantity,
      };
    });
  }, [pendingCart, revision]);

  const statusCounts = useMemo(() => {
    return demoOrders.reduce<Record<DemoOrderStatus, number>>((counts, order) => {
      counts[order.status] += 1;
      return counts;
    }, { pending: 0, processing: 0, fulfilled: 0, cancelled: 0, refunded: 0 });
  }, [revision]);

  async function runOperation(
    label: string,
    surface: ActivityEntry['surface'],
    operation: () => Promise<unknown> | unknown
  ) {
    try {
      const result = await operation();
      recordActivity(label, surface, summarize(result));
      setRevision(value => value + 1);
    } catch (error) {
      recordActivity(label, surface, error instanceof Error ? error.message : String(error));
    }
  }

  function recordActivity(label: string, surface: ActivityEntry['surface'], detail: string) {
    setActivity(entries => [
      { id: Date.now(), label, detail, surface },
      ...entries,
    ].slice(0, 8));
  }

  function removeItemFromCart(productId: string) {
    const cart = demoOrders.find(order => order.customerId === 'user_001' && order.status === 'pending');
    if (!cart) throw new Error('No active cart found.');
    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.updatedAt = new Date();
    return cart;
  }

  function requestRefund(orderId: string) {
    setPendingRefundOrderId(orderId);
    recordActivity(
      'Confirmation required',
      'permission',
      `${orderId} is a risky mutation. Generated MCP tools require __confirmed: true before refundOrder executes.`
    );
  }

  function listProducts() {
    void runOperation('List products', 'database', () => demoProducts);
  }

  function apiGetOrder() {
    recordActivity('apiGetOrder', 'api', preparedApiRequest('GET', '/api/orders/order_001'));
  }

  function executeWorkflowDemo() {
    void runOperation(
      'completePurchaseWorkflow',
      'workflow',
      () => completePurchase('user_001', 'prod_keyboard', 1, 'HACKATHON10')
    );
  }

  function resolveSupportTicket() {
    void runOperation(
      'resolveTicket',
      'permission',
      () => resolveTicket('ticket_001', 'Resolved from the demo UI.')
    );
  }

  function confirmRefundOrder() {
    if (!pendingRefundOrderId) return;
    const orderId = pendingRefundOrderId;
    setPendingRefundOrderId(null);
    void runOperation('Confirmed refundOrder', 'permission', () => refundOrder(orderId));
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">MCPify flagship example</p>
          <h1>Ecommerce SaaS AI control room</h1>
          <p className="hero-copy">
            A compact storefront and operator console that shows MCPify compiling frontend,
            backend, API, database, workflow, and permission surfaces into AI-operable tools.
          </p>
          <div className="hero-actions">
        <button
          className="button primary"
              onClick={() => runOperation('Search orders', 'backend', () => getOrdersByStatus('pending'))}
        >
              Search orders
        </button>
        <button
          className="button secondary"
              onClick={listProducts}
        >
              List products
        </button>
          </div>
        </div>

        <div className="hero-card">
          <span className="status-dot" />
          <strong>Demo coverage</strong>
          <p>100+ generated MCP tools across UI, backend, API, database, workflows, and safety.</p>
          <code>npm run mcpify:smoke</code>
        </div>
      </section>

      <section className="coverage-grid" aria-label="MCPify feature coverage">
        {featureCards.map(card => (
          <article className="coverage-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.detail}</p>
            <div className="tool-list">
              {card.tools.map(tool => <code key={tool}>{tool}</code>)}
            </div>
          </article>
        ))}
      </section>

      <section className="stats-grid" aria-label="Live ecommerce state">
        <Metric label="Orders" value={demoOrders.length} detail={`${statusCounts.pending} pending`} />
        <Metric label="Products" value={demoProducts.length} detail={`${totalStock()} units in stock`} />
        <Metric label="Users" value={demoUsers.length} detail="customer, agent, admin" />
        <Metric label="Tickets" value={demoTickets.length} detail={`${openTickets()} open`} />
      </section>

      <section className="workspace-grid">
        <section className="panel catalog-panel" aria-labelledby="catalog-title">
          <div className="panel-heading">
            <p className="eyebrow">Frontend plus backend</p>
            <h2 id="catalog-title">Product catalog</h2>
          </div>
          <div className="product-list">
            {demoProducts.map(product => (
              <article className="product-card" key={product.id}>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <span>{product.stock} in stock</span>
                </div>
                <strong>${product.price.toFixed(2)}</strong>
                {/* MCPify extracts: addItemToCart */}
                <button
                  className="button secondary"
                  onClick={() => runOperation(
                    'Add item to cart',
                    'frontend',
                    () => addItemToCart('user_001', product.id, 1)
                  )}
                >
                  Add to cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <CartPage
          items={cartItems}
          checkoutAction={() => runOperation('Checkout cart', 'frontend', () => checkoutCart('user_001'))}
          removeItemAction={productId => runOperation('Remove item from cart', 'frontend', () => removeItemFromCart(productId))}
          applyCouponAction={code => runOperation('Apply discount code', 'frontend', () => applyDiscountCode('user_001', code))}
        />
      </section>

      <section className="workspace-grid">
        <AdminDashboard
          refundAction={requestRefund}
          approveAction={requestId => recordActivity('Approve request', 'permission', `${requestId} approved in the demo console.`)}
          rejectAction={requestId => recordActivity('Reject request', 'permission', `${requestId} rejected in the demo console.`)}
          publishAction={() => recordActivity('Publish content', 'frontend', 'Catalog changes were marked ready to publish.')}
          exportAction={() => recordActivity('Export CSV', 'frontend', 'Prepared orders.csv export from current demo data.')}
          searchAction={query => runOperation('Search orders', 'backend', () => searchOrders(query))}
          createTicketAction={() => runOperation(
            'Create support request',
            'backend',
            () => createSupportRequest('user_001', 'Demo support request', 'Created from the ecommerce UI.', 'order_001')
          )}
          sendMessageAction={userId => runOperation('Send message', 'backend', () => sendMessage(userId, 'Your order update is ready.'))}
          inviteUserAction={() => recordActivity('Invite user', 'permission', 'Prepared invite for a new support teammate.')}
          deleteRecordAction={recordId => recordActivity('Blocked tool', 'permission', `${recordId} is intentionally blocked for human-only execution.`)}
          refundWorkflowAction={orderId => runOperation(
            'Resolve refund workflow',
            'workflow',
            () => resolveRefund(orderId, 'user_001', 'Your refund has been processed.')
          )}
        />

        <section className="panel" aria-labelledby="surfaces-title">
          <div className="panel-heading">
            <p className="eyebrow">Generated surfaces</p>
            <h2 id="surfaces-title">API, DB, workflow, safety</h2>
          </div>

          <div className="surface-list">
            <article className="surface-row">
              <div>
                <span className="surface-label">API</span>
                <h3>Prepare API request</h3>
                <p>Mirrors apiGetOrder from openapi.json.</p>
              </div>
              <button
                className="button secondary"
                onClick={apiGetOrder}
              >
                Prepare API request
              </button>
            </article>

            <article className="surface-row">
              <div>
                <span className="surface-label">Database</span>
                <h3>List Prisma products</h3>
                <p>Mirrors listProducts from the Prisma model surface.</p>
              </div>
              <button className="button secondary" onClick={listProducts}>
                List products
              </button>
            </article>

            <article className="surface-row">
              <div>
                <span className="surface-label">Workflow</span>
                <h3>Run purchase workflow</h3>
                <p>Adds an item, applies a code, checks out, then processes payment.</p>
              </div>
              <button
                className="button secondary"
                onClick={executeWorkflowDemo}
              >
                Execute workflow
              </button>
            </article>

            <article className="surface-row">
              <div>
                <span className="surface-label">Support</span>
                <h3>Resolve ticket</h3>
                <p>Exercises support mutation and confirmation classification.</p>
              </div>
              <button
                className="button secondary"
                onClick={resolveSupportTicket}
              >
                Resolve ticket
              </button>
            </article>
          </div>

          {pendingRefundOrderId && (
            <div className="confirmation-box">
              <strong>Confirmation gate</strong>
              <p>
                Refunds are classified as requires confirmation. This mirrors the generated MCP
                server asking for <code>__confirmed: true</code>.
              </p>
              <button
                className="button danger"
                onClick={confirmRefundOrder}
              >
                Refund order now
              </button>
            </div>
          )}
        </section>
      </section>

      <section className="panel activity-panel" aria-labelledby="activity-title">
        <div className="panel-heading">
          <p className="eyebrow">Live result stream</p>
          <h2 id="activity-title">Activity log</h2>
        </div>
        <div className="activity-list">
          {activity.map(entry => (
            <article className="activity-item" key={entry.id}>
              <span className={`surface-badge ${entry.surface}`}>{entry.surface}</span>
              <div>
                <strong>{entry.label}</strong>
                <p>{entry.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function totalStock(): number {
  return demoProducts.reduce((sum, product) => sum + product.stock, 0);
}

function openTickets(): number {
  return demoTickets.filter(ticket => ticket.status === 'open').length;
}

function preparedApiRequest(method: string, path: string): string {
  return JSON.stringify({
    mode: 'prepared-request',
    method,
    path,
    note: 'Set MCPIFY_API_BASE_URL on the generated server to execute this request live.',
  }, null, 2);
}

function summarize(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Returned 0 records.';
    return `Returned ${value.length} records: ${value.map(item => displayId(item)).join(', ')}`;
  }

  if (isOrder(value)) {
    return `${value.id} is now ${value.status} with total $${value.total.toFixed(2)}.`;
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, jsonReplacer, 2);
  }

  return String(value);
}

function displayId(value: unknown): string {
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: unknown }).id);
  }
  if (value && typeof value === 'object' && 'name' in value) {
    return String((value as { name: unknown }).name);
  }
  return String(value);
}

function isOrder(value: unknown): value is DemoOrder {
  return Boolean(value && typeof value === 'object' && 'status' in value && 'total' in value);
}

function jsonReplacer(_key: string, value: unknown) {
  return value instanceof Date ? value.toISOString() : value;
}
