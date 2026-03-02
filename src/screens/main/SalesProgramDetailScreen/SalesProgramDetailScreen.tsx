import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { HomeStackParamList } from '../../../navigation/MainNavigator';

type SalesProgramDetailRouteProp = RouteProp<
  HomeStackParamList,
  'SalesProgramDetail'
>;

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

const SalesProgramDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SalesProgramDetailRouteProp>();
  const { programName, htmlContent } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title={programName}
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <WebView
        style={styles.webview}
        source={{ html: buildHtml(htmlContent || '') }}
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
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default SalesProgramDetailScreen;
