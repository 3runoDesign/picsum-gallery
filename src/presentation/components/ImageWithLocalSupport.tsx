import React, { useState } from "react";
import { ImageProps, Image as RNImage, StyleSheet, View } from "react-native";
import { Image } from "../../domain/entities/Image";

interface ImageWithLocalSupportProps extends Omit<ImageProps, "source"> {
  image: Image;
  style?: any;
}

export const ImageWithLocalSupport: React.FC<ImageWithLocalSupportProps> = ({
  image,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Prioriza o caminho local se disponível, senão usa a URL original
  const imageSource = image.localPath
    ? { uri: image.localPath }
    : { uri: image.url };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    console.warn(
      `Erro ao carregar imagem ${image.id} do caminho: ${imageSource.uri}`
    );
  };

  // Se houve erro e temos um caminho local, tenta carregar da URL original
  const fallbackSource =
    hasError && image.localPath ? { uri: image.url } : imageSource;

  return (
    <View style={styles.container}>
      <RNImage
        {...props}
        source={fallbackSource}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        style={[style, { opacity: isLoading ? 0 : 1 }]}
      />
      {hasError && !image.localPath && (
        <View style={styles.errorContainer}>
          <RNImage
            source={{ uri: image.url }}
            style={[style, { opacity: 0.5 }]}
            onLoadEnd={() => {
              setIsLoading(false);
              setHasError(false);
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
