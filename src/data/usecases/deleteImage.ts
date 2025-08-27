import { ImageStorageRepository } from "@/src/domain/repositories/imageStorageRepository";

export class DeleteImageUseCase {
  constructor(private imageStorageRepo: ImageStorageRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID da imagem é necessário.");
    }
    await this.imageStorageRepo.deleteImage(id);
  }
}
