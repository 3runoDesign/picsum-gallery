import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";
import { DependencyProvider } from "../core/dependenciesContext";
import { store } from "../redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar barStyle={"dark-content"} />
      <DependencyProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Início" }} />
          <Stack.Screen name="gallery/index" options={{ title: "Galeria" }} />
          <Stack.Screen
            name="saved/index"
            options={{ title: "Imagens Salvas" }}
          />
          <Stack.Screen
            name="images/[url]"
            options={{ title: "Imagem", headerShown: false }}
          />
        </Stack>
      </DependencyProvider>
    </Provider>
  );
}
