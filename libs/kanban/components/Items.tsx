import { useContext } from 'react'
import DeleteIcon from '../../../components/svgs/Delete'
import useApi, { Category } from '../../../hooks/useApi'
import useTheme from '../../../hooks/useTheme'
import { Context } from '../../../store/Store'
import { ItemDecoder } from '../helper'
import styles from './Items.module.css'

type Props = {
  category: Category
}

export default function Items(props: Props): JSX.Element {
  const { category } = props
  const { state, dispatch } = useContext(Context)

  const { updateItem, deleteItem } = useApi()
  const [isDarkTheme] = useTheme()

  return (
    <>
      {state.kanban[category].map(
        ({ id, title, content, isDragOver, isHover }) => {
          const menuStyles = isHover
            ? `${styles.menu} ${styles.show}`
            : `${styles.menu} ${styles.hide}`

          return (
            <div
              key={id}
              draggable={true}
              onClick={() => {
                const position = state.kanban[category].findIndex(
                  (i) => i.id === id
                )
                dispatch({
                  type: 'SET_EDIT',
                  edit: {
                    item: { id, title, content, isDragOver, isHover },
                    category,
                    position,
                  },
                })
              }}
              onTouchStart={(): void =>
                dispatch({
                  type: 'UPDATE_HOVER',
                  category,
                  id,
                  isHover: true,
                })
              }
              onTouchEnd={(): void =>
                dispatch({
                  type: 'UPDATE_HOVER',
                  category,
                  id,
                  isHover: false,
                })
              }
              onMouseEnter={(): void =>
                dispatch({
                  type: 'UPDATE_HOVER',
                  category,
                  id,
                  isHover: true,
                })
              }
              onMouseLeave={(): void =>
                dispatch({
                  type: 'UPDATE_HOVER',
                  category,
                  id,
                  isHover: false,
                })
              }
              onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                e.dataTransfer.setData(
                  'text/plain',
                  JSON.stringify({ id, title, content, category, isDragOver })
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
                const position = state.kanban[category].findIndex(
                  (i) => i.id === id
                )
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
                    decodedItem.title,
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
                className={`${styles.content} ${
                  isDragOver ? styles.dashed : ''
                }`}
              >
                <h2>{title || 'Untitled'}</h2>
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      dispatch({ type: 'DELETE', category, id })
                      await deleteItem(id, category)
                    } catch (error) {
                      if (error instanceof Error) alert(error.message)
                    }
                  }}
                >
                  <span className={menuStyles}>
                    <DeleteIcon
                      height={17}
                      width={17}
                      fill={isDarkTheme ? '#c6c6c6' : '#5b5b5b'}
                    />
                  </span>
                </button>
              </div>
            </div>
          )
        }
      )}
    </>
  )
}
