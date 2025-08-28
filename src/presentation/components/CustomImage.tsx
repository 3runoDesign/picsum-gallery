import React, { memo } from "react";
import { Image, ImageProps, Pressable, StyleSheet } from "react-native";

interface CustomImageProps extends Omit<ImageProps, "source"> {
  source: { uri: string };
  style?: any;
  onPress?: () => void;
}

export const CustomImage = memo<CustomImageProps>(
  ({ source, style, onPress, ...props }) => {
    const imageComponent = (
      <Image
        source={source}
        style={[styles.image, style]}
        resizeMode="cover"
        {...props}
      />
    );

    if (onPress) {
      return <Pressable onPress={onPress}>{imageComponent}</Pressable>;
    }

    return imageComponent;
  }
);

CustomImage.displayName = "CustomImage";

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
});
