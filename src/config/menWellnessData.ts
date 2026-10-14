import type { RegionId } from './regions';

export interface RegionalProgram {
  id: string;
  name: string;
  subtitle: string;
  durationMinutes: number;
  priceFormatted: string;
  priceMinor: number;
  category: 'Recovery' | 'Therapy' | 'Longevity' | 'Grooming' | 'Breathwork';
  description: string;
  benefits: string[];
  image: string;
}

export interface TeamMember {
  name: string;
  title: string;
  credentials: string;
  bio: string;
  specialty: string;
  avatar: string;
}

export interface TransformationCase {
  title: string;
  protocol: string;
  duration: string;
  clientProfile: string;
  metricLabel: string;
  metricBefore: string;
  metricAfter: string;
  summary: string;
}

export interface RegionalSanctuaryData {
  regionId: RegionId;
  city: string;
  country: string;
  tagline: string;
  headline: string;
  heroSubheadline: string;
  premisesDescription: string;
  hotline: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  currency: string;
  heroImage: string;
  treatmentImage: string;
  teamLeadImage: string;
  leadSpecialist: TeamMember;
  team: TeamMember[];
  programs: RegionalProgram[];
  transformations: TransformationCase[];
}

export const MEN_SANCTUARY_DATA: Record<RegionId, RegionalSanctuaryData> = {
  nairobi: {
    regionId: 'nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    tagline: 'Highland Garden Sanctuary for Men',
    headline: 'High-Altitude Recovery & Longevity for Men',
    heroSubheadline:
      'Earthy open-air timber pavilions, outdoor hydrotherapy springs, and clinical deep-tissue release in leafy Karen.',
    premisesDescription:
      'Set within a private four-acre botanical garden in Karen, Nairobi. Hand-carved stone hydrotherapy pools, cedarwood recovery saunas, open-air mobility decks, and private treatment suites shaded by indigenous acacia and jacaranda trees.',
    hotline: '+254 709 555 100',
    whatsapp: '+254 700 888 222',
    email: 'karen@amenwellness.com',
    address: 'Amen Sanctuary, Karen Plains Road, Karen, Nairobi',
    hours: 'Daily 08:00 – 20:00 EAT',
    currency: 'KES',
    heroImage: '/assets/nairobi/hero/hero.jpg',
    treatmentImage: '/assets/nairobi/services/treatment.jpg',
    teamLeadImage: '/assets/nairobi/team/lead.jpg',
    leadSpecialist: {
      name: 'Dr. Amani Kamau',
      title: 'Clinical Director & Lead Sports Physiotherapist',
      credentials: 'BSc Physiotherapy, MSc Sports Medicine (UoN)',
      bio: 'Over 14 years restoring elite Kenyan endurance athletes, rugby professionals, and corporate leaders through neuromuscular release, spinal decompression, and thermal contrast physiology.',
      specialty: 'High-Performance Neuromuscular & Spinal Restoration',
      avatar: '/assets/nairobi/team/lead.jpg',
    },
    team: [
      {
        name: 'Dr. Amani Kamau',
        title: 'Clinical Director & Lead Sports Physiotherapist',
        credentials: 'BSc Physiotherapy, MSc Sports Medicine (UoN)',
        bio: 'Over 14 years restoring elite Kenyan endurance athletes, rugby professionals, and corporate leaders through neuromuscular release, spinal decompression, and thermal contrast physiology.',
        specialty: 'High-Performance Neuromuscular & Spinal Restoration',
        avatar: '/assets/nairobi/team/lead.jpg',
      },
      {
        name: 'Juma Kiprop',
        title: 'Lead Breathwork & Thermal Contrast Coach',
        credentials: 'Certified Wim Hof Instructor, Oxygen Advantage Master Coach',
        bio: 'Specialist in autonomic nervous system control, hypoxic breath retention, and cold plunge metabolic conditioning in our Karen cedar pavilions.',
        specialty: 'Autonomic Regulation & Breathwork Conditioning',
        avatar: '/assets/nairobi/team/specialist-juma.jpg',
      },
    ],
    programs: [
      {
        id: 'nairobi-highland-body',
        name: 'Highland Botanical Deep Heat & Tissue Revival',
        subtitle: 'Moringa & Baobab Hot Stone Recovery',
        durationMinutes: 75,
        priceFormatted: 'KSh 8,500',
        priceMinor: 850000,
        category: 'Recovery',
        description:
          'Deep muscular decompression utilizing heated Kenyan basalt river stones infused with cold-pressed highland moringa and baobab seed oils.',
        benefits: ['Deep lactic acid clearance', 'Relieves lumbar and shoulder tension', 'Micro-circulation boost'],
        image: '/assets/nairobi/services/treatment.jpg',
      },
      {
        id: 'nairobi-hydro-contrast',
        name: 'Garden Hydrotherapy & Thermal Plunge Circuit',
        subtitle: '3°C Ice Plunge + 40°C Natural Mineral Pool',
        durationMinutes: 60,
        priceFormatted: 'KSh 6,500',
        priceMinor: 650000,
        category: 'Longevity',
        description:
          'Guided contrast therapy through our outdoor stone thermal pool and cold plunge, structured to spike norepinephrine, flush inflammation, and reset the central nervous system.',
        benefits: ['Reduced whole-body inflammation', 'CNS reset & elevated alertness', 'Vascular conditioning'],
        image: '/assets/nairobi/hero/hero.jpg',
      },
      {
        id: 'nairobi-altitude-breath',
        name: 'High-Altitude Thoracic & Breathwork Conditioning',
        subtitle: 'Pranayama & Diaphragmatic Expansion',
        durationMinutes: 50,
        priceFormatted: 'KSh 5,000',
        priceMinor: 500000,
        category: 'Breathwork',
        description:
          'Conducted on the open-air cedar mobility deck. Targeted ribcage expansion, CO2 tolerance training, and nervous system down-regulation.',
        benefits: ['Lower resting heart rate', 'Enhanced VO2 efficiency', 'Cortisol down-regulation'],
        image: '/assets/nairobi/hero/hero.jpg',
      },
      {
        id: 'nairobi-spinal-decomp',
        name: 'Spine & Posture Structural Alignment',
        subtitle: 'Decompression for Desk Strain & Athletes',
        durationMinutes: 60,
        priceFormatted: 'KSh 9,000',
        priceMinor: 900000,
        category: 'Therapy',
        description:
          'Targeted osteopathic myofascial alignment addressing pelvic anterior tilt, forward neck syndrome, and spinal compression.',
        benefits: ['Spinal disc decompression', 'Restored athletic posture', 'Elimination of chronic tension headaches'],
        image: '/assets/nairobi/services/treatment.jpg',
      },
    ],
    transformations: [
      {
        title: 'Chronic Lumbar Desk Compression',
        protocol: '4-Week Spinal Decompression & Deep Heat Protocol',
        duration: '4 Weeks (8 Sessions)',
        clientProfile: 'Executive / Tech Founder (39 yrs)',
        metricLabel: 'Thoracic Forward Angle',
        metricBefore: '34° Forward Slump',
        metricAfter: '9° Neutral Athletic Plumb',
        summary: 'Completely eliminated daily lower back fatigue and tension headaches from long desk hours.',
      },
      {
        title: 'Endurance Marathon Recovery',
        protocol: 'Highland Botanical & Hydrotherapy Contrast Plunge',
        duration: '72 Hours Post-Race',
        clientProfile: 'Marathon Runner (42 yrs)',
        metricLabel: 'Lactate & Muscle Soreness (VAS)',
        metricBefore: '8.5 / 10 Severe DOMS',
        metricAfter: '1.2 / 10 Fully Restored',
        summary: 'Achieved sub-48hr muscular mobility with zero joint swelling or hamstring stiffness.',
      },
    ],
  },

  'new-york': {
    regionId: 'new-york',
    city: 'New York',
    country: 'USA',
    tagline: 'SoHo Executive Contrast & Longevity Loft',
    headline: 'High-Performance Men’s Recovery in SoHo',
    heroSubheadline:
      'Sub-zero cryotherapy, infrared cedar saunas, sensory deprivation float tanks, and clinical neuromuscular bodywork.',
    premisesDescription:
      'A multi-level historic industrial loft on Greene Street in SoHo. Exposed 19th-century brick, black steel factory casements, Finnish cedar saunas, stainless steel ice plunge suites, and acoustic sound recovery pods.',
    hotline: '+1 (212) 899-7400',
    whatsapp: '+1 (212) 899-7401',
    email: 'soho@amenwellness.com',
    address: 'Amen Wellness Loft, 478 Greene Street, SoHo, NY 10013',
    hours: 'Daily 07:00 – 21:00 EST',
    currency: 'USD',
    heroImage: '/assets/new-york/hero/hero.jpg',
    treatmentImage: '/assets/new-york/services/treatment.jpg',
    teamLeadImage: '/assets/new-york/team/lead.jpg',
    leadSpecialist: {
      name: 'Marcus Sterling, DPT',
      title: 'Director of Athletic Longevity & Sports Medicine',
      credentials: 'Doctor of Physical Therapy (Columbia), CSCS',
      bio: 'Former consultant for professional athletic programs and hedge fund executives. Specializes in rapid contrast recovery, hyperbaric oxygen therapy, and myofascial structural integration.',
      specialty: 'Cryo-Thermal Physiology & Biomechanical Optimization',
      avatar: '/assets/new-york/team/lead.jpg',
    },
    team: [
      {
        name: 'Marcus Sterling, DPT',
        title: 'Director of Athletic Longevity & Sports Medicine',
        credentials: 'Doctor of Physical Therapy (Columbia), CSCS',
        bio: 'Former consultant for professional athletic programs and hedge fund executives. Specializes in rapid contrast recovery, hyperbaric oxygen therapy, and myofascial structural integration.',
        specialty: 'Cryo-Thermal Physiology & Biomechanical Optimization',
        avatar: '/assets/new-york/team/lead.jpg',
      },
      {
        name: 'Tyler Brooks, LMT',
        title: 'Senior Neuromuscular & Sports Fascia Specialist',
        credentials: 'Licensed Massage Therapist (NY), Active Release Technique (ART) Certified',
        bio: 'Former collegiate decathlete specializing in deep fascia release, chronic scar tissue mobilization, and high-impact lifting recovery in our SoHo loft.',
        specialty: 'Active Release & High-Impact Athletic Recovery',
        avatar: '/assets/new-york/team/specialist-tyler.jpg',
      },
    ],
    programs: [
      {
        id: 'ny-subzero-contrast',
        name: 'Sub-Zero Cryo & Infrared Contrast Protocol',
        subtitle: '-110°C Chamber + 90°C Finnish Cedar Sauna',
        durationMinutes: 60,
        priceFormatted: '$195',
        priceMinor: 19500,
        category: 'Recovery',
        description:
          'The gold-standard contrast circuit: cold shock protein release, intense endorphin surge, rapid lymphatic drainage, and cellular detox.',
        benefits: ['Dramatically accelerates workout recovery', 'Spikes dopamine and focus', 'Deep anti-inflammatory effect'],
        image: '/assets/new-york/services/treatment.jpg',
      },
      {
        id: 'ny-magnesium-float',
        name: 'Zero-Gravity Magnesium Sensory Float Suite',
        subtitle: '1,000 lbs Pharmaceutical Epsom Salt Solution',
        durationMinutes: 60,
        priceFormatted: '$165',
        priceMinor: 16500,
        category: 'Longevity',
        description:
          'Absolute sensory deprivation float chamber at exact skin temperature. Eliminates all gravitational load on joints and allows theta-state neural recovery.',
        benefits: ['Complete spinal decompression', 'Profound cortisol reduction', 'Theta-brainwave restorative rest'],
        image: '/assets/new-york/hero/hero.jpg',
      },
      {
        id: 'ny-executive-reset',
        name: 'Executive 45-Minute Lunch Recovery Reset',
        subtitle: 'Percussive Therapy + Compression + Neck Release',
        durationMinutes: 45,
        priceFormatted: '$140',
        priceMinor: 14000,
        category: 'Recovery',
        description:
          'Tailored for Wall Street and tech executives. Fast-acting cervical decompression, pneumatic compression boots, and cranial tension unwind.',
        benefits: ['Cures mid-day brain fog', 'Relieves desk shoulder knots', 'Leaves you sharp and energized'],
        image: '/assets/new-york/services/treatment.jpg',
      },
      {
        id: 'ny-deep-tissue-sports',
        name: 'High-Impact Sports & Myofascial Release',
        subtitle: 'Deep Structural Bodywork for Lifting & Athletics',
        durationMinutes: 75,
        priceFormatted: '$220',
        priceMinor: 22000,
        category: 'Therapy',
        description:
          'Heavy-pressure sports bodywork combining active release technique (ART), myofascial scraping, and assisted PNF stretching.',
        benefits: ['Breaks down chronic scar tissue', 'Increases hip & shoulder mobility', 'Restores athletic power transfer'],
        image: '/assets/new-york/services/treatment.jpg',
      },
    ],
    transformations: [
      {
        title: 'Executive Burnout & High Cortisol',
        protocol: 'Contrast Therapy & Sensory Float Protocol',
        duration: '6 Weeks (12 Sessions)',
        clientProfile: 'Managing Director / Finance (44 yrs)',
        metricLabel: 'Deep Sleep / Heart Rate Variability (HRV)',
        metricBefore: '32 mins deep sleep · HRV 38ms',
        metricAfter: '86 mins deep sleep · HRV 64ms',
        summary: 'Normalized sleep latency within 10 days, reduced afternoon fatigue, and lowered resting heart rate.',
      },
      {
        title: 'Upper Cross Syndrome & Rounded Shoulders',
        protocol: 'Structural Myofascial Release & Mobility',
        duration: '5 Weeks (6 Sessions)',
        clientProfile: 'Triathlete & Tech Exec (36 yrs)',
        metricLabel: 'Glenohumeral Internal Rotation',
        metricBefore: 'Restricted 48°',
        metricAfter: 'Optimal 82° Clean Arc',
        summary: 'Full overhead press range restored without shoulder impingement or trap soreness.',
      },
    ],
  },

  paris: {
    regionId: 'paris',
    city: 'Paris',
    country: 'France',
    tagline: 'Sanctuaire Masculin de Haute Récupération · Saint-Germain',
    headline: 'L’Art de Vivre & Longévité Masculine d’Élite',
    heroSubheadline:
      'Hammam traditionnel en marbre privé, ostéopathie posturale, soins cutanés anti-fatigue et thérapie de contraste.',
    premisesDescription:
      'Niché dans un hôtel particulier d’époque rue de Grenelle à Saint-Germain-des-Prés. Parquets en chêne massif en chevrons, hammam en marbre blanc de Carrare, cabines de soins privatisées et cour intérieure confidentielle.',
    hotline: '+33 1 42 68 90 20',
    whatsapp: '+33 6 40 12 34 56',
    email: 'saintgermain@amenwellness.com',
    address: 'Sanctuaire Amen, 24 Rue de Grenelle, 75007 Paris',
    hours: 'Lun–Sam 09:00 – 20:00, Dim 10:00 – 18:00 CET',
    currency: 'EUR',
    heroImage: '/assets/paris/hero/hero.jpg',
    treatmentImage: '/assets/paris/services/treatment.jpg',
    teamLeadImage: '/assets/paris/team/lead.jpg',
    leadSpecialist: {
      name: 'Julien Moreau',
      title: 'Directeur des Soins & Ostéopathe D.O.',
      credentials: 'Diplômé de l’Institut Supérieur d’Ostéopathie de Paris',
      bio: 'Expert renommé en biomécanique masculine, décompression vertébrale et récupération tissulaire profonde. Accompagne les athlètes et dirigeants parisiens depuis 16 ans.',
      specialty: 'Ostéopathie Posturale & Rituels Hammam Thérapeutiques',
      avatar: '/assets/paris/team/lead.jpg',
    },
    team: [
      {
        name: 'Julien Moreau',
        title: 'Directeur des Soins & Ostéopathe D.O.',
        credentials: 'Diplômé de l’Institut Supérieur d’Ostéopathie de Paris',
        bio: 'Expert renommé en biomécanique masculine, décompression vertébrale et récupération tissulaire profonde. Accompagne les athlètes et dirigeants parisiens depuis 16 ans.',
        specialty: 'Ostéopathie Posturale & Rituels Hammam Thérapeutiques',
        avatar: '/assets/paris/team/lead.jpg',
      },
      {
        name: 'Mathieu Laurent',
        title: 'Maître de Hammam & Hydrothérapeute d’Élite',
        credentials: 'Maître de Rituels Thermaux & Soins Corporels',
        bio: 'Gardien des rituels traditionnels de sudation et de gommage au savon noir. Expert en relaxation musculaire profonde par alternance thermique dans nos thermes privés en marbre de Carrare.',
        specialty: 'Bains de Vapeur & Hydrothérapie Thermale',
        avatar: '/assets/paris/team/specialist-mathieu.jpg',
      },
    ],
    programs: [
      {
        id: 'paris-hammam-gommage',
        name: 'Rituel Hammam & Gommage Traditionnel Homme',
        subtitle: 'Vapeur d’Eucalyptus & Savon Noir Biologique',
        durationMinutes: 70,
        priceFormatted: '150 €',
        priceMinor: 15000,
        category: 'Recovery',
        description:
          'Bain de vapeur privatisé en marbre suivi d’un gommage kessa traditionnel au savon noir naturel pour éliminer les toxines et stimuler la circulation.',
        benefits: ['Détoxification cutanée en profondeur', 'Décontraction musculaire immédiate', 'Purification respiratoire'],
        image: '/assets/paris/services/treatment.jpg',
      },
      {
        id: 'paris-massage-osteo',
        name: 'Massage Signature Récupération Profonde & Fascias',
        subtitle: 'Huiles d’Arnica & Cèdre de l’Atlas',
        durationMinutes: 75,
        priceFormatted: '170 €',
        priceMinor: 17000,
        category: 'Therapy',
        description:
          'Massage puissant et précis ciblant les nœuds musculaires, le dos, les trapèzes et les jambes lourdes avec étirements ostéopathiques doux.',
        benefits: ['Soulagement durable des tensions dorsales', 'Libération des blocages cervicaux', 'Régénération musculaire'],
        image: '/assets/paris/hero/hero.jpg',
      },
      {
        id: 'paris-anti-fatigue-face',
        name: 'Soin Visage Homme Anti-Fatigue & Détox Cutanée',
        subtitle: 'Traitement Purifiant & Drainage Lymphatique',
        durationMinutes: 55,
        priceFormatted: '135 €',
        priceMinor: 13500,
        category: 'Grooming',
        description:
          'Spécialement formulé pour la peau masculine fatiguée par la pollution urbaine et le stress. Serviettes chaudes, vapeur et modelage tonifiant.',
        benefits: ['Teint instantanément reposé', 'Décongestion du regard et des cernes', 'Équilibre cutané optimal'],
        image: '/assets/paris/services/treatment.jpg',
      },
      {
        id: 'paris-bain-froid-vapeur',
        name: 'Protocole Bain Froid & Vapeur Minérale',
        subtitle: 'Thermothérapie de Contraste dans les Thermes Privés',
        durationMinutes: 60,
        priceFormatted: '110 €',
        priceMinor: 11000,
        category: 'Longevity',
        description:
          'Alternance de séances de vapeur chaude et d’immersions en eau froide à 6°C sous protocole guidé pour booster l’immunité et le tonus.',
        benefits: ['Renforcement du système immunitaire', 'Amélioration de la tonicité vasculaire', 'Vitalité physique immédiate'],
        image: '/assets/paris/hero/hero.jpg',
      },
    ],
    transformations: [
      {
        title: 'Tensions Cervicales & Migraines Posturales',
        protocol: 'Protocole Ostéopathique & Hammam Thérapeutique',
        duration: '4 Semaines (6 Séances)',
        clientProfile: 'Avocat d’affaires / Cadre Dirigeant (46 ans)',
        metricLabel: 'Mobilité Cervicale & Échelle de Douleur',
        metricBefore: 'Rotation limitée à 42° · Douleur 7/10',
        metricAfter: 'Rotation fluide à 80° · Douleur 0/10',
        summary: 'Disparition complète des céphalées de tension et posture réalignée sans raideur.',
      },
      {
        title: 'Fatigue Cutanée & Stress Oxydatif',
        protocol: 'Soin Visage Détox & Drainage Lymphatique',
        duration: '30 Jours (3 Séances)',
        clientProfile: 'Entrepreneur (38 ans)',
        metricLabel: 'Élasticité Cutanée & Décongestion',
        metricBefore: 'Teint terne · Cernes prononcés',
        metricAfter: 'Peau régénérée · Regard reposé et net',
        summary: 'Restauration visible du grain de peau et décongestion lymphatique du visage.',
      },
    ],
  },
};
