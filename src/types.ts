export type UserLevel = 'beginner' | 'experienced';
export type UserRole = 'developer' | 'tester';
export type UserGoal = 'architecture' | 'testing' | 'security';

export interface UserProfile {
  level: UserLevel | null;
  role: UserRole | null;
  goal: UserGoal | null;
}

export type DecisionId = 1 | 2 | 3;
export type ChoiceOption = 'A' | 'B';

export type DecisionChoices = {
  [key in DecisionId]?: ChoiceOption;
};

export type ScreenType = 'profile' | 'scene' | 'ending';

export interface DecisionOutcome {
  whatHappened: string;
  whyHappened: string;
  goalInsight?: string; // Appended if user's goal matches this decision
}

export interface DecisionDefinition {
  id: DecisionId;
  orderLabel: string; // e.g. "01.", "02.", "03."
  title: string;
  topic: 'architecture' | 'testing' | 'security';
  topicLabel: string;
  summaryLabel: string;
  eceDialogue: string;
  denizDialogue: string;
  technicalContext: string;
  beginnerTerminology?: { term: string; definition: string };
  beginnerThinkingPrompt: string; // "Doğru cevabı açığa çıkarmayan genel bir düşünme sorusu"
  rolePerspectiveNote: {
    developer: string;
    tester: string;
  };
  telemetry: {
    label1: string;
    value1: string;
    sub1?: string;
    label2: string;
    value2: string;
    sub2?: string;
    note: string;
  };
  question: string;
  choices: {
    A: {
      text: string;
      tacticalBadge: string;
    };
    B: {
      text: string;
      tacticalBadge: string;
    };
  };
  getOutcome: (choice: ChoiceOption, previousChoices: DecisionChoices, goal: UserGoal | null) => DecisionOutcome;
}

export interface DecisionSummaryItem {
  id: DecisionId;
  orderLabel: string;
  title: string;
  appliedText: string;
  badgeText: string;
  isPositive: boolean;
}

export interface EndingResult {
  type: 'good' | 'bad';
  title: string;
  subTitle: string;
  narrative: string;
  isSystemStable: boolean;
  hasCapacityIssue: boolean;
  hasUnverifiedTesting: boolean;
  hasDataBreach: boolean;
  eceFinalMessage: string;
  summaries: DecisionSummaryItem[];
  keyLearnings: {
    title: string;
    description: string;
  }[];
}

export interface GameState {
  screen: ScreenType;
  profile: UserProfile;
  currentDecisionId: DecisionId;
  choices: DecisionChoices;
  isChoiceLocked: boolean;
}
