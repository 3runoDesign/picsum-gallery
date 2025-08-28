import * as FileSystem from "expo-file-system";
import { Image } from "../domain/entities/Image";

export class ImageDownloadService {
  private static readonly IMAGES_DIR = `${FileSystem.documentDirectory}images/`;

  /**
   * Cria o diretório de imagens se não existir
   */
  private static async ensureImagesDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.IMAGES_DIR, {
        intermediates: true,
      });
    }
  }

  /**
   * Baixa uma imagem da URL e salva localmente
   * @param image - A imagem a ser baixada
   * @returns O caminho local da imagem salva
   */
  static async downloadAndSaveImage(image: Image): Promise<string> {
    try {
      await this.ensureImagesDirectory();

      const fileExtension = this.getFileExtension(image.url);
      const fileName = `${image.id}${fileExtension}`;
      const localPath = `${this.IMAGES_DIR}${fileName}`;

      const downloadResult = await FileSystem.downloadAsync(
        image.url,
        localPath
      );

      if (downloadResult.status === 200) {
        return downloadResult.uri;
      } else {
        throw new Error(
          `Falha ao baixar imagem. Status: ${downloadResult.status}`
        );
      }
    } catch (error) {
      throw new Error(
        `Erro ao baixar imagem: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  /**
   * Verifica se uma imagem já foi baixada localmente
   * @param imageId - ID da imagem
   * @returns O caminho local se existir, null caso contrário
   */
  static async getLocalImagePath(imageId: string): Promise<string | null> {
    try {
      await this.ensureImagesDirectory();

      const files = await FileSystem.readDirectoryAsync(this.IMAGES_DIR);

      const matchingFile = files.find((file) => file.startsWith(imageId));

      if (matchingFile) {
        return `${this.IMAGES_DIR}${matchingFile}`;
      }

      return null;
    } catch (error) {
      console.error(`Erro ao verificar imagem local ${imageId}:`, error);
      return null;
    }
  }

  /**
   * Remove uma imagem local
   * @param localPath - Caminho local da imagem
   */
  static async deleteLocalImage(localPath: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localPath);
      }
    } catch (error) {
      console.error(`Erro ao remover imagem local ${localPath}:`, error);
      throw error;
    }
  }

  /**
   * Obtém a extensão do arquivo baseada na URL
   * @param url - URL da imagem
   * @returns Extensão do arquivo (ex: .jpg, .png)
   */
  private static getFileExtension(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const extension = pathname.split(".").pop();

      return extension &&
        ["jpg", "jpeg", "png", "gif", "webp"].includes(extension.toLowerCase())
        ? `.${extension.toLowerCase()}`
        : ".jpg";
    } catch {
      return ".jpg";
    }
  }

  /**
   * Limpa todas as imagens locais (útil para limpeza de cache)
   */
  static async clearAllLocalImages(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.IMAGES_DIR);
      }
    } catch (error) {
      console.error("Erro ao limpar imagens locais:", error);
      throw error;
    }
  }
}
