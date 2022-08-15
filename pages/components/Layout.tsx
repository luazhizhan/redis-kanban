import { useState } from 'react'
import styles from './Layout.module.css'
import GithubCornerIcon from './svgs/GithubCorner'
import MenuIcon from './svgs/Menu'

type Props = {
  children: JSX.Element
}

const Layout = (props: Props): JSX.Element => {
  const [open, isOpen] = useState(false)
  const drawerStyle = open
    ? `${styles.drawer} ${styles.open}`
    : `${styles.drawer} ${styles.close}`

  const { children } = props
  return (
    <>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://github.com/luazhizhan/redis-kanban"
        className="github-corner"
      >
        <GithubCornerIcon height="65px" width="65px" />
      </a>
      <div className={styles.container}>
        <div className={drawerStyle}></div>
        <div className={styles.body}>
          <nav className={styles.nav}>
            <button onClick={() => isOpen(() => !open)}>
              <MenuIcon height={22} width={22} />
            </button>
            <h1>Redis Kanban</h1>
          </nav>
          <div className={styles.content}>{children} </div>
        </div>
      </div>
    </>
  )
}

export default Layout
