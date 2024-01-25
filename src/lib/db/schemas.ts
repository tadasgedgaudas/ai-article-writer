export interface Article {
  website: string;
  keyword: string;
  niche: string;
  isFinished: boolean;
  taskId: string;
  words: number;
  article: string;
  imageUrl: string | null;
  date: Date;
}

export interface Task {
  taskId: string;
  website: string;
  niche: string;
  keyword: string;
}

export interface ArticleData {
  website: string;
  niche: string;
  keyword: string;
  taskId: string;
}

export interface TaskData {
  niche: string;
  keyword: string;
  title: string;
  paragraph: string;
}
