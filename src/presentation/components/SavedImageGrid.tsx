import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "../../domain/entities/Image";
import { ImageWithLocalSupport } from "./ImageWithLocalSupport";

interface SavedImageGridProps {
  images: Image[];
  onImagePress: (image: Image) => void;
  onDeleteImage: (image: Image) => void;
  isDeleting?: boolean;
}

const numColumns = 2;
const { width } = Dimensions.get("window");
const itemSize = (width - 30) / numColumns; // 15 de padding horizontal

export const SavedImageGrid = ({
  images,
  onImagePress,
  onDeleteImage,
  isDeleting = false,
}: SavedImageGridProps) => {
  const renderImage = ({ item }: { item: Image }) => (
    <View style={styles.imageContainer}>
      <Pressable onPress={() => onImagePress(item)}>
        <ImageWithLocalSupport image={item} style={styles.image} />
        <View style={styles.imageOverlay}>
          <Text style={styles.authorText}>{item.author}</Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={() => onDeleteImage(item)}
        disabled={isDeleting}
      >
        <Text style={styles.deleteButtonText}>{isDeleting ? "..." : "🗑️"}</Text>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      renderItem={renderImage}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
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
    position: "relative",
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
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
  },
});
