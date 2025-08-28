export interface Image {
  id: string;
  url: string;
  author: string;
  width: number;
  height: number;
  localPath?: string;
  isSaved?: boolean;
}
