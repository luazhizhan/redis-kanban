import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import useApi from '../../../hooks/useApi'
import useWallet from '../../../hooks/useWallet'
import { Action } from '../store'
import styles from './CreateItem.module.css'

type Props = {
  useShow: [boolean, Dispatch<SetStateAction<boolean>>]
  dispatch: Dispatch<Action>
}

export default function CreateItem(props: Props): JSX.Element {
  const { useShow, dispatch } = props
  const [show, setShow] = useShow

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
      const id = await createItem(createItemInput)
      if (id === null) return
      dispatch({ type: 'CREATE', content: createItemInput, id })
      setCreateItemInput('')
      setShow(false)
    } catch (error) {
      if (error instanceof Error) alert(error.message)
    }
  }

  return (
    <>
      {show && (
        <div className={styles.container}>
          <span>Title</span>
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
            <button onClick={() => setShow(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
