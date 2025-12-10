import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';

interface Dealer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

const DealerListScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);

  // Mock data - replace with API call
  useEffect(() => {
    const mockData: Dealer[] = [
      {
        id: '1',
        name: 'Đại lý Hà Nội 1',
        phone: '0901234567',
        address: '123 Đường ABC, Quận Hoàn Kiếm, Hà Nội',
      },
      {
        id: '2',
        name: 'Đại lý Hà Nội 2',
        phone: '0912345678',
        address: '456 Đường XYZ, Quận Đống Đa, Hà Nội',
      },
      {
        id: '3',
        name: 'Đại lý TP.HCM 1',
        phone: '0923456789',
        address: '789 Đường LMN, Quận 1, TP.HCM',
      },
      {
        id: '4',
        name: 'Đại lý Đà Nẵng',
        phone: '0934567890',
        address: '321 Đường PQR, Quận Hải Châu, Đà Nẵng',
      },
      {
        id: '5',
        name: 'Đại lý Cần Thơ',
        phone: '0945678901',
        address: '654 Đường STU, Quận Ninh Kiều, Cần Thơ',
      },
    ];
    setDealers(mockData);
    setFilteredDealers(mockData);
  }, []);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDealers(dealers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = dealers.filter(
        (dealer) =>
          dealer.name.toLowerCase().includes(query) ||
          dealer.phone.includes(query) ||
          dealer.address.toLowerCase().includes(query)
      );
      setFilteredDealers(filtered);
    }
  }, [searchQuery, dealers]);

  const handleSelectDealer = (dealer: Dealer) => {
    // TODO: Handle dealer selection - pass data back to InOutScreen
    console.log('Selected dealer:', dealer);
    navigation.goBack();
  };

  const renderDealer = ({ item }: { item: Dealer }) => (
    <TouchableOpacity
      style={styles.dealerCard}
      onPress={() => handleSelectDealer(item)}
      activeOpacity={0.7}
    >
      <Image
        source={require('../../../assets/images/user.jpg')}
        style={styles.dealerAvatar}
      />
      <View style={styles.dealerInfo}>
        <Text style={styles.dealerName}>Tên đại lý {item.name}</Text>
        <Text style={styles.dealerDetail}>
          <Text style={styles.detailLabel}>SĐT:</Text> {item.phone}
        </Text>
        <Text style={styles.dealerDetail}>
          <Text style={styles.detailLabel}>Địa chỉ:</Text> {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Chọn đại lý"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tên / SĐT / Email"
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dealer List */}
      <FlatList
        data={filteredDealers}
        renderItem={renderDealer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy đại lý</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Search Bar
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 18,
    color: COLORS.gray400,
  },

  // Dealer List
  listContainer: {
    padding: SPACING.md,
  },
  dealerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  dealerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  dealerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dealerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  dealerDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});

export default DealerListScreen;
