import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageProps,
  Image as RNImage,
  StyleSheet,
  View,
} from "react-native";

export const CustomImage = (props: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      <RNImage
        {...props}
        onLoadEnd={() => setIsLoading(false)}
        style={[props.style, { opacity: isLoading ? 0 : 1 }]}
      />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    position: "absolute",
  },
});
