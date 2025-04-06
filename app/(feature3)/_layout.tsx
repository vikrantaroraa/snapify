import { Stack, Tabs } from "expo-router";

export default function Feature2Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Show headers for Stack screens
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
