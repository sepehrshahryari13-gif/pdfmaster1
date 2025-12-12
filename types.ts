export interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

export enum ToolType {
  MERGE = 'MERGE',
  COMPRESS = 'COMPRESS',
  IMAGES_TO_PDF = 'IMAGES_TO_PDF'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}