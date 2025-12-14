import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner';

interface Province {
  id: string;
  TenDiaBan: string;
}

interface District {
  id: string;
  TenDiaBan: string;
  provinceId: string;
}

interface Ward {
  id: string;
  TenDiaBan: string;
  districtId: string;
}

const WarrantyReportScreen = () => {
  const navigation = useNavigation();

  // Form states
  const [serial, setSerial] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState<Province | null>(null);
  const [district, setDistrict] = useState<District | null>(null);
  const [ward, setWard] = useState<Ward | null>(null);
  const [address, setAddress] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Mock data - replace with API
  const provinces: Province[] = [
    { id: '1', TenDiaBan: 'Hà Nội' },
    { id: '2', TenDiaBan: 'TP. Hồ Chí Minh' },
    { id: '3', TenDiaBan: 'Đà Nẵng' },
  ];

  const districts: District[] = [
    { id: '1', TenDiaBan: 'Quận Hoàn Kiếm', provinceId: '1' },
    { id: '2', TenDiaBan: 'Quận Hai Bà Trưng', provinceId: '1' },
    { id: '3', TenDiaBan: 'Quận 1', provinceId: '2' },
    { id: '4', TenDiaBan: 'Quận Tân Bình', provinceId: '2' },
  ];

  const wards: Ward[] = [
    { id: '1', TenDiaBan: 'Phường Hàng Bạc', districtId: '1' },
    { id: '2', TenDiaBan: 'Phường Hàng Bồ', districtId: '1' },
    { id: '3', TenDiaBan: 'Phường Bạch Đằng', districtId: '2' },
  ];

  const filteredDistricts = province
    ? districts.filter((d) => d.provinceId === province.id)
    : [];

  const filteredWards = district
    ? wards.filter((w) => w.districtId === district.id)
    : [];

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setSerial(data);
    setShowScanner(false);
  };

  const handleSearchByPhone = () => {
    Alert.alert(
      'Tìm theo SĐT',
      'Tính năng tìm kiếm theo số điện thoại đang được phát triển.',
      [{ text: 'OK' }]
    );
  };

  const handleAddImage = () => {
    Alert.alert(
      'Chụp ảnh',
      'Tính năng chụp ảnh đang được phát triển.',
      [{ text: 'OK' }]
    );
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = () => {
    // Validation
    if (!serial.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số serial');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    if (!province) {
      Alert.alert('Lỗi', 'Vui lòng chọn tỉnh thành');
      return;
    }
    if (!district) {
      Alert.alert('Lỗi', 'Vui lòng chọn quận huyện');
      return;
    }
    if (!ward) {
      Alert.alert('Lỗi', 'Vui lòng chọn xã phường');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }
    if (!issueDescription.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập thông tin lỗi');
      return;
    }

    // TODO: Submit to API
    Alert.alert(
      'Thành công',
      'Báo ca bảo hành đã được gửi thành công!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Clear form or navigate back
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderLocationModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    onSelect: (item: any) => void,
    selectedItem: any
  ) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Tìm kiếm..."
              placeholderTextColor={COLORS.gray400}
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              autoFocus
            />
            {searchKeyword !== '' && (
              <TouchableOpacity
                onPress={() => setSearchKeyword('')}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.modalListWrapper}>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={true}>
              {data
                .filter((item) =>
                  item.TenDiaBan.toLowerCase().includes(searchKeyword.toLowerCase())
                )
                .map((item, index, filteredArray) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.modalOption,
                      index === filteredArray.length - 1 && styles.modalOptionLast,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                      setSearchKeyword('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedItem?.id === item.id && styles.modalOptionTextActive,
                      ]}
                    >
                      {item.TenDiaBan}
                    </Text>
                    {selectedItem?.id === item.id && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Báo ca bảo hành"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            {/* Serial Number */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>
                  Số serial <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity onPress={handleSearchByPhone}>
                  <Text style={styles.linkText}>
                    📞 Tìm theo Tên/SĐT
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔍</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Serial"
                  placeholderTextColor={COLORS.gray400}
                  value={serial}
                  onChangeText={setSerial}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={handleScanQR} style={styles.scanButton}>
                  <Text style={styles.scanIcon}>⚡</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Customer Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Tên khách hàng <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Họ tên"
                  placeholderTextColor={COLORS.gray400}
                  value={customerName}
                  onChangeText={setCustomerName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  placeholderTextColor={COLORS.gray400}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Province */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Tỉnh thành <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectWrapper}
                onPress={() => setShowProvinceModal(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectText,
                    !province && styles.selectTextPlaceholder,
                  ]}
                >
                  {province ? province.TenDiaBan : 'Chọn tỉnh thành'}
                </Text>
                <Text style={styles.selectIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* District */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Quận huyện <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectWrapper,
                  !province && styles.selectWrapperDisabled,
                ]}
                onPress={() => province && setShowDistrictModal(true)}
                activeOpacity={0.7}
                disabled={!province}
              >
                <Text
                  style={[
                    styles.selectText,
                    !district && styles.selectTextPlaceholder,
                  ]}
                >
                  {district ? district.TenDiaBan : 'Chọn quận huyện'}
                </Text>
                <Text style={styles.selectIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Ward */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Xã phường <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectWrapper,
                  !district && styles.selectWrapperDisabled,
                ]}
                onPress={() => district && setShowWardModal(true)}
                activeOpacity={0.7}
                disabled={!district}
              >
                <Text
                  style={[
                    styles.selectText,
                    !ward && styles.selectTextPlaceholder,
                  ]}
                >
                  {ward ? ward.TenDiaBan : 'Chọn xã phường'}
                </Text>
                <Text style={styles.selectIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Địa chỉ <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ"
                  placeholderTextColor={COLORS.gray400}
                  value={address}
                  onChangeText={setAddress}
                  editable={!isLoading}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            {/* Issue Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Thông tin lỗi / hiện tượng hư hỏng <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, styles.textareaWrapper]}>
                <Text style={[styles.inputIcon, styles.textareaIcon]}>📝</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Mô tả chi tiết hiện tượng hư hỏng..."
                  placeholderTextColor={COLORS.gray400}
                  value={issueDescription}
                  onChangeText={setIssueDescription}
                  editable={!isLoading}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Add Image Button */}
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
              activeOpacity={0.7}
            >
              <Text style={styles.addImageButtonText}>Chụp ảnh thiết bị</Text>
            </TouchableOpacity>

            {/* Images Preview */}
            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageCard}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageIcon}>🗑️</Text>
                      <Text style={styles.removeImageText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi thông tin</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Modals */}
      {renderLocationModal(
        showProvinceModal,
        () => setShowProvinceModal(false),
        'Chọn tỉnh thành',
        provinces,
        (item) => {
          setProvince(item);
          setDistrict(null);
          setWard(null);
        },
        province
      )}

      {renderLocationModal(
        showDistrictModal,
        () => setShowDistrictModal(false),
        'Chọn quận huyện',
        filteredDistricts,
        (item) => {
          setDistrict(item);
          setWard(null);
        },
        district
      )}

      {renderLocationModal(
        showWardModal,
        () => setShowWardModal(false),
        'Chọn xã phường',
        filteredWards,
        setWard,
        ward
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanComplete}
        title="Quét mã sản phẩm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },

  // Input Fields
  inputContainer: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  required: {
    color: COLORS.error,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  textareaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  textareaIcon: {
    marginTop: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scanButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  scanIcon: {
    fontSize: 24,
  },

  // Select Fields
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  selectWrapperDisabled: {
    opacity: 0.5,
  },
  selectText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  selectTextPlaceholder: {
    color: COLORS.gray400,
  },
  selectIcon: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: '300',
  },

  // Image Upload
  addImageButton: {
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
  },
  addImageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  imagesContainer: {
    marginBottom: SPACING.md,
  },
  imageCard: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.gray100,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  removeImageIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  removeImageText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    height: '70%',
    ...SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  modalSearchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearSearchButton: {
    padding: SPACING.xs,
  },
  clearSearchIcon: {
    fontSize: 16,
    color: COLORS.gray500,
  },
  modalListWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  modalList: {
    flex: 1,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  checkIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default WarrantyReportScreen;
