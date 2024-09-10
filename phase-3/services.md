# Service guide

Данный гайд описывает абстракцию, которая строится над сетевыми запросами внутри frontend
приложения

## Описание

### Создание HTTP клиента

Для начала можно использовать готовые решения HTTP клиентов, как экземпляр axios. Его
можно единообразно сконфигурировать для всех совершаемых запросов:

```tsx
import axios from 'axios';
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});
```

### Создание сервиса

Сервис -- абстракция над сетевыми запросами, которая содержит логику по отправлению
запросов, обработке ответов и предоставлению данных. Любой сервис должен использовать в
себе клиент для совершения запросов -- такой экземпляр внедряется во время конструирования
сервиса. Это позволяет классу быть более гибким и не быть привязанным к конкретной
имплементации клиента. Ниже пример через паттерн `Dependency Injection`.

Необходимо создать класс или несколько классов для различных сущностный приложения. Это
позволит коду быть более читаемым и окажется полезным при тестировании. Внедрение HTTP
клиента (axiosInstance) через конструктор:

```ts
class ItemService {
  constructor(private readonly client: AxiosInstance) {}

  async getItems(): Promise<Item[]> {
    const response = await this.client<Item[]>('/items');
    if (response.status !== 200) return Promise.reject('Ошибка запроса');
    return response.data;
  }

  async addItem(data: FormData): Promise<ItemType> {
    const response = await this.client.post<ItemType>('/items', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status !== 201) return Promise.reject('Ошибка создания');
    return response.data;
  }

  deleteItem(id: number): Promise<void> {
    return this.client.delete(`/items/${id}`);
  }
}

const itemService = new ItemService(axiosInstance);

export default itemService;
```

### Абстракция клиента

Чтобы не зависит от явной имплементации HTTP клиента можно построить абстракцию и над ним
