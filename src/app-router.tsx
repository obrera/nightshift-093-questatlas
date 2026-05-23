import { createBrowserRouter, Navigate } from 'react-router'

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import ShellFeatureLayout from '@/shell/feature/shell-feature-layout'
import ShellUiLoader from '@/shell/ui/shell-ui-loader'

export const appRouter = createBrowserRouter(
  [
    {
      children: [
        { element: <Navigate replace to="/atlas" />, index: true },
        {
          lazy: () => import('@/questatlas/feature/questatlas-feature-entry'),
          path: 'atlas',
        },
        {
          lazy: () => import('@/shell/feature/shell-not-found-feature'),
          loader: (): ShellNotFoundProps => ({
            links: [
              {
                description: 'Return to the QuestAtlas route builder and pass mint console.',
                title: 'QuestAtlas',
                to: '/atlas',
              },
            ],
          }),
          path: '*',
        },
      ],
      element: <ShellFeatureLayout links={[{ label: 'Atlas', to: '/atlas' }]} />,
      hydrateFallbackElement: <ShellUiLoader fullScreen />,
    },
  ],
  {
    // Set the base URL for router links and redirects, removing trailing slashes if present, independent of the base
    basename: import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, ''),
  },
)
