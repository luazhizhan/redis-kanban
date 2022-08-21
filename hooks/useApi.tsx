import * as JD from 'decoders'
import { useContext } from 'react'
import { Context } from '../store/Store'

type UseApi = {
  login: (
    address: string,
    message: string,
    signedMessage: string
  ) => Promise<string>
  refresh: (jwt: string) => Promise<string>
  createItem: (title: string, category: Category) => Promise<string | null>
  allItems: () => Promise<AllItems | null>
  updateItem: (
    id: string,
    title: string,
    content: string,
    category: Category,
    position: number
  ) => Promise<string | null>
  deleteItemPermanent: (id: string, category: Category) => Promise<void>
  deleteItem: (id: string, category: Category) => Promise<void>
  deletedItems: (offset: number) => Promise<ApiItem[]>
  restoreItem: (id: string) => Promise<ApiItem | null>
}

export type Category = 'todo' | 'doing' | 'done'

export type ApiItem = {
  id: string
  title: string
  content: string
  category: Category
}

export type AllItems = {
  items: ApiItem[]
  orders: Record<string, string[]>
}

export default function useApi(): UseApi {
  const { state } = useContext(Context)

  const login = async (
    address: string,
    message: string,
    signedMessage: string
  ): Promise<string> => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        message,
        signedMessage,
      }),
    })
    const data = await response.json()
    const decodedData = LoginDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data.token
  }

  const refresh = async (jwt: string): Promise<string> => {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    const decodedData = RefreshDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data.token
  }

  const createItem = async (
    title: string,
    category: Category
  ): Promise<string | null> => {
    if (state.wallet.status !== 'connected') return null
    const response = await fetch('/api/items/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        category,
      }),
    })
    const data = await response.json()
    const decodedData = CreateItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data.id
  }

  const allItems = async (): Promise<AllItems | null> => {
    if (state.wallet.status !== 'connected') return null
    const response = await fetch('/api/items/all', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    const decodedData = AllItemsDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data
  }

  const updateItem = async (
    id: string,
    title: string,
    content: string,
    category: Category,
    position: number
  ): Promise<string | null> => {
    if (state.wallet.status !== 'connected') return null
    const response = await fetch('/api/items/update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        title,
        category,
        content,
        position,
      }),
    })
    const data = await response.json()
    const decodedData = UpdateItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data.id
  }

  const deleteItem = async (id: string, category: Category): Promise<void> => {
    if (state.wallet.status !== 'connected') return
    const response = await fetch('/api/items/delete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        category,
      }),
    })
    const data = await response.json()
    const decodedData = DeleteItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
  }

  const deleteItemPermanent = async (
    id: string,
    category: Category
  ): Promise<void> => {
    if (state.wallet.status !== 'connected') return
    const response = await fetch('/api/items/delete-perm', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        category,
      }),
    })
    const data = await response.json()
    const decodedData = DeleteItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
  }

  const deletedItems = async (offset: number): Promise<ApiItem[]> => {
    if (state.wallet.status !== 'connected') return []
    const response = await fetch('/api/items/deleted', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offset,
      }),
    })
    const data = await response.json()
    const decodedData = DeletedItemsDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data.items
  }

  const restoreItem = async (id: string): Promise<ApiItem | null> => {
    if (state.wallet.status !== 'connected') return null
    const response = await fetch('/api/items/restore', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    })
    const data = await response.json()
    const decodedData = RestoreItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data.item
  }

  return {
    login,
    refresh,
    createItem,
    allItems,
    updateItem,
    deleteItem,
    deleteItemPermanent,
    deletedItems,
    restoreItem,
  }
}

/* Decoders */

// Login API
const LoginErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf(['Invalid body', 'Address mismatched']),
})
const LoginSuccessDecoder = JD.object({
  status: JD.constant('success'),
  data: JD.object({ token: JD.string }),
})
const LoginDecoder = JD.either(LoginErrorDecoder, LoginSuccessDecoder)

// Refresh API
const RefreshErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf(['Unauthorised', 'Invalid JWT', 'Expired JWT']),
})
const RefreshSuccessDecoder = JD.object({
  status: JD.constant('success'),
  data: JD.object({ token: JD.string }),
})
const RefreshDecoder = JD.either(RefreshErrorDecoder, RefreshSuccessDecoder)

// Create Item API
const CreateItemErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf([
    'Invalid body',
    'Unauthorised',
    'Invalid JWT',
    'Expired JWT',
  ]),
})
const CreateItemSuccessDecoder = JD.object({
  status: JD.constant('success'),
  data: JD.object({ id: JD.string }),
})
const CreateItemDecoder = JD.either(
  CreateItemSuccessDecoder,
  CreateItemErrorDecoder
)

// All Items API
const AllItemsErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf(['Unauthorised', 'Invalid JWT', 'Expired JWT']),
})
const AllItemsSuccessDecoder = JD.object({
  status: JD.constant('success'),
  data: JD.object({
    items: JD.array(
      JD.object({
        id: JD.string,
        title: JD.string,
        content: JD.string,
        category: JD.oneOf(['todo', 'doing', 'done']),
      })
    ),
    orders: JD.dict(JD.array(JD.string)),
  }),
})
const AllItemsDecoder = JD.either(AllItemsErrorDecoder, AllItemsSuccessDecoder)

// Update Item API
const UpdateItemErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf([
    'Invalid body',
    'Item order not found',
    'Unauthorised',
    'Invalid JWT',
    'Expired JWT',
  ]),
})
const UpdateItemSuccessDecoder = JD.object({
  status: JD.constant('success'),
  data: JD.object({ id: JD.string }),
})
const UpdateItemDecoder = JD.either(
  UpdateItemSuccessDecoder,
  UpdateItemErrorDecoder
)

// Delete Item API
const DeleteItemErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf([
    'Invalid body',
    'Unauthorised',
    'Invalid JWT',
    'Expired JWT',
  ]),
})
const DeleteItemSuccessDecoder = JD.object({
  status: JD.constant('success'),
})
const DeleteItemDecoder = JD.either(
  DeleteItemErrorDecoder,
  DeleteItemSuccessDecoder
)

// Deleted Items API
const DeletedItemsErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf([
    'Invalid body',
    'Unauthorised',
    'Invalid JWT',
    'Expired JWT',
  ]),
})
const DeletedItemsSuccessDecoder = JD.object({
  status: JD.constant('success'),
  data: JD.object({
    items: JD.array(
      JD.object({
        id: JD.string,
        title: JD.string,
        content: JD.string,
        category: JD.oneOf(['todo', 'doing', 'done']),
      })
    ),
  }),
})

const DeletedItemsDecoder = JD.either(
  DeletedItemsErrorDecoder,
  DeletedItemsSuccessDecoder
)

// Restore Item API
const RestoreItemErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf([
    'Invalid body',
    'Unauthorised',
    'Invalid JWT',
    'Expired JWT',
  ]),
})
const RestoreItemSuccessDecoder = JD.object({
  status: JD.constant('success'),
  data: JD.object({
    item: JD.object({
      id: JD.string,
      title: JD.string,
      content: JD.string,
      category: JD.oneOf(['todo', 'doing', 'done']),
    }),
  }),
})
const RestoreItemDecoder = JD.either(
  RestoreItemErrorDecoder,
  RestoreItemSuccessDecoder
)
