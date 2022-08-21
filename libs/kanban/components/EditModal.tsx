import '@uiw/react-markdown-preview/markdown.css'
import '@uiw/react-md-editor/markdown-editor.css'
import dynamic from 'next/dynamic'
import { useContext } from 'react'
import CloseIcon from '../../../components/svgs/Close'
import useApi from '../../../hooks/useApi'
import useTheme from '../../../hooks/useTheme'
import { Context } from '../../../store/Store'
import styles from './EditModal.module.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditModal(): JSX.Element {
  const { state, dispatch } = useContext(Context)

  const [isDarkTheme] = useTheme()
  const { updateItem } = useApi()

  const editModalStyle = state.kanban.edit
    ? `${styles.container} ${styles.show}`
    : `${styles.container} ${styles.hide}`

  return (
    <div className={editModalStyle}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span>Edit</span>
          <button
            onClick={async () => {
              if (!state.kanban.edit) return
              const { item, category, position } = state.kanban.edit
              dispatch({ type: 'SET_EDIT', edit: null })
              await updateItem(
                item.id,
                item.title,
                item.content,
                category,
                position
              )
            }}
          >
            <CloseIcon
              height={22}
              width={22}
              stroke={isDarkTheme ? 'white' : 'black'}
            />
          </button>
        </div>

        <textarea
          className={styles.title}
          placeholder="Untitled"
          value={state.kanban.edit ? state.kanban.edit.item.title : ''}
          onChange={(e): void => {
            if (!state.kanban.edit) return
            dispatch({
              type: 'UPDATE',
              item: { ...state.kanban.edit.item, title: e.currentTarget.value },
              category: state.kanban.edit.category,
            })
          }}
          rows={2}
        ></textarea>
        <MDEditor
          height="85%"
          value={state.kanban.edit ? state.kanban.edit.item.content : ''}
          onChange={(v): void => {
            if (!state.kanban.edit) return
            dispatch({
              type: 'UPDATE',
              item: { ...state.kanban.edit.item, content: v || '' },
              category: state.kanban.edit.category,
            })
          }}
        />
      </div>
    </div>
  )
}
