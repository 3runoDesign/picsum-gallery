import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "../../domain/entities/Image";
import { CustomImage } from "../../presentation/components/CustomImage";
import { useImageList } from "../../presentation/hooks/useImageList";
import { useImageOperations } from "../../presentation/hooks/useImageOperations";

const numColumns = 2;
const { width } = Dimensions.get("window");
const itemSize = (width - 30) / numColumns;

export default function GalleryScreen() {
  const router = useRouter();

  const {
    allImages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useImageList();

  const {
    saveImage,
    savedImages,
    loadingSavedImages,
    refreshSavedImages,
    savingImage,
    deletingImage,
  } = useImageOperations();

  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());

  const savedImagesSet = useMemo(() => {
    return new Set(savedImages.map((img: Image) => img.id));
  }, [savedImages]);

  useFocusEffect(
    useCallback(() => {
      refreshSavedImages();
    }, [refreshSavedImages])
  );

  const handleImagePress = useCallback(
    (image: Image) => {
      const isSaved = savedImagesSet.has(image.id);
      router.push({
        pathname: "/images/[url]" as any,
        params: {
          url: image.url,
          id: image.id,
          author: image.author,
          width: image.width.toString(),
          height: image.height.toString(),
          isSaved: isSaved.toString(),
        },
      });
    },
    [router, savedImagesSet]
  );

  const handleSaveImage = useCallback(
    async (image: Image) => {
      if (savingImages.has(image.id)) {
        return;
      }

      setSavingImages((prev) => new Set(prev).add(image.id));

      try {
        await saveImage(image);
      } catch {
      } finally {
        setSavingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(image.id);
          return newSet;
        });
      }
    },
    [saveImage, savingImages]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isImageSaved = useCallback(
    (imageId: string) => {
      return savedImagesSet.has(imageId);
    },
    [savedImagesSet]
  );

  const renderImage = useCallback(
    ({ item }: { item: Image }) => {
      const isThisImageSaving = savingImages.has(item.id);
      const isSaved = isImageSaved(item.id);
      const isButtonDisabled = isThisImageSaving || isSaved;

      return (
        <Pressable
          style={[styles.imageContainer, isSaved && styles.savedImageContainer]}
          onPress={() => handleImagePress(item)}
        >
          <CustomImage source={{ uri: item.url }} style={styles.image} />
          {isSaved && (
            <View style={styles.savedIndicator}>
              <Text style={styles.savedText}>✓</Text>
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Text style={styles.authorText}>{item.author}</Text>
            <Pressable
              style={[
                styles.saveButton,
                isSaved && styles.savedButton,
                isThisImageSaving && styles.savingButton,
              ]}
              onPress={() => handleSaveImage(item)}
              disabled={isButtonDisabled}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  isSaved && styles.savedButtonText,
                  isThisImageSaving && styles.savingButtonText,
                ]}
              >
                {isThisImageSaving
                  ? "Salvando..."
                  : isSaved
                  ? "Salva"
                  : "Salvar"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      );
    },
    [handleImagePress, handleSaveImage, isImageSaved, savingImages]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Carregando mais imagens...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderErrorScreen = useCallback(
    () => (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erro ao carregar galeria</Text>
        <Text style={styles.errorMessage}>
          {error?.message || "Ocorreu um problema ao carregar as imagens."}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </Pressable>
      </View>
    ),
    [error, refetch]
  );

  if (isLoading || loadingSavedImages) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>
          {loadingSavedImages
            ? "Carregando imagens salvas..."
            : "Carregando galeria..."}
        </Text>
      </View>
    );
  }

  if (error) {
    return renderErrorScreen();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Galeria de Imagens</Text>
      <FlatList
        data={allImages}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        renderItem={renderImage}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: itemSize,
          offset: itemSize * Math.floor(index / numColumns),
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 10,
  },
  imageContainer: {
    width: itemSize,
    height: itemSize,
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  savedImageContainer: {
    borderWidth: 3,
    borderColor: "#4CAF50",
    elevation: 6,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    transform: [{ scale: 1.02 }],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  savedButton: {
    backgroundColor: "#4CAF50",
  },
  savedButtonText: {
    color: "#fff",
  },
  savingButton: {
    backgroundColor: "#FFA500",
    opacity: 0.8,
  },
  savingButtonText: {
    color: "#fff",
  },
  savedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  savedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  footerLoader: {
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
});
