import { createExtension } from '@backstage/frontend-plugin-api';
import homePlugin from '@backstage/plugin-home/alpha';
import {
  HomePageLayoutBlueprint,
  homePageWidgetDataRef,
} from '@backstage/plugin-home-react/alpha';
import { HomeLayout } from './HomeLayout';
import { FavoriteEntities } from './widgets/FavoriteEntities';
import { GettingStarted } from './widgets/GettingStarted';
import { RandomJoke } from './widgets/RandomJoke';
import { Toolkit } from './widgets/Toolkit';
import { MostVisited, RecentlyVisited } from './widgets/VisitedPages';
import { WorldClock } from './widgets/WorldClock';

// The widgets are drawn by `HomeLayout` in the DevPortal card style, so they
// replace the plugin's own widgets (which come with a MUI card) under the same
// extension ids. Their settings in app-config.yaml keep working.
const gettingStartedWidget = createExtension({
  kind: 'home-page-widget',
  name: 'getting-started',
  attachTo: { id: 'page:home', input: 'widgets' },
  output: [homePageWidgetDataRef],
  factory: ({ node }) => [
    homePageWidgetDataRef({
      node,
      name: 'GettingStarted',
      title: 'Primeiros passos',
      component: <GettingStarted />,
    }),
  ],
});

/** The home plugin with the DevPortal layout and widgets. */
export const devPortalHomePlugin = homePlugin.withOverrides({
  extensions: [
    // The top bar (breadcrumb, notifications) comes from the page layout.
    homePlugin.getExtension('page:home').override({
      factory: originalFactory =>
        originalFactory({ params: { noHeader: false } }),
    }),
    HomePageLayoutBlueprint.make({
      params: { loader: async () => HomeLayout },
    }),
    gettingStartedWidget,
    homePlugin.getExtension('home-page-widget:home/starred-entities').override({
      factory: (_originalFactory, { node }) => [
        homePageWidgetDataRef({
          node,
          name: 'HomePageStarredEntities',
          title: 'Suas entidades favoritas',
          component: <FavoriteEntities />,
        }),
      ],
    }),
    homePlugin.getExtension('home-page-widget:home/toolkit').override({
      factory: (_originalFactory, { node, config }) => [
        homePageWidgetDataRef({
          node,
          name: 'HomePageToolkit',
          title: 'Ferramentas',
          component: <Toolkit tools={config.tools} />,
        }),
      ],
    }),
    homePlugin.getExtension('home-page-widget:home/random-joke').override({
      factory: (_originalFactory, { node }) => [
        homePageWidgetDataRef({
          node,
          name: 'HomePageRandomJoke',
          title: 'Piada aleatória',
          component: <RandomJoke />,
        }),
      ],
    }),
    homePlugin.getExtension('home-page-widget:home/world-clock').override({
      factory: (_originalFactory, { node, config }) => [
        homePageWidgetDataRef({
          node,
          name: 'HomePageWorldClock',
          title: 'Relógios mundiais',
          component: (
            <WorldClock
              clocks={config.clockConfigs}
              hour12={config.customTimeFormat?.hour12}
            />
          ),
        }),
      ],
    }),
    homePlugin.getExtension('home-page-widget:home/most-visited').override({
      factory: (_originalFactory, { node }) => [
        homePageWidgetDataRef({
          node,
          name: 'HomePageMostVisited',
          title: 'Mais visitados',
          component: <MostVisited />,
        }),
      ],
    }),
    homePlugin.getExtension('home-page-widget:home/recently-visited').override({
      factory: (_originalFactory, { node }) => [
        homePageWidgetDataRef({
          node,
          name: 'HomePageRecentlyVisited',
          title: 'Visitados recentemente',
          component: <RecentlyVisited />,
        }),
      ],
    }),
  ],
});
