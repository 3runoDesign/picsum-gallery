/**
 * Hook para lista de imagens da galeria usando TanStack Query
 *
 * Este hook utiliza useInfiniteQuery para gerenciar a paginação
 * e o ciclo de vida dos dados da API da Picsum.
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import { Duration } from "js-duration";
import { AxiosClient } from "../../api/axiosClient";
import { Image } from "../../domain/entities/Image";
import { PicsumImage } from "../../domain/entities/PicsumImage";

// Função para buscar imagens da API
const fetchGalleryImages = async ({ pageParam = 1 }: { pageParam: number }) => {
  const httpClient = new AxiosClient("https://picsum.photos");
  const response = await httpClient.get<PicsumImage[]>(
    `/v2/list?page=${pageParam}&limit=10`
  );

  const images: Image[] = response.map((picsumImage: PicsumImage) => ({
    id: picsumImage.id,
    url: picsumImage.download_url,
    author: picsumImage.author,
    width: picsumImage.width,
    height: picsumImage.height,
    isSaved: false,
  }));

  return {
    images,
    nextPage: response.length === 10 ? pageParam + 1 : undefined,
    hasMore: response.length === 10,
  };
};

export const useImageList = () => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["image-list"],
    queryFn: fetchGalleryImages,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: Duration.of({ minutes: 5 }).inMilliseconds,
    gcTime: Duration.of({ minutes: 10 }).inMilliseconds,
  });

  // Flatten das imagens de todas as páginas
  const allImages = data?.pages.flatMap((page) => page.images) ?? [];

  return {
    data: {
      pages: data?.pages ?? [],
    },
    allImages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  };
};
