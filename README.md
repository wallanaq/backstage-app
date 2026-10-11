# Backstage Lab

A [Backstage](https://backstage.io) instance used to **validate what Backstage can do when it is
wired to real platform tooling**: GitOps, Argo CD, Kubernetes, Keycloak and more. Each integration
is tried, documented and kept only if it earns its place. The app also wears its own visual
identity (see [DevPortal UI](#devportal-ui)).

## Status

| Area                                                                                    | State                                                                                                               |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Software catalog, API docs, TechDocs, search, notifications, user settings, MCP actions | Running, with the example data in `examples/`                                                                       |
| Software templates (scaffolder)                                                         | Running; the templates in `examples/` only log their input (the original one publishes to GitHub and needs a token) |
| DevPortal UI on every screen                                                            | Done (light mode)                                                                                                   |
| Istio (ambient mode) + Gateway API                                                      | Running: `make istio` installs it with the shared Gateway `istio-gateway` (`*.k8s.orb.local`)                       |
| PostgreSQL (CloudNativePG)                                                              | Running: `make postgres`; shared instance, Backstage uses it today and other tools can reuse it                     |
| Kubernetes                                                                              | Backend plugin installed, **not configured** (`kubernetes` is commented out in `app-config.yaml`)                   |
| GitOps / Argo CD                                                                        | Planned                                                                                                             |
| Keycloak (OIDC sign-in, users and groups)                                               | Running: `make keycloak`; realm `backstage` imported from the repo                                                  |
| Permissions / RBAC                                                                      | Plugin installed with the allow-all policy                                                                          |
| Other integrations                                                                      | To be added as they are validated                                                                                   |

Nothing under "Planned" exists in this repository yet.

## Stack

- Backstage 1.55 on the **new frontend system** and the **new backend system**
- UI on Backstage UI (BUI), custom theme in `packages/app/src/theme/devportal.css`
- Node.js 22 or 24, Yarn 4 (`packageManager` is `yarn@4.13.0`, the binary is vendored in `.yarn/releases`)
- Database: PostgreSQL (CloudNativePG) shared in the local Kubernetes
- Kubernetes: OrbStack (k3s), Istio in ambient mode, Gateway API

## Requirements

- Node.js 22 or 24
- Yarn 4 (use [Corepack](https://nodejs.org/api/corepack.html): `corepack enable`)
- [OrbStack](https://orbstack.dev) with Kubernetes enabled, `kubectl`, `make` and
  [`istioctl`](https://istio.io/latest/docs/setup/getting-started/#download) 1.31.1 (for the
  [infrastructure](#infrastructure); the context is `orbstack`; `brew install istioctl` gets the latest)
- Docker (optional): TechDocs builds docs in a container (`techdocs.generator.runIn: docker`), and
  it is needed to build the backend image

## Install

```sh
yarn install
```

If `yarn install` fails with `ENOENT .../.yarn/patches/got-npm-11.8.2-...patch`, check that the
`@yarnpkg/core` entry in `resolutions` (root `package.json`) is still there: version 4.9.2 of that
package was published broken. It can be removed once a fixed version is released.

## Infrastructure

The backend needs the Postgres of the lab, so bring the infrastructure up first (OrbStack Kubernetes
running). Everything is in the `Makefile` and `infra/<component>/`; `make help` lists the targets and
the variables you can override.

```sh
make keycloak   # runs "postgres" first, which runs "istio" first
```

| Target          | What it does                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make istio`    | Gateway API CRDs (experimental bundle, for `TCPRoute`), Istio in **ambient mode** with `istioctl` (`infra/istio/operator.yaml`) and the shared Gateway **`istio-gateway`** in `istio-system`                |
| `make postgres` | CloudNativePG operator (release manifest through Kustomize) and the shared `postgres` cluster (1 instance, 5Gi), with the managed roles `backstage` and `keycloak` (`changeme`) and the database `keycloak` |
| `make keycloak` | Keycloak 26.8 (plain Deployment, shared Postgres) behind `istio-gateway`, with the realm `backstage` imported from `infra/keycloak/realm-backstage.json`                                                    |

Addresses:

| What                    | Where                                                                          |
| ----------------------- | ------------------------------------------------------------------------------ |
| HTTP applications       | `http://<name>.k8s.orb.local`, with an `HTTPRoute` attached to `istio-gateway` |
| Postgres from the host  | `postgres.k8s.orb.local:5432` (`TCPRoute` on the Gateway port 5432)            |
| Postgres in the cluster | `postgres-rw.postgres.svc.cluster.local:5432`                                  |
| Keycloak                | `http://keycloak.k8s.orb.local` (admin console: `admin` / `admin`)             |

Other tools should create their own role and database in this Postgres instead of running another
one (Keycloak did, see `infra/postgres/cluster.yaml`). The targets are safe to run again. Notes:

- There is no Helm. `make istio` runs `istioctl install -f infra/istio/operator.yaml` and fails when the
  local `istioctl` is not `ISTIO_VERSION`; `make postgres` applies the release manifest of CloudNativePG
  with `kubectl apply --server-side -k infra/postgres/operator` (the version is in the URL there).
- OrbStack runs k3s, so `istio-cni` is pointed at `/var/lib/rancher/k3s/...` (`values.cni` in
  `infra/istio/operator.yaml`); with the defaults it waits forever for a CNI config.
- `TCPRoute` is an experimental Gateway API kind: istiod runs with `PILOT_ENABLE_ALPHA_GATEWAY_API`
  (`infra/istio/operator.yaml`).
- If the lab was installed with an older version of this repo (Helm), remove the releases first with
  `helm uninstall ztunnel istio-cni istiod istio-base -n istio-system` and `helm uninstall cnpg -n cnpg-system`.
  The CRDs are kept (`helm.sh/resource-policy: keep`), so the Postgres data is not touched.
- Workloads are not enrolled in the ambient mesh yet (no `istio.io/dataplane-mode` label).
- Credentials are plain text on purpose (lab only) and there is no TLS.
- Keycloak imports the realm only when it does not exist yet. After changing `realm-backstage.json`,
  delete the realm `backstage` in the admin console (or drop the database `keycloak`) and run
  `make keycloak` again.
- Keycloak is plain HTTP: `http://keycloak.k8s.orb.local`. The HTTPS port of `*.k8s.orb.local` is
  answered by OrbStack's own proxy, which fails with `502 Bad Gateway ... OrbStack proxy error: EOF` for
  every host behind the gateway (also with a listener and a certificate on 443). A browser that upgrades
  `http://` to `https://` ("Always use secure connections" in Chrome, "HTTPS first" elsewhere) therefore
  shows that 502: turn it off for this host.
- OrbStack also publishes an IPv6 address for `*.k8s.orb.local`, and on this setup big responses
  (more than a few KB) over IPv6 stall, so a client that prefers IPv6 can hang on the Keycloak login
  page. Check with `curl -6 http://keycloak.k8s.orb.local/resources/` against `curl -4`; a container
  address (`<name>.orb.local`) does not have the problem. Headless browsers can be pinned to IPv4
  with `--host-resolver-rules="MAP keycloak.k8s.orb.local <node ip>"`.

### Keycloak realm

The realm `backstage` (one source: `infra/keycloak/realm-backstage.json`) has:

| What                       | Details                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Client `backstage`         | Backstage sign-in (authorization code); redirect URIs for the backend on 7007 and 7008; secret `changeme`         |
| Client `backstage-catalog` | Service account (roles `query-users`, `query-groups`, `view-users`) used by the catalog import; secret `changeme` |
| User `platform-admin`      | Platform admin, group `platform`, password `changeme`                                                             |
| User `banking-user`        | User of the business product "banking", group `banking`, password `changeme`                                      |

Users and groups of the realm are imported into the catalog every minute (`catalog.providers.keycloakOrg`),
so a user created in Keycloak shows up in Backstage after the next run. The sign-in matches the e-mail of
the Keycloak user with the e-mail of the catalog `User` entity, so a new user can only sign in once it
has been imported (and must have an e-mail).

## Run locally

```sh
yarn start
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:7007>
- Sign in as **Guest**.

The database is the shared Postgres (see [Infrastructure](#infrastructure)), so catalog data, starred
entities, notifications and user settings survive restarts. Without the cluster running the backend
cannot start.

To run only one side: `yarn workspace app start` or `yarn workspace backend start`.

## Configuration

| File                    | Use                                            |
| ----------------------- | ---------------------------------------------- |
| `app-config.yaml`       | Local development                              |
| `app-config.local.yaml` | Your own overrides; git ignores `*.local.yaml` |

Environment variables:

| Variable                                                               | When                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `GITHUB_TOKEN`                                                         | Only for GitHub-backed features such as the `publish:github` scaffolder action |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Database (the defaults point at the lab Postgres)                              |

Notes on `app-config.yaml`:

- `app.extensions` sets the landing page (`page:home` at `/`; the catalog is at `/catalog`), turns
  on visit tracking, and holds the content of the home widgets (toolkit links, world clocks).
- `catalog.locations` lists the example files loaded at startup.

## Example data

- `examples/entities.yaml`, `examples/org.yaml`: sample components, API, system, users and groups
- `examples/template/`: the original example template
- `examples/templates/`: sample templates for the templates screen, the teams that own them, and
  **"Gerar notificações de teste"**, a template that sends 6 broadcast notifications
- `examples/showcase/`: one entity of every kind (domain, system, group, user, resource, API and three
  components, with links, tags and docs) for the entity detail page; `artist-lookup` is the one in the design

## Useful commands

| Command               | What it does                                                              |
| --------------------- | ------------------------------------------------------------------------- |
| `yarn tsc`            | Type check                                                                |
| `yarn lint:all`       | Lint everything (`yarn lint` only lints what changed since `origin/main`) |
| `yarn test`           | Unit tests (`yarn test:all` with coverage)                                |
| `yarn test:e2e`       | Playwright tests                                                          |
| `yarn prettier:check` | Check formatting                                                          |
| `yarn build:all`      | Build every package                                                       |
| `yarn new`            | Create a plugin or package from a template                                |
| `yarn clean`          | Remove build output                                                       |

## Build the image

```sh
yarn install --immutable
yarn tsc
yarn build:backend
yarn build-image   # docker build, tag "backstage"
```

The image uses only `app-config.yaml` (a local lab has no production profile), so the defaults
point at the lab cluster and the `POSTGRES_*` variables override them. See `packages/backend/Dockerfile`.

## Project layout

```
Makefile               Infrastructure targets (istio, postgres, keycloak)
infra/                 Manifests and settings, one folder per component
packages/app/          Frontend (new frontend system)
  src/theme/           DevPortal tokens
  src/modules/         One folder per restyled plugin + nav, entities (shared UI), home
packages/backend/      Backend (plugins are added in src/index.ts)
plugins/               Local plugins (none yet)
examples/              Catalog data and templates
app-config*.yaml       Configuration
```

## DevPortal UI

The interface follows the "DevPortal" Figma file and is built on BUI tokens instead of MUI. The
rules (tokens, patterns, how to add a plugin or screen, known gotchas) are in
[`CLAUDE.md`](CLAUDE.md); read it before changing the UI. Plugins from the community that use MUI
get the DevPortal shell (menu, top bar, theme tokens) but keep the MUI look inside the page until
they are restyled.

Not done yet: dark mode for the new screens, translations (texts are in Portuguese, hard-coded),
and the "pin sidebar" setting.

## Roadmap

- [ ] Kubernetes: configure clusters and show workloads on entity pages
- [ ] GitOps with Argo CD: applications and sync status in the catalog
- [ ] Keycloak: OIDC sign-in, users and groups from the realm
- [ ] Shared UI package so new plugins start with the DevPortal identity
- [ ] Translations (pt-BR for the official plugins)

## Contributing

Commits are a single line in Conventional Commits style, for example
`feat: apply the DevPortal visual identity to the Backstage app`.
