import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Check, X, Sticker, Download, Undo } from "lucide-react-native";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from "expo-image-manipulator";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";

const STICKERS = [
  "https://bit.ly/4bOZGOd/sticker1.png",
  "https://bit.ly/4bOZGOd/sticker2.png",
  "https://bit.ly/4bOZGOd/sticker3.png",
];

type Sticker = {
  uri: string;
  x: number;
  y: number;
  scale: number;
};

export default function EditorScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [imageUri, setImageUri] = useState(uri);
  console.log("sent image:- ", uri);
  const [showStickers, setShowStickers] = useState(false);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const canvasRef = useRef<WebView>(null);
  const [paths, setPaths] = useState<any[]>([]);
  const router = useRouter();

  const handleBack = () => {
    if (router && typeof router.back === "function") {
      router.back();
    } else {
      // Fallback navigation if router.back is not available
      router.replace("/(tabs)");
    }
  };

  useEffect(() => {
    setImageUri(uri);
    checkFileType(uri);
  }, [uri]);

  const handleSave = async () => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      await MediaLibrary.saveToLibraryAsync(manipulatedImage.uri);
      handleBack();
    } catch (error) {
      console.error("Failed to save image:", error);
    }
  };

  const handleAddSticker = (stickerUri: string) => {
    setStickers([
      ...stickers,
      {
        uri: stickerUri,
        x: 0,
        y: 0,
        scale: 1,
      },
    ]);
    setShowStickers(false);
  };

  const handleUndo = () => {
    setPaths((currentPaths) => currentPaths.slice(0, -1));
  };

  const canvasHtml = `
    <html>
      <body style="margin: 0; overflow: hidden; touch-action: none;">
        <canvas id="drawingCanvas" style="width: 100%; height: 100%;"></canvas>
        <script>
          const canvas = document.getElementById('drawingCanvas');
          const ctx = canvas.getContext('2d');
          let isDrawing = false;
          let lastX = 0;
          let lastY = 0;
          
          function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          }
          
          window.addEventListener('resize', resize);
          resize();
          
          canvas.addEventListener('touchstart', handleStart);
          canvas.addEventListener('touchmove', handleMove);
          canvas.addEventListener('touchend', handleEnd);
          
          function handleStart(e) {
            e.preventDefault();
            isDrawing = true;
            const touch = e.touches[0];
            [lastX, lastY] = [touch.clientX, touch.clientY];
          }
          
          function handleMove(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const touch = e.touches[0];
            const currentX = touch.clientX;
            const currentY = touch.clientY;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            [lastX, lastY] = [currentX, currentY];
          }
          
          function handleEnd() {
            isDrawing = false;
          }
        </script>
      </body>
    </html>
  `;

  // Check file type of the current photo
  async function checkFileType(uri: string) {
    const info = await FileSystem.getInfoAsync(uri);
    console.log("File Info:", info);
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <WebView
        ref={canvasRef}
        style={styles.canvas}
        source={{ html: canvasHtml }}
        onMessage={(event) => {
          const path = JSON.parse(event.nativeEvent.data);
          setPaths([...paths, path]);
        }}
      />

      {stickers.map((sticker, index) => (
        <PanGestureHandler key={index}>
          <Animated.View
            style={[styles.sticker, { transform: [{ scale: sticker.scale }] }]}
          >
            <Image source={{ uri: sticker.uri }} style={styles.stickerImage} />
          </Animated.View>
        </PanGestureHandler>
      ))}

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleBack}>
          <X color="white" size={24} />
        </TouchableOpacity>

        <View style={styles.toolbarCenter}>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleUndo}>
            <Undo color="white" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowStickers(!showStickers)}
          >
            <Sticker color="white" size={24} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton} onPress={handleSave}>
            <Download color="white" size={24} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleSave}>
          <Check color="white" size={24} />
        </TouchableOpacity>
      </View>

      {showStickers && (
        <View style={styles.stickersPanel}>
          {STICKERS.map((sticker, index) => (
            <TouchableOpacity
              key={index}
              style={styles.stickerButton}
              onPress={() => handleAddSticker(sticker)}
            >
              <Image source={{ uri: sticker }} style={styles.stickerPreview} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "95%",
    height: "25%",
    margin: "auto",
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  toolbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  toolbarCenter: {
    flexDirection: "row",
    gap: 20,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  stickersPanel: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  stickerButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stickerPreview: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  sticker: {
    position: "absolute",
    width: 100,
    height: 100,
  },
  stickerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
