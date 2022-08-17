import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Provider } from '../store/Store'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const [hasMounted, setHasMounted] = useState(false)

  // Ensure window object is mounted before rendering
  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return <></>

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Kanban board build with Next.js, TypeScript and Redis for Redis Hackathon hosted at DEV Community."
        />
      </Head>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  )
}

export default MyApp
