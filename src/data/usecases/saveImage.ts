import { Image } from "@/src/domain/entities/Image";
import { ImageStorageRepository } from "@/src/domain/repositories/imageStorageRepository";
import { ImageDownloadService } from "@/src/services/imageDownloadService";

export class SaveImageUseCase {
  constructor(private imageStorageRepo: ImageStorageRepository) {}

  async execute(image: Image): Promise<void> {
    if (!image.id || !image.url) {
      throw new Error("Imagem inválida.");
    }

    try {
      let localPath = image.localPath;

      if (!localPath) {
        const existingLocalPath = await ImageDownloadService.getLocalImagePath(
          image.id
        );

        if (existingLocalPath) {
          localPath = existingLocalPath;
        } else {
          localPath = await ImageDownloadService.downloadAndSaveImage(image);
        }
      }

      const imageWithLocalPath: Image = {
        ...image,
        localPath: localPath,
      };

      await this.imageStorageRepo.saveImage(imageWithLocalPath);
    } catch (error) {
      console.error(`Erro ao salvar imagem ${image.id}:`, error);
      await this.imageStorageRepo.saveImage(image);

      throw new Error(
        `Erro ao baixar imagem localmente: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }
}
