// Shared entity shapes. Future modules (spinning, weaving, garments…)
// reuse these exact types — only the data files grow.

export type Category =
  | 'production'
  | 'laboratory'
  | 'quality'
  | 'engineering'
  | 'downstream'
  | 'entry';

export type FlowType = 'material' | 'info' | 'support' | 'feedback';

export interface NodePos {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Department {
  id: string;
  name: string;
  short: string;
  cat: Category;
  icon: string;
  pos: NodePos;
  central?: boolean;
  decision?: boolean;
  beginner: string;
  pro: string;
  inputs: string[];
  outputs: string[];
  responsibilities: string[];
  processes: string[];
  equipment: string[];
  params: string[];
  problems: string[];
}

export interface Connection {
  from: string;
  to: string;
  type: FlowType;
  label: string;
  what: string[];
  why: string;
  next: string;
}

export interface Workflow {
  title: string;
  steps: [string, string][];
  meta: string;
}

export interface BatchStage {
  dept: string;
  title: string;
  status: string;
  info: string;
  date: string;
}

export interface Batch {
  order: string;
  fabric: string;
  colour: string;
  machine: string;
  recipe: string;
  stages: BatchStage[];
  trace: [string, string][];
}

export type Mode = 'beginner' | 'pro';
