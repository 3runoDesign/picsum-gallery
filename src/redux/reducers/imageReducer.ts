import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosClient } from "../../api/axiosClient";
import { ClearAllImagesUseCase } from "../../data/usecases/clearAllImages";
import { DeleteImageUseCase } from "../../data/usecases/deleteImage";
import { ListSavedImagesUseCase } from "../../data/usecases/listImages";
import { SaveImageUseCase } from "../../data/usecases/saveImage";
import { Image } from "../../domain/entities/Image";
import { PicsumImage } from "../../domain/entities/PicsumImage";
import { ImageService } from "../../services/imageService";

// Tipos para status de carregamento
type LoadingStatus = "idle" | "pending" | "succeeded" | "failed";

interface ImageState {
  // Estado das imagens salvas
  savedImages: Image[];

  // Estado da galeria
  galleryImages: Image[];
  galleryPage: number;
  galleryHasMore: boolean;

  // Estados de carregamento granulares
  status: {
    gallery: LoadingStatus;
    saved: LoadingStatus;
    random: LoadingStatus;
    save: LoadingStatus;
    delete: LoadingStatus;
    clearAll: LoadingStatus;
    fetchAndSave: LoadingStatus;
  };

  // Estados de erro granulares
  errors: {
    gallery: string | null;
    saved: string | null;
    random: string | null;
    save: string | null;
    delete: string | null;
    clearAll: string | null;
    fetchAndSave: string | null;
  };

  // Imagem aleatória atual
  randomImage: Image | null;
}

const initialState: ImageState = {
  savedImages: [],
  galleryImages: [],
  galleryPage: 1,
  galleryHasMore: true,
  status: {
    gallery: "idle",
    saved: "idle",
    random: "idle",
    save: "idle",
    delete: "idle",
    clearAll: "idle",
    fetchAndSave: "idle",
  },
  errors: {
    gallery: null,
    saved: null,
    random: null,
    save: null,
    delete: null,
    clearAll: null,
    fetchAndSave: null,
  },
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

// Thunk para buscar imagens da galeria (paginação centralizada)
export const fetchGalleryImages = createAsyncThunk(
  "images/fetchGalleryImages",
  async (_, { getState, extra }) => {
    const state = getState() as { images: ImageState };
    const currentPage = state.images.galleryPage;

    const httpClient = new AxiosClient("https://picsum.photos");
    const response = await httpClient.get<PicsumImage[]>(
      `/v2/list?page=${currentPage}&limit=10`
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
    // Actions para limpar erros específicos
    clearError: (state, action) => {
      const errorType = action.payload as keyof typeof state.errors;
      if (errorType && state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },

    // Action para limpar todos os erros
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach((key) => {
        state.errors[key as keyof typeof state.errors] = null;
      });
    },

    // Action para resetar estado da galeria
    resetGalleryState: (state) => {
      state.galleryImages = [];
      state.galleryPage = 1;
      state.galleryHasMore = true;
      state.status.gallery = "idle";
      state.errors.gallery = null;
    },

    // Action para resetar estado de uma operação específica
    resetOperationStatus: (state, action) => {
      const operation = action.payload as keyof typeof state.status;
      if (operation && state.status[operation]) {
        state.status[operation] = "idle";
        state.errors[operation] = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Load Saved Images
    builder
      .addCase(loadSavedImages.pending, (state) => {
        state.status.saved = "pending";
        state.errors.saved = null;
      })
      .addCase(loadSavedImages.fulfilled, (state, action) => {
        state.status.saved = "succeeded";
        state.savedImages = action.payload;
      })
      .addCase(loadSavedImages.rejected, (state, action) => {
        state.status.saved = "failed";
        state.errors.saved = action.error.message || "Erro ao carregar imagens";
      });

    // Save Image
    builder
      .addCase(saveImage.pending, (state) => {
        state.status.save = "pending";
        state.errors.save = null;
      })
      .addCase(saveImage.fulfilled, (state, action) => {
        state.status.save = "succeeded";
        state.savedImages.push(action.payload);
      })
      .addCase(saveImage.rejected, (state, action) => {
        state.status.save = "failed";
        state.errors.save = action.error.message || "Erro ao salvar imagem";
      });

    // Delete Image
    builder
      .addCase(deleteImage.pending, (state) => {
        state.status.delete = "pending";
        state.errors.delete = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.status.delete = "succeeded";
        state.savedImages = state.savedImages.filter(
          (img) => img.id !== action.payload
        );
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.status.delete = "failed";
        state.errors.delete = action.error.message || "Erro ao deletar imagem";
      });

    // Fetch Random Image
    builder
      .addCase(fetchRandomImage.pending, (state) => {
        state.status.random = "pending";
        state.errors.random = null;
      })
      .addCase(fetchRandomImage.fulfilled, (state, action) => {
        state.status.random = "succeeded";
        state.randomImage = action.payload;
      })
      .addCase(fetchRandomImage.rejected, (state, action) => {
        state.status.random = "failed";
        state.errors.random = action.error.message || "Erro ao buscar imagem";
      });

    // Fetch and Save Random Image
    builder
      .addCase(fetchAndSaveRandomImage.pending, (state) => {
        state.status.fetchAndSave = "pending";
        state.errors.fetchAndSave = null;
      })
      .addCase(fetchAndSaveRandomImage.fulfilled, (state, action) => {
        state.status.fetchAndSave = "succeeded";
        state.randomImage = action.payload;
        state.savedImages.push(action.payload);
      })
      .addCase(fetchAndSaveRandomImage.rejected, (state, action) => {
        state.status.fetchAndSave = "failed";
        state.errors.fetchAndSave =
          action.error.message || "Erro ao buscar e salvar imagem";
      });

    // Fetch Gallery Images
    builder
      .addCase(fetchGalleryImages.pending, (state) => {
        state.status.gallery = "pending";
        state.errors.gallery = null;
      })
      .addCase(fetchGalleryImages.fulfilled, (state, action) => {
        state.status.gallery = "succeeded";
        const { images, hasMore } = action.payload;

        // Se for a primeira página, substitui todas as imagens
        if (state.galleryPage === 1) {
          state.galleryImages = images;
        } else {
          // Páginas subsequentes: concatena com as existentes
          // Filtra imagens duplicadas baseado no ID
          const existingIds = new Set(state.galleryImages.map((img) => img.id));
          const newImages = images.filter((img) => !existingIds.has(img.id));
          state.galleryImages.push(...newImages);
        }

        // Incrementa a página para a próxima busca
        state.galleryPage += 1;
        state.galleryHasMore = hasMore;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.status.gallery = "failed";
        state.errors.gallery =
          action.error.message || "Erro ao carregar galeria";
      });

    // Clear All Images
    builder
      .addCase(clearAllImages.pending, (state) => {
        state.status.clearAll = "pending";
        state.errors.clearAll = null;
      })
      .addCase(clearAllImages.fulfilled, (state) => {
        state.status.clearAll = "succeeded";
        state.savedImages = [];
      })
      .addCase(clearAllImages.rejected, (state, action) => {
        state.status.clearAll = "failed";
        state.errors.clearAll =
          action.error.message || "Erro ao limpar imagens";
      });
  },
});

export const {
  clearError,
  clearAllErrors,
  resetGalleryState,
  resetOperationStatus,
} = imageSlice.actions;

export default imageSlice.reducer;
