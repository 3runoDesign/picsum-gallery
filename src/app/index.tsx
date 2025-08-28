import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useRandomImage } from "../presentation/hooks/useRandomImage";

export default function HomeScreen() {
  const { savedImages, refreshSavedImages, saveImage, savingImage } =
    useImageOperations();

  const {
    randomImage,
    isLoading: loadingRandomImage,
    refetch: refreshRandomImage,
  } = useRandomImage();

  const { addImage, goToPrevious, getCurrentImage, canGoBack } =
    useImageHistory();
  const router = useRouter();

  const [imageLoading, setImageLoading] = useState(false);

  const savedImagesSet = useMemo(() => {
    return new Set(savedImages.map((img) => img.id));
  }, [savedImages]);

  const isCurrentImageSaved = useCallback(() => {
    const current = getCurrentImage();
    if (!current) return false;
    return savedImagesSet.has(current.id);
  }, [savedImagesSet, getCurrentImage]);

  useEffect(() => {
    if (randomImage) {
      addImage(randomImage);

      setImageLoading(true);
    }
  }, [randomImage, addImage]);

  useEffect(() => {
    refreshSavedImages();
  }, [refreshSavedImages]);

  const currentImage = getCurrentImage();
  const currentImageIsSaved = isCurrentImageSaved();

  const handleGoBack = useCallback(() => {
    goToPrevious();
  }, [goToPrevious]);

  const handleNewImage = useCallback(() => {
    refreshRandomImage();
  }, [refreshRandomImage]);

  const handleSaveImage = useCallback(async () => {
    if (!currentImage) return;

    try {
      await saveImage(currentImage);
    } catch (error) {
      console.error("Erro ao salvar imagem:", error);
    }
  }, [currentImage, saveImage]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageLoadStart = useCallback(() => {
    setImageLoading(true);
  }, []);

  const handleGalleryPress = useCallback(() => {
    router.push("/gallery");
  }, [router]);

  const handleSavedPress = useCallback(() => {
    router.push("/saved");
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Galeria</Text>

      <View style={styles.imageContainer}>
        {loadingRandomImage ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
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

            {/* Botão de salvar imagem */}
            <Pressable
              style={[
                styles.saveButton,
                currentImageIsSaved && styles.savedButton,
                savingImage && styles.savingButton,
              ]}
              onPress={handleSaveImage}
              disabled={currentImageIsSaved || savingImage}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  currentImageIsSaved && styles.savedButtonText,
                  savingImage && styles.savingButtonText,
                ]}
              >
                {savingImage
                  ? "Salvando..."
                  : currentImageIsSaved
                  ? "✓ Salva"
                  : "Salvar Imagem"}
              </Text>
            </Pressable>
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
      </View>

      <Text style={styles.counter}>Imagens Salvas: {savedImages.length}</Text>

      <View style={styles.navigationContainer}>
        <Pressable style={styles.navButton} onPress={handleGalleryPress}>
          <Text style={styles.navButtonText}>Ver Galeria</Text>
        </Pressable>

        <Pressable style={styles.navButton} onPress={handleSavedPress}>
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
  saveButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  savedButton: {
    backgroundColor: "#4CAF50",
  },
  savingButton: {
    backgroundColor: "#FF9500",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  savedButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  savingButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
