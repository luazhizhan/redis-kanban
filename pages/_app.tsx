import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { Provider } from '../store/Store'
import '../styles/github-corner.css'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const [hasMounted, setHasMounted] = useState(false)

  // Ensure window object is mounted before rendering
  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return <></>

  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
