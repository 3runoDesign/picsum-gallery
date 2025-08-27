export interface Image {
  id: string;
  url: string;
  author: string;
  width: number;
  height: number;
  localPath?: string; // Caminho local da imagem salva no dispositivo
  isSaved?: boolean; // Indica se a imagem já foi salva
}
