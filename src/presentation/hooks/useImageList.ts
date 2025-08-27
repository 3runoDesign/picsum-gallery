import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Duration } from "js-duration";
import { AxiosClient } from "../../api/axiosClient";
import { useDependencies } from "../../core/dependenciesContext";
import { Image } from "../../domain/entities/Image";
import { PicsumImage } from "../../domain/entities/PicsumImage";

export const useImageList = () => {
  const { listUseCase } = useDependencies();

  // Busca imagens salvas para verificar quais já foram salvas
  const { data: savedImages = [], isLoading: loadingSavedImages } = useQuery({
    queryKey: ["saved-images"],
    queryFn: async () => {
      return await listUseCase.execute();
    },
    staleTime: Duration.of({ minutes: 2 }).inMilliseconds,
  });

  return useInfiniteQuery({
    queryKey: ["image-list"], // Não inclui savedImages para evitar refetch desnecessário
    queryFn: async ({ pageParam = 1 }): Promise<Image[]> => {
      const httpClient = new AxiosClient("https://picsum.photos");
      const response = await httpClient.get<PicsumImage[]>(
        `/v2/list?page=${pageParam}&limit=10`
      );

      return response.map((picsumImage: PicsumImage) => {
        const isSaved = savedImages.some(
          (saved) => saved.id === picsumImage.id
        );
        return {
          id: picsumImage.id,
          url: picsumImage.download_url,
          author: picsumImage.author,
          width: picsumImage.width,
          height: picsumImage.height,
          isSaved,
        };
      });
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
    enabled: !loadingSavedImages, // Só habilita quando as imagens salvas foram carregadas
  });
};
