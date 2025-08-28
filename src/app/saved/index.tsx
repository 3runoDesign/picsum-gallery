import { SavedImageGrid } from "@/src/presentation/components/SavedImageGrid";
import { useImageOperations } from "@/src/presentation/hooks/useImageOperations";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
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
    deleteImage,
    deletingImage,
    clearAllImages,
    clearingAllImages,
  } = useImageOperations();
  const router = useRouter();
  const navigation = useNavigation();

  const handleClearAllImages = useCallback(() => {
    clearAllImages();
  }, [clearAllImages]);

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
  }, [navigation, clearingAllImages, handleClearAllImages]);

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
    try {
      await deleteImage(image.id);
    } catch {
      // Erro tratado pelo ErrorObserver global
    }
  };

  if (loadingSavedImages) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
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
