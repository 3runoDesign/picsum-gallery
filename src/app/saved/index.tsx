import { SavedImageGrid } from "@/src/presentation/components/SavedImageGrid";
import { useImageOperations } from "@/src/presentation/hooks/useImageQueries";
import { useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "../../domain/entities/Image";

export default function SavedImagesScreen() {
  const {
    savedImages,
    loadingSavedImages,
    savedImagesError,
    deleteImage,
    deletingImage,
    clearAllImages,
    clearingAllImages,
  } = useImageOperations();
  const router = useRouter();
  const navigation = useNavigation();

  // Configura o header da navegação com o botão "Limpar Tudo"
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={[
            styles.headerButton,
            clearingAllImages && styles.headerButtonDisabled,
          ]}
          onPress={handleClearAllImages}
          disabled={clearingAllImages}
        >
          <Text style={styles.headerButtonText}>
            {clearingAllImages ? "Limpando..." : "Limpar Tudo"}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, clearingAllImages]);

  const handleImagePress = (image: Image) => {
    router.push({
      pathname: "/images/[url]" as any,
      params: {
        ...(() => {
          let newWidth = image.width;
          let newHeight = image.height;
          if (image.width !== 800) {
            newWidth = Math.round(image.width * 0.7);
            newHeight = Math.round(image.height * 0.7);
          }

          return {
            url: `https://picsum.photos/id/${image.id}/${newWidth}/${newHeight}`,
            id: image.id,
            author: image.author,
            width: newWidth.toString(),
            height: newHeight.toString(),
            isSaved: "true",
          };
        })(),
      },
    });
  };

  const handleDeleteImage = async (image: Image) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir a imagem de ${image.author}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteImage(image.id);
              Alert.alert("Sucesso", "Imagem excluída com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir imagem");
            }
          },
        },
      ]
    );
  };

  const handleClearAllImages = () => {
    Alert.alert(
      "Confirmar Limpeza",
      `Deseja realmente remover TODAS as ${savedImages.length} imagens salvas? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar Tudo",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllImages();
              Alert.alert("Sucesso", "Todas as imagens foram removidas!");
            } catch (error) {
              Alert.alert("Erro", "Falha ao limpar imagens");
            }
          },
        },
      ]
    );
  };

  // Mostra alerta de erro se houver
  if (savedImagesError) {
    Alert.alert("Erro", `Erro ao carregar imagens: ${savedImagesError}`);
  }

  if (loadingSavedImages) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando imagens...</Text>
      </View>
    );
  }

  if (savedImages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma imagem salva ainda.</Text>
        <Text style={styles.emptySubtext}>
          Volte à tela inicial para salvar algumas imagens!
        </Text>
      </View>
    );
  }

  return (
    <SavedImageGrid
      images={savedImages}
      onImagePress={handleImagePress}
      onDeleteImage={handleDeleteImage}
      isDeleting={deletingImage}
    />
  );
}

const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  headerButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  headerButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
