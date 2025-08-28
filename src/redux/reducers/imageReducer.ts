import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosClient } from "../../api/axiosClient";
import { ClearAllImagesUseCase } from "../../data/usecases/clearAllImages";
import { DeleteImageUseCase } from "../../data/usecases/deleteImage";
import { ListSavedImagesUseCase } from "../../data/usecases/listImages";
import { SaveImageUseCase } from "../../data/usecases/saveImage";
import { Image } from "../../domain/entities/Image";
import { PicsumImage } from "../../domain/entities/PicsumImage";
import { ImageService } from "../../services/imageService";

interface ImageState {
  // Estado das imagens salvas
  savedImages: Image[];
  
  // Estado da galeria
  galleryImages: Image[];
  galleryPage: number;
  galleryHasMore: boolean;
  
  // Estados de loading mais descritivos
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  galleryLoading: 'idle' | 'pending' | 'succeeded' | 'failed';
  savingImage: boolean;
  deletingImage: boolean;
  clearingAllImages: boolean;
  fetchingRandomImage: boolean;
  fetchingAndSaving: boolean;
  
  // Estados de erro
  error: string | null;
  galleryError: string | null;
  
  // Imagem aleatória atual
  randomImage: Image | null;
}

const initialState: ImageState = {
  savedImages: [],
  galleryImages: [],
  galleryPage: 1,
  galleryHasMore: true,
  loading: 'idle',
  galleryLoading: 'idle',
  savingImage: false,
  deletingImage: false,
  clearingAllImages: false,
  fetchingRandomImage: false,
  fetchingAndSaving: false,
  error: null,
  galleryError: null,
  randomImage: null,
};

// Thunk para carregar imagens salvas
export const loadSavedImages = createAsyncThunk(
  "images/loadSavedImages",
  async (_, { extra }) => {
    const { listUseCase } = extra as {
      listUseCase: ListSavedImagesUseCase;
    };
    return await listUseCase.execute();
  }
);

// Thunk para salvar uma imagem
export const saveImage = createAsyncThunk(
  "images/saveImage",
  async (image: Image, { extra }) => {
    const { saveUseCase } = extra as {
      saveUseCase: SaveImageUseCase;
    };
    await saveUseCase.execute(image);
    return image;
  }
);

// Thunk para deletar uma imagem
export const deleteImage = createAsyncThunk(
  "images/deleteImage",
  async (id: string, { extra }) => {
    const { deleteUseCase } = extra as {
      deleteUseCase: DeleteImageUseCase;
    };
    await deleteUseCase.execute(id);
    return id;
  }
);

// Thunk para buscar uma imagem aleatória
export const fetchRandomImage = createAsyncThunk(
  "images/fetchRandomImage",
  async () => {
    const httpClient = new AxiosClient("https://picsum.photos");
    const imageService = new ImageService(httpClient, null as any);
    return await imageService.fetchRandomImage();
  }
);

// Thunk para buscar e salvar uma imagem aleatória
export const fetchAndSaveRandomImage = createAsyncThunk(
  "images/fetchAndSaveRandomImage",
  async (_, { extra }) => {
    const { saveUseCase } = extra as {
      saveUseCase: SaveImageUseCase;
    };
    const httpClient = new AxiosClient("https://picsum.photos");
    const imageService = new ImageService(httpClient, null as any);
    const image = await imageService.fetchRandomImage();
    await saveUseCase.execute(image);
    return image;
  }
);

// Thunk para buscar imagens da galeria (paginação)
export const fetchGalleryImages = createAsyncThunk(
  "images/fetchGalleryImages",
  async (page: number = 1) => {
    const httpClient = new AxiosClient("https://picsum.photos");
    const response = await httpClient.get<PicsumImage[]>(
      `/v2/list?page=${page}&limit=10`
    );

    return {
      images: response.map((picsumImage: PicsumImage) => ({
        id: picsumImage.id,
        url: picsumImage.download_url,
        author: picsumImage.author,
        width: picsumImage.width,
        height: picsumImage.height,
        isSaved: false,
      })),
      page,
      hasMore: response.length === 10,
    };
  }
);

// Thunk para limpar todas as imagens salvas
export const clearAllImages = createAsyncThunk(
  "images/clearAllImages",
  async (_, { extra }) => {
    const { clearAllUseCase } = extra as {
      clearAllUseCase: ClearAllImagesUseCase;
    };
    await clearAllUseCase.execute();
  }
);

const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearGalleryError(state) {
      state.galleryError = null;
    },
    resetGalleryState(state) {
      state.galleryImages = [];
      state.galleryPage = 1;
      state.galleryHasMore = true;
      state.galleryLoading = 'idle';
      state.galleryError = null;
    },
  },
  extraReducers: (builder) => {
    // Load Saved Images
    builder
      .addCase(loadSavedImages.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(loadSavedImages.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.savedImages = action.payload;
      })
      .addCase(loadSavedImages.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || "Erro ao carregar imagens";
      });

    // Save Image
    builder
      .addCase(saveImage.pending, (state) => {
        state.savingImage = true;
        state.error = null;
      })
      .addCase(saveImage.fulfilled, (state, action) => {
        state.savingImage = false;
        state.savedImages.push(action.payload);
      })
      .addCase(saveImage.rejected, (state, action) => {
        state.savingImage = false;
        state.error = action.error.message || "Erro ao salvar imagem";
      });

    // Delete Image
    builder
      .addCase(deleteImage.pending, (state) => {
        state.deletingImage = true;
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.deletingImage = false;
        state.savedImages = state.savedImages.filter(
          (img) => img.id !== action.payload
        );
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.deletingImage = false;
        state.error = action.error.message || "Erro ao deletar imagem";
      });

    // Fetch Random Image
    builder
      .addCase(fetchRandomImage.pending, (state) => {
        state.fetchingRandomImage = true;
        state.error = null;
      })
      .addCase(fetchRandomImage.fulfilled, (state, action) => {
        state.fetchingRandomImage = false;
        state.randomImage = action.payload;
      })
      .addCase(fetchRandomImage.rejected, (state, action) => {
        state.fetchingRandomImage = false;
        state.error = action.error.message || "Erro ao buscar imagem";
      });

    // Fetch and Save Random Image
    builder
      .addCase(fetchAndSaveRandomImage.pending, (state) => {
        state.fetchingAndSaving = true;
        state.error = null;
      })
      .addCase(fetchAndSaveRandomImage.fulfilled, (state, action) => {
        state.fetchingAndSaving = false;
        state.randomImage = action.payload;
        state.savedImages.push(action.payload);
      })
      .addCase(fetchAndSaveRandomImage.rejected, (state, action) => {
        state.fetchingAndSaving = false;
        state.error = action.error.message || "Erro ao buscar e salvar imagem";
      });

    // Fetch Gallery Images
    builder
      .addCase(fetchGalleryImages.pending, (state, action) => {
        state.galleryLoading = 'pending';
        state.galleryError = null;
        // Se for a primeira página, limpa as imagens existentes
        if (action.meta.arg === 1) {
          state.galleryImages = [];
        }
      })
      .addCase(fetchGalleryImages.fulfilled, (state, action) => {
        state.galleryLoading = 'succeeded';
        const { images, page, hasMore } = action.payload;
        
        if (page === 1) {
          // Primeira página: substitui todas as imagens
          state.galleryImages = images;
        } else {
          // Páginas subsequentes: concatena com as existentes
          state.galleryImages.push(...images);
        }
        
        state.galleryPage = page;
        state.galleryHasMore = hasMore;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.galleryLoading = 'failed';
        state.galleryError = action.error.message || "Erro ao carregar galeria";
      });

    // Clear All Images
    builder
      .addCase(clearAllImages.pending, (state) => {
        state.clearingAllImages = true;
        state.error = null;
      })
      .addCase(clearAllImages.fulfilled, (state) => {
        state.clearingAllImages = false;
        state.savedImages = [];
      })
      .addCase(clearAllImages.rejected, (state, action) => {
        state.clearingAllImages = false;
        state.error = action.error.message || "Erro ao limpar imagens";
      });
  },
});

export const { clearError, clearGalleryError, resetGalleryState } = imageSlice.actions;
export default imageSlice.reducer;
