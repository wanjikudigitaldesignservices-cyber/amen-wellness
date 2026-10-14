import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { isValidRegion } from './config/regions';
import { AuthProvider } from './lib/auth/AuthContext';
import { AdminRoute } from './components/auth/ProtectedRoute';

/* ── Lazy admin routes ────────────────────────────────────────────── */
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminMfa = lazy(() => import('./admin/pages/AdminMfa'));
const AdminForgotPassword = lazy(() => import('./admin/pages/AdminForgotPassword'));
const AdminResetPassword = lazy(() => import('./admin/pages/AdminResetPassword'));
const AdminUnauthorized = lazy(() => import('./admin/pages/AdminUnauthorized'));
const AdminDashboardShell = lazy(() => import('./admin/pages/AdminDashboardShell'));

/* ── Lazy customer auth routes ────────────────────────────────────── */
const CustomerLogin = lazy(() => import('./regions/shared/CustomerLogin'));
const CustomerRegister = lazy(() => import('./regions/shared/CustomerRegister'));

/* ── Lazy region shells (code-split per region) ───────────────────── */
const NairobiShell = lazy(() =>
  import('./regions/nairobi/NairobiShell').then((m) => ({
    default: m.default,
  })),
);
const NewYorkShell = lazy(() =>
  import('./regions/new-york/NewYorkShell').then((m) => ({
    default: m.default,
  })),
);
const ParisShell = lazy(() =>
  import('./regions/paris/ParisShell').then((m) => ({
    default: m.default,
  })),
);

/* ── Region Gate Component ────────────────────────────────────────── */
const RegionGate = lazy(() => import('./components/gate/RegionGate'));

/* ── Region route guard ───────────────────────────────────────────── */
function RegionRoute() {
  const { region = '' } = useParams<{ region: string }>();

  if (!isValidRegion(region)) {
    return <Navigate to="/" replace />;
  }

  const shells: Record<string, React.ReactNode> = {
    nairobi: <NairobiShell />,
    'new-york': <NewYorkShell />,
    paris: <ParisShell />,
  };

  return <>{shells[region]}</>;
}

/* ── Application root ─────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense
          fallback={
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
              Loading…
            </div>
          }
        >
          <Routes>
            {/* Public Region Gate */}
            <Route path="/" element={<RegionGate />} />

            {/* Admin Authentication & Recovery */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/mfa" element={<AdminMfa />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />

            {/* Protected Admin Shell */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboardShell />
                </AdminRoute>
              }
            />

            {/* Regional Customer Auth Routes */}
            <Route path="/:region/account/login" element={<CustomerLogin />} />
            <Route path="/:region/account/register" element={<CustomerRegister />} />

            {/* Public Regional Sites */}
            <Route path="/:region/*" element={<RegionRoute />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
