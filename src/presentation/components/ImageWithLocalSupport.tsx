import React, { memo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ImageWithLocalSupportProps extends Omit<ImageProps, "source"> {
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

export const ImageWithLocalSupport = memo<ImageWithLocalSupportProps>(
  ({ image, style, onLoadStart, onLoad, onLoadEnd, ...props }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
      onLoadStart?.();
    };

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };

    const handleLoadEnd = () => {
      setIsLoading(false);
      onLoadEnd?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
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
          onError={handleError}
          {...props}
        />

        {/* Loading indicator com fundo semi-transparente */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          </View>
        )}

        {/* Error state */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorContainer}>
              <ActivityIndicator size="small" color="#FF3B30" />
              <Text style={styles.errorText}>Erro ao carregar</Text>
            </View>
          </View>
        )}
      </View>
    );
  }
);

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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: 4,
  },
  errorText: {
    fontSize: 10,
    color: "#FF3B30",
    fontWeight: "500",
  },
});
