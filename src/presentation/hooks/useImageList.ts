/**
 * Hook para lista de imagens da galeria usando Redux
 *
 * Este hook substitui o useImageList.ts e fornece
 * a funcionalidade de paginação através do Redux.
 */

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchGalleryImages } from "../../redux/reducers/imageReducer";

export const useImageList = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados do Redux
  const {
    galleryImages,
    galleryPage,
    galleryHasMore,
    galleryLoading,
    galleryError,
  } = useSelector((state: RootState) => state.images);

  // Carrega a primeira página apenas se não houver dados existentes
  useEffect(() => {
    if (galleryImages.length === 0 && galleryLoading === 'idle') {
      dispatch(fetchGalleryImages(1));
    }
  }, [dispatch, galleryImages.length, galleryLoading]);

  // Função para buscar a próxima página
  const fetchNextPage = useCallback(() => {
    if (galleryHasMore && galleryLoading !== 'pending') {
      dispatch(fetchGalleryImages(galleryPage + 1));
    }
  }, [dispatch, galleryHasMore, galleryLoading, galleryPage]);

  // Função para recarregar a primeira página
  const refetch = useCallback(() => {
    dispatch(fetchGalleryImages(1));
  }, [dispatch]);

  // Estados computados para compatibilidade com a interface anterior
  const isLoading = galleryLoading === 'pending' && galleryPage === 1;
  const isFetchingNextPage = galleryLoading === 'pending' && galleryPage > 1;
  const hasNextPage = galleryHasMore;
  const error = galleryError;

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
