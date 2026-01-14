import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { commonStyles } from '../../../styles/commonStyles';
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import { rankingService } from '../../../api/rankingService';
import { RankingMember } from '../../../types/ranking';
import { Icon } from '../../../components/common';

const RANK_COLORS = {
  gold: {
    background: '#FFF8E1',
    border: '#FFD700',
    text: '#B8860B',
    badge: '#FFD700',
  },
  silver: {
    background: '#F5F5F5',
    border: '#C0C0C0',
    text: '#757575',
    badge: '#C0C0C0',
  },
  bronze: {
    background: '#FBE9E7',
    border: '#CD7F32',
    text: '#8D6E63',
    badge: '#CD7F32',
  },
};

const RankingScreen = () => {
  const navigation = useNavigation();
  const [members, setMembers] = useState<RankingMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      setIsLoading(true);
      const response = await rankingService.getListThanhVien();
      if (response.status) {
        setMembers(response.members);
      }
    } catch (error) {
      // Keep empty list on error
    } finally {
      setIsLoading(false);
    }
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return RANK_COLORS.gold;
    if (index === 1) return RANK_COLORS.silver;
    if (index === 2) return RANK_COLORS.bronze;
    return null;
  };

  const renderMember = ({ item, index }: { item: RankingMember; index: number }) => {
    const rankStyle = getRankStyle(index);
    const isTopThree = index < 3;

    return (
      <View
        style={[
          styles.memberCard,
          isTopThree && rankStyle && {
            backgroundColor: rankStyle.background,
            borderWidth: 2,
            borderColor: rankStyle.border,
          },
        ]}
      >
        {/* Rank Badge */}
        <View
          style={[
            styles.rankBadge,
            isTopThree && rankStyle && { backgroundColor: rankStyle.badge },
          ]}
        >
          {isTopThree ? (
            <Icon name="trophy" size={16} color={COLORS.white} />
          ) : (
            <Text style={styles.rankNumber}>{index + 1}</Text>
          )}
        </View>

        {/* Avatar */}
        <Avatar size={50} style={styles.memberAvatar} />

        {/* Member Info */}
        <View style={styles.memberInfo}>
          <Text
            style={[
              styles.memberName,
              isTopThree && rankStyle && { color: rankStyle.text },
            ]}
          >
            {item.name}
          </Text>
          {item.khuvuckinhdoanh ? (
            <Text style={styles.memberLocation}>{item.khuvuckinhdoanh}</Text>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsLabel}>Doanh số</Text>
          <Text
            style={[
              styles.statsValue,
              isTopThree && rankStyle && { color: rankStyle.text },
            ]}
          >
            {item.doanhsodat}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Bảng xếp hạng"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={commonStyles.loadingText}>Đang tải bảng xếp hạng...</Text>
        </View>
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item, index) => `member-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={commonStyles.emptyContainer}>
              <Text style={commonStyles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
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
  listContainer: {
    padding: SPACING.md,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray400,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  memberAvatar: {
    marginRight: SPACING.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  memberLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default RankingScreen;
