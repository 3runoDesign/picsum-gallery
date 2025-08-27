import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useImageOperations } from "../../presentation/hooks/useImageQueries";

const numColumns = 2;
const { width } = Dimensions.get("window");
const itemSize = (width - 30) / numColumns; // 15 de padding horizontal

export default function GalleryScreen() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useImageList();
  const { saveImage } = useImageOperations();

  // Estado local para controlar imagens sendo salvas
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());

  // Estado local para imagens salvas (sincronizado com dados do servidor)
  const [localSavedImages, setLocalSavedImages] = useState<Set<string>>(
    new Set()
  );

  // Flatten all pages into a single array
  const allImages = useMemo(() => data?.pages.flat() || [], [data?.pages]);

  // Sincroniza imagens salvas quando os dados chegam ou quando savedImages muda
  useEffect(() => {
    if (allImages.length > 0) {
      // Combina dados da API com estado local para garantir sincronização
      const apiSavedIds = new Set(
        allImages.filter((img) => img.isSaved).map((img) => img.id)
      );

      // Cria um novo Set combinando API + estado local
      const combinedSavedIds = new Set([...localSavedImages, ...apiSavedIds]);

      // Só atualiza se houver mudanças
      if (
        combinedSavedIds.size !== localSavedImages.size ||
        [...combinedSavedIds].some((id) => !localSavedImages.has(id))
      ) {
        setLocalSavedImages(combinedSavedIds);
      }
    }
  }, [allImages, localSavedImages]);

  // Refaz o processo quando o usuário volta para a galeria
  useFocusEffect(
    useCallback(() => {
      // Reseta o estado local para forçar nova sincronização
      setLocalSavedImages(new Set());

      // Força refetch dos dados para sincronizar com o estado atual do servidor
      refetch();
    }, [refetch])
  );

  const handleImagePress = (image: Image) => {
    router.push({
      pathname: "/images/[url]" as any,
      params: {
        url: image.url,
        id: image.id,
        author: image.author,
        width: image.width.toString(),
        height: image.height.toString(),
      },
    });
  };

  const handleSaveImage = async (image: Image) => {
    // Verifica se a imagem já está sendo salva
    if (savingImages.has(image.id)) {
      return; // Previne cliques múltiplos
    }

    // Adiciona a imagem ao conjunto de imagens sendo salvas
    setSavingImages((prev) => new Set(prev).add(image.id));

    try {
      await saveImage(image);

      // Atualiza o estado local imediatamente para destacar a imagem
      setLocalSavedImages((prev) => new Set(prev).add(image.id));

      // Alert.alert("Sucesso", "Imagem salva com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar imagem");
    } finally {
      // Remove a imagem do conjunto de imagens sendo salvas
      setSavingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderImage = ({ item }: { item: Image }) => {
    const isThisImageSaving = savingImages.has(item.id);
    const isSaved = item.isSaved || localSavedImages.has(item.id);
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
              {isThisImageSaving ? "Salvando..." : isSaved ? "Salva" : "Salvar"}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Carregando mais imagens...</Text>
      </View>
    );
  };

  if (error) {
    Alert.alert("Erro", `Erro ao carregar imagens: ${error.message || error}`);
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando galeria...</Text>
      </View>
    );
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
    borderWidth: 2,
    borderColor: "#4CAF50",
    elevation: 4,
    shadowOpacity: 0.2,
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
