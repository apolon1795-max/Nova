export type EntrepreneurId = 'gates' | 'jobs' | 'musk' | 'durov' | 'ovchinnikov' | 'bakalchuk' | 'bezos' | 'zuckerberg';

export type Answer = {
  text: string;
  points: Partial<Record<EntrepreneurId, number>>;
};

export type Question = {
  id: number;
  text: string;
  answers: Answer[];
};

export type Entrepreneur = {
  id: EntrepreneurId;
  name: string;
  image: string;
  description: string;
};
