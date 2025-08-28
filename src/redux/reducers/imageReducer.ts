import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ClearAllImagesUseCase } from "../../data/usecases/clearAllImages";
import { DeleteImageUseCase } from "../../data/usecases/deleteImage";
import { ListSavedImagesUseCase } from "../../data/usecases/listImages";
import { SaveImageUseCase } from "../../data/usecases/saveImage";
import { Image } from "../../domain/entities/Image";

type LoadingStatus = "idle" | "pending" | "succeeded" | "failed";

interface ImageState {
  savedImages: Image[];

  status: {
    saved: LoadingStatus;
    save: LoadingStatus;
    delete: LoadingStatus;
    clearAll: LoadingStatus;
  };

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

export const loadSavedImages = createAsyncThunk(
  "images/loadSavedImages",
  async (_, { extra }) => {
    const { listUseCase } = extra as {
      listUseCase: ListSavedImagesUseCase;
    };
    return await listUseCase.execute();
  }
);

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
    clearError: (state, action) => {
      const errorType = action.payload as keyof typeof state.errors;
      if (errorType && state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },

    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach((key) => {
        state.errors[key as keyof typeof state.errors] = null;
      });
    },

    resetOperationStatus: (state, action) => {
      const operation = action.payload as keyof typeof state.status;
      if (operation && state.status[operation]) {
        state.status[operation] = "idle";
        state.errors[operation] = null;
      }
    },
  },
  extraReducers: (builder) => {
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
