import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Check, X, Sticker, Download, Undo } from "lucide-react-native";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from "expo-image-manipulator";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";

const STICKERS = [
  require("../assets/stickers/flower-doughtnut-plant.png"),
  require("../assets/stickers/one-eyed-ufo.png"),
  require("../assets/stickers/amazed-pizza-guy.png"),
  require("../assets/stickers/wanda-the-sausage.png"),
  require("../assets/stickers/grumpy-smoker.png"),
  require("../assets/stickers/my-favourite-mug.png"),
];

type Sticker = {
  uri: string;
  x: number;
  y: number;
  scale: number;
  id: number; // Unique ID to track stickers
};

export default function EditorScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [imageUri, setImageUri] = useState(uri);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
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

  const handleAddSticker = (stickerIndex: number) => {
    if (!imageSize.width || !imageSize.height) return;

    const stickerSize = 100;
    const centerX = imageSize.width / 2 - stickerSize / 2;
    const centerY = imageSize.height / 2 - stickerSize / 2;

    setStickers((prevStickers) => [
      ...prevStickers,
      {
        id: Date.now(),
        uri: STICKERS[stickerIndex],
        x: centerX,
        y: centerY,
        scale: 1,
      },
    ]);
  };

  const handleUndo = () => {
    setPaths((currentPaths) => currentPaths.slice(0, -1));
  };

  function StickerComponent({
    id,
    uri,
    initialX,
    initialY,
    initialScale,
  }: {
    id: number;
    uri: any;
    initialX: number;
    initialY: number;
    initialScale: number;
  }) {
    const x = useSharedValue(initialX);
    const y = useSharedValue(initialY);
    const scale = useSharedValue(initialScale);

    // Animated style for positioning and scaling
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { scale: scale.value },
      ],
    }));

    // ✅ Drag Gesture (Pan)
    const panGesture = Gesture.Pan()
      .onStart(() => {
        // Nothing needed here
      })
      .onUpdate((event) => {
        x.value = event.translationX + initialX;
        y.value = event.translationY + initialY;
      })
      .onEnd(() => {
        runOnJS(updateStickerPosition)(id, x.value, y.value);
      });

    // ✅ Pinch Gesture (Zoom)
    const pinchGesture = Gesture.Pinch()
      .onUpdate((event) => {
        scale.value = event.scale;
      })
      .onEnd(() => {
        runOnJS(updateStickerScale)(id, scale.value);
      });

    // ✅ Combine Both Gestures
    const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

    return (
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.sticker, animatedStyle]}>
          <Image source={uri} style={styles.stickerImage} />
        </Animated.View>
      </GestureDetector>
    );
  }

  // Move the state update OUTSIDE the gesture handler
  const updateStickerPosition = (
    stickerId: number,
    newX: number,
    newY: number
  ) => {
    setStickers((prevStickers) =>
      prevStickers.map((sticker) =>
        sticker.id === stickerId ? { ...sticker, x: newX, y: newY } : sticker
      )
    );
  };

  const updateStickerScale = (stickerId: number, newScale: number) => {
    setStickers((prevStickers) =>
      prevStickers.map((sticker) =>
        sticker.id === stickerId ? { ...sticker, scale: newScale } : sticker
      )
    );
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
      <View
        style={styles.imageContainer}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setImageSize({ width, height });
        }}
      >
        <Image source={{ uri: imageUri }} style={styles.image} />
        <WebView
          ref={canvasRef}
          style={styles.canvas}
          androidLayerType="software"
          source={{ html: canvasHtml }}
          onMessage={(event) => {
            const path = JSON.parse(event.nativeEvent.data);
            setPaths([...paths, path]);
          }}
        />
        {stickers.map((sticker) => {
          return (
            <StickerComponent
              key={sticker.id}
              id={sticker.id}
              uri={sticker.uri}
              initialX={sticker.x}
              initialY={sticker.y}
              initialScale={sticker.scale}
            />
          );
        })}
      </View>

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
              onPress={() => handleAddSticker(index)}
            >
              <Image source={sticker} style={styles.stickerPreview} />
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
  imageContainer: {
    width: "94%",
    height: "70%",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: "auto",
    marginTop: 20,
    backgroundColor: "black",
    borderRadius: 8,
    borderColor: "#d3d3d3",
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute", // Ensure it's inside the container
  },
  canvas: {
    width: "100%",
    height: "100%",
    position: "absolute", // Overlays the image
    backgroundColor: "transparent",
    zIndex: 2, // Ensure it's above the image
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
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  stickerButton: {
    width: 55,
    height: 55,
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
    zIndex: 3, // Ensures stickers stay on top
  },
  stickerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
