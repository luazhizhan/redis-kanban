import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/Layout'
import Kanban from '../libs/kanban/Index'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Redis Kanban</title>
      </Head>
      <Layout>
        <Kanban />
      </Layout>
    </>
  )
}

export default Home
