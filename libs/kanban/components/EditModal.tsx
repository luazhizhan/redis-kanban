import '@uiw/react-markdown-preview/markdown.css'
import '@uiw/react-md-editor/markdown-editor.css'
import dynamic from 'next/dynamic'
import { Dispatch } from 'react'
import CloseIcon from '../../../components/svgs/Close'
import useApi from '../../../hooks/useApi'
import useTheme from '../../../hooks/useTheme'
import { Action, State } from '../store'
import styles from './EditModal.module.css'

type Props = {
  useKanbanReducer: [State, Dispatch<Action>]
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditModal(props: Props): JSX.Element {
  const { useKanbanReducer } = props
  const [state, dispatch] = useKanbanReducer
  const [isDarkTheme] = useTheme()
  const { updateItem } = useApi()

  const editModalStyle = state.edit
    ? `${styles.container} ${styles.show}`
    : `${styles.container} ${styles.hide}`

  return (
    <div className={editModalStyle}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span>Edit</span>
          <button
            onClick={async () => {
              if (!state.edit) return
              const { item, category, position } = state.edit
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
          value={state.edit ? state.edit.item.title : ''}
          onChange={(e): void => {
            if (!state.edit) return
            dispatch({
              type: 'UPDATE',
              item: { ...state.edit.item, title: e.currentTarget.value },
              category: state.edit.category,
            })
          }}
          rows={2}
        ></textarea>
        <MDEditor
          height="85%"
          value={state.edit ? state.edit.item.content : ''}
          onChange={(v): void => {
            if (!state.edit) return
            dispatch({
              type: 'UPDATE',
              item: { ...state.edit.item, content: v || '' },
              category: state.edit.category,
            })
          }}
        />
      </div>
    </div>
  )
}
