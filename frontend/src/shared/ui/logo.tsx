import styles from './logo.module.css';

export function Logo() {
  return (
    <span className={styles.logo} aria-hidden="true">
      <svg viewBox="0 0 28 28" fill="none" className={styles.mark}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
          <g key={rotation} transform={`rotate(${rotation} 14 14)`}>
            <g className={styles.petalOffset}>
              <ellipse
                cx="14"
                cy="8.3"
                rx="2.6"
                ry="4.15"
                className={`${styles.petalSpin} ${
                  index % 2 === 0 ? styles.markPetalAccent : styles.markPetal
                }`}
              />
            </g>
          </g>
        ))}
        <circle cx="14" cy="14" r="1.5" className={styles.markPetalAccent} />
      </svg>
      <span className={styles.wordmark}>
        cv<span>match</span>
      </span>
    </span>
  );
}
