import React, { memo, useState } from "react";
import { Image, ImageProps, StyleSheet, View, ActivityIndicator } from "react-native";

interface ImageWithLocalSupportProps extends Omit<ImageProps, 'source'> {
  image: {
    id: string;
    url: string;
    author: string;
    width: number;
    height: number;
  };
  style?: any;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onLoadEnd?: () => void;
}

export const ImageWithLocalSupport = memo<ImageWithLocalSupportProps>(({
  image,
  style,
  onLoadStart,
  onLoad,
  onLoadEnd,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: image.url }}
        style={[styles.image, style]}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onLoadEnd={handleLoadEnd}
        {...props}
      />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
});

ImageWithLocalSupport.displayName = "ImageWithLocalSupport";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loader: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
