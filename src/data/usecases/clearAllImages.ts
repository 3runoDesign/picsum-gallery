import { ImageStorageRepository } from "@/src/domain/repositories/imageStorageRepository";

export class ClearAllImagesUseCase {
  constructor(private imageStorageRepo: ImageStorageRepository) {}

  async execute(): Promise<void> {
    await this.imageStorageRepo.clearAllImages();
  }
}
