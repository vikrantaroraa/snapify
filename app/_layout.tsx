// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect } from 'react';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/useColorScheme';

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }

import { View } from "react-native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import * as SplashScreen from "expo-splash-screen";
import { Clapperboard, Instagram, ShoppingBag } from "lucide-react-native";
import {
  ColorSchemeContext,
  useColorSchemeProvider,
} from "@/hooks/useColorScheme2";
// import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding too early or before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorSchemeProvider();
  const isDark = colorScheme.colorScheme === "dark";

  // Delay hide with fade-like behavior
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 400); // minimum 400ms splash duration

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ColorSchemeContext.Provider value={colorScheme}>
      <Drawer
        initialRouteName="(feature2)"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? "#101010" : "#FFFFFF",
          },
          headerTintColor: isDark ? "#FFFFFF" : "#101010",
          drawerStyle: {
            backgroundColor: isDark ? "#101010" : "#FFFFFF",
          },
          drawerActiveTintColor: isDark ? "#2196F3" : "#2563EB",
          drawerInactiveTintColor: isDark ? "#ffffff" : "#666666",
        }}
        drawerContent={(props) => (
          <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
              <DrawerItemList {...props} />
            </DrawerContentScrollView>
            {/* <ThemeToggle /> */}
          </View>
        )}
      >
        <Drawer.Screen
          name="(feature2)"
          options={{
            title: "Interactive Photo Canvas",
            drawerIcon: ({ size, color }) => (
              <Clapperboard size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="(feature3)"
          options={{
            title: "Instagram Stories Integration",
            drawerIcon: ({ size, color }) => (
              <Instagram size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="(feature1)"
          options={{
            drawerItemStyle: { display: "none" }, // Hides from drawer
            title: "Feature 1",
            drawerIcon: ({ size, color }) => (
              <ShoppingBag size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerItemStyle: { display: "none" }, // Hides from drawer
          }}
        />
        <Drawer.Screen
          name="+not-found"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="index"
          options={{
            drawerItemStyle: { display: "none" }, // hides it from the drawer menu
          }}
        />
      </Drawer>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ColorSchemeContext.Provider>
  );
}
