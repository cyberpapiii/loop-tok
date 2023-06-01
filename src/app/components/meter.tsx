import {FC} from 'react';
import styles from './meter.module.css';
import type { BasicMeter } from '../types';

const Meter: FC<BasicMeter> = ({
  keyword,
  color,
  count,
  goal,
  header
}) => {
  // 
  const percent = Math.round(100 * (Math.min((count / goal) * 100, 100))) / 100;

  // NOTE: CSS logic requires NON-div
  return <section className={styles.meterPane}>
    {header && <p>{header}</p>}
    <div className={styles.meterRow}>
      <span className={styles.meterKeyword}>{keyword}</span>
      <span className={styles.meterBar} style={{
        "--pct": `${percent}%`,
        "--color-primary": color,
      } as React.CSSProperties}>
        {percent}%
      </span>
    </div>
  </section>
}

export default Meter