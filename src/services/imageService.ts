import { HttpClient } from "../api/httpClient";
import { Image } from "../domain/entities/Image";
import { PicsumImage } from "../domain/entities/PicsumImage";
import { ImageStorageRepository } from "../domain/repositories/imageStorageRepository";

export class ImageService {
  constructor(
    private apiClient: HttpClient,
    private storage: ImageStorageRepository
  ) {}

  async fetchRandomImage(): Promise<Image> {
    // Gera um número aleatório para a página (1-100) para obter imagens diferentes
    const randomPage = Math.floor(Math.random() * 100) + 1;
    console.log(`Buscando imagem na página ${randomPage}...`);

    const images = await this.apiClient.get<PicsumImage[]>(
      `/v2/list?page=${randomPage}&limit=1`
    );

    console.log("Resposta da API:", images);

    if (!images || images.length === 0) {
      throw new Error("Nenhuma imagem encontrada.");
    }
    const fetchedImage = images[0];
    console.log("Imagem obtida:", fetchedImage);

    const result = {
      id: fetchedImage.id,
      url: fetchedImage.download_url,
      author: fetchedImage.author,
      width: fetchedImage.width,
      height: fetchedImage.height,
    };

    console.log("Imagem convertida:", result);
    return result;
  }

  async fetchAndSaveRandomImage(): Promise<Image> {
    const image = await this.fetchRandomImage();
    await this.storage.saveImage(image);
    return image;
  }
}
