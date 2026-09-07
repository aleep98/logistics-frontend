import api from './api';
/** Supports both array responses and the backend's paginated envelope. */
export async function fetchCollection<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  for (;;) {
    const response = await api.get<T[] | { data: T[]; total: number }>(path, { params: { page, limit: 50 }, signal });
    if (Array.isArray(response.data)) return response.data;
    if (!Array.isArray(response.data.data) || !Number.isFinite(response.data.total)) throw new Error('Formato de resposta inválido.');
    items.push(...response.data.data);
    if (items.length >= response.data.total) return items;
    if (!response.data.data.length) throw new Error('A lista não pôde ser carregada completamente.');
    page += 1;
  }
}
