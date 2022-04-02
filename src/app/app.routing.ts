import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

  // Redirect empty path to '/dashboard'
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  // Redirect signed in user to the '/dashboard'
  //
  // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
  // path. Below is another redirection for that path to redirect the user to the desired
  // location. This is a small convenience to keep all main routes together here on this file.
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboard' },

  // Auth routes for guests
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty'
    },
    children: [
      {
        path: 'sign-in',
        loadChildren: (): any => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)
      }
    ]
  },

  // Auth routes for authenticated users
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty'
    },
    children: [
      {
        path: 'sign-out',
        loadChildren: (): any => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)
      }
    ]
  },

  // Landing routes
  {
    path: '',
    component: LayoutComponent,
    data: {
      layout: 'empty'
    },
    children: [
      {
        path: 'home',
        loadChildren: (): any => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)
      },
    ]
  },

  // Admin routes
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    children: [
      // Homepage
      {
        path: 'dashboard',
        loadChildren: (): any => import('app/modules/admin/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      // License routes
      {
        path: 'license',
        loadChildren: (): any => import('app/modules/license/license.module').then(m => m.LicenseModule)
      },

      // Admin
      {
        path: 'admin',
        children: [
          // Thinqpage
          {
            path: 'thinq/:appId',
            loadChildren: (): any => import('app/modules/admin/thinq/thinq.module').then(m => m.ThinqModule)
          },
          // Admin view cabinet
          {
            path: 'view/:cabinet',
            loadChildren: (): any => import('app/modules/admin/admin-view/admin-view.module').then(m => m.AdminViewModule)
          },
          // Create Appdata
          {
            path: 'create',
            loadChildren: (): any => import('app/modules/admin/create-thinq/create-thinq.module').then(m => m.CreateThinqModule)
          },
          {
            path: 'create/:appId',
            loadChildren: (): any => import('app/modules/admin/create-thinq/create-thinq.module').then(m => m.CreateThinqModule)
          },
          // Relate page
          {
            path: 'relate/:appId',
            loadChildren: (): any => import('app/modules/admin/relate-thinq/relate-thinq.module').then(m => m.RelateThinqModule)
          },
          // Document preview page
          {
            path: 'document/view/:appId',
            loadChildren: (): any => import('app/modules/admin/document-view/document-view.module').then(m => m.DocumentViewModule)
          },
          // Generic Kanban page
          {
            path: 'Kanban/:cabinet/:field',
            loadChildren: (): any => import('app/modules/admin/kanban-board/kanban-board.module').then(m => m.KanbanBoardModule)
          },
          // Project Management
          {
            path: 'PM',
            children: [
              // Project kanban view
              {
                path: 'Kanban',
                loadChildren: (): any => import('app/modules/admin/project-management/kanban-board/kanban-board.module')
                  .then(m => m.PMKanbanBoardModule)
              },
              // Project dashboard view
              {
                path: 'Dashboard',
                loadChildren: (): any => import('app/modules/admin/project-management/pm-dashboard/pm-dashboard.module')
                  .then(m => m.PMDashboardModule)
              },
            ]
          },
          // CRM
          {
            path: 'CRM',
            children: [
              {
                path: 'Opportunity',
                loadChildren: (): any => import('app/modules/admin/CRM/opportunity-dashboard/opportunity-dashboard.module')
                  .then(m => m.OpportunityDashboardModule)
              }
            ]
          },
          // Create Party
          {
            path: 'party',
            loadChildren: (): any => import('app/modules/admin/party/party.module')
              .then(m => m.PartyModule)
          }
        ]
      },

      // Error
      {
        path: 'error', children: [
          {
            path: '404',
            loadChildren: (): any => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module)
          },
          {
            path: '500',
            loadChildren: (): any => import('app/modules/admin/pages/error/error-500/error-500.module').then(m => m.Error500Module)
          }
        ]
      },

      // Error page
      // 404 & Catch all
      {
        path: '404-not-found',
        pathMatch: 'full', loadChildren: (): any => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module)
      },
      {
        path: '**',
        redirectTo: '404-not-found'
      }
    ]
  }
];
