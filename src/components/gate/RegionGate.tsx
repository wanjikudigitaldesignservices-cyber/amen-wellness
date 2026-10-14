import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { REGIONS, type RegionId } from '../../config/regions';
import { MEN_SANCTUARY_DATA } from '../../config/menWellnessData';
import { saveUserRegionPreference, detectBrowserRegion } from '../../lib/regionCookie';
import { Clock, ArrowRight, ShieldCheck, Sparkles, MapPin, Globe } from 'lucide-react';

export default function RegionGate() {
  const navigate = useNavigate();
  const [activeHover, setActiveHover] = useState<RegionId | null>(null);
  const [suggestedRegion] = useState<RegionId>(() => detectBrowserRegion());
  const [currentTimes, setCurrentTimes] = useState<Record<RegionId, string>>({
    nairobi: '',
    'new-york': '',
    paris: '',
  });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTimes({
        nairobi: now.toLocaleTimeString('en-US', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        'new-york': now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        paris: now.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      });
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectRegion = (region: RegionId) => {
    saveUserRegionPreference(region);
    navigate(`/${region}`);
  };

  const regionKeys: RegionId[] = ['nairobi', 'new-york', 'paris'];

  return (
    <div className="relative min-h-screen w-full bg-[#0E1612] text-[#FAF7F0] flex flex-col font-sans overflow-x-hidden">
      {/* ── Header ── */}
      <header className="relative z-20 w-full px-6 py-5 border-b border-white/[0.06] bg-[#0E1612]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2E4A3F] to-[#1A2A23] border border-white/10 flex items-center justify-center text-[#EADFCB] shadow-lg">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 21V11a8 8 0 1 1 16 0v10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 13a4 4 0 0 1 4 4v4H8v-4a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-serif text-xl tracking-[0.2em] font-semibold text-[#FAF7F0]">AMEN</h1>
                <span className="text-[9px] font-bold tracking-[0.25em] text-[#B5573A] uppercase">Men's Wellness</span>
              </div>
              <p className="text-[10px] text-[#FAF7F0]/40 tracking-wider">
                High-Performance Men's Recovery
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="badge-gold">
              <Globe className="h-3 w-3" />
              <span>Choose Your Region</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/30 mt-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400/60" />
              <span>Three global sanctuaries · Complete physical & mental restoration</span>
            </div>
          </div>

          <a
            href="/admin/login"
            className="text-[11px] text-stone-600 hover:text-stone-300 transition tracking-wider"
          >
            Staff Portal →
          </a>
        </div>
      </header>

      {/* ── 3-Panel Region Selector ── */}
      <main className="relative flex-1 flex flex-col md:flex-row w-full h-full min-h-[calc(100vh-130px)]">
        {regionKeys.map((regId) => {
          const cfg = REGIONS[regId];
          const data = MEN_SANCTUARY_DATA[regId];
          const isSuggested = suggestedRegion === regId;
          const isHovered = activeHover === regId;

          return (
            <div
              key={regId}
              onMouseEnter={() => setActiveHover(regId)}
              onMouseLeave={() => setActiveHover(null)}
              onClick={() => handleSelectRegion(regId)}
              className={`group relative flex-1 min-h-[420px] md:min-h-full cursor-pointer overflow-hidden transition-all duration-700 ease-out ${
                isHovered ? 'md:flex-[1.5]' : 'md:flex-1'
              }`}
            >
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${data.heroImage})` }}
              />
              {/* Multi-layer gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0D] via-[#0A0F0D]/70 to-[#0A0F0D]/30 group-hover:via-[#0A0F0D]/55 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

              {/* Subtle separator line between panels */}
              <div className="absolute inset-y-0 right-0 w-px bg-white/[0.04] hidden md:block" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-8 sm:p-10 z-10">
                {/* Top */}
                <div className="flex items-center justify-between gap-2">
                  {isSuggested ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B5573A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
                          style={{ boxShadow: '0 4px 20px rgba(181,87,58,0.35)' }}>
                      <Sparkles className="h-3 w-3" />
                      <span>Suggested</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] backdrop-blur-sm px-3 py-1.5 text-[10px] font-medium tracking-wider text-[#EADFCB]/70 border border-white/[0.06]">
                      <MapPin className="h-3 w-3" />
                      <span>{data.country}</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1.5 text-[11px] font-mono text-[#D4A853]/80 border border-white/[0.06]">
                    <Clock className="h-3 w-3" />
                    <span className="tabular-nums">{currentTimes[regId] || '--:--:--'}</span>
                  </div>
                </div>

                {/* Bottom */}
                <div className="space-y-5 pt-12">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#D4A853]/60">
                      Amen Wellness
                    </span>
                    <h2 className="font-serif text-4xl sm:text-5xl font-medium text-white mt-1 group-hover:text-[#EADFCB] transition-colors duration-300">
                      {data.city}
                    </h2>
                    <p className="text-sm text-stone-400 mt-2 line-clamp-2 leading-relaxed group-hover:text-stone-300 transition-colors">
                      {data.tagline}
                    </p>
                  </div>

                  {/* Detail Pills */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                    {[
                      `${cfg.currency} Pricing`,
                      `${data.programs.length} Protocols`,
                      cfg.gateway === 'intasend' ? 'M-Pesa' : 'Stripe',
                    ].map((pill) => (
                      <span key={pill} className="rounded-md bg-white/[0.06] backdrop-blur-sm px-2.5 py-1.5 text-stone-400 border border-white/[0.04]">
                        {pill}
                      </span>
                    ))}
                  </div>

                  {/* Enter Button */}
                  <Link
                    to={`/${regId}`}
                    onClick={() => handleSelectRegion(regId)}
                    className="btn-luxury-primary w-full flex items-center justify-between !py-3.5 !px-6 !text-sm group/btn"
                  >
                    <span>Enter Amen {data.city}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-20 py-4 px-6 border-t border-white/[0.04] bg-[#080C0A] text-center text-[11px] text-stone-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Amen Men's Wellness Centre</p>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Nairobi · Karen</span>
            <span className="text-white/10">•</span>
            <span>New York · SoHo</span>
            <span className="text-white/10">•</span>
            <span>Paris · Saint-Germain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
