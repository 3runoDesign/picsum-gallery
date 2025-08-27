/**
 * Hooks Específicos para Imagens usando TanStack Query
 *
 * Este arquivo contém hooks especializados para operações com imagens,
 * utilizando o TanStack Query para gerenciamento de estado assíncrono.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Duration } from "js-duration";
import { useCallback } from "react";
import { AxiosClient } from "../../api/axiosClient";
import { useDependencies } from "../../core/dependenciesContext";
import { Image } from "../../domain/entities/Image";
import { ImageService } from "../../services/imageService";

/**
 * Hook para buscar imagens salvas
 */
export const useSavedImages = () => {
  const { listUseCase } = useDependencies();

  return useQuery({
    queryKey: ["saved-images"],
    queryFn: async () => {
      return await listUseCase.execute();
    },
    staleTime: Duration.of({ minutes: 2 }).inMilliseconds,
  });
};

/**
 * Hook para buscar uma imagem aleatória
 */
export const useRandomImage = () => {
  return useQuery({
    queryKey: ["random-image"],
    queryFn: async (): Promise<Image> => {
      const httpClient = new AxiosClient("https://picsum.photos");
      const imageService = new ImageService(httpClient, null as any);
      return await imageService.fetchRandomImage();
    },
    staleTime: 0, // Sempre considera stale para forçar nova busca
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para salvar uma imagem
 */
export const useSaveImage = () => {
  const { saveUseCase } = useDependencies();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: Image) => {
      await saveUseCase.execute(image);
      return image;
    },
    onSuccess: (image) => {
      console.log(`Imagem ${image.id} salva com sucesso!`);
      // Apenas invalida a lista de imagens salvas para sincronizar com o servidor
      queryClient.invalidateQueries({ queryKey: ["saved-images"] });
    },
    onError: (error) => {
      console.error("Erro ao salvar imagem:", error);
    },
  });
};

/**
 * Hook para deletar uma imagem
 */
export const useDeleteImage = () => {
  const { deleteUseCase } = useDependencies();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteUseCase.execute(id);
      return id;
    },
    onSuccess: (id) => {
      console.log(`Imagem ${id} deletada com sucesso!`);
      // Invalida ambas as queries para atualizar o estado após sucesso real
      queryClient.invalidateQueries({ queryKey: ["saved-images"] });
      queryClient.invalidateQueries({ queryKey: ["image-list"] });
    },
    onError: (error) => {
      console.error("Erro ao deletar imagem:", error);
    },
  });
};

/**
 * Hook para limpar todas as imagens salvas
 */
export const useClearAllImages = () => {
  const { clearAllUseCase } = useDependencies();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await clearAllUseCase.execute();
    },
    onSuccess: () => {
      console.log("Todas as imagens foram removidas com sucesso!");
      // Invalida ambas as queries para atualizar o estado após sucesso real
      queryClient.invalidateQueries({ queryKey: ["saved-images"] });
      queryClient.invalidateQueries({ queryKey: ["image-list"] });
    },
    onError: (error) => {
      console.error("Erro ao limpar todas as imagens:", error);
    },
  });
};

/**
 * Hook para buscar e salvar uma imagem aleatória
 */
export const useFetchAndSaveRandomImage = () => {
  const { saveUseCase } = useDependencies();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Image> => {
      console.log("Iniciando fetch de imagem aleatória...");
      const httpClient = new AxiosClient("https://picsum.photos");
      const imageService = new ImageService(httpClient, null as any);

      console.log("Buscando imagem aleatória...");
      const randomImage = await imageService.fetchRandomImage();
      console.log("Imagem aleatória obtida:", randomImage);

      // randomImage já é do tipo Image, então não precisa converter
      const image: Image = {
        id: randomImage.id,
        url: randomImage.url,
        author: randomImage.author,
        width: randomImage.width,
        height: randomImage.height,
      };

      console.log("Salvando imagem...");
      await saveUseCase.execute(image);
      console.log("Imagem salva com sucesso!");
      return image;
    },
    onSuccess: (image) => {
      console.log(`Imagem aleatória ${image.id} buscada e salva com sucesso!`);
      // Invalida ambas as queries para atualizar o estado após sucesso real
      queryClient.invalidateQueries({ queryKey: ["saved-images"] });
      queryClient.invalidateQueries({ queryKey: ["image-list"] });
    },
    onError: (error) => {
      console.error("Erro ao buscar e salvar imagem aleatória:", error);
    },
  });
};

/**
 * Hook combinado que fornece todas as operações de imagem
 *
 * Este hook atua como um "gerente de operações" que combina
 * queries e mutations em uma interface unificada.
 */
export const useImageOperations = () => {
  const savedImagesQuery = useSavedImages();
  const randomImageQuery = useRandomImage();
  const saveImageMutation = useSaveImage();
  const deleteImageMutation = useDeleteImage();
  const clearAllImagesMutation = useClearAllImages();
  const fetchAndSaveRandomImageMutation = useFetchAndSaveRandomImage();

  // Função para recarregar imagens salvas
  const refreshSavedImages = useCallback(() => {
    savedImagesQuery.refetch();
  }, [savedImagesQuery]);

  // Função para buscar nova imagem aleatória
  const refreshRandomImage = useCallback(() => {
    randomImageQuery.refetch();
  }, [randomImageQuery]);

  // Função para salvar uma imagem
  const saveImage = useCallback(
    async (image: Image) => {
      try {
        await saveImageMutation.mutateAsync(image);
      } catch (error) {
        console.error("Erro ao salvar imagem:", error);
      }
    },
    [saveImageMutation]
  );

  // Função para deletar uma imagem
  const deleteImage = useCallback(
    async (id: string) => {
      try {
        await deleteImageMutation.mutateAsync(id);
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
      }
    },
    [deleteImageMutation]
  );

  // Função para limpar todas as imagens
  const clearAllImages = useCallback(async () => {
    try {
      await clearAllImagesMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao limpar todas as imagens:", error);
    }
  }, [clearAllImagesMutation]);

  // Função para buscar e salvar uma imagem aleatória
  const fetchAndSaveRandomImage = useCallback(async () => {
    try {
      console.log("Iniciando busca e salvamento de imagem aleatória...");
      const result = await fetchAndSaveRandomImageMutation.mutateAsync();
      console.log("Imagem buscada e salva com sucesso:", result);
    } catch (error) {
      console.error("Erro ao buscar e salvar imagem aleatória:", error);
    }
  }, [fetchAndSaveRandomImageMutation]);

  return {
    // Estados das queries
    savedImages: savedImagesQuery.data || [],
    randomImage: randomImageQuery.data,

    // Estados de loading
    loadingSavedImages: savedImagesQuery.isLoading,
    loadingRandomImage:
      randomImageQuery.isLoading || randomImageQuery.isFetching,
    savingImage: saveImageMutation.isPending,
    deletingImage: deleteImageMutation.isPending,
    clearingAllImages: clearAllImagesMutation.isPending,
    fetchingAndSaving: fetchAndSaveRandomImageMutation.isPending,

    // ID da imagem sendo salva (para controle individual)
    savingImageId: saveImageMutation.variables?.id,

    // Estados de erro
    savedImagesError: savedImagesQuery.error,
    randomImageError: randomImageQuery.error,
    saveImageError: saveImageMutation.error,
    deleteImageError: deleteImageMutation.error,
    fetchAndSaveError: fetchAndSaveRandomImageMutation.error,

    // Ações
    refreshSavedImages,
    refreshRandomImage,
    saveImage,
    deleteImage,
    clearAllImages,
    fetchAndSaveRandomImage,

    // Funções de refetch
    refetchSavedImages: savedImagesQuery.refetch,
    refetchRandomImage: randomImageQuery.refetch,
  };
};
