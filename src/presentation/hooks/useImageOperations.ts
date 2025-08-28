/**
 * Hook para operações de imagem usando Redux
 *
 * Este hook substitui o useImageQueries.ts e fornece
 * todas as operações de imagem através do Redux.
 */

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  clearError,
  clearGalleryError,
  deleteImage,
  fetchAndSaveRandomImage,
  fetchRandomImage,
  loadSavedImages,
  resetGalleryState,
  saveImage,
  clearAllImages,
} from "../../redux/reducers/imageReducer";

export const useImageOperations = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados do Redux
  const {
    savedImages,
    randomImage,
    loading,
    savingImage,
    deletingImage,
    clearingAllImages,
    fetchingRandomImage,
    fetchingAndSaving,
    error,
    galleryError,
  } = useSelector((state: RootState) => state.images);

  // Carrega imagens salvas quando o hook é montado
  useEffect(() => {
    dispatch(loadSavedImages());
  }, [dispatch]);

  // Função para recarregar imagens salvas
  const refreshSavedImages = useCallback(() => {
    dispatch(loadSavedImages());
  }, [dispatch]);

  // Função para buscar nova imagem aleatória
  const refreshRandomImage = useCallback(() => {
    dispatch(fetchRandomImage());
  }, [dispatch]);

  // Função para salvar uma imagem
  const saveImageHandler = useCallback(
    async (image: any) => {
      try {
        await dispatch(saveImage(image)).unwrap();
      } catch (error) {
        console.error("Erro ao salvar imagem:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Função para deletar uma imagem
  const deleteImageHandler = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteImage(id)).unwrap();
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Função para limpar todas as imagens
  const clearAllImagesHandler = useCallback(async () => {
    try {
      await dispatch(clearAllImages()).unwrap();
    } catch (error) {
      console.error("Erro ao limpar todas as imagens:", error);
      throw error;
    }
  }, [dispatch]);

  // Função para buscar e salvar uma imagem aleatória
  const fetchAndSaveRandomImageHandler = useCallback(async () => {
    try {
      console.log("Iniciando busca e salvamento de imagem aleatória...");
      const result = await dispatch(fetchAndSaveRandomImage()).unwrap();
      console.log("Imagem buscada e salva com sucesso:", result);
    } catch (error) {
      console.error("Erro ao buscar e salvar imagem aleatória:", error);
      throw error;
    }
  }, [dispatch]);

  // Função para limpar erros
  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearGalleryErrorHandler = useCallback(() => {
    dispatch(clearGalleryError());
  }, [dispatch]);

  // Função para resetar estado da galeria
  const resetGalleryStateHandler = useCallback(() => {
    dispatch(resetGalleryState());
  }, [dispatch]);

  return {
    // Estados das imagens
    savedImages: savedImages || [],
    randomImage,

    // Estados de loading
    loadingSavedImages: loading === 'pending',
    loadingRandomImage: fetchingRandomImage,
    savingImage,
    deletingImage,
    clearingAllImages,
    fetchingAndSaving,

    // Estados de erro
    savedImagesError: error,
    randomImageError: error,
    saveImageError: error,
    deleteImageError: error,
    fetchAndSaveError: error,
    galleryError,

    // Ações
    refreshSavedImages,
    refreshRandomImage,
    saveImage: saveImageHandler,
    deleteImage: deleteImageHandler,
    clearAllImages: clearAllImagesHandler,
    fetchAndSaveRandomImage: fetchAndSaveRandomImageHandler,
    clearError: clearErrorHandler,
    clearGalleryError: clearGalleryErrorHandler,
    resetGalleryState: resetGalleryStateHandler,
  };
};
