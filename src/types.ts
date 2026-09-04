export const ENTREPRENEUR_IDS = [
  'gates',
  'jobs',
  'musk',
  'durov',
  'ovchinnikov',
  'bakalchuk',
  'bezos',
  'zuckerberg',
] as const;

export type EntrepreneurId = (typeof ENTREPRENEUR_IDS)[number];

export type Answer = {
  text: string;
  points: Partial<Record<EntrepreneurId, number>>;
};

export type Question = {
  id: number;
  text: string;
  answers: Answer[];
};

export type Skill = {
  name: string;
  icon: SkillIcon;
};

export type SkillIcon =
  | 'analytics'
  | 'strategy'
  | 'focus'
  | 'creative'
  | 'detail'
  | 'vision'
  | 'rocket'
  | 'courage'
  | 'experiment'
  | 'freedom'
  | 'ideas'
  | 'speed'
  | 'team'
  | 'openness'
  | 'empathy'
  | 'practical'
  | 'growth'
  | 'resource'
  | 'goal'
  | 'system'
  | 'plan'
  | 'digital'
  | 'trends'
  | 'code';

export type Entrepreneur = {
  id: EntrepreneurId;
  name: string;
  nameAccusative: string;
  archetype: string;
  image: string;
  description: string;
  skills: Skill[];
  growthIdea: string;
};
