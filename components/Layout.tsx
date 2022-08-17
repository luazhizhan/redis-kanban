import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import useHideOutsideClick from '../hooks/useHideOutsideClick'
import useTheme from '../hooks/useTheme'
import useWallet from '../hooks/useWallet'
import ConnectButton from './ConnectButton'
import styles from './Layout.module.css'
import DotsVerticalIcon from './svgs/DotsVertical'
import ExternalLinkIcon from './svgs/ExternalLink'
import GithubIcon from './svgs/Github'
import DarkIcon from './svgs/Moon'
import LightIcon from './svgs/Sun'
import WalletIcon from './svgs/Wallet'

type Props = {
  children: JSX.Element
}

const Layout = (props: Props): JSX.Element => {
  const { children } = props
  const { wallet, onDisconnect, refreshSession } = useWallet()
  const [hideOptions, setHideOptions] = useState(true)
  const [isDarkTheme, onChangeTheme] = useTheme()

  const optionsRef = useRef<HTMLDivElement>(null)
  useHideOutsideClick(optionsRef, setHideOptions)
  const optionsContainer = hideOptions ? styles.hide : styles.options

  const ThemeIcon = isDarkTheme ? (
    <LightIcon height={20} width={20} fill="white" />
  ) : (
    <DarkIcon height={20} width={20} fill="black" />
  )
  const themeText = isDarkTheme ? 'Light Theme' : 'Dark Theme'

  const getDisplayAddress = (address: string): string =>
    `${address.substring(0, 7)}...${address.substring(address.length - 7)}`

  useEffect(() => {
    refreshSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <nav className={styles.nav}>
          <Image
            src={isDarkTheme ? '/logo-dark.svg' : '/logo-light.svg'}
            width="70px"
            height="70px"
            alt="Redis Kanban"
          />
          <div>
            {wallet.status === 'connected' ? (
              <div className={styles.connected}>
                <WalletIcon
                  height={20}
                  width={20}
                  fill={isDarkTheme ? 'white' : 'black'}
                />
                <button onClick={onDisconnect}>
                  <span>{getDisplayAddress(wallet.account)}</span>
                </button>
              </div>
            ) : (
              <ConnectButton />
            )}
            <div ref={optionsRef}>
              <button
                className={styles.menu}
                onClick={(): void => setHideOptions(() => !hideOptions)}
              >
                <DotsVerticalIcon
                  height={20}
                  width={20}
                  fill={isDarkTheme ? 'white' : 'black'}
                />
              </button>
              <div className={optionsContainer}>
                <button onClick={onChangeTheme}>
                  {ThemeIcon}
                  <span>{themeText}</span>
                </button>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/luazhizhan/redis-kanban"
                >
                  <GithubIcon
                    height={20}
                    width={20}
                    fill={isDarkTheme ? 'white' : 'black'}
                  />
                  <span>Github</span>
                </a>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://dev.to/devteam/announcing-the-redis-hackathon-on-dev-3248"
                >
                  <ExternalLinkIcon height={20} width={20} />
                  <span>Redis Hackathon</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div className={styles.content}>{children} </div>
      </div>
    </div>
  )
}

export default Layout
