import { useRouter } from "expo-router";
import { Dimensions, FlatList, Pressable, StyleSheet } from "react-native";
import { Image } from "../../domain/entities/Image";
import { ImageWithLocalSupport } from "./ImageWithLocalSupport";

interface ImageGridProps {
  images: Image[];
}

const numColumns = 3;
const { width } = Dimensions.get("window");
const itemSize = (width - 20) / numColumns; // 10 de padding horizontal

export const ImageGrid = ({ images }: ImageGridProps) => {
  const router = useRouter();

  const handlePress = (image: Image) => {
    router.push({
      pathname: "/images/[url]" as any,
      params: { url: image.url },
    });
  };

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <Pressable onPress={() => handlePress(item)}>
          <ImageWithLocalSupport image={item} style={styles.image} />
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },
  image: {
    width: itemSize,
    height: itemSize,
    margin: 5,
  },
});
