import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ClearAllImagesUseCase } from "../../data/usecases/clearAllImages";
import { DeleteImageUseCase } from "../../data/usecases/deleteImage";
import { ListSavedImagesUseCase } from "../../data/usecases/listImages";
import { SaveImageUseCase } from "../../data/usecases/saveImage";
import { Image } from "../../domain/entities/Image";

// Tipos para status de carregamento
type LoadingStatus = "idle" | "pending" | "succeeded" | "failed";

interface ImageState {
  // Estado das imagens salvas
  savedImages: Image[];

  // Estados de carregamento granulares
  status: {
    saved: LoadingStatus;
    save: LoadingStatus;
    delete: LoadingStatus;
    clearAll: LoadingStatus;
  };

  // Estados de erro granulares
  errors: {
    saved: string | null;
    save: string | null;
    delete: string | null;
    clearAll: string | null;
  };
}

const initialState: ImageState = {
  savedImages: [],
  status: {
    saved: "idle",
    save: "idle",
    delete: "idle",
    clearAll: "idle",
  },
  errors: {
    saved: null,
    save: null,
    delete: null,
    clearAll: null,
  },
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

export const { clearError, clearAllErrors, resetOperationStatus } =
  imageSlice.actions;

export default imageSlice.reducer;
