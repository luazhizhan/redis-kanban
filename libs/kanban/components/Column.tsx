import { useContext, useState } from 'react'
import AddIcon from '../../../components/svgs/Add'
import useApi, { Category } from '../../../hooks/useApi'
import useTheme from '../../../hooks/useTheme'
import { Context } from '../../../store/Store'
import { ItemDecoder } from '../helper'
import styles from './Column.module.css'
import CreateItem from './CreateItem'
import Items from './Items'

type Props = {
  category: Category
}
export function Column(props: Props): JSX.Element {
  const { category } = props
  const { state, dispatch } = useContext(Context)

  const [hideCreateItem, setHideCreateItem] = useState(true)
  const [isDarkTheme] = useTheme()
  const { updateItem } = useApi()

  const onItemDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    newCategory: Category
  ): Promise<void> => {
    const item = e.dataTransfer.getData('text/plain')
    const parsedItem = JSON.parse(item)
    const decodedItem = ItemDecoder.verify(parsedItem)
    const position = state.kanban[newCategory].length
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
        decodedItem.title,
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
          <span>{state.kanban[category].length}</span>
        </span>
        <button className={styles.add} onClick={() => setHideCreateItem(false)}>
          <AddIcon
            height={17}
            width={17}
            fill={isDarkTheme ? 'white' : 'black'}
          />
        </button>
      </div>
      {!hideCreateItem && (
        <CreateItem setHide={setHideCreateItem} category={category} />
      )}
      <div
        className={styles.items}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onItemDrop(e, category)}
      >
        <Items category={category} />
      </div>
    </div>
  )
}
