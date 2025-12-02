import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from './layout/layout';
import FullPageLayout from './pages/(full-page)/layout';
import LandingLayout from './pages/(landing)/layout';

// Main Pages
const SalesDashboard = lazy(() => import('./pages/(main)/page'));
const DashboardAnalytics = lazy(() => import('./pages/(main)/dashboards/dashboardanalytics/page'));
const DashboardSaaS = lazy(() => import('./pages/(main)/dashboards/dashboardsaas/page'));
const BlocksDemo = lazy(() => import('./pages/(main)/blocks/page'));
const Documentation = lazy(() => import('./pages/(main)/documentation/page'));

// Fleet Management
const VehiclesList = lazy(() => import('./pages/(main)/fleet/vehicles/list/page'));
const AddVehicle = lazy(() => import('./pages/(main)/fleet/vehicles/add/page'));
const VehicleOverview = lazy(() => import('./pages/(main)/fleet/vehicles/page'));
const VehicleDetails = lazy(() => import('./pages/(main)/fleet/vehicles/[id]/page'));
const EditVehicle = lazy(() => import('./pages/(main)/fleet/vehicles/[id]/edit/page'));

// Driver Management
const DriversList = lazy(() => import('./pages/(main)/fleet/drivers/list/page'));
const AddDriver = lazy(() => import('./pages/(main)/fleet/drivers/add/page'));
const DriverDetails = lazy(() => import('./pages/(main)/fleet/drivers/[id]/page'));
const EditDriver = lazy(() => import('./pages/(main)/fleet/drivers/[id]/edit/page'));

// Maintenance
const MaintenanceSchedule = lazy(() => import('./pages/(main)/maintenance/schedule/page'));
const MaintenanceRecords = lazy(() => import('./pages/(main)/maintenance/records/page'));
const WorkOrdersList = lazy(() => import('./pages/(main)/maintenance/work-orders/list/page'));
const AddWorkOrder = lazy(() => import('./pages/(main)/maintenance/work-orders/add/page'));
const WorkOrderDetails = lazy(() => import('./pages/(main)/maintenance/work-orders/[id]/page'));
const EditWorkOrder = lazy(() => import('./pages/(main)/maintenance/work-orders/[id]/edit/page'));
const FleetAnalytics = lazy(() => import('./pages/(main)/dashboards/fleet-analytics/page'));
// const AgencyDashboard = lazy(() => import('../../apps/agency/frontend/src/pages/(main)/dashboard/page'));

// Apps
const AppCalendar = lazy(() => import('./pages/(main)/apps/calendar/page'));
const AppChat = lazy(() => import('./pages/(main)/apps/chat/page'));
const ChatLayout = lazy(() => import('./pages/(main)/apps/chat/layout'));
const AppFiles = lazy(() => import('./pages/(main)/apps/files/page'));
const AppTaskList = lazy(() => import('./pages/(main)/apps/tasklist/page'));
const TaskListLayout = lazy(() => import('./pages/(main)/apps/tasklist/layout'));
const AppBlogDetail = lazy(() => import('./pages/(main)/apps/blog/detail/page'));
const AppBlogEdit = lazy(() => import('./pages/(main)/apps/blog/edit/page'));
const AppBlogList = lazy(() => import('./pages/(main)/apps/blog/list/page'));
const MailLayout = lazy(() => import('./pages/(main)/apps/(mail)/layout'));
const AppMailArchived = lazy(() => import('./pages/(main)/apps/(mail)/mail/archived/page'));
const AppMailCompose = lazy(() => import('./pages/(main)/apps/(mail)/mail/compose/page'));
const AppMailDetail = lazy(() => import('./pages/(main)/apps/(mail)/mail/detail/[mailId]/page'));
const AppMailImportant = lazy(() => import('./pages/(main)/apps/(mail)/mail/important/page'));
const AppMailInbox = lazy(() => import('./pages/(main)/apps/(mail)/mail/inbox/page'));
const AppMailSent = lazy(() => import('./pages/(main)/apps/(mail)/mail/sent/page'));
const AppMailSpam = lazy(() => import('./pages/(main)/apps/(mail)/mail/spam/page'));
const AppMailStarred = lazy(() => import('./pages/(main)/apps/(mail)/mail/starred/page'));
const AppMailTrash = lazy(() => import('./pages/(main)/apps/(mail)/mail/trash/page'));

// E-commerce
const EcommerceCheckoutForm = lazy(() => import('./pages/(main)/ecommerce/checkout-form/page'));
const EcommerceNewProduct = lazy(() => import('./pages/(main)/ecommerce/new-product/page'));
const EcommerceOrderHistory = lazy(() => import('./pages/(main)/ecommerce/order-history/page'));
const EcommerceOrderSummary = lazy(() => import('./pages/(main)/ecommerce/order-summary/page'));
const EcommerceProductList = lazy(() => import('./pages/(main)/ecommerce/product-list/page'));
const EcommerceProductOverview = lazy(() => import('./pages/(main)/ecommerce/product-overview/page'));
const EcommerceShoppingCart = lazy(() => import('./pages/(main)/ecommerce/shopping-cart/page'));

// Pages
const PagesContact = lazy(() => import('./pages/(main)/pages/contact/page'));
const PagesCrud = lazy(() => import('./pages/(main)/pages/crud/page'));
const PagesEmpty = lazy(() => import('./pages/(main)/pages/empty/page'));
const PagesHelp = lazy(() => import('./pages/(main)/pages/help/page'));
const PagesInvoice = lazy(() => import('./pages/(main)/pages/invoice/page'));
const PagesTimeline = lazy(() => import('./pages/(main)/pages/timeline/page'));
const NotFound = lazy(() => import('./pages/(full-page)/pages/notfound/page'));

/* Profile */
const ProfileCreate = lazy(() => import('./pages/(main)/profile/create/page'));
const ProfileList = lazy(() => import('./pages/(main)/profile/list/page'));

/* Settings */
const SystemConfigPage = lazy(() => import('./pages/(main)/settings/config/page'));
const MaintenanceCompletionTypesPage = lazy(() => import('./pages/(main)/settings/maintenance-completion-types/page'));
const DocumentTypesPage = lazy(() => import('./pages/(main)/settings/document-types/page'));

/* Documents */
const DocumentsArchived = lazy(() => import('./pages/(main)/documents/archived/page'));

/* Accounts & GST routes are provided by host apps (e.g. apps/accounts) via window.__EXTRA_CHILD_ROUTES__ */

// UI Kit
const ButtonDemo = lazy(() => import('./pages/(main)/uikit/button/page'));
const ChartDemo = lazy(() => import('./pages/(main)/uikit/charts/page'));
const FileDemo = lazy(() => import('./pages/(main)/uikit/file/page'));
const FloatLabelDemo = lazy(() => import('./pages/(main)/uikit/floatlabel/page'));
const FormLayoutDemo = lazy(() => import('./pages/(main)/uikit/formlayout/page'));
const InputDemo = lazy(() => import('./pages/(main)/uikit/input/page'));
const InvalidStateDemo = lazy(() => import('./pages/(main)/uikit/invalidstate/page'));
const ListDemo = lazy(() => import('./pages/(main)/uikit/list/page'));
const MediaDemo = lazy(() => import('./pages/(main)/uikit/media/page'));
const MenuDemo = lazy(() => import('./pages/(main)/uikit/menu/page'));
const MenuConfirmation = lazy(() => import('./pages/(main)/uikit/menu/confirmation/page'));
const MenuPayment = lazy(() => import('./pages/(main)/uikit/menu/payment/page'));
const MenuSeat = lazy(() => import('./pages/(main)/uikit/menu/seat/page'));
const MessageDemo = lazy(() => import('./pages/(main)/uikit/message/page'));
const MiscDemo = lazy(() => import('./pages/(main)/uikit/misc/page'));
const OverlayDemo = lazy(() => import('./pages/(main)/uikit/overlay/page'));
const PanelDemo = lazy(() => import('./pages/(main)/uikit/panel/page'));
const TableDemo = lazy(() => import('./pages/(main)/uikit/table/page'));
const TreeDemo = lazy(() => import('./pages/(main)/uikit/tree/page'));

// Utilities
const UtilitiesColors = lazy(() => import('./pages/(main)/utilities/colors/page'));
const UtilitiesIcons = lazy(() => import('./pages/(main)/utilities/icons/page'));
const UtilitiesPrimeFlex = lazy(() => import('./pages/(main)/utilities/primeflex/page'));
const UtilitiesFigma = lazy(() => import('./pages/(main)/utilities/figma/page'));

// Auth
const Login = lazy(() => import('./pages/(full-page)/auth/login/page'));
const Login2 = lazy(() => import('./pages/(full-page)/auth/login2/page'));
const Access = lazy(() => import('./pages/(full-page)/auth/access/page'));
const Access2 = lazy(() => import('./pages/(full-page)/auth/access2/page'));
const Error = lazy(() => import('./pages/(full-page)/auth/error/page'));
const Error2 = lazy(() => import('./pages/(full-page)/auth/error2/page'));
const ForgotPassword = lazy(() => import('./pages/(full-page)/auth/forgotpassword/page'));
const LockScreen = lazy(() => import('./pages/(full-page)/auth/lockscreen/page'));
const NewPassword = lazy(() => import('./pages/(full-page)/auth/newpassword/page'));
const Register = lazy(() => import('./pages/(full-page)/auth/register/page'));
const Verification = lazy(() => import('./pages/(full-page)/auth/verification/page'));

// Landing
const LandingPage = lazy(() => import('./pages/(landing)/landing/page'));

const AppRoutes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <SalesDashboard /> },
      {
        path: 'fleet',
        children: [
          {
            path: 'vehicles',
            children: [
              { path: 'list', element: <VehiclesList /> },
              { path: 'add', element: <AddVehicle /> },
              { path: 'overview', element: <VehicleOverview /> },
              { path: ':id/edit', element: <EditVehicle /> },
              { path: ':id', element: <VehicleDetails /> },
            ],
          },
          {
            path: 'drivers',
            children: [
              { path: 'list', element: <DriversList /> },
              { path: 'add', element: <AddDriver /> },
              { path: ':id/edit', element: <EditDriver /> },
              { path: ':id', element: <DriverDetails /> },
            ],
          },
        ],
      },
      {
        path: 'maintenance',
        children: [
          { path: 'records', element: <MaintenanceRecords /> },
          { path: 'schedule', element: <MaintenanceSchedule /> },
          {
            path: 'work-orders',
            children: [
              { path: 'list', element: <WorkOrdersList /> },
              { path: 'add', element: <AddWorkOrder /> },
              { path: ':id/edit', element: <EditWorkOrder /> },
              { path: ':id', element: <WorkOrderDetails /> },
            ],
          },
        ],
      },
      {
        path: 'dashboards',
        children: [
          { path: 'dashboardanalytics', element: <DashboardAnalytics /> },
          { path: 'dashboardsaas', element: <DashboardSaaS /> },
          { path: 'fleet-analytics', element: <FleetAnalytics /> },
          // Temporary removal of invalid route referencing external app until integration is complete
          // { path: 'agency-dashboard', element: <AgencyDashboard /> },
        ],
      },
      {
        path: 'apps',
        children: [
          { path: 'calendar', element: <AppCalendar /> },
          {
            path: 'chat',
            element: <ChatLayout />,
            children: [{ index: true, element: <AppChat /> }],
          },
          { path: 'files', element: <AppFiles /> },
          {
            path: 'tasklist',
            element: <TaskListLayout />,
            children: [{ index: true, element: <AppTaskList /> }],
          },
          {
            path: 'blog',
            children: [
              { path: 'detail', element: <AppBlogDetail /> },
              { path: 'edit', element: <AppBlogEdit /> },
              { path: 'list', element: <AppBlogList /> },
            ],
          },
          {
            path: 'mail',
            element: <MailLayout />,
            children: [
              { path: 'archived', element: <AppMailArchived /> },
              { path: 'compose', element: <AppMailCompose /> },
              { path: 'detail/:mailId', element: <AppMailDetail /> },
              { path: 'important', element: <AppMailImportant /> },
              { path: 'inbox', element: <AppMailInbox /> },
              { path: 'sent', element: <AppMailSent /> },
              { path: 'spam', element: <AppMailSpam /> },
              { path: 'starred', element: <AppMailStarred /> },
              { path: 'trash', element: <AppMailTrash /> },
            ],
          },
        ],
      },
      {
        path: 'ecommerce',
        children: [
          { path: 'checkout-form', element: <EcommerceCheckoutForm /> },
          { path: 'new-product', element: <EcommerceNewProduct /> },
          { path: 'order-history', element: <EcommerceOrderHistory /> },
          { path: 'order-summary', element: <EcommerceOrderSummary /> },
          { path: 'product-list', element: <EcommerceProductList /> },
          { path: 'product-overview', element: <EcommerceProductOverview /> },
          { path: 'shopping-cart', element: <EcommerceShoppingCart /> },
        ],
      },
      {
        path: 'documents',
        children: [{ path: 'archived', element: <DocumentsArchived /> }],
      },
      {
        path: 'pages',
        children: [
          { path: 'contact', element: <PagesContact /> },
          { path: 'crud', element: <PagesCrud /> },
          { path: 'empty', element: <PagesEmpty /> },
          { path: 'help', element: <PagesHelp /> },
          { path: 'invoice', element: <PagesInvoice /> },
          { path: 'timeline', element: <PagesTimeline /> },
          { path: 'notfound', element: <NotFound /> },
        ],
      },
      {
        path: 'profile',
        children: [
          { path: 'create', element: <ProfileCreate /> },
          { path: 'list', element: <ProfileList /> },
        ],
      },
      {
        path: 'settings',
        children: [
          { path: 'config', element: <SystemConfigPage /> },
          { path: 'document-types', element: <DocumentTypesPage /> },
          { path: 'maintenance-completion-types', element: <MaintenanceCompletionTypesPage /> },
        ],
      },
      {
        path: 'uikit',
        children: [
          { path: 'button', element: <ButtonDemo /> },
          { path: 'charts', element: <ChartDemo /> },
          { path: 'file', element: <FileDemo /> },
          { path: 'floatlabel', element: <FloatLabelDemo /> },
          { path: 'formlayout', element: <FormLayoutDemo /> },
          { path: 'input', element: <InputDemo /> },
          { path: 'invalidstate', element: <InvalidStateDemo /> },
          { path: 'list', element: <ListDemo /> },
          { path: 'media', element: <MediaDemo /> },
          {
            path: 'menu',
            children: [
              { index: true, element: <MenuDemo /> },
              { path: 'confirmation', element: <MenuConfirmation /> },
              { path: 'payment', element: <MenuPayment /> },
              { path: 'seat', element: <MenuSeat /> },
            ],
          },
          { path: 'message', element: <MessageDemo /> },
          { path: 'misc', element: <MiscDemo /> },
          { path: 'overlay', element: <OverlayDemo /> },
          { path: 'panel', element: <PanelDemo /> },
          { path: 'table', element: <TableDemo /> },
          { path: 'tree', element: <TreeDemo /> },
        ],
      },
      {
        path: 'utilities',
        children: [
          { path: 'colors', element: <UtilitiesColors /> },
          { path: 'icons', element: <UtilitiesIcons /> },
          { path: 'primeflex', element: <UtilitiesPrimeFlex /> },
          { path: 'figma', element: <UtilitiesFigma /> },
        ],
      },
      { path: 'blocks', element: <BlocksDemo /> },
      { path: 'documentation', element: <Documentation /> },
    ],
  },
  {
    path: 'auth',
    element: <FullPageLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'login2', element: <Login2 /> },
      { path: 'access', element: <Access /> },
      { path: 'access2', element: <Access2 /> },
      { path: 'error', element: <Error /> },
      { path: 'error2', element: <Error2 /> },
      { path: 'forgotpassword', element: <ForgotPassword /> },
      { path: 'lockscreen', element: <LockScreen /> },
      { path: 'newpassword', element: <NewPassword /> },
      { path: 'register', element: <Register /> },
      { path: 'verification', element: <Verification /> },
    ],
  },
  {
    path: 'landing',
    element: <LandingLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    path: 'notfound',
    element: <NotFound />,
  },
  { path: '*', element: <Navigate to="/notfound" replace /> },
];

export default AppRoutes;
