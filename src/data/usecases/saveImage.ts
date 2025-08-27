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
      // Verifica se a imagem já tem um caminho local
      let localPath = image.localPath;

      if (!localPath) {
        // Verifica se já existe uma versão local da imagem
        const existingLocalPath = await ImageDownloadService.getLocalImagePath(
          image.id
        );

        if (existingLocalPath) {
          localPath = existingLocalPath;
        } else {
          // Baixa a imagem e salva localmente
          console.log(
            `Baixando imagem ${image.id} para armazenamento local...`
          );
          localPath = await ImageDownloadService.downloadAndSaveImage(image);
          console.log(
            `Imagem ${image.id} baixada com sucesso para: ${localPath}`
          );
        }
      }

      // Cria uma cópia da imagem com o caminho local
      const imageWithLocalPath: Image = {
        ...image,
        localPath: localPath,
      };

      // Salva a imagem no repositório
      await this.imageStorageRepo.saveImage(imageWithLocalPath);

      console.log(`Imagem ${image.id} salva com sucesso (local: ${localPath})`);
    } catch (error) {
      console.error(`Erro ao salvar imagem ${image.id}:`, error);

      // Se falhar o download, salva apenas com a URL original
      console.log(`Salvando imagem ${image.id} apenas com URL original...`);
      await this.imageStorageRepo.saveImage(image);

      throw new Error(
        `Erro ao baixar imagem localmente: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }
}
