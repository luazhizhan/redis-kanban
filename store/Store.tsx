import { createContext, Dispatch, useReducer } from 'react'
import { Theme } from './theme'
import { Wallet } from './wallet'

type Action =
  | {
      type: 'SET_WALLET'
      wallet: Wallet
    }
  | {
      type: 'SET_THEME'
      theme: Theme
    }

type State = {
  wallet: Wallet
  theme: Theme
}

const initialState: State = {
  wallet: { status: 'disconnected' },
  theme: 'light',
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_WALLET':
      return { ...state, wallet: action.wallet }
    case 'SET_THEME':
      return { ...state, theme: action.theme }
    default:
      return state
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
