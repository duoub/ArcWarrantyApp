import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { commonStyles } from '../../../styles/commonStyles';
import { NewsItem } from '../../../types/news';

type NewsDetailRouteParams = {
  NewsDetail: {
    article: NewsItem;
  };
};

const NewsDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<NewsDetailRouteParams, 'NewsDetail'>>();
  const { article } = route.params;
  const { width } = useWindowDimensions();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Chi tiết tin tức"
        leftIcon={<Text style={commonStyles.backIconMedium}>‹</Text>}
        onLeftPress={handleBackPress}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {article.imgurl ? (
          <Image
            source={{ uri: article.imgurl }}
            style={[styles.image, { width: width }]}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{article.createdate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="eye" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{article.luotview} lượt xem</Text>
            </View>
          </View>

          {article.description ? (
            <Text style={styles.description}>{article.description}</Text>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.content}>{article.content}</Text>
        </View>

        <View style={commonStyles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    height: 220,
    backgroundColor: COLORS.gray200,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 30,
    marginBottom: SPACING.md,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: SPACING.xs,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.md,
  },
  content: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
});

export default NewsDetailScreen;
