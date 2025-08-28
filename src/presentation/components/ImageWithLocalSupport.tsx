import { Image, ImageProps } from "expo-image";
import React, { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image as ImageEntity } from "../../domain/entities/Image";

interface ImageWithLocalSupportProps extends Omit<ImageProps, "source"> {
  image: ImageEntity;
  style?: any;
}

export const ImageWithLocalSupport: React.FC<ImageWithLocalSupportProps> = memo(
  ({ image, style, ...props }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Prioriza o caminho local se disponível, senão usa a URL original
    const imageSource = image.localPath
      ? { uri: image.localPath }
      : { uri: image.url };

    const handleLoad = () => {
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
        <Image
          {...props}
          source={fallbackSource}
          onLoad={handleLoad}
          onError={handleError}
          style={[style, { opacity: isLoading ? 0 : 1 }]}
          contentFit="cover"
          transition={200}
        />
        {hasError && !image.localPath && (
          <View style={styles.errorContainer}>
            <Image
              source={{ uri: image.url }}
              style={[style, { opacity: 0.5 }]}
              onLoad={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}
      </View>
    );
  }
);

ImageWithLocalSupport.displayName = "ImageWithLocalSupport";

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
