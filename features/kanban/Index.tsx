import { useEffect, useReducer } from 'react'
import ConnectButton from '../../components/ConnectButton'
import useApi from '../../hooks/useApi'
import useWallet from '../../hooks/useWallet'
import { Column } from './components/Column'
import styles from './Index.module.css'
import { initialState, reducer } from './store'

export default function Index(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { wallet } = useWallet()
  const { allItems } = useApi()

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (wallet.status !== 'connected') return
      try {
        const data = await allItems()
        if (!data) return
        dispatch({ type: 'SET_ITEMS', allItems: data })
      } catch (error) {
        if (error instanceof Error) alert(error.message)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  if (wallet.status !== 'connected') {
    return (
      <div className={styles.container}>
        <section className={styles.connect}>
          <ConnectButton />
        </section>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <section className={styles.columns}>
        <Column category="todo" useKanbanReducer={[state, dispatch]} />
        <Column category="doing" useKanbanReducer={[state, dispatch]} />
        <Column category="done" useKanbanReducer={[state, dispatch]} />
      </section>
    </div>
  )
}
