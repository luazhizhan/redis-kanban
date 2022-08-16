import { MetaMaskInpageProvider } from '@metamask/providers'
import { Client } from 'redis-om'

declare global {
  var client: Client | undefined // Cache redis client connection
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

export default global
