/**
 * Hook orquestrador para operações de imagem
 *
 * Este hook combina TanStack Query (dados da API) e Redux (imagens salvas)
 * fornecendo uma interface unificada para a UI.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "../../domain/entities/Image";
import {
  clearAllImages,
  clearError,
  deleteImage,
  loadSavedImages,
  saveImage,
} from "../../redux/reducers/imageReducer";
import { AppDispatch, RootState } from "../../redux/store";

export const useImageOperations = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  // Estados do Redux (apenas imagens salvas)
  const { savedImages, status, errors } = useSelector(
    (state: RootState) => state.images
  );

  // Mutation para salvar imagem
  const saveImageMutation = useMutation({
    mutationFn: async (image: Image) => {
      const result = await dispatch(saveImage(image)).unwrap();
      return result;
    },
    onSuccess: () => {
      // Invalida a query da lista de imagens para refletir o novo status
      queryClient.invalidateQueries({ queryKey: ["image-list"] });
    },
  });

  // Mutation para deletar imagem
  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await dispatch(deleteImage(id)).unwrap();
      return result;
    },
    onSuccess: () => {
      // Invalida a query da lista de imagens para refletir o novo status
      queryClient.invalidateQueries({ queryKey: ["image-list"] });
    },
  });

  // Mutation para limpar todas as imagens
  const clearAllImagesMutation = useMutation({
    mutationFn: async () => {
      const result = await dispatch(clearAllImages()).unwrap();
      return result;
    },
    onSuccess: () => {
      // Invalida a query da lista de imagens para refletir o novo status
      queryClient.invalidateQueries({ queryKey: ["image-list"] });
    },
  });

  // Função para recarregar imagens salvas
  const refreshSavedImages = useCallback(() => {
    dispatch(loadSavedImages());
  }, [dispatch]);

  // Função para salvar uma imagem
  const saveImageHandler = useCallback(
    async (image: Image) => {
      try {
        await saveImageMutation.mutateAsync(image);
      } catch (error) {
        console.error("Erro ao salvar imagem:", error);
        throw error;
      }
    },
    [saveImageMutation]
  );

  // Função para deletar uma imagem
  const deleteImageHandler = useCallback(
    async (id: string) => {
      try {
        await deleteImageMutation.mutateAsync(id);
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
        throw error;
      }
    },
    [deleteImageMutation]
  );

  // Função para limpar todas as imagens
  const clearAllImagesHandler = useCallback(async () => {
    try {
      await clearAllImagesMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao limpar todas as imagens:", error);
      throw error;
    }
  }, [clearAllImagesMutation]);

  // Função para limpar erros específicos
  const clearErrorHandler = useCallback(
    (errorType: keyof typeof errors) => {
      dispatch(clearError(errorType));
    },
    [dispatch]
  );

  // Função para resetar estado de uma operação específica
  const resetOperationStatusHandler = useCallback(
    (operation: keyof typeof status) => {
      // Esta função pode ser implementada se necessário
      console.log(`Reset operation status: ${operation}`);
    },
    []
  );

  return {
    // Estados das imagens salvas (Redux)
    savedImages: savedImages || [],

    // Estados de loading granulares (Redux)
    loadingSavedImages: status.saved === "pending",
    savingImage: saveImageMutation.isPending,
    deletingImage: deleteImageMutation.isPending,
    clearingAllImages: clearAllImagesMutation.isPending,

    // Estados de erro granulares (Redux)
    savedImagesError: errors.saved,
    saveImageError: errors.save,
    deleteImageError: errors.delete,
    clearAllImagesError: errors.clearAll,

    // Ações
    refreshSavedImages,
    saveImage: saveImageHandler,
    deleteImage: deleteImageHandler,
    clearAllImages: clearAllImagesHandler,
    clearError: clearErrorHandler,
    resetOperationStatus: resetOperationStatusHandler,
  };
};
