# Deployment

## Static build

Vite uses a relative asset base so the generated app can be hosted at a
repository subpath on GitHub Pages.

```sh
npm ci
npm run build
npm run preview
```

The deployable site is `dist/`. Do not commit build output.

## GitHub Pages

The repository workflow is responsible for building the site and publishing
`dist/` to the GitHub Pages environment. In repository settings, select the
GitHub Actions Pages source and grant the workflow only the Pages deployment
permissions it needs. The deployment must run from the approved branch or
release workflow; never publish secrets because this site has no backend.

After a successful deployment, record the workflow run and public URL, then
verify that the page and its assets load from the repository subpath. Complete
the rent → return → receipt walkthrough and reload-reset check against the
public URL. A local build is not evidence of a successful public deployment.

## Release verification

Before deployment, run `npm run format:check`, `npm run lint`,
`npm run typecheck`, `npm test`, `npm run test:e2e`,
`npm run diagrams:check`, and `npm run build`. Capture compressed JavaScript
size and measure LCP on a documented representative mobile device/network
profile. Record skipped checks and any unmet targets in the implementation
report. No remote deployment or push is performed as part of local development
without explicit authorization.
