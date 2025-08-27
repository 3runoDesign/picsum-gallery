import { Image } from "@/src/domain/entities/Image";
import { ImageStorageRepository } from "@/src/domain/repositories/imageStorageRepository";

export class ListSavedImagesUseCase {
  constructor(private imageStorageRepo: ImageStorageRepository) {}

  async execute(): Promise<Image[]> {
    return this.imageStorageRepo.getSavedImages();
  }
}
