import httpClient from '@/config/clients';
import { ShoppingList, ShoppingListItem } from '@/types/domain';

interface RawListItem {
  id: string;
  list_id: string;
  product_name: string;
  barcode: string | null;
  quantity: number | null;
  purchased: boolean;
  created_at?: string;
}

interface RawList {
  id: string;
  name: string | null;
  created_at?: string;
  items?: RawListItem[];
}

function mapItem(raw: RawListItem): ShoppingListItem {
  return {
    id: raw.id,
    list_id: raw.list_id,
    name: raw.product_name,
    quantity: raw.quantity ?? 1,
    purchased: raw.purchased,
    created_at: raw.created_at,
  };
}

function mapList(raw: RawList): ShoppingList {
  const items = raw.items ?? [];
  return {
    id: raw.id,
    name: raw.name ?? '',
    total_items: items.length,
    done_items: items.filter((i) => i.purchased).length,
    created_at: raw.created_at,
  };
}

export const ListRepository = {
  async getLists(): Promise<ShoppingList[]> {
    const { data } = await httpClient.get<RawList[]>('/api/lists');
    return (data ?? []).map(mapList);
  },

  async getList(id: string): Promise<{ list: ShoppingList; items: ShoppingListItem[] }> {
    const { data } = await httpClient.get<RawList>(`/api/lists/${id}`);
    return { list: mapList(data), items: (data.items ?? []).map(mapItem) };
  },

  async createList(name: string): Promise<ShoppingList> {
    const { data } = await httpClient.post<RawList>('/api/lists', { name });
    return mapList(data);
  },

  async deleteList(id: string): Promise<void> {
    await httpClient.delete(`/api/lists/${id}`);
  },

  async addItem(listId: string, name: string): Promise<ShoppingListItem> {
    const { data } = await httpClient.post<RawListItem>(`/api/lists/${listId}/items`, {
      product_name: name,
    });
    return mapItem(data);
  },

  async setPurchased(listId: string, itemId: string, purchased: boolean): Promise<ShoppingListItem> {
    const { data } = await httpClient.put<RawListItem>(`/api/lists/${listId}/items/${itemId}`, {
      purchased,
    });
    return mapItem(data);
  },
};

export default ListRepository;
