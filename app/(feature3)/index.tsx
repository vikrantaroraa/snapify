import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
  Alert,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import { Camera, ImagePlus, Instagram, Palette } from "lucide-react-native";
import { Link } from "expo-router";
import * as FileSystem from "expo-file-system";
import { ImageManipulator } from "expo-image-manipulator";
import * as IntentLauncher from "expo-intent-launcher";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as Mime from "react-native-mime-types"; // New package we'll use
import ViewShot from "react-native-view-shot";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Slider from "@react-native-community/slider";

const INSTAGRAM_STORE_URLS = {
  ios: "https://apps.apple.com/app/instagram/id389801252",
  android:
    "https://play.google.com/store/apps/details?id=com.instagram.android",
};

const COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#ff0000" },
  { name: "Green", value: "#008000" },
  { name: "Blue", value: "#0000ff" },
  { name: "Yellow", value: "#ffff00" },
  { name: "Cyan", value: "#00ffff" },
  { name: "Magenta", value: "#ff00ff" },

  { name: "AliceBlue", value: "#f0f8ff" },
  { name: "AntiqueWhite", value: "#faebd7" },
  { name: "Aquamarine", value: "#7fffd4" },
  { name: "Azure", value: "#f0ffff" },
  { name: "Beige", value: "#f5f5dc" },
  { name: "Bisque", value: "#ffe4c4" },
  { name: "BlanchedAlmond", value: "#ffebcd" },
  { name: "BlueViolet", value: "#8a2be2" },
  { name: "Brown", value: "#a52a2a" },
  { name: "BurlyWood", value: "#deb887" },
  { name: "CadetBlue", value: "#5f9ea0" },
  { name: "Chartreuse", value: "#7fff00" },
  { name: "Chocolate", value: "#d2691e" },
  { name: "Coral", value: "#ff7f50" },
  { name: "CornflowerBlue", value: "#6495ed" },
  { name: "Cornsilk", value: "#fff8dc" },
  { name: "Crimson", value: "#dc143c" },
  { name: "DarkBlue", value: "#00008b" },
  { name: "DarkCyan", value: "#008b8b" },
  { name: "DarkGoldenRod", value: "#b8860b" },
  { name: "DarkGray", value: "#a9a9a9" },
  { name: "DarkGreen", value: "#006400" },
  { name: "DarkKhaki", value: "#bdb76b" },
  { name: "DarkMagenta", value: "#8b008b" },
  { name: "DarkOliveGreen", value: "#556b2f" },
  { name: "DarkOrange", value: "#ff8c00" },
  { name: "DarkOrchid", value: "#9932cc" },
  { name: "DarkRed", value: "#8b0000" },
  { name: "DarkSalmon", value: "#e9967a" },
  { name: "DarkSeaGreen", value: "#8fbc8f" },
  { name: "DarkSlateBlue", value: "#483d8b" },
  { name: "DarkSlateGrey", value: "#2f4f4f" },
  { name: "DarkTurquoise", value: "#00ced1" },
  { name: "DarkViolet", value: "#9400d3" },
  { name: "DeepPink", value: "#ff1493" },
  { name: "DeepSkyBlue", value: "#00bfff" },
  { name: "DimGray", value: "#696969" },
  { name: "DodgerBlue", value: "#1e90ff" },
  { name: "FireBrick", value: "#b22222" },
  { name: "FloralWhite", value: "#fffaf0" },
  { name: "ForestGreen", value: "#228b22" },
  { name: "Gainsboro", value: "#dcdcdc" },
  { name: "GhostWhite", value: "#f8f8ff" },
  { name: "Gold", value: "#ffd700" },
  { name: "GoldenRod", value: "#daa520" },
  { name: "Gray", value: "#808080" },
  { name: "GreenYellow", value: "#adff2f" },
  { name: "HoneyDew", value: "#f0fff0" },
  { name: "HotPink", value: "#ff69b4" },
  { name: "IndianRed", value: "#cd5c5c" },
  { name: "Indigo", value: "#4b0082" },
  { name: "Ivory", value: "#fffff0" },
  { name: "Khaki", value: "#f0e68c" },
  { name: "Lavender", value: "#e6e6fa" },
  { name: "LavenderBlush", value: "#fff0f5" },
  { name: "LawnGreen", value: "#7cfc00" },
  { name: "LemonChiffon", value: "#fffacd" },
  { name: "LightBlue", value: "#add8e6" },
  { name: "LightCoral", value: "#f08080" },
  { name: "LightCyan", value: "#e0ffff" },
  { name: "LightGoldenRodYellow", value: "#fafad2" },
  { name: "LightGray", value: "#d3d3d3" },
  { name: "LightGreen", value: "#90ee90" },
  { name: "LightPink", value: "#ffb6c1" },
  { name: "LightSalmon", value: "#ffa07a" },
  { name: "LightSeaGreen", value: "#20b2aa" },
  { name: "LightSkyBlue", value: "#87cefa" },
  { name: "LightSlateGrey", value: "#778899" },
  { name: "LightSteelBlue", value: "#b0c4de" },
  { name: "LightYellow", value: "#ffffe0" },
  { name: "Lime", value: "#00ff00" },
  { name: "LimeGreen", value: "#32cd32" },
  { name: "Linen", value: "#faf0e6" },
  { name: "Maroon", value: "#800000" },
  { name: "MediumAquaMarine", value: "#66cdaa" },
  { name: "MediumBlue", value: "#0000cd" },
  { name: "MediumOrchid", value: "#ba55d3" },
  { name: "MediumPurple", value: "#9370db" },
  { name: "MediumSeaGreen", value: "#3cb371" },
  { name: "MediumSlateBlue", value: "#7b68ee" },
  { name: "MediumSpringGreen", value: "#00fa9a" },
  { name: "MediumTurquoise", value: "#48d1cc" },
  { name: "MediumVioletRed", value: "#c71585" },
  { name: "MidnightBlue", value: "#191970" },
  { name: "MintCream", value: "#f5fffa" },
  { name: "MistyRose", value: "#ffe4e1" },
  { name: "Moccasin", value: "#ffe4b5" },
  { name: "NavajoWhite", value: "#ffdead" },
  { name: "Navy", value: "#000080" },
  { name: "OldLace", value: "#fdf5e6" },
  { name: "Olive", value: "#808000" },
  { name: "OliveDrab", value: "#6b8e23" },
  { name: "Orange", value: "#ffa500" },
  { name: "OrangeRed", value: "#ff4500" },
  { name: "Orchid", value: "#da70d6" },
  { name: "PaleGoldenRod", value: "#eee8aa" },
  { name: "PaleGreen", value: "#98fb98" },
  { name: "PaleTurquoise", value: "#afeeee" },
  { name: "PaleVioletRed", value: "#db7093" },
  { name: "PapayaWhip", value: "#ffefd5" },
  { name: "PeachPuff", value: "#ffdab9" },
  { name: "Peru", value: "#cd853f" },
  { name: "Pink", value: "#ffc0cb" },
  { name: "Plum", value: "#dda0dd" },
  { name: "PowderBlue", value: "#b0e0e6" },
  { name: "Purple", value: "#800080" },
  { name: "RebeccaPurple", value: "#663399" },
  { name: "RosyBrown", value: "#bc8f8f" },
  { name: "RoyalBlue", value: "#4169e1" },
  { name: "SaddleBrown", value: "#8b4513" },
  { name: "Salmon", value: "#fa8072" },
  { name: "SandyBrown", value: "#f4a460" },
  { name: "SeaGreen", value: "#2e8b57" },
  { name: "Seashell", value: "#fff5ee" },
  { name: "Sienna", value: "#a0522d" },
  { name: "Silver", value: "#c0c0c0" },
  { name: "SkyBlue", value: "#87ceeb" },
  { name: "SlateBlue", value: "#6a5acd" },
  { name: "SlateGray", value: "#708090" },
  { name: "Snow", value: "#fffafa" },
  { name: "SpringGreen", value: "#00ff7f" },
  { name: "SteelBlue", value: "#4682b4" },
  { name: "Tan", value: "#d2b48c" },
  { name: "Teal", value: "#008080" },
  { name: "Thistle", value: "#d8bfd8" },
  { name: "Tomato", value: "#ff6347" },
  { name: "Turquoise", value: "#40e0d0" },
  { name: "Violet", value: "#ee82ee" },
  { name: "Wheat", value: "#f5deb3" },
  { name: "WhiteSmoke", value: "#f5f5f5" },
  { name: "YellowGreen", value: "#9acd32" },
];

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [caption, setCaption] = useState("");
  const viewShotRef = useRef<ViewShot>(null);
  const [captionFontSize, setCaptionFontSize] = useState(24); // default font size
  const [captionTextColor, setCaptionTextColor] = useState("#FFFFFF"); // default white

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (event, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }, []);

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionsContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.startButton}
        >
          <Text style={styles.startText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function savePhoto(uri: string) {
    const newPath = `${FileSystem.documentDirectory}captured.jpg`; // Save to app's permanent storage

    try {
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      console.log("File moved successfully:", newPath);
      return newPath;
    } catch (error) {
      console.log("Error moving file:", error);
      return uri; // Return original URI if moving fails
    }
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      const newUri = await savePhoto(photo.uri);
      setUri(`${newUri}?t=${Date.now()}`);
      setCameraOpen(false);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  // ------------------------XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX------------------------

  // const shareToInstagram2 = async () => {
  //   // await Linking.openURL(
  //   //   `content://com.instagram.share.ADD_TO_STORY?source_application=your_app_package_name&caption=${encodeURIComponent(
  //   //     caption
  //   //   )}&media_type=photo&source_url=${destinationUri}`
  //   // );
  //   // `content://com.instagram.share.ADD_TO_STORY?source_application=your_app_package_name&caption=${encodeURIComponent(
  //   //   caption
  //   // )}&media_type=photo&source_url=${destinationUri}`;
  //   if (!uri) return;

  //   try {
  //     let imageUri = uri;

  //     // Only manipulate image on iOS
  //     if (Platform.OS === "ios") {
  //       const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
  //         format: "jpeg",
  //       });
  //       imageUri = manipResult.uri;
  //     }

  //     const fileExists = await FileSystem.getInfoAsync(imageUri);

  //     if (!fileExists.exists) {
  //       throw new Error("Image file not found");
  //     }

  //     if (Platform.OS === "ios") {
  //       const instagramURL = `instagram-stories://share?source_application=your_app_name`;

  //       const canOpen = await Linking.canOpenURL(instagramURL);
  //       if (!canOpen) {
  //         Alert.alert(
  //           "Instagram Not Found",
  //           "Please install Instagram to share your story.",
  //           [
  //             { text: "Cancel", style: "cancel" },
  //             {
  //               text: "Install",
  //               onPress: () => Linking.openURL(INSTAGRAM_STORE_URLS.ios),
  //             },
  //           ]
  //         );
  //         return;
  //       }

  //       await Linking.openURL(instagramURL);
  //     } else {
  //       // // Android: Use a simpler intent URL format
  //       const intentUrl = `instagram://story-camera`;
  //       // const intentUrl = `instagram-stories://share?backgroundImage=${uri}&attributionURL=YOUR_APP_URL&app_id=YOUR_FACEBOOK_APP_ID&sticker_text=${encodeURIComponent(
  //       //   caption
  //       // )}`;

  //       try {
  //         const canOpen = await Linking.canOpenURL(intentUrl);
  //         if (canOpen) {
  //           // await Linking.openURL(intentUrl);
  //           await Linking.openURL(
  //             `content://com.instagram.share.ADD_TO_STORY?source_application=1321011919674357&caption=${encodeURIComponent(
  //               caption
  //             )}&media_type=photo&source_url=${uri}`
  //           );
  //         } else {
  //           throw new Error("Cannot open Instagram");
  //         }
  //       } catch (error) {
  //         Alert.alert(
  //           "Error",
  //           "Could not open Instagram. Please make sure Instagram is installed and try again.",
  //           [
  //             { text: "Cancel", style: "cancel" },
  //             {
  //               text: "Open Play Store",
  //               onPress: () => Linking.openURL(INSTAGRAM_STORE_URLS.android),
  //             },
  //           ]
  //         );
  //       }

  //       // console.log("Attempting to share to Instagram...");
  //       // const permission = await MediaLibrary.requestPermissionsAsync();
  //       // if (!permission.granted) {
  //       //   Alert.alert("Permission needed", "Storage access is required.");
  //       //   return;
  //       // }

  //       // const permission = await MediaLibrary.requestPermissionsAsync();
  //       // if (!permission.granted) {
  //       //   Alert.alert("Permission needed", "Storage access is required.");
  //       //   return;
  //       // }

  //       // Save to media library so Instagram can access it
  //       const asset = await MediaLibrary.createAssetAsync(imageUri);
  //       console.log("ye hai aapka asset: ", asset); // Debugging line
  //       const mimeType = Mime.lookup(asset.uri) || "image/jpg";

  //       // Check Instagram is installed
  //       // const canOpen = await Linking.canOpenURL("instagram://story-camera");
  //       // if (!canOpen) {
  //       //   Alert.alert(
  //       //     "Instagram not found",
  //       //     "Please install Instagram to share your story.",
  //       //     [
  //       //       { text: "Cancel", style: "cancel" },
  //       //       {
  //       //         text: "Install",
  //       //         onPress: () => Linking.openURL(INSTAGRAM_STORE_URLS.android),
  //       //       },
  //       //     ]
  //       //   );
  //       //   return;
  //       // }

  //       // const intentParams = {
  //       //   action: "com.instagram.share.ADD_TO_STORY", // ✅ correct action
  //       //   type: "image/*",
  //       //   flags: 1,
  //       //   extras: {
  //       //     source_application: "com.vikrantaroraa.snapify", // ✅ this is where your App ID or package name goes
  //       //     interactive_asset_uri: asset.uri,
  //       //     top_background_color: "#000000",
  //       //     bottom_background_color: "#ffffff",
  //       //     content_url: "https://snapify-app.netlify.app",
  //       //   },
  //       // } as any;

  //       // const intentParams2 = {
  //       //   action: "com.instagram.share.ADD_TO_STORY",
  //       //   type: mimeType,
  //       //   packageName: "com.instagram.android",
  //       //   flags: 1,
  //       //   extras: {
  //       //     // "android.intent.extra.STREAM": asset.uri,
  //       //     "android.intent.extra.TEXT": "Shared from Snapify ✨",
  //       //     interactive_asset_uri: asset.uri,
  //       //     top_background_color: "#FF0000",
  //       //     bottom_background_color: "#00FF00",
  //       //     source_application: "1321011919674357",
  //       //     appId: "1321011919674357", // Your app ID or package name
  //       //   },
  //       // };
  //       // try {
  //       //   console.log("Launching Instagram with params:", intentParams2); // Debugging line
  //       //   const result = await IntentLauncher.startActivityAsync(
  //       //     "com.instagram.share.ADD_TO_STORY",
  //       //     intentParams2
  //       //   );
  //       //   console.log("return of result:- ", result); // Debugging line
  //       // } catch (error) {
  //       //   console.error("Failed to share to Instagram Story:", error);
  //       //   Alert.alert(
  //       //     "Error",
  //       //     "Instagram not found. Please install Instagram and try again.",
  //       //     [
  //       //       { text: "Cancel", style: "cancel" },
  //       //       {
  //       //         text: "Install",
  //       //         onPress: () => Linking.openURL(INSTAGRAM_STORE_URLS.android),
  //       //       },
  //       //     ]
  //       //   );
  //       // }
  //     }
  //   } catch (error) {
  //     console.error("Error sharing to Instagram:", error);
  //     Alert.alert(
  //       "Error",
  //       "Failed to share to Instagram Stories. Please try again.",
  //       [{ text: "OK" }]
  //     );
  //   }
  // };

  // ------------------------XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX------------------------

  const shareToInstagram = async (uri: string) => {
    const intentUrl = "instagram://story-camera";
    const isInstalled = await Linking.canOpenURL(intentUrl);
    console.log("isInstalled: ", isInstalled); // Debugging line

    // check if Instagram is installed
    if (!isInstalled) {
      Alert.alert(
        "Instagram not found",
        "Please install Instagram to share your story.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Install",
            onPress: () =>
              Linking.openURL(
                Platform.OS === "ios"
                  ? INSTAGRAM_STORE_URLS.ios
                  : INSTAGRAM_STORE_URLS.android
              ),
          },
        ]
      );
      return;
    }
    // share to Instagram on Android
    if (Platform.OS === "android") {
      try {
        // Step 1: Request media library permissions first
        const permissionResult = await MediaLibrary.requestPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Permission needed", "Media library access is required.");
          return;
        }

        // Step 2: Copy the image to app's cache directory first (which is accessible to FileSystem)
        const filename = "instagram_share.jpg";
        const destinationUri = `${FileSystem.cacheDirectory}${filename}`;

        await FileSystem.copyAsync({
          from: uri,
          to: destinationUri,
        });

        // Step 3: Get content URI from the copied file (this should work since it's in our app's cache)
        const contentUri = await FileSystem.getContentUriAsync(destinationUri);

        console.log("Generated content URI:", contentUri);

        // Step 4: Save to media library to make it persistent
        const asset = await MediaLibrary.createAssetAsync(destinationUri);
        console.log("Created media asset:", asset);

        // Step 5: Use the content URI for Instagram intent
        const mimeType = "image/jpeg"; // You could use Mime.lookup but this is safer

        const result = await IntentLauncher.startActivityAsync(
          "com.instagram.share.ADD_TO_STORY",
          {
            // action: "com.instagram.share.ADD_TO_STORY",
            type: mimeType,
            packageName: "com.instagram.android",
            flags: 1,
            // extra: {
            //   source_application: "1321011919674357", // Your Facebook App ID
            //   interactive_asset_uri: contentUri, // Using the content URI
            //   top_background_color: "#FF0000",
            //   bottom_background_color: "#00FF00",
            //   content_url: "https://snapify-app.netlify.app", // optional
            // },
            data: contentUri,
            extra: {
              "com.instagram.sharedSticker.backgroundImage": contentUri,
              "com.instagram.sharedSticker.contentURL": "https://snapify.fun/",
              "com.facebook.platform.extra.APPLICATION_ID": "1321011919674357",
            },
          }
        );

        console.log("Instagram Story share result:", result);
      } catch (err) {
        console.error("Error sharing to Instagram:", err);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } // share to Instagram on ios
    else {
    }
  };

  const captureAndShare = async () => {
    const capture = viewShotRef.current?.capture;
    if (!capture) return;

    try {
      // 1. Capture the ViewShot
      const uri = await (capture as () => Promise<string>)();

      console.log("Captured view at: ", uri);

      if (!uri) return;

      // 2. Now share it
      await shareToInstagram(uri);
    } catch (error) {
      console.error("Failed to capture and share:", error);
      Alert.alert("Error", "Something went wrong while sharing. Try again.");
    }
  };

  const renderInitialUI = () => (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setCameraOpen(true)}
      >
        <ImagePlus size={32} color="#fff" />
        <Text style={styles.addText}>Take a Picture</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPicture = () => (
    <ScrollView style={styles.pictureContainer}>
      <View
        style={{
          width: "100%",
          height: 500,
          marginBottom: 16,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <GestureHandlerRootView>
          <ViewShot
            ref={viewShotRef}
            options={{ format: "jpg", quality: 0.9 }}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Image source={{ uri }} contentFit="cover" style={styles.photo} />
            <PanGestureHandler onGestureEvent={panGestureEvent}>
              <Animated.View style={[animatedStyle, { position: "absolute" }]}>
                <View pointerEvents="none">
                  <Text
                    style={{
                      color: captionTextColor,
                      fontSize: captionFontSize,
                      fontWeight: "bold",
                      textShadowColor: "rgba(0, 0, 0, 0.75)",
                      textShadowOffset: { width: -1, height: 1 },
                      textShadowRadius: 10,
                    }}
                  >
                    {caption}
                  </Text>
                </View>
              </Animated.View>
            </PanGestureHandler>
          </ViewShot>
        </GestureHandlerRootView>
      </View>
      <TextInput
        style={styles.captionInput}
        placeholder="Add a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />
      <View style={{ marginVertical: 8 }}>
        <Text style={{ color: "white", marginBottom: 4 }}>Text Size</Text>
        <Slider
          style={{
            width: "100%",
            height: 34,
            padding: 0,
          }}
          minimumValue={12}
          maximumValue={60}
          step={1}
          value={captionFontSize}
          onSlidingComplete={(value) => setCaptionFontSize(value)}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#888"
          thumbTintColor="#FFFFFF"
        />
      </View>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: "white", marginBottom: 18 }}>Text Color</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorsPanel}
        >
          {COLORS.map(({ name, value }) => (
            <TouchableOpacity
              key={value}
              onPress={() => setCaptionTextColor(value)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: value,
                borderWidth: value === "#000000" ? 1 : 0, // add border for black swatch
                borderColor: "#888",
              }}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setUri(null);
            setCameraOpen(true);
            setCaption("");
          }}
        >
          <Camera size={22} color="white" />
          <Text style={styles.startText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          // onPress={() => shareToInstagram(uri!)}  // instead of sharing the image directly to instagram, we will share the viewshot which also contains the overlay caption text
          onPress={captureAndShare}
        >
          <Instagram size={22} color="white" />
          <Text style={styles.startText}>Share to Instagram</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCamera = () => (
    <CameraView style={styles.camera} ref={ref} mode={mode} facing={facing}>
      <View style={styles.shutterContainer}>
        <Pressable onPress={takePicture}>
          <View style={styles.shutterBtn}>
            <View style={styles.shutterBtnInner} />
          </View>
        </Pressable>
      </View>

      {/* Flip Camera Button on the right */}
      <View style={styles.flipButtonContainer}>
        <Pressable onPress={toggleFacing}>
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable>
      </View>
    </CameraView>
  );

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : cameraOpen ? renderCamera() : renderInitialUI()}
    </View>
  );
}

const styles = StyleSheet.create({
  permissionsContainer: {
    flex: 1,
    backgroundColor: "#000",
    borderWidth: 2,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    borderWidth: 2,
    paddingHorizontal: 12,
  },
  pictureContainer: {
    paddingTop: 12,
    flexGrow: 1,
  },
  permissionText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#333",
    borderRadius: 25,
    flexDirection: "row",
    gap: 10,
    margin: "auto",
  },
  captionInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    width: "100%",
  },
  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  colorsPanel: {
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    gap: 10,
  },
  startButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: "50%",
    transform: [{ translateX: -42.5 }], // Centers the button
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "white",
  },
  flipButtonContainer: {
    position: "absolute",
    bottom: 60,
    right: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
    paddingBottom: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
});
