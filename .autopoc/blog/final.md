# Turning Applications into AI-Operable Systems on OpenShift: An MCPify PoC

The Model Context Protocol is becoming the standard way AI agents interact with tools. We deployed MCPify, an open-source code analyzer that generates MCP servers from existing applications, on Red Hat OpenShift to validate it works as a containerized build step.

## What is MCPify?

MCPify is an "AI Enablement Compiler." Point it at an application codebase, and it produces a complete MCP server: typed tools, permission classifications, workflow definitions, and agent documentation. It does this through static analysis, parsing ASTs of TypeScript, JavaScript, Python, and OpenAPI specs to extract routes, components, database operations, and event handlers.

The generated server sorts every operation into three permission buckets: **safe** (the agent can call autonomously), **confirm** (the agent must ask the user), and **blocked** (never exposed). This permission model matters for enterprise deployments where AI agents need governed access to application functionality.

## Why run it on OpenShift?

MCPify is a CLI tool today. You run `npx mcpify-cli analyze .` in your project directory and get a generated MCP server. That works for individual developers, but enterprises need this integrated into their build pipelines.

Running MCPify as a Kubernetes Job on OpenShift means it can be part of a Tekton pipeline, a BuildConfig step, or a CronJob that scans repositories on a schedule. Every application deployed on the platform could automatically get an MCP server generated alongside it, building an organization-wide AI tool registry.

## Containerizing for OpenShift

MCPify is a TypeScript monorepo with 13 npm workspace packages. The containerization is straightforward, with one catch: UBI Node.js images run as non-root by default, and the TypeScript compiler needs to create `dist` directories during the build step.

```dockerfile
FROM registry.access.redhat.com/ubi9/nodejs-22

WORKDIR /opt/app-root/src

# Copy package files for layer caching
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/*/package.json packages/*/

# Must run as root for install and build
USER 0
RUN npm ci
COPY . .
RUN npm run build

# OpenShift compatibility
RUN chgrp -R 0 /opt/app-root && chmod -R g=u /opt/app-root
USER 1001

ENTRYPOINT ["node", "packages/cli/dist/index.js"]
CMD ["--help"]
```

The build compiles all 13 workspace packages sequentially. The resulting image is self-contained with no runtime dependencies.

## Running the analysis

We deployed MCPify as a Kubernetes Job that analyzes the bundled ecommerce-saas example. This example includes a React frontend, Express API routes, a Prisma database schema, and an OpenAPI spec.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: mcpify-analyze
spec:
  template:
    spec:
      containers:
        - name: mcpify
          image: quay.io/aicatalyst/mcpify:latest
          args: ["analyze", "./examples/ecommerce-saas",
                 "--output", "./examples/ecommerce-saas/.mcpify",
                 "--prisma", "./examples/ecommerce-saas/prisma/schema.prisma",
                 "--swagger", "./examples/ecommerce-saas/openapi.json"]
```

The analysis completed in seconds, producing:

| Source | Extracted |
|--------|-----------|
| Backend TypeScript | 34 actions |
| OpenAPI spec | 3 API endpoints |
| Prisma schema | 29 database operations |
| React components | 20 UI actions |
| Detected workflows | 17 multi-step operations |

**Total: 103 MCP tools** with permission classifications (37 safe, 49 confirm, 0 blocked).

The generated server includes `server.ts`, `tools.ts`, `schemas.ts`, `workflows.ts`, `handlers.ts`, and an `AGENTS.md` file documenting every tool for AI agents.

## What we learned

**npm workspace monorepos containerize well on UBI**. The sequential build (13 `tsc` compilations) completes cleanly once the permission issue is resolved. The `USER 0` pattern for build steps followed by `USER 1001` for runtime is a common UBI pattern.

**CLI tools as Kubernetes Jobs work cleanly**. No need for persistent Deployments or Services. The Job runs, produces output, and terminates. For a production integration, the output would go to a PVC or be committed to a git repository.

**Permission classification is the differentiator**. Most MCP server generators just expose all routes as tools. MCPify's three-tier permission model (safe, confirm, blocked) is the feature that makes it relevant for enterprise deployments where AI agents need governed access.

## Try it yourself

The deployment artifacts are at:
- [Fork with Dockerfile and manifests](https://github.com/aicatalyst-team/MCPify)
- [PoC report](https://github.com/aicatalyst-team/MCPify/blob/autopoc-artifacts/poc-report.md)

To run MCPify against your own application on OpenShift:

1. Build the image using the provided `Dockerfile.ubi`
2. Create a Job manifest pointing to your application's source directory
3. Collect the generated `.mcpify/` directory from the Job output
4. Deploy the generated MCP server as a separate service

MCPify supports `--ai-enhance` for improved tool descriptions using Anthropic's API. Inject the API key via Kubernetes Secret for enhanced output.
