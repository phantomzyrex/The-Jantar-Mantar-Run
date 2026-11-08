export type ProtesterId = 'neha' | 'abhijit' | 'nsui' | 'genz' | 'minister' | 'warrior';

export type RankTier =
  | 'Morcha Rookie'
  | 'Sadak Runner'
  | 'Barricade Breaker'
  | 'Inquilab Leader'
  | 'Jantar Mantar Legend';

export type WeatherMode = 'sunny' | 'dusty' | 'rainy';

export interface WeatherConfig {
  id: WeatherMode;
  labelEn: string;
  labelHindi: string;
  description: string;
  fogColor: string;
  skyTopColor: string;
  skyHorizonColor: string;
  fogDensity: number;
  ambientIntensity: number;
  sunIntensity: number;
  roadRoughness: number;
  roadMetalness: number;
  lateralFriction: number; // 1.0 = crisp dry grip, 0.68 = loose dust, 0.36 = slippery monsoon
  visibilityLabel: string;
  frictionLabel: string;
}

export const WEATHER_CONFIGS: Record<WeatherMode, WeatherConfig> = {
  sunny: {
    id: 'sunny',
    labelEn: 'Sunny (Golden Hour)',
    labelHindi: 'सुनहरी धूप',
    description: 'Warm Delhi golden-amber horizon & crisp dry-asphalt traction',
    fogColor: '#d99b66',
    skyTopColor: '#8c6252',
    skyHorizonColor: '#f3c68f',
    fogDensity: 0.0075,
    ambientIntensity: 0.95,
    sunIntensity: 1.75,
    roadRoughness: 0.78,
    roadMetalness: 0.08,
    lateralFriction: 1.0,
    visibilityLabel: '100% Clear',
    frictionLabel: '100% Dry Grip',
  },
  dusty: {
    id: 'dusty',
    labelEn: 'Dusty (Delhi Pollution)',
    labelHindi: 'दिल्ली धुंध (AQI 480)',
    description: 'Thick ochre smog cuts visibility & dusty grit lowers road grip',
    fogColor: '#c28e5c',
    skyTopColor: '#78553a',
    skyHorizonColor: '#d6a36e',
    fogDensity: 0.021,
    ambientIntensity: 0.7,
    sunIntensity: 1.05,
    roadRoughness: 0.94,
    roadMetalness: 0.04,
    lateralFriction: 0.68,
    visibilityLabel: '45% Smog Haze',
    frictionLabel: '68% Dusty Grit',
  },
  rainy: {
    id: 'rainy',
    labelEn: 'Rainy (Monsoon)',
    labelHindi: 'मानसून बारिश',
    description: 'Heavy downpour, wet reflective road & hydroplaning low friction',
    fogColor: '#3b4c63',
    skyTopColor: '#1e293b',
    skyHorizonColor: '#64748b',
    fogDensity: 0.0135,
    ambientIntensity: 0.65,
    sunIntensity: 0.85,
    roadRoughness: 0.16,
    roadMetalness: 0.58,
    lateralFriction: 0.36,
    visibilityLabel: '70% Rain Mist',
    frictionLabel: '36% Wet Slip',
  },
};

export type EmoteKey = 1 | 2 | 3 | 4;

export interface ProtesterEmoteConfig {
  key: EmoteKey;
  nameEn: string;
  nameHindi: string;
  callout: string;
  durationSec: number;
}

export const PROTESTER_EMOTES: Record<EmoteKey, ProtesterEmoteConfig> = {
  1: {
    key: 1,
    nameEn: 'Fist Pump',
    nameHindi: 'इंकलाब मुट्ठी',
    callout: 'इंकलाब जिंदाबाद! [FIST PUMP]',
    durationSec: 1.1,
  },
  2: {
    key: 2,
    nameEn: 'Crowd Wave',
    nameHindi: 'जनता सलाम',
    callout: 'आवाज़ दो हम एक हैं! [WAVE]',
    durationSec: 1.2,
  },
  3: {
    key: 3,
    nameEn: 'Victory Spin',
    nameHindi: 'क्रांति स्पिन',
    callout: 'हल्ला बोल! [360 SPIN]',
    durationSec: 0.95,
  },
  4: {
    key: 4,
    nameEn: 'Bhangra Hop',
    nameHindi: 'भांगड़ा जोश',
    callout: 'चक दे फट्टे! [BHANGRA]',
    durationSec: 1.25,
  },
};

export interface ProtesterConfig {
  id: ProtesterId;
  name: string;
  tagline: string;
  speedStat: number; // 0..100 display
  speedMultiplier: number;
  jumpMultiplier: number;
  damageMultiplier: number;
  joshBoostMultiplier: number;
  scoreMultiplier: number;
  perkName: string;
  perkDesc: string;
  outfitPrimary: string;
  outfitSecondary: string;
  hatColor?: string;
  cardBgTop: string;
  cardBgBottom: string;
  accessory: 'placard' | 'cap' | 'flag' | 'selfie_stick' | 'nehru_jacket' | 'wheelchair';
}

export const PROTESTERS: ProtesterConfig[] = [
  {
    id: 'neha',
    name: 'NEHA',
    tagline: 'Loudest slogan in Delhi.',
    speedStat: 76,
    speedMultiplier: 1.02,
    jumpMultiplier: 1.04,
    damageMultiplier: 0.9,
    joshBoostMultiplier: 1.0,
    scoreMultiplier: 1.1,
    perkName: 'Dupatta Guard',
    perkDesc: '10% less जान lost from stick squad',
    outfitPrimary: '#e59866',
    outfitSecondary: '#dc2626',
    cardBgTop: '#facc15',
    cardBgBottom: '#fde047',
    accessory: 'placard',
  },
  {
    id: 'abhijit',
    name: 'ABHIJIT',
    tagline: 'Topper. Carries receipts.',
    speedStat: 84,
    speedMultiplier: 1.14,
    jumpMultiplier: 1.05,
    damageMultiplier: 1.0,
    joshBoostMultiplier: 1.0,
    scoreMultiplier: 1.15,
    perkName: 'Receipt Sprint',
    perkDesc: '+14% base sprint speed on straightaways',
    outfitPrimary: '#2563eb',
    outfitSecondary: '#334155',
    hatColor: '#1e3a8a',
    cardBgTop: '#7dd3fc',
    cardBgBottom: '#bae6fd',
    accessory: 'cap',
  },
  {
    id: 'nsui',
    name: 'NSUI',
    tagline: 'Flag up. Voice up.',
    speedStat: 78,
    speedMultiplier: 1.04,
    jumpMultiplier: 1.02,
    damageMultiplier: 0.85,
    joshBoostMultiplier: 1.35,
    scoreMultiplier: 1.1,
    perkName: 'Yuva Morcha Boost',
    perkDesc: 'Sikh Squad restores +27% जान instead of +20%',
    outfitPrimary: '#ffffff',
    outfitSecondary: '#1d4ed8',
    cardBgTop: '#93c5fd',
    cardBgBottom: '#dbeafe',
    accessory: 'flag',
  },
  {
    id: 'genz',
    name: 'GENZ',
    tagline: 'Going live. No cap.',
    speedStat: 86,
    speedMultiplier: 1.1,
    jumpMultiplier: 1.1,
    damageMultiplier: 0.95,
    joshBoostMultiplier: 1.05,
    scoreMultiplier: 1.35,
    perkName: 'Viral Livestream',
    perkDesc: '+35% bonus अंक on close WHOOSH! dodges',
    outfitPrimary: '#f97316',
    outfitSecondary: '#475569',
    hatColor: '#f472b6',
    cardBgTop: '#bbf7d0',
    cardBgBottom: '#dcfce7',
    accessory: 'selfie_stick',
  },
  {
    id: 'minister',
    name: 'EX MINISTER',
    tagline: 'Lost his convoy. Here to "clarify".',
    speedStat: 70,
    speedMultiplier: 0.96,
    jumpMultiplier: 0.98,
    damageMultiplier: 0.65,
    joshBoostMultiplier: 1.1,
    scoreMultiplier: 1.2,
    perkName: 'Z-Plus Resilience',
    perkDesc: 'Takes 35% less damage from Stick Squad',
    outfitPrimary: '#f8fafc',
    outfitSecondary: '#9a6b3e',
    cardBgTop: '#fed7aa',
    cardBgBottom: '#ffedd5',
    accessory: 'nehru_jacket',
  },
  {
    id: 'warrior',
    name: 'WHEELCHAIR WARRIOR',
    tagline: 'Ramp ya na ho, aa raha hai.',
    speedStat: 94,
    speedMultiplier: 1.26,
    jumpMultiplier: 1.08,
    damageMultiplier: 0.9,
    joshBoostMultiplier: 1.15,
    scoreMultiplier: 1.25,
    perkName: 'Turbo Axle',
    perkDesc: 'Fastest top speed + rapid lane switching',
    outfitPrimary: '#2563eb',
    outfitSecondary: '#1e293b',
    cardBgTop: '#bae6fd',
    cardBgBottom: '#e0f2fe',
    accessory: 'wheelchair',
  },
];

export interface DynamicLevelConfig {
  id: string;
  titleHindi: string;
  titleEn: string;
  subtitle: string;
  distanceM: number;
  skyColorTop: string;
  skyColorHorizon: string;
  fogColor: string;
  roadColor: string;
  defaultWeather: WeatherMode;
  hazardDensity: number;
  waterCannonChance: number;
  tearGasChance: number;
  roundaboutCount: number;
  rewardRpBonus: number;
  banners: string[];
}

export const DYNAMIC_LEVELS: DynamicLevelConfig[] = [
  {
    id: 'sansad_marg',
    titleHindi: 'संसद मार्ग',
    titleEn: 'Sansad Marg Boulevard',
    subtitle: '500M · Iconic Jantar Mantar Avenue with Book Depots, Media Crew & Barricades',
    distanceM: 500,
    skyColorTop: '#8c6252',
    skyColorHorizon: '#f3c68f',
    fogColor: '#d99b66',
    roadColor: '#3f444c',
    defaultWeather: 'sunny',
    hazardDensity: 1.0,
    waterCannonChance: 0.35,
    tearGasChance: 0.3,
    roundaboutCount: 1,
    rewardRpBonus: 150,
    banners: ['हम देखेंगे', 'RE-EXAM NOW!', 'NO PAPER LEAKS', 'द जंतर मंतर रन', 'इंकलाब जिंदाबाद'],
  },
  {
    id: 'connaught_circle',
    titleHindi: 'कनॉट प्लेस चौराहा',
    titleEn: 'Connaught Place Outer Circle',
    subtitle: '700M · Delhi Smog Alert, Twin Fountain Roundabouts & Heavy Water Cannon Trucks',
    distanceM: 700,
    skyColorTop: '#78553a',
    skyColorHorizon: '#d6a36e',
    fogColor: '#c28e5c',
    roadColor: '#373c44',
    defaultWeather: 'dusty',
    hazardDensity: 1.25,
    waterCannonChance: 0.55,
    tearGasChance: 0.45,
    roundaboutCount: 2,
    rewardRpBonus: 240,
    banners: ['RE-EXAM NOW!', 'हम देखेंगे', 'WE DEMAND JUSTICE', 'NO PAPER LEAKS', 'इंकलाब जिंदाबाद'],
  },
  {
    id: 'kartavya_monsoon',
    titleHindi: 'कर्तव्य पथ मानसून',
    titleEn: 'Kartavya Path Monsoon',
    subtitle: '900M · Monsoon Downpour, Slippery Wet Asphalt & Multi-Lane Bus Blockades',
    distanceM: 900,
    skyColorTop: '#1e293b',
    skyColorHorizon: '#64748b',
    fogColor: '#3b4c63',
    roadColor: '#272c35',
    defaultWeather: 'rainy',
    hazardDensity: 1.45,
    waterCannonChance: 0.65,
    tearGasChance: 0.55,
    roundaboutCount: 2,
    rewardRpBonus: 340,
    banners: ['हम देखेंगे', 'RE-EXAM NOW!', 'युवा मांगे रोजगार', 'NO PAPER LEAKS', 'इंकलाब जिंदाबाद'],
  },
  {
    id: 'jantar_siege',
    titleHindi: 'जंतर मंतर महा-घेराव',
    titleEn: 'Jantar Mantar Grand Siege',
    subtitle: '1100M · High-Intensity Run with Tear Gas Clouds, Buses & Elite Riot Walls',
    distanceM: 1100,
    skyColorTop: '#5c4033',
    skyColorHorizon: '#c28e5c',
    fogColor: '#b87d4b',
    roadColor: '#32363e',
    defaultWeather: 'dusty',
    hazardDensity: 1.65,
    waterCannonChance: 0.75,
    tearGasChance: 0.7,
    roundaboutCount: 3,
    rewardRpBonus: 500,
    banners: ['हम देखेंगे', 'RE-EXAM NOW!', 'आवाज़ दो हम एक हैं', 'NO PAPER LEAKS', 'इंकलाब जिंदाबाद'],
  },
];

export interface DailyChallenge {
  id: string;
  titleHindi: string;
  titleEn: string;
  description: string;
  target: number;
  rewardRp: number;
  rewardScore: number;
  metric: 'barricadesJumped' | 'closeDodges' | 'zeroWaterHitsWin' | 'fastWinUnder32s';
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'ch_barricade_8',
    titleHindi: 'बैरिकेड जंपर',
    titleEn: 'Barricade Hurdler',
    description: 'Jump cleanly over 8 POLICE Barricades in a single run',
    target: 8,
    rewardRp: 300,
    rewardScore: 400,
    metric: 'barricadesJumped',
  },
  {
    id: 'ch_dodge_6',
    titleHindi: 'बच गया उस्ताद',
    titleEn: 'Close Dodge Specialist',
    description: 'Trigger 6 close "WHOOSH!" or "BACH GAYA!" dodges past Police',
    target: 6,
    rewardRp: 350,
    rewardScore: 500,
    metric: 'closeDodges',
  },
  {
    id: 'ch_water_zero',
    titleHindi: 'सूखा मोर्चा',
    titleEn: 'Dry March Victory',
    description: 'Reach Jantar Mantar without getting hit by a Water Cannon stream',
    target: 1,
    rewardRp: 450,
    rewardScore: 600,
    metric: 'zeroWaterHitsWin',
  },
  {
    id: 'ch_fast_32',
    titleHindi: 'तेज़ रफ़्तार क्रांति',
    titleEn: 'Express Protest Run',
    description: 'Reach the Jantar Mantar finish gate in under 32.0 seconds',
    target: 1,
    rewardRp: 400,
    rewardScore: 550,
    metric: 'fastWinUnder32s',
  },
];

export function calculateRankTier(seasonRp: number): RankTier {
  if (seasonRp >= 4500) return 'Jantar Mantar Legend';
  if (seasonRp >= 3000) return 'Inquilab Leader';
  if (seasonRp >= 1500) return 'Barricade Breaker';
  if (seasonRp >= 500) return 'Sadak Runner';
  return 'Morcha Rookie';
}

export function getNextRankThreshold(seasonRp: number): { nextTier: string; targetRp: number } {
  if (seasonRp < 500) return { nextTier: 'Sadak Runner', targetRp: 500 };
  if (seasonRp < 1500) return { nextTier: 'Barricade Breaker', targetRp: 1500 };
  if (seasonRp < 3000) return { nextTier: 'Inquilab Leader (Protest Leader)', targetRp: 3000 };
  if (seasonRp < 4500) return { nextTier: 'Jantar Mantar Legend (Street Legend)', targetRp: 4500 };
  return { nextTier: 'Max Season Rank', targetRp: 4500 };
}

export interface ComicCallout {
  id: string;
  text: string;
  subtext?: string;
  x: number; // Screen percentage 0..100
  y: number; // Screen percentage 0..100
  variant: 'speech' | 'whoosh' | 'hit' | 'sikh' | 'banner' | 'arrest' | 'emote';
  createdAt: number;
}

export interface RunTelemetry {
  josh: number; // 0..100
  distanceM: number;
  targetDistanceM: number;
  timeSec: number;
  score: number;
  barricadesJumped: number;
  closeDodges: number;
  waterCannonHits: number;
  sikhBoostsTaken: number;
  halfwayShown: boolean;
  activeEmote: EmoteKey | null;
}
