import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING } from '../../../config/theme';
import { commonStyles } from '../../../styles/commonStyles';
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import { dealerService } from '../../../api/dealerService';
import { DealerInfo } from '../../../types/dealer';
import { InOutStackParamList } from '../../../navigation/MainNavigator';
import { Icon } from '../../../components/common';

type DealerListNavigationProp = StackNavigationProp<InOutStackParamList, 'DealerList'>;

const DealerListScreen = () => {
  const navigation = useNavigation<DealerListNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [dealers, setDealers] = useState<DealerInfo[]>([]);
  const [filteredDealers, setFilteredDealers] = useState<DealerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dealer list from API
  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      setIsLoading(true);
      const response = await dealerService.getDealerList();
      setDealers(response.list);
      setFilteredDealers(response.list);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách đại lý. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSelectDealer = (dealer: DealerInfo) => {
    navigation.navigate('InOut', {
      selectedDealer: {
        id: dealer.id,
        name: dealer.name,
        phone: dealer.phone,
        address: dealer.address,
      },
    });
  };

  const renderDealer = ({ item }: { item: DealerInfo }) => (
    <TouchableOpacity
      style={styles.dealerCard}
      onPress={() => handleSelectDealer(item)}
      activeOpacity={0.7}
    >
      <Avatar size={60} style={styles.dealerAvatar} />
      <View style={styles.dealerInfo}>
        <Text style={styles.dealerName}>{item.name}</Text>
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
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={commonStyles.searchContainer}>
        <View style={commonStyles.searchInputWrapper}>
          <Icon name="search" size={18} color={COLORS.gray500} style={commonStyles.searchIcon} />
          <TextInput
            style={commonStyles.searchInput}
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
      {isLoading ? (
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={commonStyles.loadingText}>Đang tải danh sách đại lý...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDealers}
          renderItem={renderDealer}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={commonStyles.emptyContainer}>
              <Text style={commonStyles.emptyText}>Không tìm thấy đại lý</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 18,
    color: COLORS.gray400,
  },
  listContainer: {
    padding: SPACING.md,
  },
  dealerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  dealerAvatar: {
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
});

export default DealerListScreen;
