import { Image, ImageProps } from "expo-image";
import React, { memo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export const CustomImage = memo((props: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      <Image
        {...props}
        onLoad={() => setIsLoading(false)}
        style={[props.style, { opacity: isLoading ? 0 : 1 }]}
        contentFit="cover"
        transition={200}
      />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
});

CustomImage.displayName = "CustomImage";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    position: "absolute",
  },
});
