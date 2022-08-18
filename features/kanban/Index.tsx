import { useEffect, useReducer, useState } from 'react'
import ConnectButton from '../../components/ConnectButton'
import AddIcon from '../../components/svgs/Add'
import useApi, { Category } from '../../hooks/useApi'
import useTheme from '../../hooks/useTheme'
import useWallet from '../../hooks/useWallet'
import CreateItem from './components/CreateItem'
import Items from './components/Items'
import { ItemDecoder } from './helper'
import styles from './Index.module.css'
import { initialState, reducer } from './store'

export default function Index(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [showCreateItem, setShowCreateItem] = useState(false)
  const { wallet } = useWallet()
  const { allItems, updateItem } = useApi()
  const [isDarkTheme] = useTheme()

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

  const onItemDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    newCategory: Category
  ): Promise<void> => {
    const item = e.dataTransfer.getData('text/plain')
    const parsedItem = JSON.parse(item)
    const decodedItem = ItemDecoder.verify(parsedItem)
    const position = state[newCategory].length
    try {
      dispatch({
        type: 'UPDATE_CATEGORY',
        id: decodedItem.id,
        newCategory,
        oldCategory: decodedItem.category,
        position,
      })
      await updateItem(
        decodedItem.id,
        decodedItem.content,
        newCategory,
        position
      )
    } catch (error) {
      if (error instanceof Error) alert(error.message)
    }
  }

  if (wallet.status !== 'connected') {
    return (
      <div className={styles.container}>
        <section className={styles.connectContent}>
          <ConnectButton />
        </section>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <section className={styles.content}>
        <div>
          <div className={styles.todo}>
            <h2>Todo</h2>
            <button onClick={() => setShowCreateItem(true)}>
              <AddIcon
                height={17}
                width={17}
                fill={isDarkTheme ? 'white' : 'black'}
              />
            </button>
          </div>
          <CreateItem
            useShow={[showCreateItem, setShowCreateItem]}
            dispatch={dispatch}
          />
          <div
            className={styles.items}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onItemDrop(e, 'todo')}
          >
            <Items category="todo" useKanbanReducer={[state, dispatch]} />
          </div>
        </div>
        <div>
          <h2>Doing</h2>
          <div
            className={styles.items}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onItemDrop(e, 'doing')}
          >
            <Items category="doing" useKanbanReducer={[state, dispatch]} />
          </div>
        </div>
        <div>
          <h2>Done</h2>
          <div
            className={styles.items}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onItemDrop(e, 'done')}
          >
            <Items category="done" useKanbanReducer={[state, dispatch]} />
          </div>
        </div>
      </section>
    </div>
  )
}
