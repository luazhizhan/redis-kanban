# Redis Kanban

Kanban board build with Next.js, TypeScript and Redis

<img src="https://user-images.githubusercontent.com/16435270/185055969-522e034d-b62e-424b-8acd-a943186cf23e.png" width="250" height="500" />
<img src="https://user-images.githubusercontent.com/16435270/185056735-6ff8016c-2f23-4790-b1cb-9bde046f169e.png" width="700" height="400" />
<img src="https://user-images.githubusercontent.com/16435270/185056859-92d02b22-978a-4079-8708-7e9622d9b805.png" width="700" height="400" />

## How it works

### How the data is stored:

All persistant data are stored into Redis using [redis-om-node](https://github.com/redis/redis-om-node/) library.

#### Kanban Item

```ts
interface Item {
  address: string
  content: string
  category: string
  createdAt: Date
  updatedAt: Date
}

class Item extends Entity {}

const itemSchema = new Schema(Item, {
  address: { type: 'string' },
  content: { type: 'text' },
  category: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
})
```

#### Kanban Items Order

This data is stored to maintain the same kanban item ordering as before.

```ts
interface ItemOrder {
  address: string
  category: string
  order: string[]
}

class ItemOrder extends Entity {}

const itemOrderSchema = new Schema(ItemOrder, {
  address: { type: 'string' },
  category: { type: 'string' },
  order: { type: 'string[]' },
})
```

### How the data is accessed:

All persistant data are access from Redis using [redis-om-node](https://github.com/redis/redis-om-node/) library.

#### Kanban Item

Item Repository

```ts
export default async function repository(): Promise<Repository<Item>> {
  const client = await Client()
  const itemRepository = client.fetchRepository(itemSchema)
  await itemRepository.createIndex()
  return itemRepository
}
```

Example of retrieving all Kanban items of a user

```ts
  const itemRepository = await ItemRepository()
  const itemQuery = await itemRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .return.all()
```

#### Kanban Items Order

Item order Repository

```ts
export default async function repository(): Promise<Repository<ItemOrder>> {
  const client = await Client()
  const itemOrderRepository = client.fetchRepository(itemOrderSchema)
  await itemOrderRepository.createIndex()
  return itemOrderRepository
}
```

Example of retrieving Kanban items order of `todo` column belonging a specific user

```ts
  const itemOrderRepository = await ItemOrderRepository()
  const itemOrder = await itemOrderRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .and('category')
    .equals('todo')
    .return.first()
```

## How to run it locally?

### Prerequisites

- [Node.js v16](https://nodejs.org/en/)
- [Redis Stack](https://redis.io/docs/stack/get-started/install/)
- [Docker](https://docs.docker.com/engine/install/) - If you are planning to run Redis Stack on Docker.
- [MetaMask](https://metamask.io/download/)

### Local installation

Complete the software installation you require by following the instructions in the links above.

Please find out how to start `Redis Stack` by looking at the instructions given in your chosen installation method.

Clone this repository.

```bash
git clone [URL]
```

Open up your terminal in the root directory of the repository and install necessary packages.

```bash
npm install
```

Create a `.env` file at the root directory of this repository to store the necessary environment variables to run this application.

```text
JWT_SECRET="SUPER_SECRET_TEXT"
REDIS_CONNECTION_STRING="CONNECTION_STRING"
```

Start the application

```bash
npm run dev
```

## Deployment

To make deploys work, you need to create free account on [Redis Cloud](https://redis.info/try-free-dev-to)

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fluazhizhan%2Fredis-kanban&env=JWT_SECRET,REDIS_CONNECTION_STRING)
