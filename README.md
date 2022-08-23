# Redis Kanban

Kanban board build with Next.js, TypeScript and Redis

<img src="https://user-images.githubusercontent.com/16435270/186055292-e13451c1-0b08-4d42-af2d-682ecd7279e4.png" width="1000" height="500" />
<img src="https://user-images.githubusercontent.com/16435270/186055303-c5d48a6b-efcb-4dea-9a0b-9eee64cce8c9.png" width="1000" height="500" />
<img src="https://user-images.githubusercontent.com/16435270/186055329-4769dec7-dc80-4089-8960-592e3fe9bb04.png" width="1000" height="400" />

## How it works

### How the data is stored:

All persistant data are stored into Redis using [redis-om-node](https://github.com/redis/redis-om-node/) library.

#### Kanban Item

Kanban item data are stored in Redis as JSON.

```ts
interface Item {
  address: string
  title: string
  content: string
  category: string
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}

class Item extends Entity {}

const itemSchema = new Schema(Item, {
  address: { type: 'string' },
  title: { type: 'text' },
  content: { type: 'text' },
  category: { type: 'string' },
  deleted: { type: 'boolean' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date', sortable: true },
})

export default async function repository(): Promise<Repository<Item>> {
  const client = await Client()
  const itemRepository = client.fetchRepository(itemSchema)
  await itemRepository.createIndex()
  return itemRepository
}
```

#### Kanban Items Order

The positions of the Kanban items are stored in Redis as JSON.

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

export default async function repository(): Promise<Repository<ItemOrder>> {
  const client = await Client()
  const itemOrderRepository = client.fetchRepository(itemOrderSchema)
  await itemOrderRepository.createIndex()
  return itemOrderRepository
}
```

### How the data is accessed:

All persistant data are access from Redis using [redis-om-node](https://github.com/redis/redis-om-node/) library.

The data are retrieved and sent as REST API to the frontend via Node.js Serverless Functions by Vercel.

#### All

Retrieve all items and order of the items by wallet address.

All items that are not marked as deleted.

```ts
const itemRepository = await ItemRepository()
const itemQuery = await itemRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .and('deleted')
  .equals(false)
  .return.all()
```

Get Kanban items order

```ts
const itemOrderRepository = await ItemOrderRepository()
const itemOrderQuery = await itemOrderRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .return.all()
```

#### Create

Store Kanban and the position of the item

Create Kanban item

```ts
const itemRepository = await ItemRepository()
const now = new Date()
const item = await itemRepository.createAndSave({
  ...decodedBody,
  address: decoded.address,
  content: '',
  deleted: false,
  createdAt: now,
  updatedAt: now,
})
```

Create position of the Kanban item.

```ts
const itemOrderRepository = await ItemOrderRepository()
const itemOrder = await itemOrderRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .and('category')
  .equals(decodedBody.category)
  .return.first()
if (itemOrder) {
  itemOrder.order = [item.entityId, ...itemOrder.order]
  await itemOrderRepository.save(itemOrder)
} else {
  await itemOrderRepository.createAndSave({
    address: decoded.address,
    category: decodedBody.category,
    order: [item.entityId],
  })
}
```

#### Update

Update content and position of the Kanban item

Update by id

```ts
const itemRepository = await ItemRepository()
const item = await itemRepository.fetch(decodedBody.id)
const { category: newCategory, title, content, position } = decodedBody
const now = new Date()
const oldCategory = item.category
item.category = newCategory
item.title = title
item.content = content
item.updatedAt = now
```

Update position of the Kanban item

```ts
const itemOrderRepository = await ItemOrderRepository()
const itemOrders = await itemOrderRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .return.all()

// Get old category item orders
const oldOrder = itemOrders.find(({ category }) => category === oldCategory)
if (!oldOrder) {
  return res
    .status(400)
    .json({ status: 'error', message: 'Item order not found' })
}

// Get new category order. Create one if it doesn't exist
const newOrder = await(async () => {
  const order = itemOrders.find(({ category }) => category === newCategory)
  if (order) return order
  return itemOrderRepository.createEntity({
    address: decoded.address,
    category: newCategory,
    order: [],
  })
})()

// Remove item id from old order
oldOrder.order = oldOrder.order.filter((id) => id !== decodedBody.id)

// Determine if old and new order are the same category
const updatingOrder = newCategory === oldCategory ? oldOrder : newOrder

// Update new order by item id and position
newOrder.order = [
  ...updatingOrder.order.slice(0, position),
  decodedBody.id,
  ...updatingOrder.order.slice(position),
]
```

#### Delete

Mark Kanban item as deleted and remove from Kanban items order array

Mark as deleted

```ts
const itemRepository = await ItemRepository()
const item = await itemRepository.fetch(decodedBody.id)
item.deleted = true
item.updatedAt = new Date()
await itemRepository.save(item)
```

Remove Kanban item from Kanban items order array

```ts
const itemOrderRepository = await ItemOrderRepository()
const itemOrder = await itemOrderRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .and('category')
  .equals(decodedBody.category)
  .return.first()

if (itemOrder) {
  itemOrder.order = itemOrder.order.filter((id) => id !== decodedBody.id)
  await itemOrderRepository.save(itemOrder)
}
```

#### Delete Permanent

Delete Kanban item from Redis

Delete by id

```ts
const itemRepository = await ItemRepository()
await itemRepository.remove(decodedBody.id)
```

Remove Kanban item position data

```ts
const itemOrderRepository = await ItemOrderRepository()
const itemOrder = await itemOrderRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .and('category')
  .equals(decodedBody.category)
  .return.first()

if (itemOrder) {
  itemOrder.order = itemOrder.order.filter((id) => id !== decodedBody.id)
  await itemOrderRepository.save(itemOrder)
}
```

#### Restore

Mark Kanban item as not deleted

Mark as not deleted

```ts
const itemRepository = await ItemRepository()
const item = await itemRepository.fetch(decodedBody.id)
item.deleted = false
item.updatedAt = new Date()
await itemRepository.save(item)
```

Update Kanban item order

```ts
const itemOrderRepository = await ItemOrderRepository()
const itemOrder = await itemOrderRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .and('category')
  .equals(item.category)
  .return.first()

if (itemOrder) {
  itemOrder.order = [item.entityId, ...itemOrder.order]
  await itemOrderRepository.save(itemOrder)
}
```

#### Deleted

Retrieve Kanban items that are deleted by pagination of 5 items.

```ts
const itemRepository = await ItemRepository()
const itemQuery = await itemRepository
  .search()
  .where('address')
  .equals(decoded.address)
  .and('deleted')
  .equals(true)
  .sortDescending('updatedAt')
  .return.page(decodedBody.offset, 5)
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

## More Information about Redis Stack

Here some resources to help you quickly get started using Redis Stack. If you still have questions, feel free to ask them in the [Redis Discord](https://discord.gg/redis) or on [Twitter](https://twitter.com/redisinc).

### Getting Started

1. Sign up for a [free Redis Cloud account using this link](https://redis.info/try-free-dev-to) and use the [Redis Stack database in the cloud](https://developer.redis.com/create/rediscloud).
1. Based on the language/framework you want to use, you will find the following client libraries:
   - [Redis OM .NET (C#)](https://github.com/redis/redis-om-dotnet)
     - Watch this [getting started video](https://www.youtube.com/watch?v=ZHPXKrJCYNA)
     - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-dotnet/)
   - [Redis OM Node (JS)](https://github.com/redis/redis-om-node)
     - Watch this [getting started video](https://www.youtube.com/watch?v=KUfufrwpBkM)
     - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-node/)
   - [Redis OM Python](https://github.com/redis/redis-om-python)
     - Watch this [getting started video](https://www.youtube.com/watch?v=PPT1FElAS84)
     - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-python/)
   - [Redis OM Spring (Java)](https://github.com/redis/redis-om-spring)
     - Watch this [getting started video](https://www.youtube.com/watch?v=YhQX8pHy3hk)
     - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-spring/)

The above videos and guides should be enough to get you started in your desired language/framework. From there you can expand and develop your app. Use the resources below to help guide you further:

1. [Developer Hub](https://redis.info/devhub) - The main developer page for Redis, where you can find information on building using Redis with sample projects, guides, and tutorials.
1. [Redis Stack getting started page](https://redis.io/docs/stack/) - Lists all the Redis Stack features. From there you can find relevant docs and tutorials for all the capabilities of Redis Stack.
1. [Redis Rediscover](https://redis.com/rediscover/) - Provides use-cases for Redis as well as real-world examples and educational material
1. [RedisInsight - Desktop GUI tool](https://redis.info/redisinsight) - Use this to connect to Redis to visually see the data. It also has a CLI inside it that lets you send Redis CLI commands. It also has a profiler so you can see commands that are run on your Redis instance in real-time
1. Youtube Videos
   - [Official Redis Youtube channel](https://redis.info/youtube)
   - [Redis Stack videos](https://www.youtube.com/watch?v=LaiQFZ5bXaM&list=PL83Wfqi-zYZFIQyTMUU6X7rPW2kVV-Ppb) - Help you get started modeling data, using Redis OM, and exploring Redis Stack
   - [Redis Stack Real-Time Stock App](https://www.youtube.com/watch?v=mUNFvyrsl8Q) from Ahmad Bazzi
   - [Build a Fullstack Next.js app](https://www.youtube.com/watch?v=DOIWQddRD5M) with Fireship.io
   - [Microservices with Redis Course](https://www.youtube.com/watch?v=Cy9fAvsXGZA) by Scalable Scripts on freeCodeCamp
