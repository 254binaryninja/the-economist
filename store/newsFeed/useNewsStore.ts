import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";
import { clientContainer } from "@/src/config/client.inversify.config";
import { TYPES } from "@/src/config/types";
import { EconomicNewsFeedController } from "@/src/controllers/EconomicNewsFeedController";
import {
  Article,
  NewsFetchParams,
} from "@/src/domain/repository/IEconomicNewsFeedRepository";

// Simple types
interface NewsFilters {
  entity?: string;
  category?: string;
  source?: "all" | "marketaux" | "finnhub";
}

interface NewsState {
  // Filters & Pagination
  filters: NewsFilters;
  currentPage: number;
  itemsPerPage: number;

  // Actions
  setFilters: (filters: Partial<NewsFilters>) => void;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
}

const economicNewsFeedController =
  clientContainer.get<EconomicNewsFeedController>(
    TYPES.EconomicsNewsFeedController,
  );

const initialFilters: NewsFilters = {
  source: "all",
};

export const useNewsStore = create<NewsState>()(
  devtools((set, get) => ({
    // Initial state
    filters: initialFilters,
    currentPage: 1,
    itemsPerPage: 20,

    // Actions
    setFilters: (newFilters: Partial<NewsFilters>) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
        currentPage: 1, // Reset to first page when filters change
      }));
    },

    setCurrentPage: (page: number) => {
      set({ currentPage: page });
    },

    clearFilters: () => {
      set({
        filters: initialFilters,
        currentPage: 1,
      });
    },
  })),
);

// React Query hook for fetching news with caching
export const useNews = (params?: NewsFetchParams) => {
  const filters = useNewsStore((state) => state.filters);
  const currentPage = useNewsStore((state) => state.currentPage);
  const itemsPerPage = useNewsStore((state) => state.itemsPerPage);

  // Combine params with filters
  const queryParams = {
    ...params,
    entity: filters.entity,
    category: filters.category,
  };

  return useQuery({
    queryKey: ["news", queryParams],
    queryFn: () => economicNewsFeedController.fetchNews(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper hook for filtered and paginated articles
export const usePaginatedNews = () => {
  const { data: newsData, isLoading, error } = useNews();
  const filters = useNewsStore((state) => state.filters);
  const currentPage = useNewsStore((state) => state.currentPage);
  const itemsPerPage = useNewsStore((state) => state.itemsPerPage);

  // Filter articles based on source
  const filteredArticles = newsData
    ? (() => {
        let articles: Article[] = [];

        if (filters.source === "all") {
          articles = [...newsData.marketaux, ...newsData.finnhub];
        } else if (filters.source === "marketaux") {
          articles = newsData.marketaux;
        } else if (filters.source === "finnhub") {
          articles = newsData.finnhub;
        }

        // Sort by date (newest first)
        return articles.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      })()
    : [];

  // Paginate articles
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  return {
    articles: paginatedArticles,
    totalArticles: filteredArticles.length,
    totalPages,
    currentPage,
    isLoading,
    error,
  };
};

// Selectors for convenience
export const useNewsFilters = () => useNewsStore((state) => state.filters);
export const useNewsActions = () =>
  useNewsStore((state) => ({
    setFilters: state.setFilters,
    setCurrentPage: state.setCurrentPage,
    clearFilters: state.clearFilters,
  }));
