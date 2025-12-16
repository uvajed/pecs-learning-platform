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
