/**
 * Hook para lista de imagens da galeria usando Redux
 *
 * Este hook substitui o useImageList.ts e fornece
 * a funcionalidade de paginação através do Redux.
 */

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchGalleryImages, resetGalleryState } from "../../redux/reducers/imageReducer";

export const useImageList = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados do Redux
  const {
    galleryImages,
    galleryPage,
    galleryHasMore,
    status,
    errors,
  } = useSelector((state: RootState) => state.images);

  // Carrega a primeira página apenas se não houver dados existentes
  useEffect(() => {
    if (galleryImages.length === 0 && status.gallery === 'idle') {
      dispatch(fetchGalleryImages());
    }
  }, [dispatch, galleryImages.length, status.gallery]);

  // Função para buscar a próxima página
  const fetchNextPage = useCallback(() => {
    if (galleryHasMore && status.gallery !== 'pending') {
      dispatch(fetchGalleryImages());
    }
  }, [dispatch, galleryHasMore, status.gallery]);

  // Função para recarregar a primeira página
  const refetch = useCallback(() => {
    // Reset do estado da galeria para começar da primeira página
    dispatch(resetGalleryState());
    // Pequeno delay para garantir que o reset seja aplicado antes da busca
    setTimeout(() => {
      dispatch(fetchGalleryImages());
    }, 100);
  }, [dispatch]);

  // Estados computados para compatibilidade com a interface anterior
  const isLoading = status.gallery === 'pending' && galleryPage === 1;
  const isFetchingNextPage = status.gallery === 'pending' && galleryPage > 1;
  const hasNextPage = galleryHasMore;
  const error = errors.gallery;

  // Flatten das imagens (mantém compatibilidade com a interface anterior)
  const data = {
    pages: [galleryImages],
  };

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
