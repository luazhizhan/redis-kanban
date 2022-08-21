import { createContext, Dispatch, useReducer } from 'react'
import { Action as KanbanAction, Item, Kanban } from './kanban'
import { Action as ThemeAction, Theme } from './theme'
import { Action as WalletAction, Wallet } from './wallet'

type Action = WalletAction | ThemeAction | KanbanAction

type State = {
  wallet: Wallet
  theme: Theme
  kanban: Kanban
}

const initialState: State = {
  wallet: { status: 'disconnected' },
  theme: 'light',
  kanban: {
    todo: [],
    doing: [],
    done: [],
    edit: null,
  },
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_WALLET':
      return { ...state, wallet: action.wallet }
    case 'SET_THEME':
      return { ...state, theme: action.theme }
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
        kanban: {
          ...state.kanban,
          todo,
          doing,
          done,
        },
      }
    }
    case 'CREATE': {
      return {
        ...state,
        kanban: {
          ...state.kanban,
          [action.category]: [
            {
              id: action.id,
              title: action.title,
              content: '',
              isDragOver: false,
              isHover: false,
            },
            ...state.kanban[action.category],
          ],
        },
      }
    }
    case 'UPDATE': {
      if (!state.kanban.edit) return state
      return {
        ...state,
        kanban: {
          ...state.kanban,
          [action.category]: state.kanban[action.category].map((item) =>
            item.id === action.item.id ? action.item : item
          ),
          edit: { ...state.kanban.edit, item: action.item },
        },
      }
    }
    case 'UPDATE_CATEGORY': {
      const { position, newCategory, oldCategory } = action
      const item = state.kanban[oldCategory].find(({ id }) => id === action.id)
      if (!item) return state

      const filtered = state.kanban[oldCategory].filter(
        ({ id }) => id !== action.id
      )
      const newCategoryList =
        newCategory === oldCategory ? filtered : [...state.kanban[newCategory]]

      return {
        ...state,
        kanban: {
          ...state.kanban,
          [oldCategory]: filtered,
          [newCategory]: [
            ...newCategoryList.slice(0, position),
            item,
            ...newCategoryList.slice(position),
          ],
        },
      }
    }
    case 'UPDATE_DRAG_OVER': {
      const updated = state.kanban[action.category].map((item) => {
        if (item.id === action.id) {
          return { ...item, isDragOver: action.isDragOver }
        }
        return item
      })
      return {
        ...state,
        kanban: {
          ...state.kanban,
          [action.category]: updated,
        },
      }
    }
    case 'UPDATE_HOVER': {
      const updated = state.kanban[action.category].map((item) => {
        if (item.id === action.id) {
          return { ...item, isHover: action.isHover }
        }
        return item
      })
      return {
        ...state,
        kanban: {
          ...state.kanban,
          [action.category]: updated,
        },
      }
    }
    case 'SET_EDIT': {
      return {
        ...state,
        kanban: {
          ...state.kanban,
          edit: action.edit,
        },
      }
    }
    case 'RESTORE_ITEM': {
      const { id, category, content, title } = action.item
      return {
        ...state,
        kanban: {
          ...state.kanban,
          [category]: [
            { id, content, title, isDragOver: false, isHover: false },
            ...state.kanban[category],
          ],
        },
      }
    }
    case 'DELETE': {
      const filtered = state.kanban[action.category].filter(
        (item) => item.id !== action.id
      )
      return {
        ...state,
        kanban: {
          ...state.kanban,
          [action.category]: filtered,
        },
      }
    }
  }
}

export const Context = createContext<{
  state: State
  dispatch: Dispatch<Action>
}>({
  state: initialState,
  dispatch: () => null,
})

export function Provider(props: { children: JSX.Element }): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  )
}
