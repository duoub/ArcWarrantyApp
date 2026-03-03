import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { commonStyles } from '../../../styles/commonStyles';
import { NewsItem } from '../../../types/news';

type NewsDetailRouteParams = {
  NewsDetail: {
    article: NewsItem;
    headerTitle?: string;
  };
};

const buildHtml = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { background: transparent !important; }
  body { font-family: 'Times New Roman', serif; font-size: 14px; color: #222; margin: 0; padding: 16px 16px 60px 16px; word-wrap: break-word; background: #f5f5f5 !important; }
  table { border-collapse: collapse; width: 100% !important; max-width: 100%; }
  td, th { border: 1px solid #ccc; padding: 6px 8px; background: transparent !important; }
  img { max-width: 100% !important; height: auto; }
  p { margin: 6px 0; line-height: 1.6; }
  ul, ol { padding-left: 20px; }
  h1,h2,h3 { line-height: 1.4; }
</style>
</head>
<body>${content}</body>
</html>
`;

const NewsDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<NewsDetailRouteParams, 'NewsDetail'>>();
  const { article, headerTitle = 'Chi tiết tin tức' } = route.params;
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title={headerTitle}
        leftIcon={<Text style={commonStyles.backIconMedium}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      {article.imgurl ? (
        <Image
          source={{ uri: article.imgurl }}
          style={[styles.image, { width }]}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{article.title}</Text>
      </View>

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

      <WebView
        style={styles.webview}
        source={{ html: buildHtml(article.content || '') }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    height: 220,
    backgroundColor: COLORS.gray200,
  },
  titleContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 28,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
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
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default NewsDetailScreen;
