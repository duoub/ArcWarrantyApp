/**
 * News API Service
 * API calls for news/articles data
 */

import { buildApiUrl } from '../utils/apiHelper';
import { API_CONFIG } from '../config/constants';
import {
  NewsItemRaw,
  NewsItem,
  GetNewsListResponse,
  GetNewsListResult,
} from '../types/news';

/**
 * Parse raw news item to clean format
 */
const parseNewsItem = (raw: NewsItemRaw): NewsItem => ({
  id: raw.id,
  title: raw.title,
  description: raw.description,
  content: raw.content,
  imgurl: raw.imgurl,
  imgurl180_120: raw.imgurl180_120,
  createdate: raw.createdate,
  luotview: raw.luotview,
});

export const newsService = {
  /**
   * Get news list
   * API: /getlisttintuc?storeid=xxx&page=1&keyword=&cat=
   */
  getNewsList: async (
    page: number = 1,
    keyword: string = '',
    cat: string = ''
  ): Promise<GetNewsListResult> => {
    try {
      const url = buildApiUrl('/getlisttintuc', {
        storeid: API_CONFIG.STORE_ID,
        page,
        keyword,
        cat,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: GetNewsListResponse = await response.json();

      if (result && result.list && result.list.length > 0) {
        return {
          status: true,
          list: result.list.map(parseNewsItem),
          nextpage: result.nextpage,
        };
      } else {
        return {
          status: true,
          list: [],
          nextpage: false,
        };
      }
    } catch (error) {
      return {
        status: false,
        list: [],
        nextpage: false,
      };
    }
  },
};
