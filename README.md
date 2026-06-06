<p align="center">
  <img src="assets/logo.png" alt="MCPify logo" width="720" />
</p>

# MCPify

Compile software into AI-operable systems.

MCPify is an AI enablement compiler that transforms existing applications into secure, agent-operable systems. Instead of manually building MCP servers, AI interfaces, workflows, and integrations, MCPify analyzes backend code, frontend applications, APIs, databases, workflows, and permissions to generate structured AI-operable abstractions.

## Vision

Software today is designed for humans. Buttons, APIs, forms, dashboards, and databases are built around human interaction. AI agents are becoming operational systems that can code, browse, plan, execute tasks, interact with tools, and operate software, but modern applications are not designed for AI-native interaction.

MCPify reduces the friction by turning existing software into:

- AI tools
- AI workflows
- AI actions
- semantic interfaces
- permission-aware operations
- agent-compatible systems

## Core Idea

```bash
npx mcpify
```

MCPify scans:

- frontend
- backend
- APIs
- database models
- workflows
- events
- permissions

and generates:

- MCP servers
- AI tools
- semantic workflows
- safety boundaries
- action abstractions
- AI-operable interfaces

## What Makes MCPify Different

Most MCP tools only expose backend functions. MCPify aims to understand applications, workflows, actions, intent, permissions, UI interactions, and system structure.

It is not just function wrapping.
It is application understanding for AI systems.

## Problem Statement

Current AI integrations often suffer from:

1. Manual MCP boilerplate for schemas, validation, wrappers, metadata, and handlers.
2. Invisible frontends that AI agents cannot operate without browser automation hacks.
3. Weak semantic structure that exposes raw endpoints instead of meaningful workflows.
4. Security risks when permissions and safety boundaries are missing.
5. Synchronization drift as code changes and generated tooling falls out of date.

## Solution

MCPify automatically:

- analyzes application structure
- extracts semantic actions
- generates AI tools
- builds workflows
- creates permission-aware interfaces
- synchronizes changes continuously

## High-Level Architecture

```txt
Application
  ↓
Static Analysis Engine
  ↓
Semantic Understanding Layer
  ↓
Workflow Extraction
  ↓
Safety & Permission Layer
  ↓
MCP Generation
  ↓
AI-Operable System
```

## System Components

### Backend Analyzer

Scans TypeScript, JavaScript, APIs, services, controllers, and SDKs to extract functions, types, actions, workflows, and dependencies.

### Frontend Analyzer

Scans React, Next.js, Vue, and Angular applications to extract buttons, forms, routes, state mutations, UI actions, and workflows.

### Workflow Extraction Engine

Identifies multi-step flows such as login, add product, checkout, and payment, then turns them into reusable AI workflows.

### Database Analyzer

Scans Prisma, Drizzle, Mongoose, SQLAlchemy, and PostgreSQL schemas to generate query tools, filtered access tools, and semantic data operations.

### API to MCP Conversion

Converts OpenAPI and Swagger definitions into AI-native tools, schemas, validations, and workflows.

### Event System Integration

Understands systems such as Kafka, RabbitMQ, webhooks, EventEmitter, and pub/sub so agents can react to events and subscriptions.

### Permission and Safety Layer

Applies permission levels, safety classifications, approval requirements, and access boundaries to every generated tool.

### AI Metadata Enhancement

Improves descriptions, naming, examples, parameter clarity, and workflow understanding.

### AGENTS.md Generation

Creates repository guidance for AI coding agents, onboarding, architecture, and operational workflows.

### Self-Updating Synchronization

Keeps generated schemas, workflows, permissions, and MCP definitions synchronized with source code changes.

### AI Simulation and Validation

Simulates prompt injection, invalid operations, workflow failures, permission bypass attempts, and unsafe operations.

## Example Output

```txt
refundOrder(orderId)
with:
- schema
- validation
- permissions
- AI metadata
```

## Suggested Tech Stack

| Area | Technology |
|---|---|
| CLI | commander.js |
| AST Parsing | ts-morph |
| Validation | zod |
| Frontend Parsing | Babel / SWC |
| MCP Integration | MCP SDK |
| Formatting | prettier |
| OpenAPI Parsing | swagger-parser |
| Knowledge Graph | Neo4j / graphlib |
| AI Enhancement | OpenAI API |

## Proposed Repository Structure

```txt
mcpify/
├── packages/
│   ├── cli/
│   ├── backend-analyzer/
│   ├── frontend-analyzer/
│   ├── workflow-engine/
│   ├── schema-engine/
│   ├── mcp-generator/
│   ├── permissions/
│   ├── security/
│   ├── ai-enhancer/
│   ├── graph-engine/
│   └── templates/
```

## Roadmap

### Phase 1 - Hackathon MVP

- backend analysis
- schema generation
- MCP generation
- OpenAPI support
- frontend action extraction

### Phase 2

- workflow understanding
- semantic UI understanding
- permissions
- audit system

### Phase 3

- knowledge graph
- event systems
- synchronization engine
- AI simulations

### Phase 4

- enterprise deployment
- hosted platform
- monitoring
- analytics
- AI operating layer

## Taglines

- Compile software into AI-operable systems.
- Turn applications into AI-native environments.
- The AI interface layer for software.
- Make any application usable by AI agents.
- From software to AI-operable systems instantly.
