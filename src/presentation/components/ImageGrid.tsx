import React, { memo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Image } from "../../domain/entities/Image";
import { CustomImage } from "./CustomImage";

interface ImageGridProps {
  images: Image[];
  onImagePress?: (image: Image) => void;
  numColumns?: number;
  contentContainerStyle?: any;
}

export const ImageGrid = memo<ImageGridProps>(({
  images,
  onImagePress,
  numColumns = 2,
  contentContainerStyle,
}) => {
  const renderImage = ({ item }: { item: Image }) => (
    <CustomImage
      source={{ uri: item.url }}
      style={styles.image}
      onPress={() => onImagePress?.(item)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={renderImage}
        contentContainerStyle={[styles.listContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

ImageGrid.displayName = "ImageGrid";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  image: {
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 8,
  },
});
