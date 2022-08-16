import * as JD from 'decoders'
import useJwt from './useJwt'

type UseApi = {
  login: (
    address: string,
    message: string,
    signedMessage: string
  ) => Promise<void>
  refresh: () => Promise<void>
  createItem: (content: string) => Promise<string | null>
  allItems: () => Promise<ApiItem[] | null>
  updateItem: (
    id: string,
    content: string,
    category: Category
  ) => Promise<string | null>
  deleteItem: (id: string) => Promise<void>
}

export type Category = 'todo' | 'doing' | 'done'

export type ApiItem = { id: string; content: string; category: Category }

export default function useApi(): UseApi {
  const [jwt, setJwt] = useJwt()

  const login = async (
    address: string,
    message: string,
    signedMessage: string
  ): Promise<void> => {
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
    setJwt({ address, token: decodedData.body.token })
  }

  const refresh = async (): Promise<void> => {
    if (!jwt) return
    const response = await fetch('/api/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    const decodedData = RefreshDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    setJwt({ address: jwt.address, token: decodedData.body.token })
  }

  const createItem = async (content: string): Promise<string | null> => {
    if (!jwt) return null
    const response = await fetch('/api/items/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.token}`,
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
    return decodedData.body.id
  }

  const allItems = async (): Promise<ApiItem[] | null> => {
    if (!jwt) return null
    const response = await fetch('/api/items/all', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    const decodedData = AllItemsDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.body.data
  }

  const updateItem = async (
    id: string,
    content: string,
    category: Category
  ): Promise<string | null> => {
    if (!jwt) return null
    const response = await fetch('/api/items/update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        content,
        category,
      }),
    })
    const data = await response.json()
    const decodedData = UpdateItemDecoder.verify(data)
    if (decodedData.status === 'error') throw new Error(decodedData.message)
    return decodedData.body.id
  }

  const deleteItem = async (id: string): Promise<void> => {
    if (!jwt) return
    const response = await fetch('/api/items/delete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.token}`,
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
  body: JD.object({ token: JD.string }),
})
const LoginDecoder = JD.either(LoginErrorDecoder, LoginSuccessDecoder)

// Refresh API
const RefreshErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf(['Unauthorised', 'Invalid JWT', 'Expired JWT']),
})
const RefreshSuccessDecoder = JD.object({
  status: JD.constant('success'),
  body: JD.object({ token: JD.string }),
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
  body: JD.object({ id: JD.string }),
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
  body: JD.object({
    data: JD.array(
      JD.object({
        id: JD.string,
        content: JD.string,
        category: JD.oneOf(['todo', 'doing', 'done']),
      })
    ),
  }),
})
const AllItemsDecoder = JD.either(AllItemsErrorDecoder, AllItemsSuccessDecoder)

// Update Item API
const UpdateItemErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf([
    'Invalid body',
    'Unauthorised',
    'Invalid JWT',
    'Expired JWT',
  ]),
})
const UpdateItemSuccessDecoder = JD.object({
  status: JD.constant('success'),
  body: JD.object({ id: JD.string }),
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
