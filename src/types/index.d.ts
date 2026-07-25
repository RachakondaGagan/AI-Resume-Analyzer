interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
}

interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: { type: 'good' | 'improve'; tip: string }[];
  };
  toneAndStyle: {
    score: number;
    tips: { type: 'good' | 'improve'; tip: string; explanation: string }[];
  };
  content: {
    score: number;
    tips: { type: 'good' | 'improve'; tip: string; explanation: string }[];
  };
  structure: {
    score: number;
    tips: { type: 'good' | 'improve'; tip: string; explanation: string }[];
  };
  skills: {
    score: number;
    tips: { type: 'good' | 'improve'; tip: string; explanation: string }[];
  };
}

interface FSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  size: number | null;
}

interface PuterUser {
  uuid: string;
  username: string;
}

interface KVItem {
  key: string;
  value: string;
}
