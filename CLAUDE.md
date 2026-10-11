# CLAUDE.md

Backstage lab (new frontend system + new backend system, Yarn 4). The UI wears the
**DevPortal visual identity**, built on Backstage UI (BUI) instead of MUI. Keep it
that way: every new screen, widget or plugin integration follows the rules below.

Talk to the user in Portuguese (pt-BR); write code, comments, docs and commits in English.

## Source of truth

- Figma: file key `hA6JOGGrOo0CpfPRrUiw0m` ("DevPortal"). Read it with the Figma MCP tools
  (`get_screenshot`, `get_metadata`, then `get_design_context` on the subtree you build; skip the
  sidebar subtree, it is already built). The file has no variables: take values from the design context.
- Screens already built (node ids): catalog `4-568`, APIs `8-875`, templates `12-751`,
  home `31-753`, documentation `39-645`, notifications `43-255`, settings `59-3`, search `64-700`,
  entity detail `69-1864` (a Component; every other kind reuses it, see `modules/entity/`).
- If the Figma has no design for a state (e.g. notification rows), design it with the same
  tokens and patterns, and say so to the user.

## How the identity is wired (`packages/app/src`)

- `theme/devportal.css`: `--bui-*` overrides for **light mode only** (the selector avoids dark
  mode on purpose) plus `--dp-*` tokens BUI has no equivalent for. Font: Inter.
- `modules/nav/`: own app layout (no MUI `SidebarPage`), sidebar, and the swapped
  `core-page-layout` (top bar, breadcrumbs, title blocks, tabs).
- `modules/<plugin>/`: one folder per plugin whose page was restyled. Each swaps only the page
  of its plugin with `plugin.withOverrides` + `getExtension('page:x').override(...)`, and is
  listed in `App.tsx` `features`. Reader/wizard/detail pages of the plugin stay original.
- `modules/entities/`: shared building blocks for list pages (list card with BUI table,
  `UserFilters`, `FilterSelects`, `cells`, `SupportMenu`, `PageNote`). Reuse them before writing new ones.
- `modules/entity/`: the entity detail page (`/catalog/:namespace/:kind/:name`), one page for every
  kind. Header (`EntityHeaderLayoutBlueprint`), 2-column card grid (`EntityContentLayoutBlueprint`),
  and own cards swapped into the catalog and catalog-graph plugins (`Sobre`, `Links`, `Relações`
  diagram, relation tables, API definition card and the API tab, wired from `modules/api-docs`).
  Cards of other plugins (org, api-docs, labels) stay original and are
  only restyled by the CSS of the grid (`EntityContentLayout.module.css`; the Ownership tiles of
  `org` are matched by structure because MUI class names are generated). Its extensions are spread into `devPortalCatalogPlugin`.
- `modules/home/`: custom home layout and widgets (fixed 3-column CSS grid; the plugin's
  `defaultConfig` grid positions are not used, widget content config in `app-config.yaml` is).

## Design rules

- **BUI first.** Use `@backstage/ui` components (`Table`, `SearchField`, `Select`, `Menu`,
  `Button`, `ButtonLink`...). Use MUI only for icons (`@material-ui/icons`) or where no BUI
  equivalent exists. Do not add Tailwind or a new icon set (the user chose to keep the project's icons).
- **Styling:** CSS modules (`*.module.css`) with tokens. Never hardcode colors, radii or fonts that
  have a token. To restyle BUI internals use the stable classes with `:global(.bui-...)`.
- **Palette (light):** accent `#365f9b`, accent subtle `#e8eef8`, text `#202631` / `#697384` /
  tertiary `#767f8e` (`--dp-fg-tertiary`, darker than Figma's `#929aa7` for contrast), borders
  `#e3e7ed`, app bg `#f6f7f9`, sidebar `#f0f2f5`, card `#fff`. Status pills: `--dp-status-*`.
- **Shape and size:** radius 6 (chips/icon buttons), 8 (buttons/inputs/nav items), 12 (cards).
  Sidebar 232px, page padding 40px, filter column 188px, title block `26px` + `13px` description.
- **Page anatomy:** top bar (from the page layout) -> white title block (title, description,
  `SupportMenu variant="button"`) -> optional tabs -> gray body with filters column + white list card.
  Pages with tabs get their title block from `HEADERS` and visible tabs from `VISIBLE_TABS` in
  `modules/nav/PageLayout.tsx`.
- **Accessibility:** real buttons/links, labels for icon buttons, `aria-pressed`/`aria-current`
  where state exists, visible `:focus-visible` outline (`--bui-ring`), no text below ~4:1 contrast.
- **Texts are hard-coded in Portuguese for now.** Do not start i18n unless asked; when it
  comes, strings move to translation refs and official plugins get pt messages. Dates and
  numbers use `pt-BR`.

## Adding a plugin or screen

1. Read the Figma node, then the plugin's extensions in `node_modules/@backstage/plugin-x/dist/alpha.esm.js`
   (page id, sub pages, inputs, config schema) before writing code.
2. New page: create `modules/<plugin>/`, override the page loader, add the plugin to `App.tsx`.
3. Nav label/icon/section: `LABELS` and `WORKSPACE`/`FOOTER`/`HIDDEN` in `modules/nav/Sidebar.tsx`
   (items not listed fall under "Organização"). Breadcrumb titles: `TITLES` in `PageLayout.tsx`.
4. A community plugin that uses MUI keeps the MUI look inside the DevPortal shell. Restyle it
   on request; do not assume it is on-brand.
5. Do not import from `packages/app` inside a plugin. Shared UI for plugins belongs in a
   shared package (planned, not done yet).

## Gotchas

- `NavContentNavItems` are shared across renders: call `navItems.clone()` before `take`.
- `extension.override({ disabled: true })` removes the extension (and its URL). To hide a
  menu item or tab keep the page and filter it (`HIDDEN`, `VISIBLE_TABS`).
- The entity header layout only receives `tabs` and `activeTabId`, not the items of the `...`
  menu: `page:catalog/entity` is overridden to pass them through `MenuItemsProvider`, and with
  `noHeader: true` because the header draws its own top bar (it needs custom crumbs).
- The layout of the entity overview only gets `{ element, type }` per card; the extension id is
  read from `element.props.node.spec.id` to order the cards (`ORDER` in `EntityContentLayout.tsx`).
- `backstage.io/source-location` makes TechDocs resolve `dir:.` against that URL (it downloads
  the repo). Do not set both on the sample entities. `providesApis`/`consumesApis` are plural.
- The catalog list page is pinned to components; only `component` and `api` kinds have a list
  page to link from the breadcrumb (`kindListPage`).
- The notifications client types `created/read/saved` as `Date` but returns ISO strings.
- The guest user signs in as `user:development/guest`, not `user:default/guest`; notifications
  for tests are sent as `broadcast`.
- `https://*.k8s.orb.local` is answered by OrbStack's proxy and returns `502 ... EOF` for hosts behind
  the gateway (a listener on 443 with a certificate did not help); Keycloak is HTTP only. A browser
  that upgrades to HTTPS cannot open it.
- `app-config.yaml`: home is `/`, catalog is `/catalog`, visit tracking is on. Yarn pins
  `@yarnpkg/core` to 4.9.1 in `resolutions` (4.9.2 was published broken); drop it once fixed.

## Infrastructure

`Makefile` + `infra/<component>/` (one folder per component, variables with `?=`, explicit CPU and
memory limits on every workload). No Helm: Istio is `istioctl install -f infra/istio/operator.yaml` (the
local `istioctl` must be `ISTIO_VERSION`), CloudNativePG is its release manifest through Kustomize
(`infra/postgres/operator`), Keycloak is plain manifests. `make istio`, `make postgres`, `make keycloak` (see README). Gotchas: OrbStack
is k3s (CNI paths in `infra/istio/operator.yaml`); `TCPRoute` needs `PILOT_ENABLE_ALPHA_GATEWAY_API`;
CNPG managed roles need their Secret labeled `cnpg.io/reload: "true"`; Keycloak imports its realm only
when it does not exist (`realm-backstage.json` is the only source). Over IPv6 the `*.k8s.orb.local`
gateway stalls on responses of more than a few KB (a plain container does not), which hangs the Keycloak
login page in a browser that prefers IPv6. Always pass the cluster by
context (`orbstack`). `yarn start` needs the cluster Postgres running. Remove test resources you create.

## Not done yet

Dark mode for the new screens (BUI defaults + `--dp-*` fallbacks only), i18n, the "pin sidebar"
setting (needs a collapsed-sidebar design), MUI theme alignment, shared UI package, and the menu
items that exist only in the Figma (Backstage AI, Administração, Grupos, Tech Radar). On the entity
page: the Docs tab (TechDocs reader), the rendered OpenAPI/AsyncAPI/GraphQL widgets (only fonts
and spacing are adjusted) and the `...` menu items still look like the plugins and are in English.

## Verifying work

Run `yarn tsc`, `yarn workspace app lint`, `CI=true yarn workspace app test --watchAll=false` and
`yarn workspace app build` after UI changes. These do not prove the layout. Never stop or restart the user's
`yarn start`; to look at the app build it and run a separate instance (a backend on port 7008 with
`APP_CONFIG_backend_listen_port=7008`, `APP_CONFIG_backend_baseUrl=http://localhost:7008` and
`APP_CONFIG_app_baseUrl=http://localhost:7008`), then stop it afterwards. The backend caches
`index.html`: restart it after every build. Headless Chromium works for screenshots
(`npx playwright install chromium`, then `playwright-core` from `node_modules` in a script kept
outside the repo; sign in with the Guest button). Say clearly what was not seen in a browser.

## Commits

Short, single line, Conventional Commits style, lower case after the type, imperative mood,
no body and no `Co-Authored-By` trailer unless asked. Example:

`feat: apply the DevPortal visual identity to the Backstage app`

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`. Do not push unless asked;
if on `main`, create a branch first.
