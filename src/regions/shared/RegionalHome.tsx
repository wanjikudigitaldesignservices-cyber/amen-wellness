import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { REGIONS, type RegionId } from '../../config/regions';
import { MEN_SANCTUARY_DATA, type RegionalProgram } from '../../config/menWellnessData';
import { saveUserRegionPreference } from '../../lib/regionCookie';
import {
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  X,
  Activity,
  Award,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

interface RegionalHomeProps {
  regionId: RegionId;
}

export default function RegionalHome({ regionId }: RegionalHomeProps) {
  const navigate = useNavigate();
  const regionConfig = REGIONS[regionId];
  const sanctuaryData = MEN_SANCTUARY_DATA[regionId];

  // Local live clock for the region
  const [localTime, setLocalTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString(regionId === 'paris' ? 'fr-FR' : 'en-US', {
          timeZone: regionConfig.tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [regionId, regionConfig.tz]);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<RegionalProgram | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 AM');
  const [bookingGuestName, setBookingGuestName] = useState('');
  const [bookingGuestPhone, setBookingGuestPhone] = useState('');
  const [bookingGuestEmail, setBookingGuestEmail] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessRef, setBookingSuccessRef] = useState<string | null>(null);

  // Region switcher dropdown state
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);

  // Open booking with preselected program
  const handleOpenBooking = (program?: RegionalProgram) => {
    setSelectedProgram(program || sanctuaryData.programs[0]);
    setIsBookingOpen(true);
    setBookingSuccessRef(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingGuestName || !bookingGuestPhone) return;

    const ref = `AMN-${sanctuaryData.city.slice(0, 3).toUpperCase()}-${Math.floor(
      100000 + Math.random() * 900000,
    )}`;
    setBookingSuccessRef(ref);
  };

  const handleSwitchRegion = (targetRegion: RegionId) => {
    setIsRegionMenuOpen(false);
    saveUserRegionPreference(targetRegion);
    navigate(`/${targetRegion}`);
  };

  return (
    <div
      data-region={regionId}
      className="min-h-screen bg-[#101714] text-[#FAF7F0] font-sans selection:bg-[#B5573A] selection:text-white"
    >
      {/* ── TOP UTILITY NOTIFICATION BAR ── */}
      <div className="w-full bg-[#0B100E] border-b border-white/5 py-2 px-4 text-xs text-stone-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{sanctuaryData.city} Sanctuary Open</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1 text-stone-400">
              <Clock className="h-3.5 w-3.5 text-[#EADFCB]" />
              <span className="font-mono text-stone-200">{localTime || '--:--:--'}</span>
              <span className="text-[10px] text-stone-400 uppercase">
                ({regionConfig.tz.split('/')[1]?.replace('_', ' ')})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Direct hotline display */}
            <a
              href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 text-[#EADFCB] hover:text-white transition font-medium"
            >
              <Phone className="h-3 w-3 text-[#B5573A]" />
              <span>Hotline: {sanctuaryData.hotline}</span>
            </a>

            <span className="text-white/20 hidden sm:inline">|</span>

            {/* Direct WhatsApp link */}
            <a
              href={`https://wa.me/${sanctuaryData.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
            >
              <MessageSquare className="h-3 w-3" />
              <span>WhatsApp Concierge</span>
            </a>

            <span className="text-white/20 hidden md:inline">|</span>

            <Link
              to={`/${regionId}/account/login`}
              className="text-stone-400 hover:text-stone-200 transition"
            >
              Member Sign In
            </Link>
            <Link
              to="/admin/login"
              className="text-stone-400 hover:text-stone-200 transition text-[11px]"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* ── PRIMARY LUXURY HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-[#101714]/90 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo & City Identity */}
          <div className="flex items-center gap-3">
            <Link to={`/${regionId}`} className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-[#20332B] border border-white/20 flex items-center justify-center text-[#EADFCB] shadow-inner group-hover:border-[#EADFCB] transition">
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
                  <span className="font-serif text-2xl tracking-[0.18em] font-semibold text-[#FAF7F0]">
                    AMEN
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#B5573A] uppercase">
                    Men’s Wellness
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#EADFCB] tracking-wider uppercase font-medium">
                  <MapPin className="h-3 w-3 text-[#B5573A]" />
                  <span>{sanctuaryData.city} Sanctuary</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm tracking-wide text-stone-300 font-medium">
            <a href="#programs" className="hover:text-white transition">
              Programs & Activities
            </a>
            <a href="#transformations" className="hover:text-white transition">
              Before & After Progress
            </a>
            <a href="#team" className="hover:text-white transition">
              Our Clinical Team
            </a>
            <a href="#premises" className="hover:text-white transition">
              Sanctuary Premises
            </a>
            <a href="#contact" className="hover:text-white transition">
              Hotline & Location
            </a>
          </nav>

          {/* Right Action: Region Switcher & Book Button */}
          <div className="flex items-center gap-3">
            {/* Region Switcher Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-2 text-xs font-medium text-stone-200 transition"
              >
                <Globe className="h-3.5 w-3.5 text-[#EADFCB]" />
                <span className="uppercase">{regionId}</span>
                <span className="text-stone-400">({regionConfig.currency})</span>
              </button>

              {/* Dropdown Menu */}
              {isRegionMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#1A2621] border border-white/20 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-stone-400 uppercase border-b border-white/10">
                    Switch Men’s Sanctuary
                  </div>
                  {(['nairobi', 'new-york', 'paris'] as RegionId[]).map((rId) => {
                    const rData = MEN_SANCTUARY_DATA[rId];
                    const rCfg = REGIONS[rId];
                    const isCurrent = rId === regionId;
                    return (
                      <button
                        key={rId}
                        type="button"
                        onClick={() => handleSwitchRegion(rId)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition ${
                          isCurrent
                            ? 'bg-[#2E4A3F] text-white font-semibold'
                            : 'text-stone-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-serif text-sm tracking-wide">{rData.city}</div>
                          <div className="text-[10px] text-stone-400">{rData.country}</div>
                        </div>
                        <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-[10px] text-[#EADFCB]">
                          {rCfg.currency}
                        </span>
                      </button>
                    );
                  })}
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <Link
                      to="/"
                      className="block text-center text-xs text-[#EADFCB] hover:text-white py-1"
                    >
                      ← Return to Global Portal
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Book CTA */}
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="rounded-xl bg-[#FAF7F0] px-4 py-2 text-xs font-semibold tracking-wider text-[#101714] shadow-lg hover:bg-[#EADFCB] transition flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-[#B5573A]" />
              <span className="hidden sm:inline">Book Protocol</span>
              <span className="sm:hidden">Book</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER: BESPOKE REGIONAL PHOTOGRAPHY & IDENTITY ── */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Region's exclusive hero photography on disk */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${sanctuaryData.heroImage})` }}
        />
        {/* Layered luxury dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101714] via-[#101714]/80 to-[#101714]/40" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#EADFCB] uppercase shadow-lg mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#B5573A]" />
            <span>Amen {sanctuaryData.city} · {sanctuaryData.tagline}</span>
          </div>

          {/* Regional Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#FAF7F0] leading-[1.1] max-w-4xl">
            {sanctuaryData.headline}
          </h1>

          {/* Regional Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-stone-300 font-light max-w-2xl leading-relaxed">
            {sanctuaryData.heroSubheadline}
          </p>

          {/* Key Regional Highlights Bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-stone-200">
            <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-3.5 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Exclusively for Men</span>
            </span>
            <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-3.5 py-1.5 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#EADFCB]" />
              <span>{sanctuaryData.programs.length} Dedicated Protocols</span>
            </span>
            <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-3.5 py-1.5 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#B5573A]" />
              <span>Direct Concierge: {sanctuaryData.hotline}</span>
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="w-full sm:w-auto rounded-xl bg-[#FAF7F0] px-8 py-4 text-sm font-semibold tracking-wider text-[#101714] shadow-2xl hover:bg-[#EADFCB] transition flex items-center justify-center gap-2 group"
            >
              <span>Reserve Sanctuary Session</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#programs"
              className="w-full sm:w-auto rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 text-sm font-semibold tracking-wider text-white backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <span>View Treatment Menu & Pricing</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION: REGIONAL PROGRAMS & ACTIVITIES ── */}
      <section id="programs" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#B5573A] uppercase">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Amen {sanctuaryData.city} Treatment Menu</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-wide text-[#FAF7F0] mt-2">
              Programs & Activities
            </h2>
            <p className="text-stone-400 mt-2 max-w-xl text-sm leading-relaxed">
              Every protocol is clinically formulated for high-performance recovery, neuromuscular
              restoration, and central nervous system decompression.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-xs text-stone-400">All prices in</span>
            <div className="font-mono text-xl font-bold text-[#EADFCB]">{sanctuaryData.currency}</div>
          </div>
        </div>

        {/* 4 Bespoke Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sanctuaryData.programs.map((program) => (
            <div
              key={program.id}
              className="group rounded-2xl bg-[#16211C] border border-white/10 overflow-hidden shadow-xl hover:border-white/30 transition-all flex flex-col justify-between"
            >
              {/* Program Visual Header */}
              <div className="relative h-60 w-full overflow-hidden">
                <img
                  src={program.image}
                  alt={program.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16211C] via-[#16211C]/30 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="rounded-full bg-[#101714]/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#EADFCB] border border-white/15">
                    {program.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-mono font-medium text-white border border-white/15 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#EADFCB]" />
                    <span>{program.durationMinutes} min</span>
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-2xl font-medium text-[#FAF7F0] group-hover:text-white transition">
                      {program.name}
                    </h3>
                  </div>
                  <div className="text-xs font-medium text-[#B5573A] mt-1 tracking-wide">
                    {program.subtitle}
                  </div>
                  <p className="text-sm text-stone-300 mt-3 leading-relaxed">
                    {program.description}
                  </p>

                  {/* Physiological Benefits Checklist */}
                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                    <span className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                      Clinical Benefits:
                    </span>
                    <ul className="space-y-1.5">
                      {program.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-stone-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Price & Booking Trigger Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                      Session Fee
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#EADFCB]">
                      {program.priceFormatted}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(program)}
                    className="rounded-xl bg-[#FAF7F0] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#101714] hover:bg-[#EADFCB] transition flex items-center gap-1.5 shadow-md"
                  >
                    <span>Reserve Session</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#101714]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: BEFORE & AFTER PROGRESS & CLINICAL CASE STUDIES ── */}
      <section id="transformations" className="py-24 px-6 bg-[#0E1512] border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.25em] text-[#B5573A] uppercase mb-2">
              <Activity className="h-3.5 w-3.5" />
              <span>Measurable Progress & Clinical Transformations</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-wide text-[#FAF7F0]">
              Real Recovery. Quantifiable Results.
            </h2>
            <p className="text-stone-400 mt-3 text-sm sm:text-base leading-relaxed">
              Every Amen protocol tracks objective bio-markers: spinal alignment plumb lines,
              forward head posture angles, heart rate variability, and muscular tissue elasticity.
            </p>
          </div>

          {/* Clinical Posture Analysis Photography Showcase */}
          <div className="rounded-3xl bg-[#141E1A] border border-white/15 p-6 sm:p-10 shadow-2xl mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Visual Side */}
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <img
                  src="/assets/brand/before-after-posture.jpg"
                  alt="Clinical Posture & Spine Alignment Transformation"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between text-xs text-stone-200">
                  <span className="font-semibold text-[#EADFCB]">
                    Clinical Case #704 · Thoracic Alignment & Decompression
                  </span>
                  <span className="text-emerald-400 font-medium">8-Week Protocol Complete</span>
                </div>
              </div>

              {/* Regional Metric Transformations Side */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#B5573A]">
                    {sanctuaryData.city} Branch Case Studies
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#FAF7F0] mt-1">
                    Documented Client Outcomes
                  </h3>
                </div>

                <div className="space-y-4">
                  {sanctuaryData.transformations.map((tCase, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#1A2621] border border-white/10 p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{tCase.title}</span>
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-stone-300">
                          {tCase.duration}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Protocol: <span className="text-stone-200">{tCase.protocol}</span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Profile: <span className="text-stone-200">{tCase.clientProfile}</span>
                      </div>

                      {/* Before vs After Metric Comparison Bar */}
                      <div className="rounded-lg bg-black/40 border border-white/10 p-3 space-y-2">
                        <div className="text-[10px] uppercase font-semibold text-stone-400">
                          {tCase.metricLabel}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded bg-red-950/40 border border-red-500/20 p-2 text-center">
                            <span className="text-[9px] uppercase tracking-wider text-red-300 block">
                              Baseline Before
                            </span>
                            <span className="font-medium text-red-200">{tCase.metricBefore}</span>
                          </div>
                          <div className="rounded bg-emerald-950/40 border border-emerald-500/20 p-2 text-center">
                            <span className="text-[9px] uppercase tracking-wider text-emerald-300 block">
                              Outcome After
                            </span>
                            <span className="font-medium text-emerald-300">{tCase.metricAfter}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-300 italic">“{tCase.summary}”</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: OUR REGIONAL CLINICAL TEAM ── */}
      <section id="team" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.25em] text-[#B5573A] uppercase mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Dedicated Practitioners in {sanctuaryData.city}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-wide text-[#FAF7F0]">
            Our Clinical Specialists
          </h2>
          <p className="text-stone-400 mt-3 text-sm sm:text-base leading-relaxed">
            Our teams are permanent specialists based directly at our {sanctuaryData.city} sanctuary.
            Masters in sports physiotherapy, thermal contrast physiology, and neuromuscular bodywork.
          </p>
        </div>

        {/* Team Grid with On-Disk Portraits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {sanctuaryData.team.map((member, idx) => (
            <div
              key={idx}
              className="group rounded-2xl bg-[#16211C] border border-white/10 overflow-hidden shadow-xl hover:border-white/30 transition-all flex flex-col sm:flex-row"
            >
              {/* Member Portrait */}
              <div className="sm:w-1/2 relative min-h-[280px]">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16211C] via-transparent to-transparent sm:hidden" />
              </div>

              {/* Member Bio & Credentials */}
              <div className="sm:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5573A]">
                    {idx === 0 ? 'Clinical Director' : 'Senior Specialist'}
                  </span>
                  <h3 className="font-serif text-2xl font-medium text-[#FAF7F0] mt-1">
                    {member.name}
                  </h3>
                  <div className="text-xs font-medium text-[#EADFCB] mt-0.5">{member.title}</div>
                  <div className="text-[11px] text-stone-400 italic mt-1">{member.credentials}</div>
                  <p className="text-xs text-stone-300 mt-3 leading-relaxed line-clamp-4">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Core Specialization:
                  </div>
                  <span className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-[11px] text-[#EADFCB] font-medium">
                    {member.specialty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: PREMISES & ATMOSPHERE ── */}
      <section id="premises" className="py-24 px-6 bg-[#0E1512] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text & Architecture */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#B5573A] uppercase">
                <MapPin className="h-3.5 w-3.5" />
                <span>The Sanctuary Grounds</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-wide text-[#FAF7F0]">
                Amen {sanctuaryData.city} Sanctuary
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                {sanctuaryData.premisesDescription}
              </p>

              {/* Operating Info Card */}
              <div className="rounded-2xl bg-[#16211C] border border-white/10 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#B5573A] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase font-semibold text-stone-400">Location</span>
                    <div className="text-sm font-medium text-white">{sanctuaryData.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#EADFCB] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase font-semibold text-stone-400">Hours</span>
                    <div className="text-sm font-medium text-white">{sanctuaryData.hours}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase font-semibold text-stone-400">
                      Direct Region Hotline
                    </span>
                    <div className="text-sm font-mono font-medium text-white">
                      <a
                        href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
                        className="hover:underline"
                      >
                        {sanctuaryData.hotline}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Mosaic */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-80">
                <img
                  src={sanctuaryData.heroImage}
                  alt={`${sanctuaryData.city} Sanctuary Grounds`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden border border-white/10 h-44">
                  <img
                    src={sanctuaryData.treatmentImage}
                    alt={`${sanctuaryData.city} Treatment Suite`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10 h-44">
                  <img
                    src={sanctuaryData.teamLeadImage}
                    alt={`${sanctuaryData.city} Lead Specialist`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: CONTACT & HOTLINE CARD ── */}
      <section id="contact" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#182620] via-[#1F332A] to-[#182620] border border-white/15 p-8 sm:p-14 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#EADFCB] font-semibold">
              Instant Reservations & Private Inquiries
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white mt-1">
              Connect With Amen {sanctuaryData.city}
            </h2>
            <p className="text-stone-300 text-sm mt-2 max-w-xl">
              Speak directly with our front-desk concierge or clinical intake coordinator. Same-day
              recovery sessions subject to availability.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <a
              href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
              className="w-full sm:w-auto rounded-xl bg-[#FAF7F0] px-6 py-4 text-xs font-semibold tracking-wider text-[#101714] shadow-xl hover:bg-[#EADFCB] transition flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4 text-[#B5573A]" />
              <span>Call {sanctuaryData.hotline}</span>
            </a>

            <a
              href={`https://wa.me/${sanctuaryData.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-4 text-xs font-semibold tracking-wider text-white shadow-xl transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#0B100E] border-t border-white/10 py-12 px-6 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="font-serif text-lg tracking-widest text-[#FAF7F0] font-bold">
              AMEN WELLNESS
            </div>
            <span className="text-white/20">|</span>
            <span className="text-stone-300">{sanctuaryData.city} Branch</span>
          </div>

          <div className="flex items-center gap-6 text-stone-300">
            <button
              type="button"
              onClick={() => handleSwitchRegion('nairobi')}
              className={`hover:text-white transition ${
                regionId === 'nairobi' ? 'text-[#EADFCB] font-semibold' : ''
              }`}
            >
              Nairobi Sanctuary
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRegion('new-york')}
              className={`hover:text-white transition ${
                regionId === 'new-york' ? 'text-[#EADFCB] font-semibold' : ''
              }`}
            >
              New York Sanctuary
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRegion('paris')}
              className={`hover:text-white transition ${
                regionId === 'paris' ? 'text-[#EADFCB] font-semibold' : ''
              }`}
            >
              Paris Sanctuary
            </button>
          </div>

          <p>© 2026 Amen Men’s Wellness Centre. All rights reserved.</p>
        </div>
      </footer>

      {/* ── FLOATING QUICK HOTLINE ACTION (BOTTOM RIGHT) ── */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <a
          href={`https://wa.me/${sanctuaryData.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition hover:scale-105"
          title="WhatsApp Concierge"
        >
          <MessageSquare className="h-5 w-5" />
        </a>
        <a
          href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
          className="rounded-full bg-[#1A2621] hover:bg-[#20332B] border border-white/20 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur-md flex items-center gap-2 transition hover:scale-105"
        >
          <Phone className="h-4 w-4 text-[#B5573A]" />
          <span className="hidden sm:inline">{sanctuaryData.hotline}</span>
        </a>
      </div>

      {/* ── INTERACTIVE RESERVATION MODAL ── */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#141E1A] border border-white/20 p-6 sm:p-8 shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-white p-1"
            >
              <X className="h-6 w-6" />
            </button>

            {bookingSuccessRef ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-3xl font-medium text-white">
                  Reservation Confirmed
                </h3>
                <p className="text-stone-300 text-sm max-w-md mx-auto">
                  Thank you, <span className="text-white font-medium">{bookingGuestName}</span>. Your
                  session at <span className="text-white">Amen {sanctuaryData.city}</span> has been
                  scheduled.
                </p>
                <div className="rounded-xl bg-black/40 border border-white/10 p-4 max-w-xs mx-auto text-xs">
                  <span className="text-stone-400 uppercase text-[10px]">Booking Reference</span>
                  <div className="font-mono text-lg font-bold text-[#EADFCB]">
                    {bookingSuccessRef}
                  </div>
                </div>
                <div className="text-xs text-stone-400">
                  A confirmation SMS & WhatsApp reminder has been dispatched to{' '}
                  <span className="text-white">{bookingGuestPhone}</span>.
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="rounded-xl bg-[#FAF7F0] px-6 py-3 text-xs font-semibold text-[#101714] hover:bg-[#EADFCB] transition mt-4"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5573A]">
                    Amen {sanctuaryData.city}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mt-1">
                    Reserve Recovery Session
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Select your protocol and convenient arrival window.
                  </p>
                </div>

                {/* Protocol Selector */}
                <div>
                  <label className="block text-xs uppercase font-semibold text-stone-300 mb-2">
                    Selected Protocol
                  </label>
                  <select
                    value={selectedProgram?.id || ''}
                    onChange={(e) => {
                      const found = sanctuaryData.programs.find((p) => p.id === e.target.value);
                      if (found) setSelectedProgram(found);
                    }}
                    className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EADFCB]"
                  >
                    {sanctuaryData.programs.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#141E1A] text-white">
                        {p.name} — {p.priceFormatted} ({p.durationMinutes} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-stone-300 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EADFCB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-stone-300 mb-2">
                      Arrival Window
                    </label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EADFCB]"
                    >
                      <option value="09:00 AM" className="bg-[#141E1A]">09:00 AM</option>
                      <option value="11:00 AM" className="bg-[#141E1A]">11:00 AM</option>
                      <option value="01:30 PM" className="bg-[#141E1A]">01:30 PM</option>
                      <option value="03:30 PM" className="bg-[#141E1A]">03:30 PM</option>
                      <option value="05:30 PM" className="bg-[#141E1A]">05:30 PM</option>
                      <option value="07:00 PM" className="bg-[#141E1A]">07:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-stone-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Mwangi or Thomas Vance"
                      value={bookingGuestName}
                      onChange={(e) => setBookingGuestName(e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#EADFCB]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-semibold text-stone-300 mb-2">
                        WhatsApp / Mobile Phone
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={sanctuaryData.hotline}
                        value={bookingGuestPhone}
                        onChange={(e) => setBookingGuestPhone(e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#EADFCB]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-stone-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="client@company.com"
                        value={bookingGuestEmail}
                        onChange={(e) => setBookingGuestEmail(e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#EADFCB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-stone-300 mb-2">
                      Physical Focus / Injuries (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lower back tension, marathon recovery, post-flight stiffness"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#EADFCB]"
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-xl bg-black/60 border border-white/10 p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block">Total Due Upon Arrival</span>
                    <span className="text-[10px] text-stone-500">
                      Payment via {regionConfig.gateway === 'intasend' ? 'M-Pesa or Card' : 'Card or Apple Pay'}
                    </span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#EADFCB]">
                    {selectedProgram?.priceFormatted || '—'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-5 py-3 text-xs text-stone-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#FAF7F0] px-6 py-3 text-xs font-semibold tracking-wider text-[#101714] hover:bg-[#EADFCB] transition shadow-xl"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
