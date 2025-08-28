/**
 * Componente observador global para tratamento de erros
 * 
 * Este componente monitora o estado de erro do Redux e exibe
 * alertas quando necessário, centralizando o tratamento de erros.
 */

import React, { useEffect } from "react";
import { Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { clearError } from "../../redux/reducers/imageReducer";

export const ErrorObserver: React.FC = () => {
  const dispatch = useDispatch();
  const errors = useSelector((state: RootState) => state.images.errors);

  useEffect(() => {
    // Monitora cada tipo de erro e exibe alerta quando necessário
    Object.entries(errors).forEach(([errorType, errorMessage]) => {
      if (errorMessage) {
        // Mapeia o tipo de erro para uma mensagem amigável
        const errorTitle = getErrorTitle(errorType);
        
        Alert.alert(
          errorTitle,
          errorMessage,
          [
            {
              text: "OK",
              onPress: () => {
                // Limpa o erro após o usuário confirmar
                dispatch(clearError(errorType as keyof typeof errors));
              },
            },
          ]
        );
      }
    });
  }, [errors, dispatch]);

  // Função para mapear tipos de erro para títulos amigáveis
  const getErrorTitle = (errorType: string): string => {
    const errorTitles: Record<string, string> = {
      gallery: "Erro na Galeria",
      saved: "Erro ao Carregar Imagens Salvas",
      random: "Erro ao Buscar Imagem",
      save: "Erro ao Salvar Imagem",
      delete: "Erro ao Deletar Imagem",
      clearAll: "Erro ao Limpar Imagens",
      fetchAndSave: "Erro ao Buscar e Salvar Imagem",
    };

    return errorTitles[errorType] || "Erro";
  };

  // Este componente não renderiza nada visualmente
  return null;
};
