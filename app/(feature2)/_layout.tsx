import { Stack, Tabs } from "expo-router";
import { Camera, Image as ImageIcon } from "lucide-react-native";

// export default function TabLayout() {
//   return (
//     <Stack
//       screenOptions={{
//         headerShown: false,
//         // tabBarStyle: {
//         //   backgroundColor: "#1a1a1a",
//         // },
//         // tabBarActiveTintColor: "#ffffff",
//         // tabBarInactiveTintColor: "#888888",
//       }}
//     >
//       <Stack.Screen
//         name="index"
//         // options={{
//         //   title: "Camera",
//         //   tabBarIcon: ({ size, color }) => <Camera size={size} color={color} />,
//         // }}
//       />
//       {/* <Tabs.Screen
//         name="gallery"
//         options={{
//           title: "Gallery",
//           tabBarIcon: ({ size, color }) => (
//             <ImageIcon size={size} color={color} />
//           ),
//         }}
//       /> */}
//     </Stack>
//   );
// }

export default function Feature2Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Show headers for Stack screens
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="editor" />
    </Stack>
  );
}
