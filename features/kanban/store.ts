import { AllItems, Category } from '../../hooks/useApi'

export type Action =
  | { type: 'SET_ITEMS'; allItems: AllItems }
  | { type: 'CREATE'; category: Category; content: string; id: string }
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
  | { type: 'DELETE'; id: string; category: Category }

export type Item = {
  id: string
  content: string
  isDragOver: boolean
  isHover: boolean
}
export type State = { [key in Category]: Item[] }

export const initialState: State = {
  todo: [],
  doing: [],
  done: [],
}
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS': {
      const { allItems } = action
      const items = allItems.items.reduce(
        (prev, { category, id, content }) => {
          switch (category) {
            case 'todo':
              return {
                ...prev,
                todo: [
                  ...prev.todo,
                  { id, content, isDragOver: false, isHover: false },
                ],
              }
            case 'doing':
              return {
                ...prev,
                doing: [
                  ...prev.doing,
                  { id, content, isDragOver: false, isHover: false },
                ],
              }
            case 'done':
              return {
                ...prev,
                done: [
                  ...prev.done,
                  { id, content, isDragOver: false, isHover: false },
                ],
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
            content: action.content,
            isDragOver: false,
            isHover: false,
          },
          ...state[action.category],
        ],
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
