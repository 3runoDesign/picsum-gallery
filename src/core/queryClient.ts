import { QueryClient } from "@tanstack/react-query";
import { Duration } from "js-duration";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Duration.of({ minutes: 5 }).inMilliseconds,
      gcTime: Duration.of({ minutes: 10 }).inMilliseconds,
      retry: 2,

      retryDelay: (attemptIndex) =>
        Math.min(
          Duration.of({ seconds: 1 * 2 ** attemptIndex }).inMilliseconds,
          Duration.of({ seconds: 30 }).inMilliseconds
        ),

      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: Duration.of({ seconds: 1 }).inMilliseconds,
    },
  },
});
