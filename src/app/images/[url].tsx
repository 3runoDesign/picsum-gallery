import { CustomImage } from "@/src/presentation/components/CustomImage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "../../domain/entities/Image";
import { useImageOperations } from "../../presentation/hooks/useImageQueries";

export default function ImageDetailScreen() {
  const {
    url,
    id,
    author,
    width,
    height,
    isSaved: initialIsSaved,
  } = useLocalSearchParams<{
    url: string;
    id: string;
    author: string;
    width: string;
    height: string;
    isSaved?: string;
  }>();

  const router = useRouter();
  const {
    saveImage,
    savingImage,
    deleteImage,
    deletingImage,
    savedImages,
    refreshSavedImages,
  } = useImageOperations();

  // Estado local para controlar se a imagem está salva
  const [isImageSaved, setIsImageSaved] = useState<boolean>(
    initialIsSaved === "true"
  );

  // Verifica em tempo real se a imagem está salva
  useEffect(() => {
    if (savedImages.length > 0 && id) {
      const isCurrentlySaved = savedImages.some((img) => img.id === id);
      setIsImageSaved(isCurrentlySaved);
    }
  }, [savedImages, id]);

  // Atualiza as imagens salvas quando a tela é focada
  useEffect(() => {
    refreshSavedImages();
  }, [refreshSavedImages]);

  // Construir URL do Picsum com altura fixa de 400px
  const getPicsumImageUrl = (
    imageId: string,
    width: number = 400,
    height: number = 400
  ) => {
    return `https://picsum.photos/id/${imageId}/${width}/${height}`;
  };

  // Usar URL do Picsum com dimensões fixas se tivermos o ID
  const imageUrl = id ? getPicsumImageUrl(id, 400, 400) : url;

  const handleSaveImage = async () => {
    if (!id || !author || !width || !height) {
      Alert.alert("Erro", "Informações da imagem incompletas");
      return;
    }

    const image: Image = {
      id,
      url: url!,
      author,
      width: parseInt(width),
      height: parseInt(height),
    };

    try {
      await saveImage(image);
      setIsImageSaved(true);
      Alert.alert("Sucesso", "Imagem salva com sucesso!");
    } catch {
      Alert.alert("Erro", "Falha ao salvar imagem");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleDeleteImage = async () => {
    if (!id) {
      Alert.alert("Erro", "ID da imagem não encontrado");
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir a imagem de ${author}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteImage(id);
              setIsImageSaved(false);
              Alert.alert("Sucesso", "Imagem excluída com sucesso!");
              router.back();
            } catch {
              Alert.alert("Erro", "Falha ao excluir imagem");
            }
          },
        },
      ]
    );
  };

  // Verificar se a URL existe
  if (!url) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>URL da imagem não encontrada</Text>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.image}>
          <CustomImage
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.metadataContainer}>
          <Text style={styles.metadataTitle}>Informações da Imagem</Text>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Autor:</Text>
            <Text style={styles.metadataValue}>{author}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Dimensões:</Text>
            <Text style={styles.metadataValue}>
              {width} x {height}px
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>ID:</Text>
            <Text style={styles.metadataValue}>{id}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Status:</Text>
            <Text
              style={[
                styles.metadataValue,
                styles.statusText,
                isImageSaved
                  ? styles.savedStatusText
                  : styles.notSavedStatusText,
              ]}
            >
              {isImageSaved ? "✓ Salva" : "Não salva"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.backButton]}
          onPress={handleGoBack}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>

        {isImageSaved ? (
          <Pressable
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteImage}
            disabled={deletingImage}
          >
            <Text style={styles.deleteButtonText}>
              {deletingImage ? "Excluindo..." : "Excluir Imagem"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveImage}
            disabled={savingImage}
          >
            <Text style={styles.saveButtonText}>
              {savingImage ? "Salvando..." : "Salvar Imagem"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  image: {
    width: "100%",
    height: 400,
  },
  metadataContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  metadataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metadataLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  metadataValue: {
    fontSize: 16,
    color: "#666",
    flex: 1,
    textAlign: "right",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#666",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  savedStatusText: {
    color: "#4CAF50", // Green for saved
  },
  notSavedStatusText: {
    color: "#FF9800", // Orange for not saved
  },
});
