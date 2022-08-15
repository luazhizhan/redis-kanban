import { createContext, Dispatch, useReducer } from 'react'
import { Wallet } from './wallet'

type Action = {
  type: 'SET_WALLET'
  wallet: Wallet
}

type State = {
  wallet: Wallet
}

const initialState: State = {
  wallet: { status: 'disconnected' },
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_WALLET':
      return { ...state, wallet: action.wallet }
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
