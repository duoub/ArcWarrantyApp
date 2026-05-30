import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;
const PADDING = 14;
const STABLE_DELAY = 500;
const DEFAULT_FRAME_SIZE = 260;

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  title = 'Quét mã',
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  const hasScannedRef = useRef(false);
  const pendingCodeRef = useRef<string | null>(null);
  const stableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearFrameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraSizeRef = useRef({ width: 0, height: 0 });
  const currentFrameRef = useRef({ x: 0, y: 0, w: DEFAULT_FRAME_SIZE, h: DEFAULT_FRAME_SIZE, r: 0 });

  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animW = useRef(new Animated.Value(DEFAULT_FRAME_SIZE)).current;
  const animH = useRef(new Animated.Value(DEFAULT_FRAME_SIZE)).current;
  const animR = useRef(new Animated.Value(0)).current; // rotation degrees

  const device = useCameraDevice('back');

  const animateFrameTo = (x: number, y: number, w: number, h: number, r: number) => {
    // Normalize rotation để không animate theo đường vòng (e.g. 350° → -10°)
    const prev = currentFrameRef.current;
    let targetR = r;
    const diff = r - prev.r;
    if (diff > 180) targetR = r - 360;
    if (diff < -180) targetR = r + 360;

    Animated.parallel([
      Animated.spring(animX, { toValue: x, useNativeDriver: false, tension: 120, friction: 10 }),
      Animated.spring(animY, { toValue: y, useNativeDriver: false, tension: 120, friction: 10 }),
      Animated.spring(animW, { toValue: w, useNativeDriver: false, tension: 120, friction: 10 }),
      Animated.spring(animH, { toValue: h, useNativeDriver: false, tension: 120, friction: 10 }),
      Animated.spring(animR, { toValue: targetR, useNativeDriver: false, tension: 120, friction: 10 }),
    ]).start();
    currentFrameRef.current = { x, y, w, h, r: targetR };
  };

  const resetFrameToCenter = () => {
    const { width, height } = cameraSizeRef.current;
    if (width === 0) return;
    const cx = (width - DEFAULT_FRAME_SIZE) / 2;
    const cy = (height - DEFAULT_FRAME_SIZE) / 2;
    animX.stopAnimation(); animX.setValue(cx);
    animY.stopAnimation(); animY.setValue(cy);
    animW.stopAnimation(); animW.setValue(DEFAULT_FRAME_SIZE);
    animH.stopAnimation(); animH.setValue(DEFAULT_FRAME_SIZE);
    animR.stopAnimation(); animR.setValue(0);
    currentFrameRef.current = { x: cx, y: cy, w: DEFAULT_FRAME_SIZE, h: DEFAULT_FRAME_SIZE, r: 0 };
  };

  const clearAllTimers = () => {
    if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
    if (clearFrameTimerRef.current) clearTimeout(clearFrameTimerRef.current);
    stableTimerRef.current = null;
    clearFrameTimerRef.current = null;
  };

  useEffect(() => {
    if (visible) {
      hasScannedRef.current = false;
      pendingCodeRef.current = null;
      resetFrameToCenter();
      checkCameraPermission();
    } else {
      setIsActive(false);
      hasScannedRef.current = false;
      pendingCodeRef.current = null;
      clearAllTimers();
      resetFrameToCenter();
    }
  }, [visible]);

  const checkCameraPermission = async () => {
    try {
      const permission = await Camera.requestCameraPermission();
      if (permission === 'granted') {
        setHasPermission(true);
        setIsActive(true);
      } else if (permission === 'denied') {
        Alert.alert(
          'Quyền truy cập camera',
          'Vui lòng cấp quyền truy cập camera trong cài đặt để sử dụng tính năng quét mã.',
          [
            { text: 'Hủy', onPress: onClose },
            { text: 'Mở cài đặt', onPress: () => Camera.requestCameraPermission() },
          ]
        );
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể truy cập camera. Vui lòng thử lại.');
      onClose();
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'code-93',
      'codabar', 'itf', 'upc-a', 'upc-e', 'pdf-417', 'aztec', 'data-matrix',
    ],
    onCodeScanned: (codes, frame) => {
      if (hasScannedRef.current) return;

      if (codes.length === 0) {
        // QR ra khỏi tầm nhìn — reset khung về giữa sau delay
        clearAllTimers();
        clearFrameTimerRef.current = setTimeout(() => {
          resetFrameToCenter();
          pendingCodeRef.current = null;
        }, 400);
        return;
      }

      if (clearFrameTimerRef.current) {
        clearTimeout(clearFrameTimerRef.current);
        clearFrameTimerRef.current = null;
      }

      const code = codes[0];
      const { width: camW, height: camH } = cameraSizeRef.current;

      // Không có frame info → scan ngay
      if (!code.frame || camW === 0) {
        if (code.value) {
          hasScannedRef.current = true;
          setIsActive(false);
          onScan(code.value);
        }
        return;
      }

      // Từ log thực tế: frame 640×480 (landscape), code.frame đã ở portrait-space
      // (VisionCamera normalize nội bộ). Treat frame.width=640 là chiều dọc,
      // frame.height=480 là chiều ngang của preview portrait.
      const bufW = frame.height; // 480 — ngang
      const bufH = frame.width;  // 640 — dọc
      const scale = Math.max(camW / bufW, camH / bufH);
      const offsetX = (bufW * scale - camW) / 2;
      const offsetY = (bufH * scale - camH) / 2;

      const px = code.frame.x * scale - offsetX;
      const py = code.frame.y * scale - offsetY;
      const pw = code.frame.width * scale;
      const ph = code.frame.height * scale;

      const targetX = Math.max(0, px - PADDING);
      const targetY = Math.max(0, py - PADDING);
      const targetW = Math.min(pw + PADDING * 2, camW - targetX);
      const targetH = Math.min(ph + PADDING * 2, camH - targetY);

      // Góc xoay: chỉ tính khi corners hợp lệ và QR thực sự bị nghiêng
      let targetR = 0;
      if (code.corners && code.corners.length >= 2) {
        const c0 = code.corners[0];
        const c1 = code.corners[1];
        const dx = c1.x - c0.x;
        const dy = c1.y - c0.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        // Normalize về [-45, 45] — QR vuông nên góc ngoài range này là nhiễu
        targetR = ((angle % 90) + 90) % 90;
        if (targetR > 45) targetR -= 90;
      }

      if (code.value) pendingCodeRef.current = code.value;

      const prev = currentFrameRef.current;
      // QR gần vuông (ratio ≈ 1), barcode 1D có ratio > 1.5
      const isBarcode = pw > ph * 1.5 || ph > pw * 1.5;
      const thresholdXY = isBarcode ? 12 : 6;
      const thresholdWH = isBarcode ? 24 : 8;
      const stableDelay = isBarcode ? 250 : STABLE_DELAY;

      const moved =
        Math.abs(prev.x - targetX) > thresholdXY ||
        Math.abs(prev.y - targetY) > thresholdXY ||
        Math.abs(prev.w - targetW) > thresholdWH ||
        Math.abs(prev.h - targetH) > thresholdWH ||
        Math.abs(prev.r - targetR) > 2;

      // Luôn animate khung
      animateFrameTo(targetX, targetY, targetW, targetH, targetR);

      if (moved) {
        if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
        stableTimerRef.current = setTimeout(() => {
          if (!hasScannedRef.current && pendingCodeRef.current) {
            hasScannedRef.current = true;
            setIsActive(false);
            onScan(pendingCodeRef.current);
          }
        }, stableDelay);
      }
      // Nếu không di chuyển: giữ nguyên stable timer đang chạy
    },
  });

  const handleClose = () => {
    setIsActive(false);
    hasScannedRef.current = false;
    pendingCodeRef.current = null;
    clearAllTimers();
    onClose();
  };

  if (!visible) return null;

  const content = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={styles.cameraContainer}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          cameraSizeRef.current = { width, height };
          // Đặt khung giữa màn hình ngay khi layout sẵn sàng
          const cx = (width - DEFAULT_FRAME_SIZE) / 2;
          const cy = (height - DEFAULT_FRAME_SIZE) / 2;
          animX.setValue(cx);
          animY.setValue(cy);
          animW.setValue(DEFAULT_FRAME_SIZE);
          animH.setValue(DEFAULT_FRAME_SIZE);
          currentFrameRef.current = { x: cx, y: cy, w: DEFAULT_FRAME_SIZE, h: DEFAULT_FRAME_SIZE, r: 0 };
        }}
      >
        {device && hasPermission ? (
          <>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              codeScanner={codeScanner}
              enableZoomGesture
              torch={flashEnabled ? 'on' : 'off'}
            />

            {/* Instruction text */}
            <View style={styles.instructionRow} pointerEvents="none">
              <Text style={styles.instructionText}>
                Đưa mã vạch/QR code vào khung hình
              </Text>
            </View>

            {/* Khung vàng animated */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.trackingFrame,
                {
                  left: animX,
                  top: animY,
                  width: animW,
                  height: animH,
                  transform: [{ rotate: animR.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) }],
                },
              ]}
            >
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </Animated.View>

            {/* Flash */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setFlashEnabled(v => !v)}
                activeOpacity={0.7}
              >
                <Text style={styles.controlIcon}>{flashEnabled ? '⚡' : '🔦'}</Text>
                <Text style={styles.controlText}>{flashEnabled ? 'Tắt đèn' : 'Bật đèn'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang khởi động camera...</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {Platform.OS === 'ios' ? (
          <SafeAreaView style={styles.container} edges={['top']}>
            {content}
          </SafeAreaView>
        ) : (
          <View style={styles.container}>
            {content}
          </View>
        )}
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 26,
    color: COLORS.white,
    fontWeight: '300',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.white,
  },
  instructionRow: {
    position: 'absolute',
    bottom: SPACING.xl + 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: SPACING.xl,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  trackingFrame: {
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FFD600',
  },
  cornerTopLeft: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: BORDER_RADIUS.sm,
  },
  cornerTopRight: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: BORDER_RADIUS.sm,
  },
  cornerBottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  cornerBottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  controlsRow: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  controlIcon: { fontSize: 20 },
  controlText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default BarcodeScanner;
