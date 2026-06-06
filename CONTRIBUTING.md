## Contributing

Thanks for helping improve MCPify.

### Getting Started

1. Fork or branch from `main`.
2. Install dependencies and make sure the workspace builds locally.
3. Make focused changes in the smallest package or app that owns the behavior.
4. Update docs, tests, or examples when behavior changes.

### Development Guidelines

- Keep changes small and easy to review.
- Follow the existing TypeScript and formatting conventions in the repo.
- Prefer fixing root causes instead of adding surface-level patches.
- Avoid unrelated refactors in the same pull request.

### Before Opening a PR

- Verify the affected package or app still builds.
- Run the relevant tests for the area you changed.
- Check that documentation stays aligned with the code.
- Include a short summary of what changed and why.

### Reporting Issues

If you find a bug or missing behavior, open an issue with:

- a clear description of the problem
- the package, app, or command involved
- steps to reproduce
- expected and actual behavior
- any logs, screenshots, or stack traces that help narrow it down
