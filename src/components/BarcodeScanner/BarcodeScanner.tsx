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
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
}

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
  const device = useCameraDevice('back');

  useEffect(() => {
    if (visible) {
      hasScannedRef.current = false;
      checkCameraPermission();
    } else {
      setIsActive(false);
      hasScannedRef.current = false;
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
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể truy cập camera. Vui lòng thử lại.');
      onClose();
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'ean-8',
      'code-128',
      'code-39',
      'code-93',
      'codabar',
      'itf',
      'upc-a',
      'upc-e',
      'pdf-417',
      'aztec',
      'data-matrix',
    ],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !hasScannedRef.current) {
        // Vibrate on scan (optional)
        // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        hasScannedRef.current = true;
        const scannedValue = codes[0].value;
        setIsActive(false);
        onScan(scannedValue);
      }
    },
  });

  const handleClose = () => {
    setIsActive(false);
    hasScannedRef.current = false;
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Header with SafeAreaView */}
        <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
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
        </SafeAreaView>

        {/* Camera View */}
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

            {/* Overlay with scanning frame */}
            <View style={styles.overlay}>
              <View style={styles.overlayTop} />
              <View style={styles.overlayMiddle}>
                <View style={styles.overlaySide} />
                <View style={styles.scanFrame}>
                  {/* Corner indicators */}
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />
                </View>
                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayBottom}>
                <Text style={styles.instructionText}>
                  Đưa mã vạch/QR code vào khung hình
                </Text>

                {/* Flash Toggle Button */}
                <TouchableOpacity
                  style={styles.flashButton}
                  onPress={() => setFlashEnabled(!flashEnabled)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flashIcon}>
                    {flashEnabled ? '⚡' : '🔦'}
                  </Text>
                  <Text style={styles.flashText}>
                    {flashEnabled ? 'Tắt đèn' : 'Bật đèn'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang khởi động camera...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const FRAME_SIZE = 280;
const CORNER_SIZE = 40;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Header with Safe Area
  safeAreaHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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

  // Loading
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

  // Overlay
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },

  // Scan Frame
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },

  // Corner Indicators
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: BORDER_RADIUS.md,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: BORDER_RADIUS.md,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: BORDER_RADIUS.md,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: BORDER_RADIUS.md,
  },

  // Instruction
  instructionText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: SPACING.xl,
  },

  // Flash Button
  flashButton: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  flashIcon: {
    fontSize: 24,
  },
  flashText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default BarcodeScanner;
