# PoC Report: MCPify

## 1. Executive Summary

MCPify is an AI Enablement Compiler that statically analyzes application codebases and generates Model Context Protocol (MCP) servers for AI agents. The PoC successfully containerized the TypeScript monorepo (13 npm workspace packages) on a UBI9 Node.js base image, built and pushed the image to Quay.io, and ran the CLI as Kubernetes Jobs. The analyzer successfully processed the bundled ecommerce-saas example, generating 103 MCP tools (37 safe, 49 requiring confirmation) with a complete server, schemas, and handlers. Both test scenarios passed.

## 2. Project Analysis

- **Repository**: `https://github.com/amarnath3003/MCPify`
- **Fork**: `https://github.com/aicatalyst-team/MCPify`
- **License**: CC BY 4.0 (root) / MIT (individual packages)
- **Classification**: `infrastructure` (CLI tool / code generator)

MCPify scans backend routes, frontend components, APIs (OpenAPI/Swagger), database schemas (Prisma, Drizzle, Mongoose), and workflows via AST parsing, producing typed, permission-classified tools that AI agents can call directly through the MCP protocol.

| Component | Language | Build System | ML Workload | Port |
|---|---|---|---|---|
| mcpify-cli | TypeScript | npm workspaces | No | None (CLI) |

**Key Technologies**: TypeScript (ESM), Node.js 22, npm workspaces, Commander.js, Babel AST parsing, ts-morph, Zod

## 3. PoC Objectives

1. Containerize the 13-package npm workspace monorepo on UBI9
2. Run the MCPify analyzer against the bundled ecommerce-saas example as a Kubernetes Job
3. Validate the generated MCP server output contains the expected artifacts
4. Verify the CLI is properly installed and operational

## 4. Pipeline Execution

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#EE0000', 'primaryTextColor': '#fff', 'primaryBorderColor': '#A30000', 'lineColor': '#6A6E73', 'secondaryColor': '#F0F0F0', 'tertiaryColor': '#0066CC'}}}%%
flowchart LR
    P1[Intake] -->|PASS| P3[Fork]
    P3 -->|PASS| P4[PoC Plan]
    P4 -->|PASS| P5[Containerize]
    P5 -->|RETRY 1| P6[Build]
    P6 -->|PASS| P7[Deploy]
    P7 -->|PASS| P8[Apply]
    P8 -->|PASS| P9[Test]
    P9 -->|PASS| P10[Report]
    style P5 fill:#EE0000
    style P1 fill:#0066CC
    style P3 fill:#0066CC
    style P4 fill:#0066CC
    style P6 fill:#0066CC
    style P7 fill:#0066CC
    style P8 fill:#0066CC
    style P9 fill:#0066CC
    style P10 fill:#0066CC
```

- **Intake**: Single monorepo component, 13 npm workspace packages, Commander.js CLI entry point.
- **Fork**: Forked to `https://github.com/aicatalyst-team/MCPify` with autopoc topics.
- **PoC Plan**: Classified as `infrastructure` (CLI tool), Job-based deployment model, small resource profile.
- **Containerize**: UBI9/nodejs-22 base. First build failed (permission denied creating dist directories as non-root). Fixed by adding `USER 0` before npm ci and build steps.
- **Build**: OpenShift binary build, all 13 workspace packages compiled successfully. Image pushed to `quay.io/aicatalyst/mcpify:latest`.
- **Deploy**: Generated namespace and two Job manifests (help check and analyze run).
- **Apply**: Both Jobs completed successfully.
- **PoC Execute**: Both scenarios passed (help output and full ecommerce analysis).

## 5. Test Results

| Scenario | Status | Details |
|---|---|---|
| mcpify-help | PASS | CLI displayed help with all subcommands (analyze, interactive, audit, frontend, swagger, simulate) |
| mcpify-analyze | PASS | Analyzed ecommerce-saas: 34 backend actions, 3 API endpoints, 29 DB operations, 20 UI actions, 17 workflows. Generated MCP server with 103 tools. |

### Analysis Output Highlights
- **37 safe tools**: Agent can call autonomously (read operations)
- **49 confirm tools**: Agent must ask user first (write/update/delete operations)
- **0 blocked tools**: None blocked (all operations exposed with appropriate permission level)
- **17 workflows**: Multi-step composed operations detected
- **Generated artifacts**: package.json, tsconfig.json, schemas.ts, tools.ts, workflows.ts, handlers.ts, server.ts, AGENTS.md

## 6. Infrastructure Deployed

- **Namespace**: `poc-mcpify`
- **Container Image**: `quay.io/aicatalyst/mcpify:latest`
- **Base Image**: `registry.access.redhat.com/ubi9/nodejs-22`
- **Kubernetes Resources**:
  - `job/mcpify-help` (CLI verification, 256Mi/250m)
  - `job/mcpify-analyze` (full analysis run, 512Mi/500m)
  - `secret/autopoc-registry-pull` (Quay pull credentials)

## 7. Recommendations

### Production Use
- **CI/CD Integration**: Run MCPify as a Tekton Task or BuildConfig step that analyzes source code and generates MCP servers as part of the build pipeline.
- **Output Persistence**: Mount a PVC or output to a git commit so generated MCP servers persist beyond the Job lifecycle.
- **Multi-project Analysis**: Create a CronJob that scans multiple repositories and maintains an MCP server registry.

### Enhancements
- **AI Enhancement**: The `--ai-enhance` flag uses Anthropic's API for better tool descriptions. Inject `ANTHROPIC_API_KEY` via Secret for enhanced output.
- **Generated Server Deployment**: The MCP server generated in `.mcpify/` could itself be containerized and deployed as a persistent service on OpenShift.

### Security
- The CC BY 4.0 license at root level should be verified for enterprise compatibility. Individual packages use MIT.
- The `simulate` subcommand tests security boundaries, which is valuable for validating AI agent access controls.

## 8. Open Data Hub / OpenShift AI Considerations

- **MCP Integration**: As MCP becomes the standard protocol for AI agent tooling, MCPify could generate MCP servers for any application deployed on OpenShift, enabling AI Hub and GenAI Studio integration.
- **Tekton Pipeline**: Natural fit as a Tekton Task that converts applications into AI-operable systems as part of a deployment pipeline.
- **Agent Runtime**: Generated MCP servers could be deployed alongside application workloads, providing a standardized AI tool interface managed by the platform.

## 9. Appendix

### Artifacts
- PoC Plan: `https://github.com/aicatalyst-team/MCPify/blob/autopoc-artifacts/poc-plan.md`
- Test Script: `https://github.com/aicatalyst-team/MCPify/blob/autopoc-artifacts/poc_test.py`
- Dockerfile: `https://github.com/aicatalyst-team/MCPify/blob/main/Dockerfile.ubi`
- K8s Manifests: `https://github.com/aicatalyst-team/MCPify/tree/main/kubernetes/`

### Build Errors
1. **Build 1 (Failed)**: `EACCES: permission denied, mkdir dist` - UBI Node.js image runs as non-root by default. Fixed by adding `USER 0` before install and build steps.

### Retry Summary
- Build retries: 1 (permission fix)
- Deploy retries: 0
- Container fix retries: 0
