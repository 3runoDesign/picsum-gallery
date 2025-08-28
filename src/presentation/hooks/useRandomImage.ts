/**
 * Hook para buscar imagens aleatórias usando TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { Duration } from "js-duration";
import { AxiosClient } from "../../api/axiosClient";
import { Image } from "../../domain/entities/Image";
import { ImageService } from "../../services/imageService";

const fetchRandomImage = async (): Promise<Image> => {
  const httpClient = new AxiosClient("https://picsum.photos");
  const imageService = new ImageService(httpClient, null as any);
  return await imageService.fetchRandomImage();
};

export const useRandomImage = () => {
  const {
    data: randomImage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["random-image"],
    queryFn: fetchRandomImage,
    staleTime: 0,
    gcTime: Duration.of({ minutes: 5 }).inMilliseconds,
    enabled: false,
  });

  return {
    randomImage,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};
