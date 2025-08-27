/**
 * Configuração do TanStack Query Client
 *
 * Este arquivo configura o cliente do TanStack Query com
 * as configurações padrão para o projeto.
 */

import { QueryClient } from "@tanstack/react-query";
import { Duration } from "js-duration";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Duration.of({ minutes: 2 }).inMilliseconds,
      gcTime: Duration.of({ minutes: 5 }).inMilliseconds,
      retry: 3,
      retryDelay: (attemptIndex) =>
        Math.min(
          Duration.of({ seconds: 1 * 2 ** attemptIndex }).inMilliseconds,
          Duration.of({ seconds: 30 }).inMilliseconds
        ),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
