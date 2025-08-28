import React, { memo } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "../../domain/entities/Image";
import { CustomImage } from "./CustomImage";

interface SavedImageGridProps {
  images: Image[];
  onImagePress?: (image: Image) => void;
  onDeleteImage?: (image: Image) => void;
  isDeleting?: boolean;
}

const numColumns = 2;
const { width } = Dimensions.get("window");
const itemSize = (width - 30) / numColumns; // 15 de padding horizontal

export const SavedImageGrid = memo<SavedImageGridProps>(({
  images,
  onImagePress,
  onDeleteImage,
  isDeleting = false,
}) => {
  const renderImage = ({ item }: { item: Image }) => (
    <View style={styles.imageContainer}>
      <Pressable onPress={() => onImagePress?.(item)}>
        <CustomImage 
          source={{ uri: item.url }} 
          style={styles.image}
          // Mostra loading individual para cada imagem
        />
      </Pressable>
      
      {onDeleteImage && (
        <Pressable
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={() => onDeleteImage(item)}
          disabled={isDeleting}
        >
          <Text style={styles.deleteButtonText}>
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Text>
        </Pressable>
      )}
      
      <View style={styles.imageOverlay}>
        <Text style={styles.authorText}>{item.author}</Text>
        <Text style={styles.dimensionsText}>
          {item.width} x {item.height}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.listContainer}
      renderItem={renderImage}
      showsVerticalScrollIndicator={false}
      // Melhora a performance da lista
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
});

SavedImageGrid.displayName = "SavedImageGrid";

const styles = StyleSheet.create({
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
  },
  authorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  dimensionsText: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.8,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
