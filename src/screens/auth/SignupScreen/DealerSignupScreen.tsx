import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { AuthStackParamList } from '../../../navigation/PreLoginRootNavigator';
import { HomeStackParamList } from '../../../navigation/MainNavigator';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import ProvinceSelector from '../../../components/ProvinceSelector';
import BarcodeScanner from '../../../components/BarcodeScanner/BarcodeScanner';
import { uploadService, UploadedFile } from '../../../api/uploadService';
import { authService } from '../../../api/authService';
import { USER_TYPES } from '../../../types/user';
import { useAuthStore } from '../../../store/authStore';

type DealerSignupScreenNavigationProp = StackNavigationProp<HomeStackParamList | AuthStackParamList, 'DealerSignup'>;
type DealerSignupScreenRouteProp = RouteProp<AuthStackParamList, 'DealerSignup'>;

interface ImageItem {
  src: string;
  uri: string;
}

// Dealer Signup Validation Schema
const dealerSignupSchema = z.object({
  codenpp: z.string().optional().or(z.literal('')),
  mst: z.string().optional().or(z.literal('')),
  socccd: z.string().optional().or(z.literal('')),
  tenphapnhan: z.string().optional().or(z.literal('')),
  hoten: z.string().min(1, 'Tên đơn vị là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc').regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().min(1, 'Tỉnh thành là bắt buộc'),
  sotaikhoan: z.string().min(1, 'Số tài khoản là bắt buộc'),
  tentaikhoan: z.string().min(1, 'Tên tài khoản là bắt buộc'),
  nganhang: z.string().min(1, 'Ngân hàng là bắt buộc'),
  tendangnhap: z.string().min(1, 'Tên đăng nhập là bắt buộc').regex(/^[a-z0-9]+$/, 'Tên đăng nhập viết liền không dấu'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  repassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
}).refine((data) => data.password === data.repassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['repassword'],
});

type DealerSignupFormData = z.infer<typeof dealerSignupSchema>;

const DealerSignupScreen: React.FC = () => {
  const navigation = useNavigation<DealerSignupScreenNavigationProp>();
  const route = useRoute<DealerSignupScreenRouteProp>();
  const prefill = route.params;
  // Khi đến từ AccountInfoScreen, SĐT/mật khẩu đã nhập ở bước trước → ẩn 3 field
  // này (data vẫn giữ trong form để gửi API).
  const hideAccountFields = !!prefill?.phone;
  // Doanh nghiệp (C2): thêm Mã số thuế, đổi nhãn "Tên pháp nhân", bỏ ảnh CCCD & cửa hàng
  const isEnterprise = prefill?.subType === 'enterprise';
  // Hộ kinh doanh (C2): có CCCD (ảnh + số + quét QR), Họ tên, MST... như Doanh nghiệp
  const isHousehold = prefill?.subType === 'household';
  // Cả 2 loại C2 này đều hiển thị section "Thông tin pháp nhân" + Mã số thuế, bỏ ảnh cửa hàng
  const isLegalEntity = isEnterprise || isHousehold;
  const { user } = useAuthStore();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  // Image states for each section
  const [businessLicenseFront, setBusinessLicenseFront] = useState<ImageItem | null>(null);
  const [businessLicenseBack, setBusinessLicenseBack] = useState<ImageItem | null>(null);
  const [idCardFront, setIdCardFront] = useState<ImageItem | null>(null);
  const [idCardBack, setIdCardBack] = useState<ImageItem | null>(null);
  const [shopImages, setShopImages] = useState<ImageItem[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [provinceCode, setProvinceCode] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DealerSignupFormData>({
    resolver: zodResolver(dealerSignupSchema),
    defaultValues: {
      codenpp: '',
      mst: '',
      socccd: '',
      tenphapnhan: '',
      hoten: '',
      phone: prefill?.phone || '',
      email: '',
      address: '',
      city: '',
      sotaikhoan: '',
      tentaikhoan: '',
      nganhang: '',
      // Tên đăng nhập = số điện thoại (ẩn field khi đến từ AccountInfoScreen)
      tendangnhap: prefill?.phone || '',
      password: prefill?.password || '',
      repassword: prefill?.repassword || '',
    },
  });

  // Auto-fill codenpp from user if logged in (navigated from DealerListScreen)
  useEffect(() => {
    if (user?.codenpp) {
      setValue('codenpp', user.codenpp);
    }
  }, [user, setValue]);

  // Parse QR CCCD VN (định dạng chuẩn, các trường ngăn cách bởi dấu "|"):
  // <Số CCCD>|<Số CMND cũ>|<Họ và tên>|<Ngày sinh>|<Giới tính>|<Địa chỉ>|<Ngày cấp>
  const handleScanCccd = (raw: string) => {
    setScannerVisible(false);
    const parts = (raw || '').split('|');
    const soCccd = parts[0]?.trim() || '';
    const hoTen = parts[2]?.trim() || '';

    // QR CCCD hợp lệ: đủ số trường, số CCCD là 12 chữ số và có họ tên
    const isValidCccd =
      parts.length >= 3 && /^\d{9,12}$/.test(soCccd) && hoTen.length > 0;

    if (!isValidCccd) {
      Alert.alert(
        'Mã QR không hợp lệ',
        'Mã QR không đúng định dạng. Vui lòng quét lại.',
        [
          { text: 'Đóng', style: 'cancel' },
          { text: 'Quét lại', onPress: () => setScannerVisible(true) },
        ]
      );
      return;
    }

    setValue('socccd', soCccd, { shouldValidate: true });
    setValue('hoten', hoTen, { shouldValidate: true });
  };

  type ImageType = 'businessLicenseFront' | 'businessLicenseBack' | 'idCardFront' | 'idCardBack' | 'shopImages';

  const handleAddImage = (imageType: ImageType, shopImageIndex?: number) => {
    Alert.alert(
      'Thêm ảnh',
      'Chọn nguồn ảnh',
      [
        {
          text: 'Chụp ảnh',
          onPress: () => handleTakePhoto(imageType, shopImageIndex),
        },
        {
          text: 'Thư viện',
          onPress: () => handlePickFromLibrary(imageType, shopImageIndex),
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async (imageType: ImageType, shopImageIndex?: number) => {
    try {
      // Request camera permission for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh.',
            buttonNeutral: 'Hỏi sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập camera để tiếp tục.');
          return;
        }
      }

      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const newImage: ImageItem = {
        src: image.path,
        uri: image.path,
      };

      setImageByType(imageType, newImage, shopImageIndex);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      }
    }
  };

  const handlePickFromLibrary = async (imageType: ImageType, shopImageIndex?: number) => {
    try {
      const selectedImage = await ImagePicker.openPicker({
        multiple: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const newImage: ImageItem = {
        src: selectedImage.path,
        uri: selectedImage.path,
      };

      setImageByType(imageType, newImage, shopImageIndex);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
      }
    }
  };

  const setImageByType = (imageType: ImageType, image: ImageItem, shopImageIndex?: number) => {
    switch (imageType) {
      case 'businessLicenseFront':
        setBusinessLicenseFront(image);
        break;
      case 'businessLicenseBack':
        setBusinessLicenseBack(image);
        break;
      case 'idCardFront':
        setIdCardFront(image);
        break;
      case 'idCardBack':
        setIdCardBack(image);
        break;
      case 'shopImages':
        if (shopImageIndex !== undefined) {
          const newShopImages = [...shopImages];
          newShopImages[shopImageIndex] = image;
          setShopImages(newShopImages);
        } else {
          setShopImages([...shopImages, image]);
        }
        break;
    }
  };

  const handleRemoveImage = (imageType: ImageType, shopImageIndex?: number) => {
    switch (imageType) {
      case 'businessLicenseFront':
        setBusinessLicenseFront(null);
        break;
      case 'businessLicenseBack':
        setBusinessLicenseBack(null);
        break;
      case 'idCardFront':
        setIdCardFront(null);
        break;
      case 'idCardBack':
        setIdCardBack(null);
        break;
      case 'shopImages':
        if (shopImageIndex !== undefined) {
          const newShopImages = [...shopImages];
          newShopImages.splice(shopImageIndex, 1);
          setShopImages(newShopImages);
        }
        break;
    }
  };

  // Helper function to get all images for submission.
  // Doanh nghiệp: chỉ ảnh ĐKKD (bỏ CCCD & ảnh cửa hàng).
  const getAllImages = (): ImageItem[] => {
    const allImages: ImageItem[] = [];
    if (businessLicenseFront) allImages.push(businessLicenseFront);
    if (businessLicenseBack) allImages.push(businessLicenseBack);
    // CCCD: dùng cho đại lý thường (Section dưới) + Hộ kinh doanh (block trên).
    // Doanh nghiệp không có CCCD.
    if (!isEnterprise) {
      if (idCardFront) allImages.push(idCardFront);
      if (idCardBack) allImages.push(idCardBack);
    }
    // Ảnh cửa hàng: chỉ đại lý thường
    if (!isLegalEntity) {
      allImages.push(...shopImages);
    }
    return allImages;
  };

  const onSubmit = async (data: DealerSignupFormData) => {
    // Mã số thuế + Tên pháp nhân bắt buộc với C2 (Doanh nghiệp & Hộ kinh doanh)
    if (isLegalEntity && !data.mst?.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã số thuế');
      return;
    }
    if (isLegalEntity && !data.tenphapnhan?.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên pháp nhân');
      return;
    }
    // Số CCCD bắt buộc với Hộ kinh doanh
    if (isHousehold && !data.socccd?.trim()) {
      Alert.alert('Thông báo', 'Vui lòng quét mã QR hoặc nhập số CCCD');
      return;
    }
    // ĐKKD bắt buộc cho mọi loại
    if (!businessLicenseFront || !businessLicenseBack) {
      Alert.alert('Thông báo', 'Vui lòng tải lên đầy đủ ảnh Giấy đăng ký kinh doanh (mặt trước và mặt sau)');
      return;
    }
    // CCCD bắt buộc với đại lý thường & Hộ kinh doanh (Doanh nghiệp không cần)
    if (!isEnterprise) {
      if (!idCardFront || !idCardBack) {
        Alert.alert('Thông báo', 'Vui lòng tải lên đầy đủ ảnh Căn cước công dân (mặt trước và mặt sau)');
        return;
      }
    }
    // Ảnh cửa hàng chỉ bắt buộc với đại lý thường
    if (!isLegalEntity) {
      if (shopImages.length < 3) {
        Alert.alert('Thông báo', 'Vui lòng tải lên đủ 3 ảnh cửa hàng');
        return;
      }
    }

    const images = getAllImages();

    // Validate terms
    if (!termsAccepted) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    try {
      setIsLoading(true);

      let uploadedFiles: UploadedFile[] = [];

      // Step 1: Upload images
      try {
        // Extract URIs from ImageItem array
        const imagePaths = images.map((img) => img.uri);
        uploadedFiles = await uploadService.uploadMultipleImages(imagePaths);
      } catch (uploadError: any) {
        Alert.alert(
          'Lỗi upload ảnh',
          uploadError.message || 'Không thể upload ảnh. Vui lòng thử lại.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Step 2: Submit dealer signup with uploaded image files
      // Prepare signup request data
      const signupData = {
        codenpp: data.codenpp || '',
        mst: data.mst || '',
        socccd: data.socccd || '',
        tenphapnhan: data.tenphapnhan || '',
        tendangnhap: data.tendangnhap,
        pasword: data.password, // Note: API uses 'pasword' typo
        // Doanh nghiệp: hoten = tên pháp nhân; Hộ KD/đại lý: hoten là họ tên/tên đơn vị
        hoten: isEnterprise ? (data.tenphapnhan || '') : data.hoten,
        phone: data.phone,
        email: data.email || '',
        repassword: data.repassword,
        address: data.address,
        imgs: uploadedFiles,
        tendiaban: data.city,
        madiaban: provinceCode,
        sotaikhoan: data.sotaikhoan,
        nganhang: data.nganhang,
        tentaikhoan: data.tentaikhoan,
        loai: USER_TYPES.DEALER
      };

      // Call signup API
      const response = await authService.signup(signupData);

      Alert.alert(
        'Đăng ký thành công',
        response.message || 'Tài khoản đại lý của bạn đã được tạo thành công!',
        [
          {
            text: 'OK',
            // Điều hướng theo NGỮ CẢNH mở màn:
            //  • Mở từ luồng chưa login (qua AccountInfoScreen → có prefill params):
            //    reset stack về Login, không cho back lại form đã submit.
            //  • Mở từ DealerList (đã login → navigate không params): goBack về DealerList.
            // navigation prop là union (Home|Auth) nên ép kiểu route cho reset.
            onPress: () => {
              if (prefill) {
                navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
              } else {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Đăng ký thất bại',
        error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader
        title={prefill?.title || 'Tạo mới tài khoản hội viên C2'}
        leftIcon={<Text style={styles.backIconHeader}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        extraHeight={120}
      >
        {/* Dealer Registration Form */}
        <View style={styles.registrationCard}>
          {/* Mã đơn vị cha */}
          {/* <Controller
            control={control}
            name="codenpp"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mã đơn vị cha</Text>
                <TextInput
                  style={[styles.input, errors.codenpp && styles.inputError]}
                  placeholder="Nhập mã đơn vị cha"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.codenpp && (
                  <Text style={styles.errorText}>{errors.codenpp.message}</Text>
                )}
              </View>
            )}
          /> */}

          {/* Section "Thông tin pháp nhân" (C2: Doanh nghiệp & Hộ kinh doanh) */}
          {isLegalEntity && (
            <View style={styles.legalHeader}>
              <View style={styles.legalIconWrap}>
                <Icon name="warranty-policy" size={26} color={COLORS.primary} />
              </View>
              <View style={styles.legalHeaderText}>
                <Text style={styles.legalTitle}>Thông tin pháp nhân</Text>
                <Text style={styles.legalSubtitle}>
                  Để ARC phục vụ quý hội viên tốt hơn, vui lòng nhập thông tin sau:
                </Text>
              </View>
            </View>
          )}

          {/* Hộ kinh doanh: Ảnh CCCD → Số CCCD (quét QR) → Họ và tên ở đầu form */}
          {isHousehold && (
            <>
              {/* Hình ảnh CCCD */}
              <View style={styles.imageUploadSection}>
                <Text style={styles.sectionTitle}>
                  Hình ảnh CCCD <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.imageRow}>
                  <View style={styles.imageColumn}>
                    <Text style={styles.imageLabel}>Mặt trước</Text>
                    {idCardFront ? (
                      <View style={styles.imageItem}>
                        <Image source={{ uri: idCardFront.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage('idCardFront')}
                        >
                          <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={() => handleAddImage('idCardFront')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addImageIcon}>+</Text>
                        <Text style={styles.addImageText}>Mặt trước</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.imageColumn}>
                    <Text style={styles.imageLabel}>Mặt sau</Text>
                    {idCardBack ? (
                      <View style={styles.imageItem}>
                        <Image source={{ uri: idCardBack.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage('idCardBack')}
                        >
                          <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={() => handleAddImage('idCardBack')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addImageIcon}>+</Text>
                        <Text style={styles.addImageText}>Mặt sau</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Số CCCD + nút Quét mã QR (số CCCD chỉ điền từ QR, không cho sửa) */}
              <Controller
                control={control}
                name="socccd"
                render={({ field: { value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Số CCCD <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.cccdRow}>
                      {/* Có số CCCD → hiện số (read-only); chưa có → hiện hint */}
                      <Text style={value ? styles.cccdValue : styles.cccdHint}>
                        {value || 'Quét mã QR trên CCCD'}
                      </Text>
                      <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => setScannerVisible(true)}
                        activeOpacity={0.85}
                      >
                        <Icon name="in-out" size={18} color={COLORS.white} />
                        <Text style={styles.scanButtonText}>Quét mã QR</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.socccd && (
                      <Text style={styles.errorText}>{errors.socccd.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Họ và tên (auto điền từ QR, vẫn cho sửa) */}
              <Controller
                control={control}
                name="hoten"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Họ và tên <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, errors.hoten && styles.inputError]}
                      placeholder="VD: Nguyễn Văn A"
                      placeholderTextColor={COLORS.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                    {errors.hoten && (
                      <Text style={styles.errorText}>{errors.hoten.message}</Text>
                    )}
                  </View>
                )}
              />
            </>
          )}

          {/* Mã số thuế (C2: Doanh nghiệp & Hộ kinh doanh) */}
          {isLegalEntity && (
            <Controller
              control={control}
              name="mst"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Mã số thuế <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.mst && styles.inputError]}
                    placeholder="Nhập mã số thuế"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                  {errors.mst && (
                    <Text style={styles.errorText}>{errors.mst.message}</Text>
                  )}
                </View>
              )}
            />
          )}

          {/* Tên pháp nhân (Doanh nghiệp & Hộ kinh doanh) — dùng param tenphapnhan.
              Với Doanh nghiệp đồng bộ luôn hoten = tenphapnhan. */}
          {isLegalEntity && (
            <Controller
              control={control}
              name="tenphapnhan"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Tên pháp nhân <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.tenphapnhan && styles.inputError]}
                    placeholder="Nhập tên pháp nhân"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      // Doanh nghiệp: hoten = tên pháp nhân (Hộ KD đã có hoten riêng)
                      if (isEnterprise) setValue('hoten', text, { shouldValidate: true });
                    }}
                    onBlur={onBlur}
                  />
                  {errors.tenphapnhan && (
                    <Text style={styles.errorText}>{errors.tenphapnhan.message}</Text>
                  )}
                </View>
              )}
            />
          )}

          {/* Tên đơn vị (đại lý thường) */}
          {!isLegalEntity && (
            <Controller
              control={control}
              name="hoten"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Tên đơn vị <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.hoten && styles.inputError]}
                    placeholder="Nhập tên đơn vị"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  {errors.hoten && (
                    <Text style={styles.errorText}>{errors.hoten.message}</Text>
                  )}
                </View>
              )}
            />
          )}

          {/* Số điện thoại (ẩn nếu đã nhập ở AccountInfoScreen) */}
          {!hideAccountFields && (
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Số điện thoại <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                  />
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone.message}</Text>
                  )}
                </View>
              )}
            />
          )}

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Nhập email"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          {/* Địa chỉ */}
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Địa chỉ <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address.message}</Text>
                )}
              </View>
            )}
          />

          {/* Tỉnh thành */}
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Tỉnh thành <Text style={styles.required}>*</Text>
                </Text>
                <ProvinceSelector
                  selectedProvince={value}
                  onProvinceChange={(provinceName, provinceCode) => {
                    onChange(provinceName);
                    setProvinceCode(provinceCode);
                  }}
                  placeholder="Chọn tỉnh thành"
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city.message}</Text>
                )}
              </View>
            )}
          />

          {/* Số tài khoản */}
          <Controller
            control={control}
            name="sotaikhoan"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Số tài khoản ngân hàng<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.sotaikhoan && styles.inputError]}
                  placeholder="Nhập số tài khoản"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                />
                {errors.sotaikhoan && (
                  <Text style={styles.errorText}>{errors.sotaikhoan.message}</Text>
                )}
              </View>
            )}
          />

          {/* Tên tài khoản */}
          <Controller
            control={control}
            name="tentaikhoan"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Tên tài khoản ngân hàng<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.tentaikhoan && styles.inputError]}
                  placeholder="Nhập tên tài khoản"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.tentaikhoan && (
                  <Text style={styles.errorText}>{errors.tentaikhoan.message}</Text>
                )}
              </View>
            )}
          />

          {/* Ngân hàng */}
          <Controller
            control={control}
            name="nganhang"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Ngân hàng <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.nganhang && styles.inputError]}
                  placeholder="Nhập tên ngân hàng"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.nganhang && (
                  <Text style={styles.errorText}>{errors.nganhang.message}</Text>
                )}
              </View>
            )}
          />

          {/* Tên đăng nhập = số điện thoại → ẩn khi đã nhập ở AccountInfoScreen */}
          {!hideAccountFields && (
            <Controller
              control={control}
              name="tendangnhap"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Tên đăng nhập <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.tendangnhap && styles.inputError]}
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                  />
                  {errors.tendangnhap && (
                    <Text style={styles.errorText}>{errors.tendangnhap.message}</Text>
                  )}
                </View>
              )}
            />
          )}

          {/* Mật khẩu + Nhập lại mật khẩu (ẩn nếu đã nhập ở AccountInfoScreen) */}
          {!hideAccountFields && (
            <>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Mật khẩu <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          errors.password && styles.inputError,
                        ]}
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor={COLORS.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Icon
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color={COLORS.gray500}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="repassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Nhập lại mật khẩu <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          errors.repassword && styles.inputError,
                        ]}
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor={COLORS.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showRePassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowRePassword(!showRePassword)}
                      >
                        <Icon
                          name={showRePassword ? 'eye-off' : 'eye'}
                          size={20}
                          color={COLORS.gray500}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.repassword && (
                      <Text style={styles.errorText}>{errors.repassword.message}</Text>
                    )}
                  </View>
                )}
              />
            </>
          )}

          {/* Section 1: Giấy Đăng ký kinh doanh */}
          <View style={styles.imageUploadSection}>
            <Text style={styles.sectionTitle}>
              Giấy Đăng ký kinh doanh <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.imageRow}>
              {/* Mặt trước */}
              <View style={styles.imageColumn}>
                <Text style={styles.imageLabel}>Mặt trước</Text>
                {businessLicenseFront ? (
                  <View style={styles.imageItem}>
                    <Image source={{ uri: businessLicenseFront.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage('businessLicenseFront')}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={() => handleAddImage('businessLicenseFront')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.addImageIcon}>+</Text>
                    <Text style={styles.addImageText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Mặt sau */}
              <View style={styles.imageColumn}>
                <Text style={styles.imageLabel}>Mặt sau</Text>
                {businessLicenseBack ? (
                  <View style={styles.imageItem}>
                    <Image source={{ uri: businessLicenseBack.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage('businessLicenseBack')}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={() => handleAddImage('businessLicenseBack')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.addImageIcon}>+</Text>
                    <Text style={styles.addImageText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* CCCD + Ảnh cửa hàng (dạng cũ): chỉ dùng cho đại lý thường.
              Với C2 (Doanh nghiệp/Hộ kinh doanh) đã có block riêng ở đầu form. */}
          {!isLegalEntity && (
            <>
              {/* Section 2: Căn cước công dân */}
              <View style={styles.imageUploadSection}>
                <Text style={styles.sectionTitle}>
                  Căn cước công dân <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.imageRow}>
                  {/* Mặt trước */}
                  <View style={styles.imageColumn}>
                    <Text style={styles.imageLabel}>Mặt trước</Text>
                    {idCardFront ? (
                      <View style={styles.imageItem}>
                        <Image source={{ uri: idCardFront.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage('idCardFront')}
                        >
                          <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={() => handleAddImage('idCardFront')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addImageIcon}>+</Text>
                        <Text style={styles.addImageText}>Thêm ảnh</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {/* Mặt sau */}
                  <View style={styles.imageColumn}>
                    <Text style={styles.imageLabel}>Mặt sau</Text>
                    {idCardBack ? (
                      <View style={styles.imageItem}>
                        <Image source={{ uri: idCardBack.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage('idCardBack')}
                        >
                          <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={() => handleAddImage('idCardBack')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addImageIcon}>+</Text>
                        <Text style={styles.addImageText}>Thêm ảnh</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Section 3: Ảnh cửa hàng */}
              <View style={styles.imageUploadSection}>
                <Text style={styles.sectionTitle}>
                  Ảnh cửa hàng <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.sectionSubtitle}>Tải lên 3 ảnh cửa hàng</Text>
                <View style={styles.imageGrid}>
                  {[0, 1, 2].map((index) => (
                    <View key={index} style={styles.imageColumn}>
                      <Text style={styles.imageLabel}>Ảnh {index + 1}</Text>
                      {shopImages[index] ? (
                        <View style={styles.imageItem}>
                          <Image source={{ uri: shopImages[index].uri }} style={styles.imagePreview} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => handleRemoveImage('shopImages', index)}
                          >
                            <Text style={styles.removeImageText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addImageButton}
                          onPress={() => handleAddImage('shopImages', index)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.addImageIcon}>+</Text>
                          <Text style={styles.addImageText}>Thêm ảnh</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Tôi đã đọc, hiểu và chấp nhận{' '}
              <Text style={styles.termsLink}>Điều kiện và Điều khoản hội viên</Text>
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Quét QR trên CCCD → tự điền Số CCCD + Họ và tên */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScanCccd}
        title="Quét mã QR trên CCCD"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backIconHeader: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  // Registration Card
  registrationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },

  // Input Fields
  // Section "Thông tin pháp nhân"
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  legalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalHeaderText: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  legalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // Số CCCD + nút quét QR
  cccdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cccdHint: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  cccdValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    padding: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Image Upload
  imageUploadSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  imageColumn: {
    flex: 1,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  imageItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 4,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DealerSignupScreen;
