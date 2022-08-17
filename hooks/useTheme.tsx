import { useCallback, useContext, useEffect } from 'react'
import { Context } from '../store/Store'

type IsDarkTheme = boolean
type OnChangeTheme = () => void
type ThemeHook = [IsDarkTheme, OnChangeTheme]

export default function useTheme(): ThemeHook {
  const { state, dispatch } = useContext(Context)
  const isDarkTheme = state.theme === 'dark'

  const setDark = useCallback((): void => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.setAttribute('data-theme', 'dark')
    dispatch({ type: 'SET_THEME', theme: 'dark' })
  }, [dispatch])

  const setLight = useCallback((): void => {
    localStorage.setItem('theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')
    dispatch({ type: 'SET_THEME', theme: 'light' })
  }, [dispatch])

  const onChangeTheme = (): void => (isDarkTheme ? setLight() : setDark())

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultDark =
      storedTheme === 'dark' || (storedTheme === null && prefersDark)
    defaultDark ? setDark() : setLight()
  }, [setDark, setLight])

  return [isDarkTheme, onChangeTheme]
}
