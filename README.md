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
