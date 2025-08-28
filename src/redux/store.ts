import { configureStore } from "@reduxjs/toolkit";
import imageReducer from "./reducers/imageReducer";

import {
  clearAllUseCase,
  deleteUseCase,
  listUseCase,
  saveUseCase,
} from "@/src/core/dependenciesContext";

export const store = configureStore({
  reducer: {
    images: imageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          listUseCase,
          saveUseCase,
          deleteUseCase,
          clearAllUseCase,
        },
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
