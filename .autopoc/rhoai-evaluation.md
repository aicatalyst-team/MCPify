# RHOAI Evaluation: MCPify

## Project Summary
MCPify is an AI Enablement Compiler that analyzes codebases and generates MCP servers for AI agents. It uses AST parsing to extract routes, components, APIs, and database schemas, producing typed tools with permission classification.

## Strategy: Red Hat AI 2026

### Impact Dimensions
| Dimension | Score (0-20) | Rationale |
|-----------|-------------|-----------|
| audience_value | 15 | Relevant to platform teams building AI agent infrastructure. MCP is an emerging standard for agent-tool interaction. |
| strategic_alignment | 16 | Directly supports the agentic AI strategy area. MCP is becoming the standard protocol for AI agent tooling. |
| strategy_fit | 14 | MCP server generation aligns with AI Hub and GenAI Studio vision for making applications AI-operable. |
| platform_leverage | 12 | CLI tool demonstrates OpenShift build pipelines. Generated MCP servers could run as persistent services on OpenShift. |
| demo_potential | 15 | Self-contained demo with bundled ecommerce-saas example. Can show full analyze -> generate -> serve pipeline. |

**Impact Score**: (15 + 16 + 14 + 12 + 15) / 5 = **14.4 / 20**

### Feasibility Dimensions
| Dimension | Score (0-10) | Rationale |
|-----------|-------------|-----------|
| container_readiness | 7 | No Dockerfile but standard Node.js monorepo. npm install + build is well-documented. |
| dependency_simplicity | 9 | Zero external runtime dependencies. All npm packages. Optional Anthropic API key. |
| reproduction_confidence | 8 | package-lock.json present, clear build instructions, bundled test fixtures. |
| complexity_sweet_spot | 7 | CLI tool needs job-based deployment model. Can demo with bundled examples. |

**Feasibility Score**: (7 + 9 + 8 + 7) / 4 = **7.75 / 10**
