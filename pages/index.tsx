import * as JD from 'decoders'
import type { NextPage } from 'next'
import Head from 'next/head'
import { ChangeEvent, useEffect, useReducer, useState } from 'react'
import ConnectButton from '../components/ConnectButton'
import Layout from '../components/Layout'
import AddIcon from '../components/svgs/Add'
import DeleteIcon from '../components/svgs/Delete'
import useApi, { AllItems, Category } from '../hooks/useApi'
import useWallet from '../hooks/useWallet'
import styles from './Index.module.css'

type Action =
  | { type: 'SET_ITEMS'; allItems: AllItems }
  | { type: 'CREATE'; content: string; id: string }
  | {
      type: 'UPDATE_CATEGORY'
      newCategory: Category
      oldCategory: Category
      position: number
      id: string
    }
  | {
      type: 'UPDATE_DRAG_OVER'
      id: string
      category: Category
      isDragOver: boolean
    }
  | { type: 'DELETE'; id: string; category: Category }

type Item = { id: string; content: string; isDragOver: boolean }
type State = { [key in Category]: Item[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS': {
      const { allItems } = action
      const items = allItems.items.reduce(
        (prev, { category, id, content }) => {
          switch (category) {
            case 'todo':
              return {
                ...prev,
                todo: [...prev.todo, { id, content, isDragOver: false }],
              }
            case 'doing':
              return {
                ...prev,
                doing: [...prev.doing, { id, content, isDragOver: false }],
              }
            case 'done':
              return {
                ...prev,
                done: [...prev.done, { id, content, isDragOver: false }],
              }
          }
        },
        { todo: [], doing: [], done: [] } as {
          todo: Item[]
          doing: Item[]
          done: Item[]
        }
      )
      const todoOrders = allItems.orders['todo'] || []
      const doingOrders = allItems.orders['doing'] || []
      const doneOrders = allItems.orders['done'] || []
      const todo = todoOrders
        .map((id) => items.todo.find((item) => item.id === id))
        .filter((x): x is Item => x !== undefined)
      const doing = doingOrders
        .map((id) => items.doing.find((item) => item.id === id))
        .filter((x): x is Item => x !== undefined)
      const done = doneOrders
        .map((id) => items.done.find((item) => item.id === id))
        .filter((x): x is Item => x !== undefined)

      return {
        ...state,
        todo,
        doing,
        done,
      }
    }
    case 'CREATE': {
      return {
        ...state,
        todo: [
          { id: action.id, content: action.content, isDragOver: false },
          ...state.todo,
        ],
      }
    }
    case 'UPDATE_CATEGORY': {
      const { position, newCategory, oldCategory } = action
      const item = state[oldCategory].find(({ id }) => id === action.id)
      if (!item) return state

      const filtered = state[oldCategory].filter(({ id }) => id !== action.id)
      const newCategoryList =
        newCategory === oldCategory ? filtered : [...state[newCategory]]

      return {
        ...state,
        [oldCategory]: filtered,
        [newCategory]: [
          ...newCategoryList.slice(0, position),
          item,
          ...newCategoryList.slice(position),
        ],
      }
    }
    case 'UPDATE_DRAG_OVER': {
      const updated = state[action.category].map((item) => {
        if (item.id === action.id) {
          return { ...item, isDragOver: action.isDragOver }
        }
        return item
      })
      return {
        ...state,
        [action.category]: updated,
      }
    }
    case 'DELETE': {
      const filtered = state[action.category].filter(
        (item) => item.id !== action.id
      )
      return {
        ...state,
        [action.category]: filtered,
      }
    }
  }
}

const Home: NextPage = () => {
  const [state, dispatch] = useReducer(reducer, {
    todo: [],
    doing: [],
    done: [],
  })
  const [add, setAdd] = useState(false)
  const [createItemInput, setCreateItemInput] = useState('')
  const { wallet } = useWallet()
  const { createItem, allItems, updateItem, deleteItem } = useApi()

  const ItemDecoder = JD.object({
    id: JD.string,
    content: JD.string,
    isDragOver: JD.boolean,
    category: JD.oneOf(['todo', 'doing', 'done']),
  })

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

  const onCreateItemInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const value = event.currentTarget.value
    setCreateItemInput(value)
  }

  const onCreateItem = async (): Promise<void> => {
    if (wallet.status !== 'connected') return
    if (createItemInput.trim().length === 0) return
    try {
      const id = await createItem(createItemInput)
      if (id === null) return
      dispatch({ type: 'CREATE', content: createItemInput, id })
      setCreateItemInput('')
      setAdd(false)
    } catch (error) {
      if (error instanceof Error) alert(error.message)
    }
  }

  const Items = (items: Item[], category: Category): JSX.Element[] => {
    return items.map(({ id, content, isDragOver }) => (
      <div
        key={id}
        draggable={true}
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
          e.dataTransfer.setData(
            'text/plain',
            JSON.stringify({ id, content, category, isDragOver })
          )
        }}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          dispatch({
            type: 'UPDATE_DRAG_OVER',
            category,
            id,
            isDragOver: true,
          })
        }}
        onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          dispatch({
            type: 'UPDATE_DRAG_OVER',
            category,
            id,
            isDragOver: false,
          })
        }}
        onDrop={async (e: React.DragEvent<HTMLDivElement>) => {
          e.stopPropagation()
          const item = e.dataTransfer.getData('text/plain')
          const parsedItem = JSON.parse(item)
          const decodedItem = ItemDecoder.verify(parsedItem)
          const position = state[category].findIndex((i) => i.id === id)
          try {
            dispatch({
              type: 'UPDATE_CATEGORY',
              id: decodedItem.id,
              newCategory: category,
              oldCategory: decodedItem.category,
              position,
            })
            dispatch({
              type: 'UPDATE_DRAG_OVER',
              category,
              id,
              isDragOver: false,
            })
            await updateItem(
              decodedItem.id,
              decodedItem.content,
              category,
              position
            )
          } catch (error) {
            if (error instanceof Error) alert(error.message)
          }
        }}
      >
        <div
          className={`${styles.itemContent} ${isDragOver ? styles.dashed : ''}`}
        >
          <h2>{content}</h2>
          <button
            onClick={async () => {
              try {
                dispatch({ type: 'DELETE', category, id })
                await deleteItem(id)
              } catch (error) {
                if (error instanceof Error) alert(error.message)
              }
            }}
          >
            <DeleteIcon height={17} width={17} />
          </button>
        </div>
      </div>
    ))
  }

  const onItemsDrop = async (
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

  const IndexHead = (): JSX.Element => (
    <Head>
      <title>Redis Kanban</title>
    </Head>
  )

  if (wallet.status !== 'connected') {
    return (
      <>
        <IndexHead />
        <Layout>
          <div className={styles.container}>
            <section className={styles.connectContent}>
              <ConnectButton />
            </section>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <IndexHead />
      <Layout>
        <div className={styles.container}>
          <section className={styles.content}>
            <div>
              <div className={styles.todo}>
                <h2>Todo</h2>
                <button onClick={() => setAdd(true)}>
                  <AddIcon height={17} width={17} />
                </button>
              </div>
              {add && (
                <div className={styles.addItem}>
                  <input
                    type="text"
                    onKeyUp={async (e) => {
                      if (e.code === 'Enter') {
                        e.preventDefault()
                        e.stopPropagation()
                        await onCreateItem()
                      }
                    }}
                    onChange={onCreateItemInputChange}
                    value={createItemInput}
                  />
                  <div>
                    <button onClick={onCreateItem}>Add</button>
                    <button onClick={() => setAdd(false)}>Cancel</button>
                  </div>
                </div>
              )}
              <div
                className={styles.items}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onItemsDrop(e, 'todo')}
              >
                {Items(state.todo, 'todo')}
              </div>
            </div>
            <div>
              <h2>Doing</h2>
              <div
                className={styles.items}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onItemsDrop(e, 'doing')}
              >
                {Items(state.doing, 'doing')}
              </div>
            </div>
            <div>
              <h2>Done</h2>
              <div
                className={styles.items}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onItemsDrop(e, 'done')}
              >
                {Items(state.done, 'done')}
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  )
}

export default Home
