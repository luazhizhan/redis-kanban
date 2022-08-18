import { Dispatch } from 'react'
import DeleteIcon from '../../../components/svgs/Delete'
import useApi, { Category } from '../../../hooks/useApi'
import useTheme from '../../../hooks/useTheme'
import { ItemDecoder } from '../helper'
import { Action, State } from '../store'
import styles from './Items.module.css'

type Props = {
  category: Category
  useKanbanReducer: [State, Dispatch<Action>]
}

export default function Items(props: Props): JSX.Element {
  const { category, useKanbanReducer } = props
  const [state, dispatch] = useKanbanReducer
  const { updateItem, deleteItem } = useApi()
  const [isDarkTheme] = useTheme()

  return (
    <>
      {state[category].map(({ id, content, isDragOver, isHover }) => {
        const menuStyles = isHover
          ? `${styles.menu} ${styles.show}`
          : `${styles.menu} ${styles.hide}`

        return (
          <div
            key={id}
            draggable={true}
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
            onMouseMove={(): void =>
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
              className={`${styles.content} ${isDragOver ? styles.dashed : ''}`}
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
      })}
    </>
  )
}
