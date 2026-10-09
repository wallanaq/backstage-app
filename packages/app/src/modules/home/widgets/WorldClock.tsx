import { ReactNode, useEffect, useState } from 'react';
import GlobeIcon from '@material-ui/icons/Public';
import NightIcon from '@material-ui/icons/Brightness3';
import DayIcon from '@material-ui/icons/WbSunny';
import { WidgetCard } from '../WidgetCard';
import styles from './WorldClock.module.css';

export interface ClockConfig {
  label: string;
  timeZone: string;
}

const DEFAULT_CLOCKS: ClockConfig[] = [
  { label: 'UTC', timeZone: 'UTC' },
  { label: 'SP', timeZone: 'America/Sao_Paulo' },
];

function hourIn(timeZone: string, date: Date): number {
  const hour = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone,
  }).format(date);
  return Number(hour) % 24;
}

function iconFor(clock: ClockConfig, now: Date): ReactNode {
  if (clock.timeZone === 'UTC') {
    return <GlobeIcon />;
  }
  const hour = hourIn(clock.timeZone, now);
  return hour >= 6 && hour < 18 ? <DayIcon /> : <NightIcon />;
}

export function WorldClock({
  clocks = DEFAULT_CLOCKS,
  hour12,
}: {
  clocks?: ClockConfig[];
  hour12?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WidgetCard icon={<GlobeIcon />} title="Relógios mundiais">
      <ul className={styles.clocks}>
        {clocks.map(clock => (
          <li key={`${clock.label}-${clock.timeZone}`} className={styles.clock}>
            <span className={styles.clockIcon}>{iconFor(clock, now)}</span>
            <span className={styles.label}>{clock.label}</span>
            <time className={styles.time}>
              {new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: hour12 ?? false,
                timeZone: clock.timeZone,
              }).format(now)}
            </time>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
