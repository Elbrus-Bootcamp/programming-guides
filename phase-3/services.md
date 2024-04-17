# Service guide

## Описание

Для начала создается экземпляр axios, который можно единообразно сконфигурировать для всех запросов совершаемых с через него:

```tsx
import axios from 'axios';
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});
```

Затем создается класс или несколько классов для различных сущностный приложения что бы код был более читаемым, так же такое разделение может быть полезно при тестировании. Внедрение axiosInstance через конструктор позволяет классу быть более гибким и не быть привязанным к конкретному экземпляру axios:

```tsx
class ItemService {
  constructor(private readonly apiInstance: AxiosInstance) {}

  getItems(): Promise<CategoryWithItemsType[]> {
    return this.apiInstance<CategoryWithItemsType[]>('/item').then((res) => res.data);
  }

  addItem(data: FormData): Promise<ItemType> {
    return this.apiInstance.post<ItemType>('/item', data).then((res) => res.data);
  }

  deleteItem(id: number): Promise<void> {
    return this.apiInstance.delete(`/item/${id}`);
  }
}

export default new ItemService(axiosInstance);
```