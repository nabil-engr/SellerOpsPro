export type ToolKind = 'calculator' | 'audit' | 'image';
export interface ToolField {
  id: string;
  label: string;
  type: 'number' | 'text';
  defaultValue: number | string;
  prefix?: string;
  suffix?: string;
  min?: number;
  step?: string;
}
export interface FaqItem {
  question: string;
  answer: string;
}
export interface ToolDefinition {
  slug: string;
  name: string;
  category: string;
  description: string;
  fields: ToolField[];
  formula: string;
  example: string;
  faqs: FaqItem[];
  keywords: string[];
  kind: ToolKind;
  affiliate: 'ecommerce' | 'hosting' | 'pod' | 'email';
}
export interface ToolCategory {
  slug: string;
  name: string;
  description: string;
}
export interface ResultMetric {
  label: string;
  value: string;
}
export interface CalculatorResult {
  headline: string;
  primaryCopy?: string;
  metrics: ResultMetric[];
  note?: string;
}
