import * as JD from 'decoders'
import type { NextPage } from 'next'
import { ChangeEvent, useReducer, useState } from 'react'
import ConnectButton from '../components/ConnectButton'
import Layout from '../components/Layout'
import AddIcon from '../components/svgs/Add'
import DeleteIcon from '../components/svgs/Delete'
import useWallet from '../hooks/useWallet'
import styles from './Index.module.css'

type Action =
  | { type: 'CREATE'; content: string }
  | {
      type: 'UPDATE_CATEGORY'
      newCategory: Category
      oldCategory: Category
      position: number
      id: number
    }
  | {
      type: 'UPDATE_DRAG_OVER'
      id: number
      category: Category
      isDragOver: boolean
    }
  | { type: 'DELETE'; id: number; category: Category }

type Category = 'todo' | 'doing' | 'done'
type Item = { id: number; content: string; isDragOver: boolean }
type State = { [key in Category]: Item[] }

const initialState: State = {
  todo: [{ id: Date.now(), content: 'Task 4', isDragOver: false }],
  doing: [{ id: Date.now() + 1, content: 'Task 3', isDragOver: false }],
  done: [
    { id: Date.now() + 2, content: 'Task 2', isDragOver: false },
    { id: Date.now() + 3, content: 'Task 1', isDragOver: false },
  ],
}

const ItemDecoder = JD.object({
  id: JD.number,
  content: JD.string,
  isDragOver: JD.boolean,
  category: JD.oneOf(['todo', 'doing', 'done']),
})

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CREATE': {
      if (action.content.trim().length === 0) return state
      return {
        ...state,
        todo: [
          { id: Date.now(), content: action.content, isDragOver: false },
          ...state.todo,
        ],
      }
    }

    case 'UPDATE_CATEGORY': {
      const { position, newCategory, oldCategory } = action

      const { oldPosition, found } = (() => {
        const index = state[oldCategory].findIndex(
          (item) => item.id === action.id
        )
        return { oldPosition: index, found: state[oldCategory][index] }
      })()
      if (oldPosition === -1) return state
      if (newCategory === oldCategory && position === oldPosition) return state

      const filtered = state[oldCategory].filter(
        (item) => item.id !== action.id
      )
      const newCategoryList =
        newCategory === oldCategory ? filtered : [...state[newCategory]]
      if (position === 0) {
        return {
          ...state,
          [oldCategory]: filtered,
          [newCategory]: [found, ...newCategoryList],
        }
      }

      return {
        ...state,
        [oldCategory]: filtered,
        [newCategory]: [
          ...newCategoryList.slice(0, position),
          found,
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
  const [state, dispatch] = useReducer(reducer, initialState)
  const [add, setAdd] = useState(false)
  const [addInput, setAddInput] = useState('')
  const { wallet } = useWallet()

  const onAddInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.currentTarget.value
    setAddInput(value)
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
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.stopPropagation()
          const item = e.dataTransfer.getData('text/plain')
          const parsedItem = JSON.parse(item)
          const decodedItem = ItemDecoder.verify(parsedItem)
          const position = state[category].findIndex((i) => i.id === id)
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
        }}
      >
        <div
          className={`${styles.itemContent} ${isDragOver ? styles.dashed : ''}`}
        >
          <h2>{content}</h2>
          <button onClick={() => dispatch({ type: 'DELETE', category, id })}>
            <DeleteIcon height={13} width={13} />
          </button>
        </div>
      </div>
    ))
  }

  const onItemsDrop = (
    e: React.DragEvent<HTMLDivElement>,
    newCategory: Category
  ): void => {
    const item = e.dataTransfer.getData('text/plain')
    const parsedItem = JSON.parse(item)
    const decodedItem = ItemDecoder.verify(parsedItem)
    dispatch({
      type: 'UPDATE_CATEGORY',
      id: decodedItem.id,
      newCategory,
      oldCategory: decodedItem.category,
      position: state[newCategory].length,
    })
  }

  if (wallet.status !== 'connected') {
    return (
      <Layout>
        <div className={styles.container}>
          <section className={styles.connectContent}>
            <ConnectButton />
          </section>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.content}>
          <div>
            <div className={styles.todo}>
              <h2>Todo</h2>
              <button onClick={() => setAdd(true)}>
                <AddIcon height={15} width={15} />
              </button>
            </div>
            {add && (
              <div className={styles.addItem}>
                <input
                  type="text"
                  onKeyUp={(e) => {
                    if (e.code === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      dispatch({ type: 'CREATE', content: addInput })
                      setAddInput('')
                      setAdd(false)
                    }
                  }}
                  onChange={onAddInputChange}
                  value={addInput}
                />
                <div>
                  <button
                    onClick={() => {
                      dispatch({ type: 'CREATE', content: addInput })
                      setAddInput('')
                      setAdd(false)
                    }}
                  >
                    Add
                  </button>
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
  )
}

export default Home
