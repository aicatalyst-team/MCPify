# PoC Plan: MCPify

## Project Classification
- **Type:** infrastructure (CLI tool / code generator)
- **Key Technologies:** TypeScript, Node.js, npm workspaces, Commander.js, AST parsing (Babel, ts-morph)
- **ODH Relevance:** Demonstrates an AI enablement tool that generates MCP servers for AI agents. Shows how developer tooling for the agentic AI ecosystem can run on OpenShift as a batch job.

## PoC Objectives
1. Containerize the MCPify CLI tool on a UBI9 Node.js base image
2. Run the analyzer against the bundled ecommerce-saas example as a Kubernetes Job
3. Validate the generated MCP server output is complete and correct
4. Run the unit test suite to verify code quality

## Infrastructure Requirements
- **Resource Profile:** small (256Mi RAM, 250m CPU)
- **GPU Required:** No
- **Persistent Storage:** None
- **Sidecar Containers:** None
- **Deployment Model:** job (CLI tool, not a server)
- **Listens on Port:** No
- **LLM API:** No (--ai-enhance is optional)

## Test Scenarios

### Scenario 1: analyze-ecommerce
- **Description:** Run MCPify analyze on the bundled ecommerce-saas example
- **Type:** cli
- **Input:** mcpify analyze ./examples/ecommerce-saas --output ./examples/ecommerce-saas/.mcpify --prisma ./examples/ecommerce-saas/prisma/schema.prisma --swagger ./examples/ecommerce-saas/openapi.json
- **Expected:** Exit code 0, .mcpify directory created with server.ts and tool definitions
- **Timeout:** 120 seconds

### Scenario 2: unit-tests
- **Description:** Run the unit test suite to verify code quality
- **Type:** cli
- **Input:** npm test
- **Expected:** Exit code 0, all tests pass
- **Timeout:** 120 seconds

### Scenario 3: help-output
- **Description:** Verify CLI is properly installed and shows help
- **Type:** cli
- **Input:** mcpify --help
- **Expected:** Exit code 0, shows usage information
- **Timeout:** 15 seconds

## Dockerfile Considerations
- Base image: registry.access.redhat.com/ubi9/nodejs-22
- npm install + npm run build in monorepo
- Entry point: node packages/cli/dist/index.js
- No EXPOSE (CLI tool)
- Job deployment model: ENTRYPOINT ["node", "packages/cli/dist/index.js"], CMD ["--help"]

## Deployment Considerations
- Deploy as a Kubernetes Job that runs the analyze command
- No Service needed (CLI tool, no ports)
- Output can be captured from Job logs
