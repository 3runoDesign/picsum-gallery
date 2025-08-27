import { configureStore } from "@reduxjs/toolkit";
import imageReducer from "./reducers/imageReducer";

// Importe as dependências que serão injetadas
import {
  deleteUseCase,
  listUseCase,
  saveUseCase,
} from "@/src/core/dependenciesContext"; // Exponha as instâncias

export const store = configureStore({
  reducer: {
    images: imageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          // É aqui que a mágica acontece!
          listUseCase,
          saveUseCase,
          deleteUseCase,
        },
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
