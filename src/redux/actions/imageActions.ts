import { Dispatch } from "redux";
import { Image } from "../../domain/entities/Image";
import { ImageStorageRepository } from "../../domain/repositories/imageStorageRepository";

export const loadImages =
  (repository: ImageStorageRepository) => async (dispatch: Dispatch) => {
    const images = await repository.getAllImages();
    dispatch({ type: "SET_IMAGES", payload: images });
  };

export const saveImage =
  (repository: ImageStorageRepository, image: Image) =>
  async (dispatch: Dispatch) => {
    await repository.saveImage(image);
    const images = await repository.getAllImages();
    dispatch({ type: "SET_IMAGES", payload: images });
  };

export const deleteImage =
  (repository: ImageStorageRepository, id: string) =>
  async (dispatch: Dispatch) => {
    await repository.deleteImage(id);
    const images = await repository.getAllImages();
    dispatch({ type: "SET_IMAGES", payload: images });
  };
