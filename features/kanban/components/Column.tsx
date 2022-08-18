import { Dispatch, useState } from 'react'
import AddIcon from '../../../components/svgs/Add'
import useApi, { Category } from '../../../hooks/useApi'
import useTheme from '../../../hooks/useTheme'
import { ItemDecoder } from '../helper'
import { Action, State } from '../store'
import styles from './Column.module.css'
import CreateItem from './CreateItem'
import Items from './Items'

type Props = {
  category: Category
  useKanbanReducer: [State, Dispatch<Action>]
}
export function Column(props: Props): JSX.Element {
  const { useKanbanReducer, category } = props
  const [state, dispatch] = useKanbanReducer
  const [showCreateItem, setShowCreateItem] = useState(false)
  const [isDarkTheme] = useTheme()
  const { updateItem } = useApi()

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

  const headerStyle = (() => {
    switch (category) {
      case 'todo':
        return isDarkTheme ? '#4f4f4fb5' : '#e1e1e1b5'
      case 'doing':
        return isDarkTheme ? '#f37900b5' : '#ffbb35b5'
      case 'done':
        return isDarkTheme ? '#3fb98cb5' : '#7affceb5'
    }
  })()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span>
          <h2 className={styles.header} style={{ background: headerStyle }}>
            {category}
          </h2>
          <span>{state[category].length}</span>
        </span>
        <button className={styles.add} onClick={() => setShowCreateItem(true)}>
          <AddIcon
            height={17}
            width={17}
            fill={isDarkTheme ? 'white' : 'black'}
          />
        </button>
      </div>
      {showCreateItem && (
        <CreateItem
          setShow={setShowCreateItem}
          dispatch={dispatch}
          category={category}
        />
      )}
      <div
        className={styles.items}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onItemDrop(e, category)}
      >
        <Items category={category} useKanbanReducer={[state, dispatch]} />
      </div>
    </div>
  )
}
