import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import useApi, { Category } from '../../../hooks/useApi'
import useWallet from '../../../hooks/useWallet'
import { Context } from '../../../store/Store'
import styles from './CreateItem.module.css'

type Props = {
  setHide: Dispatch<SetStateAction<boolean>>
  category: Category
}

export default function CreateItem(props: Props): JSX.Element {
  const { setHide, category } = props
  const { dispatch } = useContext(Context)

  const [createItemInput, setCreateItemInput] = useState('')
  const { wallet } = useWallet()
  const { createItem } = useApi()

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
      const id = await createItem(createItemInput, category)
      if (id === null) return
      dispatch({
        type: 'CREATE',
        title: createItemInput,
        id,
        category,
      })
      setCreateItemInput('')
      setHide(true)
    } catch (error) {
      if (error instanceof Error) alert(error.message)
    }
  }

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Type a name"
        autoFocus={true}
        onKeyUp={async (e) => {
          if (e.key === 'Enter') {
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
        <button onClick={() => setHide(true)}>Cancel</button>
      </div>
    </div>
  )
}
