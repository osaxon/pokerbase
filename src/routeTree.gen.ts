/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignInImport } from './routes/sign-in'
import { Route as IndexImport } from './routes/index'
import { Route as SquadsIndexImport } from './routes/squads.index'
import { Route as RoomsIndexImport } from './routes/rooms.index'
import { Route as DashboardIndexImport } from './routes/dashboard.index'
import { Route as AccountIndexImport } from './routes/account.index'
import { Route as RoomsNewImport } from './routes/rooms.new'
import { Route as RoomsIdImport } from './routes/rooms.$id'
import { Route as LayoutMainImport } from './routes/_layout.main'
import { Route as RoomsIdJoinImport } from './routes/rooms_.$id.join'

// Create/Update Routes

const SignInRoute = SignInImport.update({
  path: '/sign-in',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const SquadsIndexRoute = SquadsIndexImport.update({
  path: '/squads/',
  getParentRoute: () => rootRoute,
} as any)

const RoomsIndexRoute = RoomsIndexImport.update({
  path: '/rooms/',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  path: '/dashboard/',
  getParentRoute: () => rootRoute,
} as any)

const AccountIndexRoute = AccountIndexImport.update({
  path: '/account/',
  getParentRoute: () => rootRoute,
} as any)

const RoomsNewRoute = RoomsNewImport.update({
  path: '/rooms/new',
  getParentRoute: () => rootRoute,
} as any)

const RoomsIdRoute = RoomsIdImport.update({
  path: '/rooms/$id',
  getParentRoute: () => rootRoute,
} as any)

const LayoutMainRoute = LayoutMainImport.update({
  path: '/main',
  getParentRoute: () => rootRoute,
} as any)

const RoomsIdJoinRoute = RoomsIdJoinImport.update({
  path: '/rooms/$id/join',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/sign-in': {
      id: '/sign-in'
      path: '/sign-in'
      fullPath: '/sign-in'
      preLoaderRoute: typeof SignInImport
      parentRoute: typeof rootRoute
    }
    '/_layout/main': {
      id: '/_layout/main'
      path: '/main'
      fullPath: '/main'
      preLoaderRoute: typeof LayoutMainImport
      parentRoute: typeof rootRoute
    }
    '/rooms/$id': {
      id: '/rooms/$id'
      path: '/rooms/$id'
      fullPath: '/rooms/$id'
      preLoaderRoute: typeof RoomsIdImport
      parentRoute: typeof rootRoute
    }
    '/rooms/new': {
      id: '/rooms/new'
      path: '/rooms/new'
      fullPath: '/rooms/new'
      preLoaderRoute: typeof RoomsNewImport
      parentRoute: typeof rootRoute
    }
    '/account/': {
      id: '/account/'
      path: '/account'
      fullPath: '/account'
      preLoaderRoute: typeof AccountIndexImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/': {
      id: '/dashboard/'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof rootRoute
    }
    '/rooms/': {
      id: '/rooms/'
      path: '/rooms'
      fullPath: '/rooms'
      preLoaderRoute: typeof RoomsIndexImport
      parentRoute: typeof rootRoute
    }
    '/squads/': {
      id: '/squads/'
      path: '/squads'
      fullPath: '/squads'
      preLoaderRoute: typeof SquadsIndexImport
      parentRoute: typeof rootRoute
    }
    '/rooms/$id/join': {
      id: '/rooms/$id/join'
      path: '/rooms/$id/join'
      fullPath: '/rooms/$id/join'
      preLoaderRoute: typeof RoomsIdJoinImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  SignInRoute,
  LayoutMainRoute,
  RoomsIdRoute,
  RoomsNewRoute,
  AccountIndexRoute,
  DashboardIndexRoute,
  RoomsIndexRoute,
  SquadsIndexRoute,
  RoomsIdJoinRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/sign-in",
        "/_layout/main",
        "/rooms/$id",
        "/rooms/new",
        "/account/",
        "/dashboard/",
        "/rooms/",
        "/squads/",
        "/rooms/$id/join"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/sign-in": {
      "filePath": "sign-in.tsx"
    },
    "/_layout/main": {
      "filePath": "_layout.main.tsx"
    },
    "/rooms/$id": {
      "filePath": "rooms.$id.tsx"
    },
    "/rooms/new": {
      "filePath": "rooms.new.tsx"
    },
    "/account/": {
      "filePath": "account.index.tsx"
    },
    "/dashboard/": {
      "filePath": "dashboard.index.tsx"
    },
    "/rooms/": {
      "filePath": "rooms.index.tsx"
    },
    "/squads/": {
      "filePath": "squads.index.tsx"
    },
    "/rooms/$id/join": {
      "filePath": "rooms_.$id.join.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
