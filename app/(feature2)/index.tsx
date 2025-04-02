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
} from "react-native";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import { ImagePlus } from "lucide-react-native";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [mode, setMode] = useState<CameraMode>("picture");
  // the following code will be useful while adding record video feature
  // const [recording, setRecording] = useState(false);

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
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

  // the following code will be useful while adding record video feature
  // const recordVideo = async () => {
  //   if (recording) {
  //     setRecording(false);
  //     ref.current?.stopRecording();
  //     return;
  //   }
  //   setRecording(true);
  //   const video = await ref.current?.recordAsync();
  //   console.log({ video });
  // };

  // const toggleMode = () => {
  //   setMode((prev) => (prev === "picture" ? "video" : "picture"));
  // };

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri);
    setCameraOpen(false);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
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
    <View style={styles.container}>
      <Image source={{ uri }} contentFit="cover" style={styles.photo} />
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          setUri(null);
          setCameraOpen(true);
        }}
      >
        <Text style={styles.startText}>Take Another Picture</Text>
      </TouchableOpacity>
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

  // the following code will be useful while adding record video feature
  // const renderCameraWithVideorecorder = () => {
  //     return (
  //       <CameraView
  //         style={styles.camera}
  //         ref={ref}
  //         mode={mode}
  //         facing={facing}
  //         mute={false}
  //         responsiveOrientationWhenOrientationLocked
  //       >
  //         <View style={styles.shutterContainer}>
  //           <Pressable onPress={toggleMode}>
  //             {mode === "picture" ? (
  //               <AntDesign name="picture" size={32} color="white" />
  //             ) : (
  //               <Feather name="video" size={32} color="white" />
  //             )}
  //           </Pressable>
  //           <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
  //             {({ pressed }) => (
  //               <View
  //                 style={[
  //                   styles.shutterBtn,
  //                   {
  //                     opacity: pressed ? 0.5 : 1,
  //                   },
  //                 ]}
  //               >
  //                 <View
  //                   style={[
  //                     styles.shutterBtnInner,
  //                     {
  //                       backgroundColor: mode === "picture" ? "white" : "red",
  //                     },
  //                   ]}
  //                 />
  //               </View>
  //             )}
  //           </Pressable>
  //           <Pressable onPress={toggleFacing}>
  //             <FontAwesome6 name="rotate-left" size={32} color="white" />
  //           </Pressable>
  //         </View>
  //       </CameraView>
  //     );
  //   };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : cameraOpen ? renderCamera() : renderInitialUI()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: "100%",
  },

  photo: {
    width: "90%",
    height: "85%",
    aspectRatio: 1,
    borderRadius: 12,
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
  // The following css will be used when adding record video feature to the app
  // shutterContainer: {
  //   position: "absolute",
  //   bottom: 44,
  //   left: 0,
  //   width: "100%",
  //   alignItems: "center",
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   paddingHorizontal: 30,
  // },
  // shutterBtn: {
  //   backgroundColor: "transparent",
  //   borderWidth: 5,
  //   borderColor: "white",
  //   width: 85,
  //   height: 85,
  //   borderRadius: 45,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // shutterBtnInner: {
  //   width: 70,
  //   height: 70,
  //   borderRadius: 50,
  //   backgroundColor: "white",
  // },
});
