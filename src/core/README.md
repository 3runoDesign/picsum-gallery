# TanStack Query - Configuração

Este projeto usa o **TanStack Query** (antigo React Query) para gerenciamento de estado assíncrono.

## Configuração

### QueryClient

O `QueryClient` está configurado em `src/core/queryClient.ts` com as seguintes configurações:

```tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos (antigo cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Provider

O `QueryClientProvider` está configurado no `_layout.tsx`:

```tsx
<QueryClientProvider client={queryClient}>
  {/* Sua aplicação */}
</QueryClientProvider>
```

## Uso nos Hooks

### useQuery

```tsx
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const response = await fetch("/api/users");
    return response.json();
  },
  staleTime: 2 * 60 * 1000, // 2 minutos
});
```

### useMutation

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const { mutate, isPending, error } = useMutation({
  mutationFn: async (userData) => {
    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  onSuccess: (user) => {
    // Invalida queries relacionadas
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

## Hooks Específicos do Projeto

Veja `src/presentation/hooks/useImageQueries.ts` para exemplos de como usar o TanStack Query no projeto de imagens.

### Características dos Hooks

- **useSavedImages**: Busca imagens salvas com cache de 2 minutos
- **useRandomImage**: Busca imagem aleatória com cache de 30 segundos
- **useSaveImage**: Salva imagem e invalida lista automaticamente
- **useDeleteImage**: Deleta imagem e invalida lista automaticamente
- **useFetchAndSaveRandomImage**: Busca e salva imagem aleatória
- **useImageOperations**: Hook combinado com todas as operações

## Vantagens do TanStack Query

- **Cache Inteligente**: Gerencia cache automaticamente
- **Sincronização**: Mantém dados sincronizados entre componentes
- **Retry Automático**: Sistema robusto de retry
- **Invalidação**: Invalidação automática e manual
- **DevTools**: Ferramentas de desenvolvimento excelentes
- **TypeScript**: Suporte nativo ao TypeScript
