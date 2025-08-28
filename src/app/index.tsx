import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ImageWithLocalSupport } from "../presentation/components/ImageWithLocalSupport";
import { useImageHistory } from "../presentation/hooks/useImageHistory";
import { useImageOperations } from "../presentation/hooks/useImageOperations";

export default function HomeScreen() {
  const {
    savedImages,
    randomImage,
    loadingRandomImage,
    savingImage,
    fetchingAndSaving,
    refreshRandomImage,
    saveImage,
    fetchAndSaveRandomImage,
    refreshSavedImages,
  } = useImageOperations();

  const { addImage, goToPrevious, getCurrentImage, canGoBack } =
    useImageHistory();
  const router = useRouter();

  // Estado para controlar o carregamento da imagem
  const [imageLoading, setImageLoading] = useState(false);

  // Função para verificar se a imagem atual está salva
  const isCurrentImageSaved = useCallback(() => {
    const current = getCurrentImage();
    if (!current) return false;
    return savedImages.some((img) => img.id === current.id);
  }, [savedImages, getCurrentImage]);

  // Adiciona a imagem aleatória ao histórico quando ela carrega
  useEffect(() => {
    if (randomImage) {
      addImage(randomImage);
      // Inicia o carregamento da imagem quando uma nova imagem é definida
      setImageLoading(true);
    }
  }, [randomImage, addImage]);

  // Atualiza as imagens salvas quando a tela é focada
  useEffect(() => {
    refreshSavedImages();
  }, [refreshSavedImages]);

  const currentImage = getCurrentImage();
  const currentImageIsSaved = isCurrentImageSaved();

  const handleSaveCurrentImage = () => {
    if (currentImage && !currentImageIsSaved) {
      saveImage(currentImage);
    }
  };

  const handleGoBack = () => {
    goToPrevious();
  };

  const handleFetchAndSave = () => {
    fetchAndSaveRandomImage();
  };

  const handleNewImage = () => {
    refreshRandomImage();
  };

  // Handlers para eventos de carregamento da imagem
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Galeria</Text>

      <View style={styles.imageContainer}>
        {loadingRandomImage ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando nova imagem...</Text>
          </View>
        ) : currentImage ? (
          <View style={styles.imageWrapper}>
            <ImageWithLocalSupport
              image={currentImage}
              style={styles.image}
              onLoadStart={handleImageLoadStart}
              onLoad={handleImageLoad}
              onLoadEnd={handleImageLoad}
            />
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.imageLoadingText}>
                  Renderizando imagem...
                </Text>
              </View>
            )}
            {/* Indicador de imagem salva */}
            {currentImageIsSaved && (
              <View style={styles.savedIndicator}>
                <Text style={styles.savedText}>✓ Salva</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noImageText}>Nenhuma imagem carregada</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Nova Imagem"
          onPress={handleNewImage}
          disabled={loadingRandomImage}
        />

        <Button
          title="Imagem Anterior"
          onPress={handleGoBack}
          disabled={!canGoBack}
        />

        <Button
          title="Salvar Imagem Atual"
          onPress={handleSaveCurrentImage}
          disabled={!currentImage || savingImage || currentImageIsSaved}
        />

        <Button
          title="Buscar e Salvar Nova"
          onPress={handleFetchAndSave}
          disabled={fetchingAndSaving}
        />
      </View>

      <Text style={styles.counter}>Imagens Salvas: {savedImages.length}</Text>

      <View style={styles.navigationContainer}>
        <Pressable
          style={styles.navButton}
          onPress={() => router.push("/gallery")}
        >
          <Text style={styles.navButtonText}>Ver Galeria</Text>
        </Pressable>

        <Pressable
          style={styles.navButton}
          onPress={() => router.push("/saved")}
        >
          <Text style={styles.navButtonText}>Imagens Salvas</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageContainer: {
    width: 300,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 20,
  },
  imageWrapper: {
    position: "relative",
    width: 300,
    height: 200,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 8,
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(208, 208, 208, 0.52)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    gap: 10,
  },
  imageLoadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    width: 300,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(208, 208, 208, 0.52)",
    borderRadius: 8,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  noImageText: {
    color: "#666",
    fontSize: 16,
  },
  buttonContainer: {
    gap: 10,
    width: "100%",
    maxWidth: 300,
  },
  counter: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
    maxWidth: 300,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  savedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    opacity: 0.8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  savedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
