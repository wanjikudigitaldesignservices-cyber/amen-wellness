import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { isValidRegion } from './config/regions';

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

/* ── Region gate placeholder ──────────────────────────────────────── */
function RegionGate() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem' }}>
          AMEN
        </h1>
        <p style={{ letterSpacing: '0.25em', fontSize: '0.75rem', opacity: 0.7 }}>
          WELLNESS CENTRE
        </p>
        <p style={{ margin: '2rem 0', opacity: 0.6 }}>
          Choose your region · Choisissez votre région
        </p>
        <nav style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/nairobi">Nairobi</a>
          <a href="/new-york">New York</a>
          <a href="/paris">Paris</a>
        </nav>
      </div>
    </div>
  );
}

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
      <Suspense
        fallback={
          <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<RegionGate />} />
          <Route path="/:region/*" element={<RegionRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
