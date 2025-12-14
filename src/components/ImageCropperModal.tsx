import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING } from '../config/theme';

interface ImageCropperModalProps {
  visible: boolean;
  imageUri: string;
  onCancel: () => void;
  onConfirm: (croppedUri: string) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  visible,
  imageUri,
  onCancel,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCropImage = async () => {
    try {
      setLoading(true);
      const croppedImage = await ImagePicker.openCropper({
        path: imageUri,
        width: 400,
        height: 400,
        cropperCircleOverlay: true,
        enableRotationGesture: true,
        freeStyleCropEnabled: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      setLoading(false);
      onConfirm(croppedImage.path);
    } catch (error: any) {
      setLoading(false);
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể cắt ảnh. Vui lòng thử lại.');
      }
      onCancel();
    }
  };

  React.useEffect(() => {
    if (visible && imageUri) {
      handleCropImage();
    }
  }, [visible, imageUri]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default ImageCropperModal;
