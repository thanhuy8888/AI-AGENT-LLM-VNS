
export type DepartmentType = 'HR' | 'FINANCE' | 'IT' | 'LEGAL' | 'GENERAL';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AgentDocument {
  id: string;
  title: string;
  content: string;
  lastUpdated: Date;
}

export interface Agent {
  id: string;
  name: string;
  type: DepartmentType;
  documents: AgentDocument[];
  messages: Message[];
  suggestions: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING_DOC = 'LOADING_DOC',
  ANALYZING = 'ANALYZING',
  READY = 'READY'
}
