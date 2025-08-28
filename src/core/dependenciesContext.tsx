import React, { createContext, ReactNode, useContext } from "react";

// Importe as implementações e casos de uso
import { AsyncStorageImageStorage } from "../data/datasources/asyncStorageImageStorage";
import { ClearAllImagesUseCase } from "../data/usecases/clearAllImages";
import { DeleteImageUseCase } from "../data/usecases/deleteImage";
import { ListSavedImagesUseCase } from "../data/usecases/listImages";
import { SaveImageUseCase } from "../data/usecases/saveImage";

// --- Crie as instâncias uma única vez ---
const imageStorage = new AsyncStorageImageStorage();
export const saveUseCase = new SaveImageUseCase(imageStorage);
export const listUseCase = new ListSavedImagesUseCase(imageStorage);
export const deleteUseCase = new DeleteImageUseCase(imageStorage);
export const clearAllUseCase = new ClearAllImagesUseCase(imageStorage);

interface AppDependencies {
  saveUseCase: SaveImageUseCase;
  listUseCase: ListSavedImagesUseCase;
  deleteUseCase: DeleteImageUseCase;
  clearAllUseCase: ClearAllImagesUseCase;
}

const DependencyContext = createContext<AppDependencies>({
  saveUseCase,
  listUseCase,
  deleteUseCase,
  clearAllUseCase,
});

export const useDependencies = () => useContext(DependencyContext);

export const DependencyProvider = ({ children }: { children: ReactNode }) => {
  const dependencies = {
    saveUseCase,
    listUseCase,
    deleteUseCase,
    clearAllUseCase,
  };

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};
