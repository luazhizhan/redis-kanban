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
  createItem: (content: string) => Promise<string | null>
  allItems: () => Promise<AllItems | null>
  updateItem: (
    id: string,
    content: string,
    category: Category,
    position: number
  ) => Promise<string | null>
  deleteItem: (id: string) => Promise<void>
}

export type Category = 'todo' | 'doing' | 'done'

export type AllItems = {
  items: { id: string; content: string; category: Category }[]
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

  const createItem = async (content: string): Promise<string | null> => {
    if (state.wallet.status !== 'connected') return null
    const response = await fetch('/api/items/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.wallet.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
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
        content,
        category,
        position,
      }),
    })
    const data = await response.json()
    const decodedData = UpdateItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.data.id
  }

  const deleteItem = async (id: string): Promise<void> => {
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
      }),
    })
    const data = await response.json()
    const decodedData = DeleteItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
  }

  return { login, refresh, createItem, allItems, updateItem, deleteItem }
}

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
