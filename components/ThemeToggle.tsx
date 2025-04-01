// import { Switch, View, StyleSheet } from "react-native";
// import { useColorScheme } from "@/hooks/useColorScheme2";
// import { Moon, Sun } from "lucide-react-native";

// export function ThemeToggle() {
//   const { colorScheme, toggleColorScheme } = useColorScheme();
//   const isDark = colorScheme === "dark";

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
//           borderTopColor: isDark ? "#374151" : "#E5E7EB",
//         },
//       ]}
//     >
//       <View style={styles.content}>
//         {isDark ? (
//           <Moon size={20} color={isDark ? "#9CA3AF" : "#374151"} />
//         ) : (
//           <Sun size={20} color={isDark ? "#9CA3AF" : "#374151"} />
//         )}
//         <Switch
//           value={isDark}
//           onValueChange={toggleColorScheme}
//           style={styles.switch}
//           trackColor={{ false: "#D1D5DB", true: "#4B5563" }}
//           thumbColor={isDark ? "#60A5FA" : "#9CA3AF"}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     borderTopWidth: 1,
//   },
//   content: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   switch: {
//     transform: [{ scale: 0.8 }],
//   },
// });

import { View, Switch, StyleSheet, Animated } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme2";
import { Moon, Sun } from "lucide-react-native";
import { useEffect, useRef } from "react";

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      tension: 20,
      friction: 5,
    }).start();
  }, [isDark]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1A1A1A" : "#e5e5e5" },
      ]}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          style={[styles.iconWrapper, { transform: [{ rotate: spin }] }]}
        >
          {isDark ? (
            <Moon size={22} color="#fff" />
          ) : (
            <Sun size={22} color="#666" />
          )}
        </Animated.View>
      </View>
      <Switch
        value={isDark}
        onValueChange={toggleColorScheme}
        trackColor={{ false: "#767577", true: "#1976D2" }}
        thumbColor={isDark ? "#2196F3" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        style={styles.switch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    position: "absolute",
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
});
