import { AllItems, Category } from '../../hooks/useApi'

export type Action =
  | { type: 'SET_ITEMS'; allItems: AllItems }
  | { type: 'CREATE'; category: Category; title: string; id: string }
  | { type: 'UPDATE'; item: Item; category: Category }
  | {
      type: 'UPDATE_CATEGORY'
      newCategory: Category
      oldCategory: Category
      position: number
      id: string
    }
  | {
      type: 'UPDATE_DRAG_OVER'
      id: string
      category: Category
      isDragOver: boolean
    }
  | {
      type: 'UPDATE_HOVER'
      id: string
      category: Category
      isHover: boolean
    }
  | { type: 'SET_EDIT'; edit: EditItem }
  | { type: 'DELETE'; id: string; category: Category }

export type Item = {
  id: string
  title: string
  content: string
  isDragOver: boolean
  isHover: boolean
}

type EditItem = {
  item: Item
  category: Category
  position: number
} | null

type CategoryState = {
  [key in Category]: Item[]
}

export interface State extends CategoryState {
  edit: EditItem
}

export const initialState: State = {
  todo: [],
  doing: [],
  done: [],
  edit: null,
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS': {
      const { allItems } = action
      const items = allItems.items.reduce(
        (prev, { category, id, title, content }) => {
          const init = {
            id,
            title,
            content,
            isDragOver: false,
            isHover: false,
          }
          switch (category) {
            case 'todo':
              return {
                ...prev,
                todo: [...prev.todo, init],
              }
            case 'doing':
              return {
                ...prev,
                doing: [...prev.doing, init],
              }
            case 'done':
              return {
                ...prev,
                done: [...prev.done, init],
              }
          }
        },
        { todo: [], doing: [], done: [] } as {
          todo: Item[]
          doing: Item[]
          done: Item[]
        }
      )
      const todoOrders = allItems.orders['todo'] || []
      const doingOrders = allItems.orders['doing'] || []
      const doneOrders = allItems.orders['done'] || []
      const todo = todoOrders
        .map((id) => items.todo.find((item) => item.id === id))
        .filter((x): x is Item => x !== undefined)
      const doing = doingOrders
        .map((id) => items.doing.find((item) => item.id === id))
        .filter((x): x is Item => x !== undefined)
      const done = doneOrders
        .map((id) => items.done.find((item) => item.id === id))
        .filter((x): x is Item => x !== undefined)

      return {
        ...state,
        todo,
        doing,
        done,
      }
    }
    case 'CREATE': {
      return {
        ...state,
        [action.category]: [
          {
            id: action.id,
            title: action.title,
            content: '',
            isDragOver: false,
            isHover: false,
          },
          ...state[action.category],
        ],
      }
    }
    case 'UPDATE': {
      if (!state.edit) return state
      return {
        ...state,
        [action.category]: state[action.category].map((item) =>
          item.id === action.item.id ? action.item : item
        ),
        edit: { ...state.edit, item: action.item },
      }
    }
    case 'UPDATE_CATEGORY': {
      const { position, newCategory, oldCategory } = action
      const item = state[oldCategory].find(({ id }) => id === action.id)
      if (!item) return state

      const filtered = state[oldCategory].filter(({ id }) => id !== action.id)
      const newCategoryList =
        newCategory === oldCategory ? filtered : [...state[newCategory]]

      return {
        ...state,
        [oldCategory]: filtered,
        [newCategory]: [
          ...newCategoryList.slice(0, position),
          item,
          ...newCategoryList.slice(position),
        ],
      }
    }
    case 'UPDATE_DRAG_OVER': {
      const updated = state[action.category].map((item) => {
        if (item.id === action.id) {
          return { ...item, isDragOver: action.isDragOver }
        }
        return item
      })
      return {
        ...state,
        [action.category]: updated,
      }
    }
    case 'UPDATE_HOVER': {
      const updated = state[action.category].map((item) => {
        if (item.id === action.id) {
          return { ...item, isHover: action.isHover }
        }
        return item
      })
      return {
        ...state,
        [action.category]: updated,
      }
    }
    case 'SET_EDIT': {
      return {
        ...state,
        edit: action.edit,
      }
    }
    case 'DELETE': {
      const filtered = state[action.category].filter(
        (item) => item.id !== action.id
      )
      return {
        ...state,
        [action.category]: filtered,
      }
    }
  }
}
