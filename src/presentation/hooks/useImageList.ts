import { useInfiniteQuery } from "@tanstack/react-query";
import { Duration } from "js-duration";
import { AxiosClient } from "../../api/axiosClient";
import { Image } from "../../domain/entities/Image";
import { PicsumImage } from "../../domain/entities/PicsumImage";

export const useImageList = () => {
  return useInfiniteQuery({
    queryKey: ["image-list"],
    queryFn: async ({ pageParam = 1 }): Promise<Image[]> => {
      const httpClient = new AxiosClient("https://picsum.photos");
      const response = await httpClient.get<PicsumImage[]>(
        `/v2/list?page=${pageParam}&limit=10`
      );

      return response.map((picsumImage: PicsumImage) => ({
        id: picsumImage.id,
        url: picsumImage.download_url,
        author: picsumImage.author,
        width: picsumImage.width,
        height: picsumImage.height,
        isSaved: false, // Será determinado pelo estado local na galeria
      }));
    },
    getNextPageParam: (lastPage, allPages) => {
      // Se a última página tem menos de 10 itens, não há mais páginas
      if (lastPage.length < 10) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: Duration.of({ minutes: 5 }).inMilliseconds,
    initialPageParam: 1,
  });
};
