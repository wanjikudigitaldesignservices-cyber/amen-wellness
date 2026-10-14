import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { REGIONS, type RegionId } from '../../config/regions';
import { MEN_SANCTUARY_DATA, type RegionalProgram } from '../../config/menWellnessData';
import { saveUserRegionPreference } from '../../lib/regionCookie';
import {
  Phone,
  MessageSquare,
  Mail,
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
  Globe,
  SlidersHorizontal,
  Star,
  Zap,
  Users,
  Building2,
} from 'lucide-react';

interface RegionalHomeProps {
  regionId: RegionId;
}

/* ── Intersection Observer Hook for Scroll Animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
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
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSendStatus, setEmailSendStatus] = useState<'idle' | 'sent' | 'failed'>('idle');

  // Region switcher dropdown state
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);

  // Scroll-triggered section animations
  const programsSection = useInView();
  const transformationsSection = useInView();
  const teamSection = useInView();
  const premisesSection = useInView();
  const contactSection = useInView();

  // Open booking with preselected program
  const handleOpenBooking = (program?: RegionalProgram) => {
    setSelectedProgram(program || sanctuaryData.programs[0]);
    setIsBookingOpen(true);
    setBookingSuccessRef(null);
    setEmailSendStatus('idle');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingGuestName || !bookingGuestPhone) return;

    const ref = `AMN-${sanctuaryData.city.slice(0, 3).toUpperCase()}-${Math.floor(
      100000 + Math.random() * 900000,
    )}`;
    setBookingSuccessRef(ref);

    if (bookingGuestEmail) {
      setIsEmailSending(true);
      setEmailSendStatus('idle');
      fetch('/api/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: bookingGuestName,
          guestEmail: bookingGuestEmail,
          guestPhone: bookingGuestPhone,
          cityName: sanctuaryData.city,
          programName: selectedProgram?.name || 'Men Vitality Protocol',
          durationMinutes: selectedProgram?.durationMinutes || 60,
          priceFormatted: selectedProgram?.priceFormatted || '—',
          bookingRef: ref,
          date: selectedDate || new Date().toISOString().split('T')[0],
          timeSlot: selectedTimeSlot,
          notes: bookingNotes,
        }),
      })
        .then((res) => {
          if (res.ok) {
            setEmailSendStatus('sent');
          } else {
            setEmailSendStatus('failed');
          }
        })
        .catch(() => {
          setEmailSendStatus('failed');
        })
        .finally(() => {
          setIsEmailSending(false);
        });
    }
  };

  const handleSwitchRegion = (targetRegion: RegionId) => {
    setIsRegionMenuOpen(false);
    saveUserRegionPreference(targetRegion);
    navigate(`/${targetRegion}`);
  };

  // Animation class helper
  const animIn = (visible: boolean, delay = 0) =>
    `transition-all duration-700 ease-out ${
      visible
        ? `opacity-100 translate-y-0`
        : `opacity-0 translate-y-8`
    }` + (delay ? ` delay-[${delay}ms]` : '');

  return (
    <div
      data-region={regionId}
      className="min-h-screen bg-[#101714] text-[#FAF7F0] font-sans"
    >
      {/* ── TOP UTILITY BAR ── */}
      <div className="w-full bg-[#080C0A] border-b border-white/[0.06] py-2 px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>{sanctuaryData.city} Open Now</span>
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1.5 text-stone-400">
              <Clock className="h-3 w-3 text-[#D4A853]" />
              <span className="font-mono text-[#EADFCB] font-medium tabular-nums">{localTime || '--:--:--'}</span>
              <span className="text-[10px] text-stone-500 uppercase ml-0.5">
                {regionConfig.tz.split('/')[1]?.replace('_', ' ')}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 text-[#EADFCB]/80 hover:text-white transition font-medium"
            >
              <Phone className="h-3 w-3 text-[#B5573A]" />
              <span>{sanctuaryData.hotline}</span>
            </a>
            <span className="h-3 w-px bg-white/10 hidden sm:block" />
            <a
              href={`https://wa.me/${sanctuaryData.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-emerald-400/80 hover:text-emerald-300 transition font-medium"
            >
              <MessageSquare className="h-3 w-3" />
              <span>WhatsApp</span>
            </a>
            <span className="h-3 w-px bg-white/10 hidden md:block" />
            <Link
              to={`/${regionId}/account/login`}
              className="text-stone-500 hover:text-stone-300 transition hidden md:inline"
            >
              Member Login
            </Link>
          </div>
        </div>
      </div>

      {/* ── PREMIUM STICKY HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-[#101714]/90 backdrop-blur-xl border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
          {/* Logo & City Identity */}
          <Link to={`/${regionId}`} className="flex items-center gap-3 group shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#20332B] to-[#162420] border border-white/10 flex items-center justify-center text-[#EADFCB] group-hover:border-[#D4A853]/40 transition-all duration-300 shadow-lg">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 21V11a8 8 0 1 1 16 0v10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 13a4 4 0 0 1 4 4v4H8v-4a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl tracking-[0.2em] font-semibold text-[#FAF7F0]">AMEN</span>
                <span className="text-[9px] font-bold tracking-[0.25em] text-[#B5573A] uppercase">Wellness</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#EADFCB]/60 tracking-widest uppercase font-medium">
                <MapPin className="h-2.5 w-2.5 text-[#B5573A]" />
                <span>{sanctuaryData.city}</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium">
            {[
              { href: '#programs', label: 'Programs' },
              { href: '#transformations', label: 'Results' },
              { href: '#team', label: 'Team' },
              { href: '#premises', label: 'Premises' },
              { href: '#contact', label: 'Contact' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-[#FAF7F0]/60 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.04]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Region Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-2 text-[11px] font-semibold text-[#EADFCB]/80 transition"
              >
                <Globe className="h-3 w-3" />
                <span className="uppercase tracking-wider">{regionId}</span>
              </button>

              {/* Dropdown */}
              {isRegionMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#1A2621]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-1.5 z-50"
                     style={{ animation: 'scale-in 0.2s ease-out' }}>
                  <div className="px-3 py-2 text-[10px] font-semibold tracking-widest text-stone-500 uppercase">
                    Switch Region
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition ${
                          isCurrent
                            ? 'bg-[#2E4A3F]/50 text-white'
                            : 'text-stone-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-serif text-sm text-white">{rData.city}</div>
                          <div className="text-[10px] text-stone-500">{rData.country}</div>
                        </div>
                        <span className="rounded-md bg-black/30 px-2 py-0.5 font-mono text-[10px] text-[#D4A853]/80">
                          {rCfg.currency}
                        </span>
                      </button>
                    );
                  })}
                  <div className="mt-1 pt-1.5 border-t border-white/[0.06]">
                    <Link to="/" className="block text-center text-[11px] text-stone-500 hover:text-white py-1.5 transition">
                      ← Global Portal
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Book CTA */}
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="btn-luxury-primary flex items-center gap-1.5 !py-2.5 !px-5 !text-[12px]"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Book Session</span>
              <span className="sm:hidden">Book</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION — Full-bleed cinematic with parallax vignette
          ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Photography */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${sanctuaryData.heroImage})` }}
        />
        {/* Multi-layer cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101714] via-[#101714]/80 to-[#101714]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101714]/40 via-transparent to-[#101714]/40" />
        {/* Subtle radial light */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,83,0.04) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center px-6 py-32">
          {/* Tagline Pill */}
          <div className="badge-gold mb-8" style={{ animation: 'fade-up 0.6s ease-out' }}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>Amen {sanctuaryData.city} · {sanctuaryData.tagline}</span>
          </div>

          {/* Headline */}
          <h1
            className="font-serif text-5xl sm:text-6xl lg:text-[4.5rem] font-normal tracking-tight text-white leading-[1.08] max-w-4xl"
            style={{ animation: 'fade-up 0.7s ease-out 0.1s both', textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}
          >
            {sanctuaryData.headline}
          </h1>

          {/* Sub-headline */}
          <p
            className="mt-6 text-lg sm:text-xl text-stone-300/90 font-light max-w-2xl leading-relaxed"
            style={{ animation: 'fade-up 0.7s ease-out 0.2s both' }}
          >
            {sanctuaryData.heroSubheadline}
          </p>

          {/* Stats Bar */}
          <div
            className="mt-10 flex flex-wrap justify-center gap-6 text-xs"
            style={{ animation: 'fade-up 0.7s ease-out 0.3s both' }}
          >
            {[
              { icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />, text: 'Exclusively for Men' },
              { icon: <Zap className="h-4 w-4 text-[#D4A853]" />, text: `${sanctuaryData.programs.length} Recovery Protocols` },
              { icon: <Phone className="h-4 w-4 text-[#B5573A]" />, text: sanctuaryData.hotline },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-stone-300 bg-black/30 backdrop-blur-md rounded-full px-4 py-2.5 border border-white/[0.08]">
                {stat.icon}
                <span className="font-medium">{stat.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            style={{ animation: 'fade-up 0.7s ease-out 0.4s both' }}
          >
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="btn-luxury-primary w-full sm:w-auto flex items-center justify-center gap-2 !px-10 !py-4 !text-sm group"
            >
              <span>Reserve Your Session</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#programs"
              className="btn-luxury-secondary w-full sm:w-auto flex items-center justify-center gap-2 !px-10 !py-4 !text-sm"
            >
              <span>Explore Protocols</span>
            </a>
          </div>
        </div>

        {/* Bottom gradient fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#101714] to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PROGRAMS & ACTIVITIES
          ══════════════════════════════════════════════════════════════════ */}
      <section id="programs" className="scroll-mt-24 py-28 px-6" ref={programsSection.ref}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 ${animIn(programsSection.isVisible)}`}>
            <div>
              <div className="badge-accent mb-4">
                <SlidersHorizontal className="h-3 w-3" />
                <span>{sanctuaryData.city} Treatment Menu</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-white">
                Programs & Activities
              </h2>
              <p className="text-stone-400 mt-3 max-w-xl text-sm leading-relaxed">
                Every protocol is clinically formulated for high-performance recovery, neuromuscular
                restoration, and central nervous system decompression.
              </p>
            </div>
            <div className="text-right hidden md:block shrink-0">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest block">Prices in</span>
              <div className="font-serif text-3xl font-bold text-[#D4A853]">{sanctuaryData.currency}</div>
            </div>
          </div>

          {/* Divider line */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-14" />

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {sanctuaryData.programs.map((program, idx) => (
              <div
                key={program.id}
                className={`luxury-card group flex flex-col ${animIn(programsSection.isVisible)}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Image Header */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-t-[var(--radius-card)]">
                  <img
                    src={program.image}
                    alt={program.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141E1A] via-[#141E1A]/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="badge-gold !text-[10px] !py-1 !px-3">
                      {program.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-[11px] font-mono text-white border border-white/10">
                      <Clock className="h-3 w-3 text-[#D4A853]" />
                      {program.durationMinutes} min
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-[1.7rem] font-medium text-white leading-tight group-hover:text-[#EADFCB] transition-colors">
                      {program.name}
                    </h3>
                    <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#B5573A] mt-2">
                      {program.subtitle}
                    </div>
                    <p className="text-sm text-stone-400 mt-4 leading-relaxed">
                      {program.description}
                    </p>

                    {/* Benefits */}
                    <div className="mt-6 pt-5 border-t border-white/[0.06]">
                      <span className="text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase block mb-3">
                        Clinical Benefits
                      </span>
                      <ul className="space-y-2">
                        {program.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[13px] text-stone-300">
                            <CheckCircle2 className="h-4 w-4 text-[#D4A853] shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/[0.06]">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500 block">Session Fee</span>
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#D4A853]">
                        {program.priceFormatted}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(program)}
                      className="btn-luxury-primary flex items-center gap-1.5 !py-2.5 !px-5 !text-[12px]"
                    >
                      <span>Reserve</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gradient Section Break ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4A853]/15 to-transparent mx-6" />

      {/* ══════════════════════════════════════════════════════════════════
          BEFORE & AFTER / TRANSFORMATIONS
          ══════════════════════════════════════════════════════════════════ */}
      <section id="transformations" className="scroll-mt-24 py-28 px-6 bg-[#0B100E]" ref={transformationsSection.ref}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center max-w-3xl mx-auto mb-16 ${animIn(transformationsSection.isVisible)}`}>
            <div className="badge-accent mx-auto mb-4">
              <Activity className="h-3 w-3" />
              <span>Measurable Progress</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-white">
              Real Recovery. Quantifiable Results.
            </h2>
            <p className="text-stone-400 mt-4 text-sm sm:text-base leading-relaxed">
              Every protocol tracks objective bio-markers: spinal alignment, forward head posture,
              heart rate variability, and muscular tissue elasticity.
            </p>
          </div>

          {/* Clinical Showcase */}
          <div className={`luxury-card !overflow-visible p-6 sm:p-10 ${animIn(transformationsSection.isVisible)}`} style={{ transitionDelay: '150ms' }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              {/* Visual Side */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl">
                <img
                  src="/assets/brand/before-after-posture.jpg"
                  alt="Clinical Posture & Spine Alignment Transformation"
                  className="w-full h-full object-cover min-h-[300px]"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5">
                  <span className="text-[11px] font-bold text-[#D4A853] tracking-wider">
                    Clinical Case #704
                  </span>
                  <div className="text-xs text-stone-300 mt-0.5">
                    Thoracic Alignment · 8-Week Protocol
                  </div>
                </div>
              </div>

              {/* Case Studies Side */}
              <div className="lg:col-span-7 space-y-5 flex flex-col justify-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5573A]">
                    {sanctuaryData.city} Branch
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mt-1">
                    Documented Client Outcomes
                  </h3>
                </div>

                <div className="space-y-4">
                  {sanctuaryData.transformations.map((tCase, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[#0E1612] border border-white/[0.06] p-5 space-y-3 hover:border-white/[0.12] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-[15px]">{tCase.title}</span>
                        <span className="rounded-md bg-[#D4A853]/10 px-2.5 py-1 text-[11px] text-[#D4A853] font-mono border border-[#D4A853]/20">
                          {tCase.duration}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Protocol: <span className="text-stone-300 font-medium">{tCase.protocol}</span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Profile: <span className="text-stone-300">{tCase.clientProfile}</span>
                      </div>

                      {/* Before vs After */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-red-950/20 border border-red-500/15 p-3 text-center">
                          <span className="text-[9px] uppercase tracking-widest text-red-400/70 block mb-1">Before</span>
                          <span className="text-xs font-medium text-red-300/90">{tCase.metricBefore}</span>
                        </div>
                        <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/15 p-3 text-center">
                          <span className="text-[9px] uppercase tracking-widest text-emerald-400/70 block mb-1">After</span>
                          <span className="text-xs font-semibold text-emerald-300">{tCase.metricAfter}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 italic leading-relaxed">
                        "{tCase.summary}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gradient Section Break ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4A853]/15 to-transparent mx-6" />

      {/* ══════════════════════════════════════════════════════════════════
          CLINICAL TEAM
          ══════════════════════════════════════════════════════════════════ */}
      <section id="team" className="scroll-mt-24 py-28 px-6" ref={teamSection.ref}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className={`text-center max-w-3xl mx-auto mb-16 ${animIn(teamSection.isVisible)}`}>
            <div className="badge-accent mx-auto mb-4">
              <Users className="h-3 w-3" />
              <span>{sanctuaryData.city} Specialists</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-white">
              Our Clinical Team
            </h2>
            <p className="text-stone-400 mt-4 text-sm sm:text-base leading-relaxed">
              Permanent specialists based at our {sanctuaryData.city} sanctuary. Masters in sports
              physiotherapy, thermal contrast physiology, and neuromuscular bodywork.
            </p>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {sanctuaryData.team.map((member, idx) => (
              <div
                key={idx}
                className={`luxury-card group flex flex-col ${animIn(teamSection.isVisible)}`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                {/* Portrait */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-t-[var(--radius-card)]">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141E1A] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="badge-gold !text-[10px] !py-1 !px-3">
                      {idx === 0 ? 'Clinical Director' : 'Senior Specialist'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-[1.7rem] font-medium text-white">
                      {member.name}
                    </h3>
                    <div className="text-xs font-bold text-[#D4A853] mt-1.5 tracking-wide">{member.title}</div>
                    <div className="text-[11px] text-stone-500 italic mt-1">{member.credentials}</div>
                    <p className="text-sm text-stone-400 mt-4 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                      Specialization
                    </span>
                    <span className="rounded-lg bg-[#D4A853]/8 border border-[#D4A853]/15 px-3 py-1.5 text-xs text-[#D4A853] font-medium">
                      {member.specialty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gradient Section Break ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4A853]/15 to-transparent mx-6" />

      {/* ══════════════════════════════════════════════════════════════════
          PREMISES & ATMOSPHERE
          ══════════════════════════════════════════════════════════════════ */}
      <section id="premises" className="scroll-mt-24 py-28 px-6 bg-[#0B100E]" ref={premisesSection.ref}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Text Side */}
            <div className={`lg:col-span-5 space-y-6 ${animIn(premisesSection.isVisible)}`}>
              <div>
                <div className="badge-accent mb-4">
                  <Building2 className="h-3 w-3" />
                  <span>The Sanctuary</span>
                </div>
                <h2 className="font-serif text-4xl sm:text-5xl font-medium text-white">
                  Amen {sanctuaryData.city}
                </h2>
                <p className="text-stone-400 text-sm sm:text-base leading-relaxed mt-4">
                  {sanctuaryData.premisesDescription}
                </p>
              </div>

              {/* Location Info Card */}
              <div className="luxury-card !rounded-2xl p-6 space-y-4 hover:transform-none">
                {[
                  { icon: <MapPin className="h-4.5 w-4.5 text-[#B5573A]" />, label: 'Location', value: sanctuaryData.address },
                  { icon: <Clock className="h-4.5 w-4.5 text-[#D4A853]" />, label: 'Hours', value: sanctuaryData.hours },
                  { icon: <Phone className="h-4.5 w-4.5 text-emerald-400" />, label: 'Direct Hotline', value: sanctuaryData.hotline, isPhone: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-[0.15em]">{item.label}</span>
                      {item.isPhone ? (
                        <a
                          href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
                          className="block text-sm font-medium text-[#EADFCB] hover:text-white mt-0.5 transition"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <div className="text-sm font-medium text-white mt-0.5">{item.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Mosaic */}
            <div className={`lg:col-span-7 space-y-4 ${animIn(premisesSection.isVisible)}`} style={{ transitionDelay: '150ms' }}>
              <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl h-80 group">
                <img
                  src={sanctuaryData.heroImage}
                  alt={`${sanctuaryData.city} Sanctuary Grounds`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] h-44 shadow-lg group">
                  <img
                    src={sanctuaryData.treatmentImage}
                    alt={`${sanctuaryData.city} Treatment Suite`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-white/[0.08] h-44 shadow-lg group">
                  <img
                    src={sanctuaryData.teamLeadImage}
                    alt={`${sanctuaryData.city} Lead Specialist`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CONTACT & HOTLINE
          ══════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="scroll-mt-24 py-24 px-6" ref={contactSection.ref}>
        <div className="max-w-5xl mx-auto">
          <div
            className={`luxury-card !rounded-3xl p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 hover:transform-none ${animIn(contactSection.isVisible)}`}
            style={{ background: 'linear-gradient(135deg, rgba(20,32,26,0.95) 0%, rgba(28,44,36,0.95) 50%, rgba(20,32,26,0.95) 100%)' }}
          >
            <div>
              <div className="badge-gold mb-4">
                <Star className="h-3 w-3" />
                <span>Private Reservations</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white mt-2">
                Connect With Amen {sanctuaryData.city}
              </h2>
              <p className="text-stone-400 text-sm mt-3 max-w-xl leading-relaxed">
                Speak directly with our concierge or clinical intake coordinator. Same-day
                recovery sessions subject to availability.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
                className="btn-luxury-primary w-full sm:w-auto flex items-center justify-center gap-2 !px-7 !py-4"
              >
                <Phone className="h-4 w-4" />
                <span>Call {sanctuaryData.hotline}</span>
              </a>
              <a
                href={`https://wa.me/${sanctuaryData.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 px-7 py-4 text-xs font-semibold tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#080C0A] border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="font-serif text-base tracking-[0.2em] text-[#FAF7F0]/60 font-semibold">AMEN</span>
            <span className="h-3 w-px bg-white/10" />
            <span>{sanctuaryData.city} Sanctuary</span>
          </div>

          <div className="flex items-center gap-5">
            {(['nairobi', 'new-york', 'paris'] as RegionId[]).map((rId) => (
              <button
                key={rId}
                type="button"
                onClick={() => handleSwitchRegion(rId)}
                className={`hover:text-stone-300 transition capitalize ${
                  regionId === rId ? 'text-[#D4A853] font-semibold' : ''
                }`}
              >
                {MEN_SANCTUARY_DATA[rId].city}
              </button>
            ))}
          </div>

          <p className="text-stone-600">© 2026 Amen Men's Wellness Centre</p>
        </div>
      </footer>

      {/* ── FLOATING ACTION BUTTONS ── */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5">
        <a
          href={`https://wa.me/${sanctuaryData.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition-all hover:scale-110 hover:-translate-y-1"
          title="WhatsApp Concierge"
          style={{ boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
        >
          <MessageSquare className="h-5 w-5" />
        </a>
        <a
          href={`tel:${sanctuaryData.hotline.replace(/\s+/g, '')}`}
          className="rounded-full bg-[#141E1A]/95 hover:bg-[#1C2A24] border border-white/10 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 hover:-translate-y-1"
        >
          <Phone className="h-3.5 w-3.5 text-[#B5573A]" />
          <span className="hidden sm:inline font-mono">{sanctuaryData.hotline}</span>
        </a>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOOKING MODAL
          ══════════════════════════════════════════════════════════════════ */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className="relative w-full max-w-xl rounded-3xl bg-[#141E1A] border border-white/10 p-6 sm:p-8 shadow-2xl my-8"
            style={{ animation: 'scale-in 0.25s ease-out' }}
          >
            <button
              type="button"
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-5 right-5 text-stone-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition"
            >
              <X className="h-5 w-5" />
            </button>

            {bookingSuccessRef ? (
              <div className="text-center py-8 space-y-5">
                <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-3xl font-medium text-white">
                  Reservation Confirmed
                </h3>
                <p className="text-stone-400 text-sm max-w-md mx-auto">
                  Thank you, <span className="text-white font-medium">{bookingGuestName}</span>. Your
                  session at <span className="text-white">Amen {sanctuaryData.city}</span> has been
                  scheduled.
                </p>
                <div className="rounded-xl bg-black/40 border border-white/[0.06] p-4 max-w-xs mx-auto">
                  <span className="text-stone-500 uppercase text-[10px] tracking-widest">Booking Reference</span>
                  <div className="font-mono text-lg font-bold text-[#D4A853]">
                    {bookingSuccessRef}
                  </div>
                </div>
                <div className="text-xs text-stone-500 space-y-1.5 max-w-sm mx-auto">
                  <div>
                    SMS confirmation registered for <span className="text-stone-300 font-mono">{bookingGuestPhone}</span>
                  </div>
                  {bookingGuestEmail && (
                    <div className="flex items-center justify-center gap-1.5 text-xs">
                      <Mail className="h-3.5 w-3.5 text-[#D4A853]" />
                      <span className={emailSendStatus === 'failed' ? 'text-stone-400' : 'text-emerald-400'}>
                        {isEmailSending
                          ? 'Dispatching confirmation email via Resend...'
                          : emailSendStatus === 'sent'
                          ? `Confirmation email dispatched to ${bookingGuestEmail}`
                          : `Resend email scheduled for ${bookingGuestEmail}`}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="btn-luxury-primary !px-8 !py-3 mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5573A]">
                    Amen {sanctuaryData.city}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mt-1">
                    Reserve Recovery Session
                  </h3>
                </div>

                {/* Protocol Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">
                    Protocol
                  </label>
                  <select
                    value={selectedProgram?.id || ''}
                    onChange={(e) => {
                      const found = sanctuaryData.programs.find((p) => p.id === e.target.value);
                      if (found) setSelectedProgram(found);
                    }}
                    className="w-full rounded-xl bg-[#0E1612] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A853]/40 transition"
                  >
                    {sanctuaryData.programs.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#141E1A] text-white">
                        {p.name} — {p.priceFormatted} ({p.durationMinutes} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Date</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl bg-[#0E1612] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A853]/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Time</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full rounded-xl bg-[#0E1612] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A853]/40 transition"
                    >
                      {['09:00 AM','11:00 AM','01:30 PM','03:30 PM','05:30 PM','07:00 PM'].map(t => (
                        <option key={t} value={t} className="bg-[#141E1A]">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Mwangi"
                      value={bookingGuestName}
                      onChange={(e) => setBookingGuestName(e.target.value)}
                      className="w-full rounded-xl bg-[#0E1612] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#D4A853]/40 transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder={sanctuaryData.hotline}
                        value={bookingGuestPhone}
                        onChange={(e) => setBookingGuestPhone(e.target.value)}
                        className="w-full rounded-xl bg-[#0E1612] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#D4A853]/40 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Email</label>
                      <input
                        type="email"
                        placeholder="client@company.com"
                        value={bookingGuestEmail}
                        onChange={(e) => setBookingGuestEmail(e.target.value)}
                        className="w-full rounded-xl bg-[#0E1612] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#D4A853]/40 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Focus Area (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Lower back tension, marathon recovery"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full rounded-xl bg-[#0E1612] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#D4A853]/40 transition"
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-stone-500 block">Total Due on Arrival</span>
                    <span className="text-[10px] text-stone-600">
                      {regionConfig.gateway === 'intasend' ? 'M-Pesa or Card' : 'Card or Apple Pay'}
                    </span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#D4A853]">
                    {selectedProgram?.priceFormatted || '—'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-5 py-3 text-xs text-stone-500 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-luxury-primary flex items-center gap-1.5 !px-7 !py-3"
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
