import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import ProvinceSelector from '../../../components/ProvinceSelector';

interface Distributor {
  id: string;
  TenTram: string;
  SoDienThoai: string;
  DiaChi: string;
  TinhThanh: string;
}

const DistributionSystemScreen = () => {
  const navigation = useNavigation();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('Tất cả');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for distributors
  useEffect(() => {
    const mockDistributors: Distributor[] = [
      {
        id: '1',
        TenTram: 'Nhà phân phối AKITO Hà Nội',
        SoDienThoai: '024 3666 7777',
        DiaChi: '88 Đường Láng, Quận Đống Đa, Hà Nội',
        TinhThanh: 'Hà Nội',
      },
      {
        id: '2',
        TenTram: 'Nhà phân phối AKITO TP.HCM',
        SoDienThoai: '028 3999 8888',
        DiaChi: '234 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh',
        TinhThanh: 'TP. Hồ Chí Minh',
      },
      {
        id: '3',
        TenTram: 'Nhà phân phối AKITO Đà Nẵng',
        SoDienThoai: '0236 3888 9999',
        DiaChi: '99 Nguyễn Văn Linh, Quận Thanh Khê, Đà Nẵng',
        TinhThanh: 'Đà Nẵng',
      },
      {
        id: '4',
        TenTram: 'Đại lý AKITO Long Biên',
        SoDienThoai: '024 3777 8888',
        DiaChi: '456 Nguyễn Văn Cừ, Quận Long Biên, Hà Nội',
        TinhThanh: 'Hà Nội',
      },
      {
        id: '5',
        TenTram: 'Đại lý AKITO Bình Thạnh',
        SoDienThoai: '028 3888 7777',
        DiaChi: '789 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP. Hồ Chí Minh',
        TinhThanh: 'TP. Hồ Chí Minh',
      },
    ];
    setDistributors(mockDistributors);
    setFilteredDistributors(mockDistributors);
  }, []);

  // Filter distributors based on keyword and province
  useEffect(() => {
    let filtered = distributors;

    // Filter by province
    if (selectedProvince !== 'Tất cả') {
      filtered = filtered.filter(
        (distributor) => distributor.TinhThanh === selectedProvince
      );
    }

    // Filter by keyword
    if (keyword.trim()) {
      filtered = filtered.filter((distributor) =>
        distributor.TenTram.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    setFilteredDistributors(filtered);
  }, [keyword, selectedProvince, distributors]);

  const handleCallPhone = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
        }
      })
      .catch((err) => Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi'));
  };

  const handleShowMap = (distributor: Distributor) => {
    Alert.alert('Chỉ đường', `Chỉ đường đến ${distributor.TenTram}`);
  };

  const renderDistributor = (item: Distributor) => (
    <View key={item.id} style={styles.distributorCard}>
      {/* Header */}
      <View style={styles.distributorHeader}>
        <Text style={styles.distributorName}>{item.TenTram}</Text>
      </View>

      {/* Info */}
      <View style={styles.distributorInfo}>
        {/* Phone */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📞</Text>
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Điện thoại</Text>
            <TouchableOpacity onPress={() => handleCallPhone(item.SoDienThoai)}>
              <Text style={styles.phoneValue}>{item.SoDienThoai}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📍</Text>
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{item.DiaChi}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonCall]}
          onPress={() => handleCallPhone(item.SoDienThoai)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>📞</Text>
          <Text style={styles.buttonTextCall}>Gọi ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonMap]}
          onPress={() => handleShowMap(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>🧭</Text>
          <Text style={styles.buttonTextMap}>Chỉ đường</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Hệ thống phân phối"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Search and Filter Section */}
        <View style={styles.filterSection}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tên nhà phân phối"
              placeholderTextColor={COLORS.gray400}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>

          {/* Province Selector */}
          <ProvinceSelector
            selectedProvince={selectedProvince}
            onProvinceChange={setSelectedProvince}
            label="Tỉnh/Thành phố:"
            placeholder="Tất cả"
          />
        </View>

        {/* Distributors List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : filteredDistributors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                Không tìm thấy nhà phân phối
              </Text>
            </View>
          ) : (
            <View style={styles.distributorsList}>
              {filteredDistributors.map((distributor) => renderDistributor(distributor))}
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Filter Section
  filterSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // Distributors List
  scrollView: {
    flex: 1,
  },
  distributorsList: {
    marginTop: SPACING.md,
  },
  distributorCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  distributorHeader: {
    backgroundColor: COLORS.primary + '15',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Distributor Info
  distributorInfo: {
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  infoDetail: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  phoneValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  buttonCall: {
    backgroundColor: '#E8F5E9',
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  buttonMap: {
    backgroundColor: '#FFF3E0',
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonTextCall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  buttonTextMap: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
  },

  // Loading & Empty States
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default DistributionSystemScreen;
