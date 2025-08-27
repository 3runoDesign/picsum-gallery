import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosClient } from "../../api/axiosClient";
import { DeleteImageUseCase } from "../../data/usecases/deleteImage";
import { ListSavedImagesUseCase } from "../../data/usecases/listImages";
import { SaveImageUseCase } from "../../data/usecases/saveImage";
import { Image } from "../../domain/entities/Image";
import { ImageService } from "../../services/imageService";

interface ImageState {
  savedImages: Image[];
  loading: boolean;
  error: string | null;
}

const initialState: ImageState = {
  savedImages: [],
  loading: false,
  error: null,
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
    const imageService = new ImageService(httpClient, null as any); // Storage não é necessário para buscar
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

const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load Saved Images
    builder
      .addCase(loadSavedImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSavedImages.fulfilled, (state, action) => {
        state.loading = false;
        state.savedImages = action.payload;
      })
      .addCase(loadSavedImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erro ao carregar imagens";
      });

    // Save Image
    builder
      .addCase(saveImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveImage.fulfilled, (state, action) => {
        state.loading = false;
        state.savedImages.push(action.payload);
      })
      .addCase(saveImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erro ao salvar imagem";
      });

    // Delete Image
    builder
      .addCase(deleteImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false;
        state.savedImages = state.savedImages.filter(
          (img) => img.id !== action.payload
        );
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erro ao deletar imagem";
      });

    // Fetch Random Image
    builder
      .addCase(fetchRandomImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRandomImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchRandomImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erro ao buscar imagem";
      });

    // Fetch and Save Random Image
    builder
      .addCase(fetchAndSaveRandomImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAndSaveRandomImage.fulfilled, (state, action) => {
        state.loading = false;
        state.savedImages.push(action.payload);
      })
      .addCase(fetchAndSaveRandomImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erro ao buscar e salvar imagem";
      });
  },
});

export const { clearError } = imageSlice.actions;
export default imageSlice.reducer;
