import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { REGIONS, type RegionId } from '../../config/regions';
import { MEN_SANCTUARY_DATA } from '../../config/menWellnessData';
import { saveUserRegionPreference, detectBrowserRegion } from '../../lib/regionCookie';
import { Clock, ArrowRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

export default function RegionGate() {
  const navigate = useNavigate();
  const [activeHover, setActiveHover] = useState<RegionId | null>(null);
  const [suggestedRegion] = useState<RegionId>(() => detectBrowserRegion());
  const [currentTimes, setCurrentTimes] = useState<Record<RegionId, string>>({
    nairobi: '',
    'new-york': '',
    paris: '',
  });

  // Live clocks per region
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTimes({
        nairobi: now.toLocaleTimeString('en-US', {
          timeZone: 'Africa/Nairobi',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        'new-york': now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        paris: now.toLocaleTimeString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
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
    <div className="relative min-h-screen w-full bg-[#1A2621] text-[#FAF7F0] flex flex-col font-sans overflow-x-hidden selection:bg-[#B5573A] selection:text-white">
      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-6 py-6 border-b border-white/10 bg-[#1A2621]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Arch Sanctuary Mark */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2E4A3F] border border-white/20 flex items-center justify-center text-[#EADFCB] shadow-inner">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M4 21V11a8 8 0 1 1 16 0v10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 13a4 4 0 0 1 4 4v4H8v-4a4 4 0 0 1 4-4Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-serif text-2xl tracking-[0.15em] font-medium text-[#FAF7F0]">
                  AMEN
                </h1>
                <span className="text-[10px] font-semibold tracking-[0.25em] text-[#EADFCB] uppercase">
                  Men’s Wellness
                </span>
              </div>
              <p className="text-[11px] text-[#FAF7F0]/60 tracking-wider">
                Sanctuaire Masculin de Haute Récupération
              </p>
            </div>
          </div>

          {/* Bilingual Region Prompt */}
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#EADFCB] font-medium">
              Choose your region · Choisissez votre région
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/50 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Three global branches · Complete physical & mental restoration</span>
            </div>
          </div>

          {/* Staff Access Link */}
          <div>
            <a
              href="/admin/login"
              className="text-xs text-[#EADFCB]/80 hover:text-white transition tracking-wider border-b border-white/20 pb-0.5"
            >
              Staff Portal →
            </a>
          </div>
        </div>
      </header>

      {/* Main 3-Panel Split Area */}
      <main className="relative flex-1 flex flex-col md:flex-row w-full h-full min-h-[calc(100vh-140px)]">
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
              className={`group relative flex-1 min-h-[460px] md:min-h-full cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-white/10 transition-all duration-700 ease-out ${
                isHovered ? 'md:flex-[1.4]' : 'md:flex-1'
              }`}
            >
              {/* Background Photography with Luxury Vignette */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(${data.heroImage})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1612] via-[#0E1612]/75 to-[#0E1612]/40 group-hover:via-[#0E1612]/60 transition-colors duration-500" />

              {/* Panel Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-8 sm:p-10 z-10">
                {/* Top of Card: Suggested Badge + Live Local Clock */}
                <div className="flex items-center justify-between gap-2">
                  {isSuggested ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B5573A] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-lg animate-pulse">
                      <Sparkles className="h-3 w-3" />
                      <span>Suggested for you</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-medium tracking-wider text-[#EADFCB]">
                      <MapPin className="h-3 w-3 text-[#EADFCB]" />
                      <span>{data.country}</span>
                    </span>
                  )}

                  {/* Running Local Time */}
                  <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-mono text-[#EADFCB] border border-white/10">
                    <Clock className="h-3.5 w-3.5 text-[#EADFCB]" />
                    <span>{currentTimes[regId] || '--:--:--'}</span>
                    <span className="text-[10px] text-white/50 uppercase ml-1">
                      {cfg.tz.split('/')[1]?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Bottom of Card: Sanctuary Info & Entry CTA */}
                <div className="space-y-4 pt-12">
                  <div>
                    <span className="text-xs uppercase font-semibold tracking-[0.25em] text-[#EADFCB]">
                      Amen Wellness
                    </span>
                    <h2 className="font-serif text-4xl sm:text-5xl font-medium tracking-wide text-[#FAF7F0] mt-1 group-hover:text-white transition">
                      {data.city}
                    </h2>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                      {data.tagline}
                    </p>
                  </div>

                  {/* Highlights Pill */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-[#EADFCB]/80 font-medium pt-1">
                    <span className="rounded-md bg-white/10 backdrop-blur-sm px-2.5 py-1">
                      {cfg.currency} Pricing
                    </span>
                    <span className="rounded-md bg-white/10 backdrop-blur-sm px-2.5 py-1">
                      {data.programs.length} Specialized Protocols
                    </span>
                    <span className="rounded-md bg-white/10 backdrop-blur-sm px-2.5 py-1">
                      {cfg.gateway === 'intasend' ? 'M-Pesa Express' : 'Stripe & Apple Pay'}
                    </span>
                  </div>

                  {/* Enter Button */}
                  <div className="pt-2">
                    <Link
                      to={`/${regId}`}
                      onClick={() => handleSelectRegion(regId)}
                      className="w-full flex items-center justify-between rounded-xl bg-[#FAF7F0] px-5 py-3.5 text-sm font-semibold tracking-wider text-[#1A2621] shadow-xl transition-all duration-300 group-hover:bg-[#EADFCB] group-hover:translate-y-[-2px]"
                    >
                      <span>Enter Amen {data.city}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer Info */}
      <footer className="relative z-20 py-4 px-6 border-t border-white/10 bg-[#121B17] text-center text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <p>© 2026 Amen Wellness Centre. All rights reserved. High-Performance Men’s Recovery.</p>
        <div className="flex items-center gap-4 text-[#EADFCB]/80">
          <span>Nairobi · Karen</span>
          <span>•</span>
          <span>New York · SoHo</span>
          <span>•</span>
          <span>Paris · Saint-Germain</span>
        </div>
      </footer>
    </div>
  );
}
