import styles from './PublicTabs.module.css'

function PublicTabs({ publicTab, cartCount, onTabChange }) {
  return (
    <nav className={styles.tabs}>
      <button type="button" className={publicTab === 'home' ? styles.active : ''} onClick={() => onTabChange('home')}>Home</button>
      <button type="button" className={publicTab === 'course' ? styles.active : ''} onClick={() => onTabChange('course')}>Course View</button>
      <button type="button" className={publicTab === 'instructor' ? styles.active : ''} onClick={() => onTabChange('instructor')}>Instructor View</button>
      <button type="button" className={publicTab === 'cart' ? styles.active : ''} onClick={() => onTabChange('cart')}>Cart ({cartCount})</button>
    </nav>
  )
}

export default PublicTabs
