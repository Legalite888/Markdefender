
export type Jurisdiction = 'USA' | 'EU' | 'UK' | 'China' | 'Japan' | 'International (Madrid)';

export interface TrademarkSearch {
  name: string;
  industry: string;
  logo?: string;
  jurisdictions: Jurisdiction[];
}

export interface NiceClass {
  classNumber: number;
  description: string;
}

export interface FilingRecommendation {
  viability: 'High' | 'Medium' | 'Low';
  reasoning: string;
  suggestedClasses: NiceClass[];
  nextSteps: string[];
  groundingSources?: any[];
}

export type TabType = 'landing' | 'dashboard' | 'search' | 'analyzer' | 'filing' | 'consultant' | 'chat' | 'takedown';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  status: 'pending' | 'analyzed';
  analysis?: string;
}
