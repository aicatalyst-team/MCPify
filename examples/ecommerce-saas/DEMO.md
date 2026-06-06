# MCPify Ecommerce SaaS Demo

This example is the flagship MVP for showing MCPify end to end across app code:

- backend service functions in `src/services`
- frontend actions in `src/components`
- API operations in `openapi.json`
- database models in `prisma/schema.prisma`
- workflows inferred from real service calls
- permission gates in the generated MCP server

## Generate the MCP Server

From the repository root:

```bash
npm install
npm run build
npm run mcpify -- analyze examples/ecommerce-saas --output examples/ecommerce-saas/.mcpify --prisma examples/ecommerce-saas/prisma/schema.prisma --swagger examples/ecommerce-saas/openapi.json
cd examples/ecommerce-saas/.mcpify
npm install
npm run build
```

## Codex Chat Demo Script

Use this as the live narration after connecting the generated server to Codex.

### Frontend actions

User: What customer-facing actions did MCPify discover from the cart UI?

Agent should inspect tools such as `checkoutCart`, `applyDiscountCode`, and `removeItemFromCart`.

### Backend operations

User: Show me pending orders.

Tool call:

```json
{ "name": "getOrdersByStatus", "arguments": { "status": "pending" } }
```

Expected result: real demo order data from `src/services/orders.ts`.

### API exposure

User: What API call would fetch order_001?

Tool call:

```json
{ "name": "apiGetOrder", "arguments": { "orderId": "order_001" } }
```

Expected result: a prepared API request, or a live HTTP result when `MCPIFY_API_BASE_URL` is set.

### Database exposure

User: List products from the database model surface.

Tool call:

```json
{ "name": "listProducts", "arguments": { "skip": 0, "take": 10 } }
```

Expected result: demo database rows generated from the Prisma model surface.

### Permission classification

User: Refund order_001.

First tool call:

```json
{ "name": "refundOrder", "arguments": { "orderId": "order_001" } }
```

Expected result: confirmation required.

Second tool call:

```json
{
  "name": "refundOrder",
  "arguments": {
    "orderId": "order_001",
    "__confirmed": true
  }
}
```

Expected result: order status changes to `refunded`.

### Workflow execution

User: Run the refund-and-notify workflow for order_001.

Tool call:

```json
{
  "name": "resolveRefundWorkflow",
  "arguments": {
    "orderId": "order_001",
    "customerId": "user_001",
    "message": "Your refund has been processed.",
    "__confirmed": true
  }
}
```

Expected result: structured workflow output with `refundOrder` and `sendMessage` step results.

## MVP Scope

The generated server is intentionally demo-safe. Backend handlers call real example service functions. API handlers can call a live API when `MCPIFY_API_BASE_URL` is configured, otherwise they return the prepared request. Database handlers use an in-memory demo store derived from the Prisma CRUD surface.
