import { Image } from "../entities/Image";

export interface ImageStorageRepository {
  saveImage(image: Image): Promise<void>;
  deleteImage(id: string): Promise<void>;
  getSavedImages(): Promise<Image[]>;
  clearAllImages(): Promise<void>;
}
