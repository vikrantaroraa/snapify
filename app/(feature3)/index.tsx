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

const INSTAGRAM_STORE_URLS = {
  ios: "https://apps.apple.com/app/instagram/id389801252",
  android:
    "https://play.google.com/store/apps/details?id=com.instagram.android",
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [caption, setCaption] = useState("");
  const viewShotRef = useRef<ViewShot>(null);

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
    <View style={styles.pictureContainer}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "jpg", quality: 0.9 }}
        style={{
          position: "relative",
          width: "100%",
          height: "75%",
          marginBottom: 16,
        }}
      >
        <Image source={{ uri }} contentFit="cover" style={styles.photo} />
        <Text
          style={{
            position: "absolute",
            // bottom: 20,
            // left: 20,
            // right: 20,
            color: "white",
            fontSize: 24,
            fontWeight: "bold",
            textShadowColor: "rgba(0, 0, 0, 0.75)",
            textShadowOffset: { width: -1, height: 1 },
            textShadowRadius: 10,
          }}
        >
          {caption}
        </Text>
      </ViewShot>
      <TextInput
        style={styles.captionInput}
        placeholder="Add a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />
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
          // onPress={() => shareToInstagram(uri!)}
          onPress={captureAndShare}
        >
          <Instagram size={22} color="white" />
          <Text style={styles.startText}>Share to Instagram</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    borderRadius: 8,
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
