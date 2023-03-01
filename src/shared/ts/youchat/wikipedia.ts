export interface WikipediaAppDatum {
  title: string;
  url: string;
  intro: string;
  intro_image: any[];
  paragraph: Paragraph[];
}

interface Paragraph {
  image: string[];
  index: number;
  title: string;
  content: string;
}
