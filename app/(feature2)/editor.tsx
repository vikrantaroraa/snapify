import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
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
import { Check, X, Sticker, Download, Undo, Redo } from "lucide-react-native";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from "expo-image-manipulator";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import ViewShot from "react-native-view-shot";

const STICKERS = [
  require("../../assets/stickers/flower-doughtnut-plant.png"),
  require("../../assets/stickers/one-eyed-ufo.png"),
  require("../../assets/stickers/amazed-pizza-guy.png"),
  require("../../assets/stickers/wanda-the-sausage.png"),
  require("../../assets/stickers/grumpy-smoker.png"),
  require("../../assets/stickers/my-favourite-mug.png"),
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
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const router = useRouter();
  const viewShotRef = useRef(null);

  // const handleBack = () => {
  //   if (router && typeof router.back === "function") {
  //     router.back();
  //   } else {
  //     // Fallback navigation if router.back is not available
  //     router.replace("/(tabs)");
  //   }
  // };

  const handleBack = () => {
    router.back();
    // router.replace("/(feature2)");
  };

  useEffect(() => {
    setImageUri(uri);
    checkFileType(uri);
  }, [uri]);

  // const handleAddSticker = (stickerIndex: number) => {
  //   if (!imageSize.width || !imageSize.height) return;

  //   const stickerSize = 100;
  //   const centerX = imageSize.width / 2 - stickerSize / 2;
  //   const centerY = imageSize.height / 2 - stickerSize / 2;

  //   setStickers((prevStickers) => [
  //     ...prevStickers,
  //     {
  //       id: Date.now(),
  //       uri: STICKERS[stickerIndex],
  //       x: centerX,
  //       y: centerY,
  //       scale: 1,
  //     },
  //   ]);
  // };

  const handleAddSticker = (stickerIndex: number) => {
    if (!imageSize.width || !imageSize.height) return;

    const stickerSize = 100;
    const centerX = imageSize.width / 2 - stickerSize / 2;
    const centerY = imageSize.height / 2 - stickerSize / 2;

    const newSticker = {
      id: Date.now(),
      uri: STICKERS[stickerIndex],
      x: centerX,
      y: centerY,
      scale: 1,
    };

    setStickers((prevStickers) => {
      setHistory((prevHistory) => [
        ...prevHistory,
        { type: "sticker", sticker: newSticker },
      ]);
      setRedoStack([]); // 👈 clear redo
      return [...prevStickers, newSticker];
    });
  };

  // const handleUndo = () => {
  //   setPaths((currentPaths) => currentPaths.slice(0, -1));
  // };

  // const handleUndo = () => {
  //   if (history.length === 0) return;

  //   const lastAction = history[history.length - 1];
  //   setHistory((prev) => prev.slice(0, -1));

  //   if (lastAction.type === "sticker") {
  //     setStickers((prev) => prev.filter((s) => s.id !== lastAction.sticker.id));
  //   } else if (lastAction.type === "stroke") {
  //     if (canvasRef.current) {
  //       canvasRef.current.postMessage(JSON.stringify({ type: "undo" }));
  //     }
  //   }
  // };

  // const handleUndo = () => {
  //   if (history.length === 0) return;

  //   const lastAction = history[history.length - 1];
  //   setHistory((prev) => prev.slice(0, -1));

  //   if (lastAction.type === "sticker") {
  //     setStickers((prev) => prev.filter((s) => s.id !== lastAction.sticker.id));
  //   } else if (lastAction.type === "move") {
  //     setStickers((prev) =>
  //       prev.map((s) =>
  //         s.id === lastAction.stickerId
  //           ? { ...s, x: lastAction.fromX, y: lastAction.fromY }
  //           : s
  //       )
  //     );
  //   } else if (lastAction.type === "scale") {
  //     setStickers((prev) =>
  //       prev.map((s) =>
  //         s.id === lastAction.stickerId
  //           ? { ...s, scale: lastAction.fromScale }
  //           : s
  //       )
  //     );
  //   } else if (lastAction.type === "stroke") {
  //     if (canvasRef.current) {
  //       canvasRef.current.postMessage(JSON.stringify({ type: "undo" }));
  //     }
  //   }
  // };
  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastAction]); // 👈 push to redo

    if (lastAction.type === "sticker") {
      setStickers((prev) => prev.filter((s) => s.id !== lastAction.sticker.id));
    } else if (lastAction.type === "move") {
      setStickers((prev) =>
        prev.map((s) =>
          s.id === lastAction.stickerId
            ? { ...s, x: lastAction.fromX, y: lastAction.fromY }
            : s
        )
      );
    } else if (lastAction.type === "scale") {
      setStickers((prev) =>
        prev.map((s) =>
          s.id === lastAction.stickerId
            ? { ...s, scale: lastAction.fromScale }
            : s
        )
      );
    } else if (lastAction.type === "stroke") {
      if (canvasRef.current) {
        canvasRef.current.postMessage(JSON.stringify({ type: "undo" }));
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const lastRedo = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, lastRedo]); // 👈 move back to history

    if (lastRedo.type === "sticker") {
      setStickers((prev) => [...prev, lastRedo.sticker]);
    } else if (lastRedo.type === "move") {
      setStickers((prev) =>
        prev.map((s) =>
          s.id === lastRedo.stickerId
            ? { ...s, x: lastRedo.toX, y: lastRedo.toY }
            : s
        )
      );
    } else if (lastRedo.type === "scale") {
      setStickers((prev) =>
        prev.map((s) =>
          s.id === lastRedo.stickerId ? { ...s, scale: lastRedo.toScale } : s
        )
      );
    } else if (lastRedo.type === "stroke") {
      if (canvasRef.current) {
        canvasRef.current.postMessage(JSON.stringify({ type: "redo" }));
      }
    }
  };

  useEffect(() => {
    console.log("History stack:", history);
  }, [history]);

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
  // const updateStickerPosition = (
  //   stickerId: number,
  //   newX: number,
  //   newY: number
  // ) => {
  //   setStickers((prevStickers) =>
  //     prevStickers.map((sticker) =>
  //       sticker.id === stickerId ? { ...sticker, x: newX, y: newY } : sticker
  //     )
  //   );
  // };

  const updateStickerPosition = (
    stickerId: number,
    newX: number,
    newY: number
  ) => {
    setStickers((prevStickers) => {
      const oldSticker = prevStickers.find((s) => s.id === stickerId);
      if (!oldSticker) return prevStickers;

      setHistory((prev) => [
        ...prev,
        {
          type: "move",
          stickerId,
          fromX: oldSticker.x,
          fromY: oldSticker.y,
          toX: newX,
          toY: newY,
        },
      ]);

      setRedoStack([]); // 👈 clear redo

      return prevStickers.map((sticker) =>
        sticker.id === stickerId ? { ...sticker, x: newX, y: newY } : sticker
      );
    });
  };

  // const updateStickerScale = (stickerId: number, newScale: number) => {
  //   setStickers((prevStickers) =>
  //     prevStickers.map((sticker) =>
  //       sticker.id === stickerId ? { ...sticker, scale: newScale } : sticker
  //     )
  //   );
  // };

  const updateStickerScale = (stickerId: number, newScale: number) => {
    setStickers((prevStickers) => {
      const oldSticker = prevStickers.find((s) => s.id === stickerId);
      if (!oldSticker) return prevStickers;

      setHistory((prev) => [
        ...prev,
        {
          type: "scale",
          stickerId,
          fromScale: oldSticker.scale,
          toScale: newScale,
        },
      ]);

      setRedoStack([]); // 👈 clear redo

      return prevStickers.map((sticker) =>
        sticker.id === stickerId ? { ...sticker, scale: newScale } : sticker
      );
    });
  };

  //   const canvasHtml = `
  //   <html>
  //     <body style="margin: 0; overflow: hidden; touch-action: none;">
  //       <canvas id="drawingCanvas" style="width: 100%; height: 100%;"></canvas>
  //       <script>
  //         const canvas = document.getElementById('drawingCanvas');
  //         const ctx = canvas.getContext('2d');
  //         let isDrawing = false;
  //         let lastX = 0;
  //         let lastY = 0;

  //         function resize() {
  //           canvas.width = window.innerWidth;
  //           canvas.height = window.innerHeight;
  //         }

  //         window.addEventListener('resize', resize);
  //         resize();

  //         canvas.addEventListener('touchstart', handleStart);
  //         canvas.addEventListener('touchmove', handleMove);
  //         canvas.addEventListener('touchend', handleEnd);

  //         function handleStart(e) {
  //           e.preventDefault();
  //           isDrawing = true;
  //           const touch = e.touches[0];
  //           [lastX, lastY] = [touch.clientX, touch.clientY];
  //         }

  //         function handleMove(e) {
  //           if (!isDrawing) return;
  //           e.preventDefault();
  //           const touch = e.touches[0];
  //           const currentX = touch.clientX;
  //           const currentY = touch.clientY;

  //           ctx.beginPath();
  //           ctx.moveTo(lastX, lastY);
  //           ctx.lineTo(currentX, currentY);
  //           ctx.strokeStyle = '#ff0000';
  //           ctx.lineWidth = 3;
  //           ctx.lineCap = 'round';
  //           ctx.stroke();

  //           [lastX, lastY] = [currentX, currentY];
  //         }

  //         function handleEnd() {
  //           isDrawing = false;
  //         }

  //         // ✅ Capture drawing as base64 and send it to React Native
  //         function exportDrawing() {
  //           const dataUrl = canvas.toDataURL('image/png');
  //           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', dataUrl }));
  //         }
  //       </script>
  //     </body>
  //   </html>
  // `;

  const canvasHtml = `
<html>
  <body style="margin:0; overflow:hidden; touch-action:none;">
    <canvas id="drawingCanvas" style="width:100%; height:100%;"></canvas>
    <script>
      const canvas = document.getElementById('drawingCanvas');
      const ctx = canvas.getContext('2d');
      let isDrawing = false;
      let lastX = 0;
      let lastY = 0;
      let paths = []; // Store all strokes here

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw();
      }

      function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const path of paths) {
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      window.addEventListener('resize', resize);
      resize();

      let currentPath = [];

      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
        currentPath = [{ x: lastX, y: lastY }];
      });

      canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        currentPath.push({ x, y });

        lastX = x;
        lastY = y;
      });

      canvas.addEventListener('touchend', () => {
        isDrawing = false;
        if (currentPath.length > 0) {
          paths.push(currentPath);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'strokeAdded' }));
        }
        currentPath = [];
      });

      function exportDrawing() {
        const dataUrl = canvas.toDataURL('image/png');
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', dataUrl }));
      }

      // Receive undo signal from React Native
      document.addEventListener('message', function(event) {
        const message = JSON.parse(event.data);
        if (message.type === 'undo') {
          paths.pop();
          redraw();
        }
      });
    </script>
  </body>
</html>
`;

  async function checkFileType(uri: string) {
    const info = await FileSystem.getInfoAsync(uri);
    console.log("File Info:", info);
  }

  const handleExportDrawing = () => {
    if (canvasRef.current) {
      canvasRef.current.injectJavaScript("exportDrawing();");
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need media library permissions to save the image.");
      }
    })();
  }, []);

  const handleExport = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("Image Edits", asset, false);

        Alert.alert(
          "✅ Saved!",
          "Your edited image has been saved to your gallery."
        );
      }
    } catch (error) {
      // commented the below console so that it does not show the error message on app screen when user denies the permission to save the image to gallery
      // console.error("Export failed:", error);
      Alert.alert("❌ Error", "Failed to export the image.");
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.viewShotContainer}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1 }}
          onCapture={(uri) => console.log("Captured composite image URI:", uri)}
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
              const message = JSON.parse(event.nativeEvent.data);
              if (message.type === "export") {
                console.log("Captured Drawing:", message.dataUrl); // ✅ Verify Base64 output
                setDrawingDataUrl(message.dataUrl); // ✅ Save drawing base64
              } else if (message.type === "strokeAdded") {
                setHistory((prev) => [...prev, { type: "stroke" }]);
              }
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
        </ViewShot>
      </View>

      <View style={styles.stickersPanelContainer}>
        {showStickers && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stickersPanel}
          >
            {STICKERS.map((sticker, index) => (
              <TouchableOpacity
                key={index}
                style={styles.stickerButton}
                onPress={() => handleAddSticker(index)}
              >
                <Image source={sticker} style={styles.stickerPreview} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleBack}>
          <X color="white" size={24} />
        </TouchableOpacity>

        {/* uncomment the below View container and its corresponding toolbarCenter styles object to separate 
        editing control buttons from close button */}
        {/* <View style={styles.toolbarCenter}> */}
        <TouchableOpacity style={styles.toolbarButton} onPress={handleUndo}>
          <Undo color="white" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setShowStickers(!showStickers)}
        >
          <Sticker color="white" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleRedo}>
          <Redo color="white" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleExport}>
          <Download color="white" size={24} />
        </TouchableOpacity>
        {/* </View> */}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
    paddingTop: 20,
  },
  viewShotContainer: {
    width: "94%",
    height: "70%",
    borderColor: "#d3d3d3",
    borderWidth: 2,
    marginHorizontal: "auto",
    borderRadius: 8,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: "black",
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
    height: "16%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // Uncomment to apply center toolbar styles
  // toolbarCenter: {
  //   flexDirection: "row",
  //   gap: 20,
  // },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  stickersPanelContainer: {
    height: "14%",
  },
  stickersPanel: {
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    gap: 10,
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
