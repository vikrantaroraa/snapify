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

  const shareToInstagram = async () => {
    if (!uri) return;

    try {
      let imageUri = uri;

      // Only manipulate image on iOS
      if (Platform.OS === "ios") {
        const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
          format: "jpeg",
        });
        imageUri = manipResult.uri;
      }

      const fileExists = await FileSystem.getInfoAsync(imageUri);

      if (!fileExists.exists) {
        throw new Error("Image file not found");
      }

      if (Platform.OS === "ios") {
        const instagramURL = `instagram-stories://share?source_application=your_app_name`;

        const canOpen = await Linking.canOpenURL(instagramURL);
        if (!canOpen) {
          Alert.alert(
            "Instagram Not Found",
            "Please install Instagram to share your story.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Install",
                onPress: () => Linking.openURL(INSTAGRAM_STORE_URLS.ios),
              },
            ]
          );
          return;
        }

        await Linking.openURL(instagramURL);
      } else {
        // Android: Use a simpler intent URL format
        const intentUrl = `instagram://story-camera`;

        try {
          const canOpen = await Linking.canOpenURL(intentUrl);
          if (canOpen) {
            await Linking.openURL(intentUrl);
          } else {
            throw new Error("Cannot open Instagram");
          }
        } catch (error) {
          Alert.alert(
            "Error",
            "Could not open Instagram. Please make sure Instagram is installed and try again.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Play Store",
                onPress: () => Linking.openURL(INSTAGRAM_STORE_URLS.android),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      Alert.alert(
        "Error",
        "Failed to share to Instagram Stories. Please try again.",
        [{ text: "OK" }]
      );
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
      <Image source={{ uri }} contentFit="cover" style={styles.photo} />
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
          }}
        >
          <Camera size={22} color="white" />
          <Text style={styles.startText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={shareToInstagram}
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
    height: "75%",
    borderRadius: 8,
    marginBottom: 16,
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
