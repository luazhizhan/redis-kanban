type Connecting = {
  status: 'connecting'
}

type Disconnected = {
  status: 'disconnected'
}

type Connected = {
  status: 'connected'
  account: string
}

export type Wallet = Connecting | Disconnected | Connected
