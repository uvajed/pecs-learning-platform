// User types
export type UserRole = "parent" | "therapist" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

// Child/Learner types
export interface Child {
  id: string;
  parentId: string;
  name: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  currentPhase: PECSPhase;
  preferences: ChildPreferences;
  notes?: string;
  createdAt: string;
}

export interface ChildPreferences {
  colorScheme: "calm" | "high-contrast";
  soundEnabled: boolean;
  animationsEnabled: boolean;
  reinforcementStyle: "verbal" | "visual" | "both";
}

// PECS Phase types
export type PECSPhase = 1 | 2 | 3 | 4 | 5 | 6;

export interface PhaseDefinition {
  id: PECSPhase;
  name: string;
  description: string;
  objectives: string[];
  successCriteria: string[];
}

export const PECS_PHASES: PhaseDefinition[] = [
  {
    id: 1,
    name: "How to Communicate",
    description: "Physical exchange of single picture for desired item",
    objectives: [
      "Pick up picture",
      "Reach toward partner",
      "Release picture in partner's hand",
    ],
    successCriteria: ["80% independent exchanges across 3 sessions"],
  },
  {
    id: 2,
    name: "Distance and Persistence",
    description: "Generalize exchange across distance and people",
    objectives: [
      "Travel to communication book",
      "Travel to partner",
      "Persist when partner not attending",
    ],
    successCriteria: ["Exchange from various distances", "Exchange with multiple partners"],
  },
  {
    id: 3,
    name: "Picture Discrimination",
    description: "Select from multiple pictures",
    objectives: [
      "Discriminate between 2 pictures",
      "Discriminate in larger array",
      "Reduce picture size",
    ],
    successCriteria: ["80% accuracy with 5+ pictures in array"],
  },
  {
    id: 4,
    name: "Sentence Structure",
    description: "Construct sentences on sentence strip",
    objectives: [
      "Use 'I want' starter",
      "Attach picture to strip",
      "Exchange strip",
      "Read sentence aloud",
    ],
    successCriteria: ["Independently builds and exchanges sentence strips"],
  },
  {
    id: 5,
    name: "Responsive Requesting",
    description: "Answer 'What do you want?'",
    objectives: [
      "Respond to 'What do you want?'",
      "Spontaneous requesting",
      "Mixed trial mastery",
    ],
    successCriteria: ["Responds within 5 seconds", "Maintains spontaneous requesting"],
  },
  {
    id: 6,
    name: "Commenting",
    description: "Comment in response to questions",
    objectives: [
      "'I see' responses",
      "'I hear' responses",
      "Spontaneous comments",
      "Answer varied questions",
    ],
    successCriteria: ["Uses multiple comment starters", "Spontaneous commenting emerges"],
  },
];

// Picture Card types
export type CardType = "noun" | "verb" | "adjective" | "sentence_starter" | "social";

export interface PictureCard {
  id: string;
  ownerId?: string;
  label: string;
  imageUrl: string;
  audioUrl?: string;
  ttsEnabled: boolean;
  isSystem: boolean;
  isPublic: boolean;
  cardType: CardType;
  categoryIds: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isSystem: boolean;
}

// Session types
export type PromptLevel = "independent" | "gestural" | "verbal" | "physical" | "full_physical";

export type ActivityType =
  | "exchange_attempt"
  | "exchange_success"
  | "exchange_prompted"
  | "discrimination_correct"
  | "discrimination_incorrect"
  | "sentence_built"
  | "response_correct"
  | "response_incorrect"
  | "comment_made"
  | "verbal_approximation";

export interface Session {
  id: string;
  childId: string;
  facilitatorId?: string;
  phaseId: PECSPhase;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  environment: "home" | "clinic" | "school" | "other";
  notes?: string;
}

export interface SessionActivity {
  id: string;
  sessionId: string;
  activityType: ActivityType;
  cardId?: string;
  cardsInArray?: string[];
  promptLevel?: PromptLevel;
  responseTimeMs?: number;
  wasSuccessful: boolean;
  reinforcementGiven?: string;
  recordedAt: string;
}

// Progress tracking
export type ProgressStatus = "not_started" | "in_progress" | "mastered";

export interface ChildPhaseProgress {
  id: string;
  childId: string;
  phaseId: PECSPhase;
  status: ProgressStatus;
  startedAt?: string;
  masteredAt?: string;
  objectivesCompleted: number[];
  notes?: string;
}

// Analytics
export interface DailyStats {
  date: string;
  totalSessions: number;
  totalDurationSeconds: number;
  successfulExchanges: number;
  totalExchanges: number;
  independentResponses: number;
  promptedResponses: number;
}

// Achievement System
export type AchievementCategory = 'milestone' | 'streak' | 'effort' | 'mastery' | 'special' | 'category';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'phase' | 'accuracy' | 'first' | 'speed' | 'time' | 'weekend' | 'comeback' | 'category';
  target?: number;
  activityType?: ActivityType;
  phaseId?: PECSPhase;
  categoryId?: string;
}

export interface EarnedAchievement {
  id: string;
  childId: string;
  achievementType: string;
  earnedAt: string;
  metadata?: Record<string, unknown>;
}

// Achievement definitions
export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // Milestone achievements
  FIRST_EXCHANGE: {
    id: 'FIRST_EXCHANGE',
    name: 'First Exchange',
    description: 'Complete your first picture exchange',
    icon: '🌟',
    category: 'milestone',
    criteria: { type: 'first', activityType: 'exchange_success' },
  },
  FIRST_SENTENCE: {
    id: 'FIRST_SENTENCE',
    name: 'First Sentence',
    description: 'Build your first sentence',
    icon: '💬',
    category: 'milestone',
    criteria: { type: 'first', activityType: 'sentence_built' },
  },
  FIRST_COMMENT: {
    id: 'FIRST_COMMENT',
    name: 'First Comment',
    description: 'Make your first comment',
    icon: '🗣️',
    category: 'milestone',
    criteria: { type: 'first', activityType: 'comment_made' },
  },
  PHASE_1_COMPLETE: {
    id: 'PHASE_1_COMPLETE',
    name: 'Phase 1 Master',
    description: 'Complete Phase 1: How to Communicate',
    icon: '🏆',
    category: 'milestone',
    criteria: { type: 'phase', phaseId: 1 },
  },
  PHASE_2_COMPLETE: {
    id: 'PHASE_2_COMPLETE',
    name: 'Phase 2 Master',
    description: 'Complete Phase 2: Distance and Persistence',
    icon: '🏆',
    category: 'milestone',
    criteria: { type: 'phase', phaseId: 2 },
  },
  PHASE_3_COMPLETE: {
    id: 'PHASE_3_COMPLETE',
    name: 'Phase 3 Master',
    description: 'Complete Phase 3: Picture Discrimination',
    icon: '🏆',
    category: 'milestone',
    criteria: { type: 'phase', phaseId: 3 },
  },
  PHASE_4_COMPLETE: {
    id: 'PHASE_4_COMPLETE',
    name: 'Phase 4 Master',
    description: 'Complete Phase 4: Sentence Structure',
    icon: '🏆',
    category: 'milestone',
    criteria: { type: 'phase', phaseId: 4 },
  },
  PHASE_5_COMPLETE: {
    id: 'PHASE_5_COMPLETE',
    name: 'Phase 5 Master',
    description: 'Complete Phase 5: Responsive Requesting',
    icon: '🏆',
    category: 'milestone',
    criteria: { type: 'phase', phaseId: 5 },
  },
  PHASE_6_COMPLETE: {
    id: 'PHASE_6_COMPLETE',
    name: 'PECS Graduate',
    description: 'Complete all 6 PECS phases!',
    icon: '🎓',
    category: 'milestone',
    criteria: { type: 'phase', phaseId: 6 },
  },

  // Streak achievements
  STREAK_3: {
    id: 'STREAK_3',
    name: '3-Day Streak',
    description: 'Practice for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    criteria: { type: 'streak', target: 3 },
  },
  STREAK_7: {
    id: 'STREAK_7',
    name: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '⚡',
    category: 'streak',
    criteria: { type: 'streak', target: 7 },
  },
  STREAK_14: {
    id: 'STREAK_14',
    name: 'Two Week Champion',
    description: 'Practice for 14 days in a row',
    icon: '💪',
    category: 'streak',
    criteria: { type: 'streak', target: 14 },
  },
  STREAK_30: {
    id: 'STREAK_30',
    name: 'Monthly Champion',
    description: 'Practice for 30 days in a row',
    icon: '👑',
    category: 'streak',
    criteria: { type: 'streak', target: 30 },
  },

  // Effort achievements
  SESSIONS_5: {
    id: 'SESSIONS_5',
    name: 'Getting Started',
    description: 'Complete 5 practice sessions',
    icon: '🚀',
    category: 'effort',
    criteria: { type: 'count', target: 5 },
  },
  SESSIONS_25: {
    id: 'SESSIONS_25',
    name: 'Dedicated Learner',
    description: 'Complete 25 practice sessions',
    icon: '📚',
    category: 'effort',
    criteria: { type: 'count', target: 25 },
  },
  SESSIONS_100: {
    id: 'SESSIONS_100',
    name: 'Practice Pro',
    description: 'Complete 100 practice sessions',
    icon: '🌟',
    category: 'effort',
    criteria: { type: 'count', target: 100 },
  },
  EXCHANGES_50: {
    id: 'EXCHANGES_50',
    name: 'Communicator',
    description: 'Complete 50 successful exchanges',
    icon: '🤝',
    category: 'effort',
    criteria: { type: 'count', target: 50, activityType: 'exchange_success' },
  },
  EXCHANGES_200: {
    id: 'EXCHANGES_200',
    name: 'Super Communicator',
    description: 'Complete 200 successful exchanges',
    icon: '⭐',
    category: 'effort',
    criteria: { type: 'count', target: 200, activityType: 'exchange_success' },
  },

  // Mastery achievements
  PERFECT_SESSION: {
    id: 'PERFECT_SESSION',
    name: 'Perfect Practice',
    description: 'Complete a session with 100% accuracy',
    icon: '✨',
    category: 'mastery',
    criteria: { type: 'accuracy', target: 100 },
  },
  INDEPENDENT_10: {
    id: 'INDEPENDENT_10',
    name: 'Independent Learner',
    description: 'Complete 10 exchanges independently',
    icon: '🎯',
    category: 'mastery',
    criteria: { type: 'count', target: 10 },
  },
  FAST_RESPONDER: {
    id: 'FAST_RESPONDER',
    name: 'Quick Thinker',
    description: 'Complete 10 exchanges in under 3 seconds each',
    icon: '⚡',
    category: 'mastery',
    criteria: { type: 'speed', target: 3000 },
  },
  CARD_MASTER_10: {
    id: 'CARD_MASTER_10',
    name: 'Card Collector',
    description: 'Successfully use 10 different cards',
    icon: '🃏',
    category: 'mastery',
    criteria: { type: 'count', target: 10 },
  },
  CARD_MASTER_25: {
    id: 'CARD_MASTER_25',
    name: 'Card Expert',
    description: 'Successfully use 25 different cards',
    icon: '🎴',
    category: 'mastery',
    criteria: { type: 'count', target: 25 },
  },

  // Special achievements
  EARLY_BIRD: {
    id: 'EARLY_BIRD',
    name: 'Early Bird',
    description: 'Complete a session before 9 AM',
    icon: '🌅',
    category: 'special',
    criteria: { type: 'time', target: 9 },
  },
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'Complete a session after 8 PM',
    icon: '🦉',
    category: 'special',
    criteria: { type: 'time', target: 20 },
  },
  WEEKEND_WARRIOR: {
    id: 'WEEKEND_WARRIOR',
    name: 'Weekend Warrior',
    description: 'Practice on both Saturday and Sunday',
    icon: '🎉',
    category: 'special',
    criteria: { type: 'weekend' },
  },
  COMEBACK_KID: {
    id: 'COMEBACK_KID',
    name: 'Comeback Kid',
    description: 'Resume practice after 7+ days away',
    icon: '💪',
    category: 'special',
    criteria: { type: 'comeback', target: 7 },
  },

  // Category achievements
  FOOD_LOVER: {
    id: 'FOOD_LOVER',
    name: 'Food Lover',
    description: 'Successfully use all food category cards',
    icon: '🍎',
    category: 'category',
    criteria: { type: 'category', categoryId: 'food' },
  },
  TOY_MASTER: {
    id: 'TOY_MASTER',
    name: 'Toy Master',
    description: 'Successfully use all toy category cards',
    icon: '🧸',
    category: 'category',
    criteria: { type: 'category', categoryId: 'toys' },
  },
  SOCIAL_BUTTERFLY: {
    id: 'SOCIAL_BUTTERFLY',
    name: 'Social Butterfly',
    description: 'Successfully use all people category cards',
    icon: '👨‍👩‍👧',
    category: 'category',
    criteria: { type: 'category', categoryId: 'people' },
  },
};

// Streak info
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakProtected?: boolean;
  // Computed fields for UI display
  daysUntilStreakLoss?: number;
  statusMessage?: string;
}

// Re-export database types
export type { Database, UserProfile, DBChild, DBSession, DBActivity, DBAchievement, DBStreak, ChildStats } from './database';
