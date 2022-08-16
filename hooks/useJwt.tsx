import useLocalStorage from './useLocalStorage'

type Jwt = {
  address: string
  token: string
} | null

type UseJwt = [Jwt, (value: Jwt | ((val: Jwt) => Jwt)) => void]

export default function useJwt(): UseJwt {
  const [jwt, setJwt] = useLocalStorage<Jwt>('jwt', null)
  return [jwt, setJwt]
}
