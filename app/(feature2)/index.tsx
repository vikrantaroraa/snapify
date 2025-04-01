import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme2";

export default function Feature1HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Feature 2 Home
      </Text>
      <Text style={[styles.description, { color: isDark ? "#999" : "#666" }]}>
        Welcome to Feature 2's home screen!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
  },
});
