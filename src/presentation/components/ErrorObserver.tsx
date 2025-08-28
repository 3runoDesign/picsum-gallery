/**
 * Componente observador global para tratamento de erros
 *
 * Este componente monitora o estado de erro do Redux e exibe
 * alertas quando necessário, centralizando o tratamento de erros.
 */

import React, { useEffect } from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearError } from "../../redux/reducers/imageReducer";
import { RootState } from "../../redux/store";

export const ErrorObserver: React.FC = () => {
  const dispatch = useDispatch();
  const errors = useSelector((state: RootState) => state.images.errors);

  useEffect(() => {
    Object.entries(errors).forEach(([errorType, errorMessage]) => {
      if (errorMessage) {
        const errorTitle = getErrorTitle(errorType);

        Alert.alert(errorTitle, errorMessage, [
          {
            text: "OK",
            onPress: () => {
              dispatch(clearError(errorType as keyof typeof errors));
            },
          },
        ]);
      }
    });
  }, [errors, dispatch]);

  const getErrorTitle = (errorType: string): string => {
    const errorTitles: Record<string, string> = {
      saved: "Erro ao Carregar Imagens Salvas",
      save: "Erro ao Salvar Imagem",
      delete: "Erro ao Deletar Imagem",
      clearAll: "Erro ao Limpar Imagens",
    };

    return errorTitles[errorType] || "Erro";
  };

  return null;
};
