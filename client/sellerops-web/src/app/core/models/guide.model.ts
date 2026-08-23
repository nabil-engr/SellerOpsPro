export interface GuideSection {
  heading: string;
  paragraphs: string[];
}
export interface GuideDefinition {
  slug: string;
  title: string;
  description: string;
  category: string;
  sections: GuideSection[];
  related: string[];
}
