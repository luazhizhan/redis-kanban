export type Action = {
  type: 'SET_WALLET'
  wallet: Wallet
}
type Connecting = {
  status: 'connecting'
}

type Disconnected = {
  status: 'disconnected'
}

type Connected = {
  status: 'connected'
  account: string
  jwt: string
}

export type Wallet = Connecting | Disconnected | Connected
