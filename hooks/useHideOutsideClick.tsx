import { RefObject, useCallback, useEffect } from 'react'

function assertIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !('nodeType' in e)) {
    throw new Error(`Node expected`)
  }
}

export default function useHideOutsideClick(
  ref: RefObject<any>,
  setHide: (value: any) => void
): void {
  const clickOutside = useCallback(
    ({ target }: MouseEvent): void => {
      assertIsNode(target)
      if (ref.current && ref.current.contains(target)) return
      setHide(true)
    },
    [ref, setHide]
  )

  useEffect(() => {
    document.addEventListener('mousedown', clickOutside)
    return () => {
      document.removeEventListener('mousedown', clickOutside)
    }
  }, [clickOutside])
}
