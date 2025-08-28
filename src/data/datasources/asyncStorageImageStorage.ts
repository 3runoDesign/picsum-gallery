import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "../../domain/entities/Image";
import { ImageStorageRepository } from "../../domain/repositories/imageStorageRepository";
import { ImageDownloadService } from "../../services/imageDownloadService";

const IMAGES_KEY = "@MyGallery:images";

export class AsyncStorageImageStorage implements ImageStorageRepository {
  async getSavedImages(): Promise<Image[]> {
    const jsonValue = await AsyncStorage.getItem(IMAGES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  }

  async saveImage(image: Image): Promise<void> {
    const currentImages = await this.getSavedImages();

    const existingImageIndex = currentImages.findIndex(
      (img) => img.id === image.id
    );

    if (existingImageIndex >= 0) {
      currentImages[existingImageIndex] = image;
    } else {
      currentImages.push(image);
    }

    await AsyncStorage.setItem(IMAGES_KEY, JSON.stringify(currentImages));
  }

  async deleteImage(id: string): Promise<void> {
    const currentImages = await this.getSavedImages();
    const imageToDelete = currentImages.find((img) => img.id === id);

    if (imageToDelete?.localPath) {
      try {
        await ImageDownloadService.deleteLocalImage(imageToDelete.localPath);
      } catch (error) {
        console.error(`Erro ao remover imagem local para ${id}:`, error);
      }
    }

    const newImages = currentImages.filter((img) => img.id !== id);
    await AsyncStorage.setItem(IMAGES_KEY, JSON.stringify(newImages));
  }

  async clearAllImages(): Promise<void> {
    const currentImages = await this.getSavedImages();

    for (const image of currentImages) {
      if (image.localPath) {
        try {
          await ImageDownloadService.deleteLocalImage(image.localPath);
        } catch (error) {
          console.error(
            `Erro ao remover imagem local para ${image.id}:`,
            error
          );
        }
      }
    }

    await AsyncStorage.removeItem(IMAGES_KEY);
  }
}
