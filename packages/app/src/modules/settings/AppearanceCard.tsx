import { useEffect, useState } from 'react';
import { appThemeApiRef, useApi } from '@backstage/frontend-plugin-api';
import PaletteIcon from '@material-ui/icons/PaletteOutlined';
import { SettingsCard } from './SettingsCard';
import styles from './AppearanceCard.module.css';

type ThemeChoice = 'light' | 'dark' | 'auto';

const OPTIONS: { id: ThemeChoice; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
];

/** A miniature of the portal in the colors of a theme. */
function ThemePreview({ kind }: { kind: ThemeChoice }) {
  return (
    <div className={styles.preview} data-kind={kind} aria-hidden>
      <span className={styles.sidebar} />
      <span className={styles.brand} />
      {[29, 45, 61, 77].map(top => (
        <span key={top} className={styles.nav} style={{ top }} />
      ))}
      <span className={styles.header} />
      <span className={styles.title} />
      <span className={styles.subtitle} />
      <span className={styles.content} />
      <span className={styles.accent} />
      <span className={styles.description} />
    </div>
  );
}

/** The theme choice, kept in sync with the app theme (`undefined` is auto). */
function useThemeChoice() {
  const appThemeApi = useApi(appThemeApiRef);
  const [activeId, setActiveId] = useState(appThemeApi.getActiveThemeId());

  useEffect(() => {
    const subscription = appThemeApi.activeThemeId$().subscribe(setActiveId);
    return () => subscription.unsubscribe();
  }, [appThemeApi]);

  const themes = appThemeApi.getInstalledThemes();
  const idOf = (variant: 'light' | 'dark') =>
    themes.find(theme => theme.variant === variant)?.id;

  const selected: ThemeChoice = (() => {
    if (activeId === undefined) return 'auto';
    return activeId === idOf('dark') ? 'dark' : 'light';
  })();

  const choose = (choice: ThemeChoice) =>
    appThemeApi.setActiveThemeId(choice === 'auto' ? undefined : idOf(choice));

  const available = OPTIONS.filter(
    option => option.id === 'auto' || idOf(option.id) !== undefined,
  );

  return { selected, choose, available };
}

export function AppearanceCard() {
  const { selected, choose, available } = useThemeChoice();

  return (
    <SettingsCard icon={<PaletteIcon />} title="Appearance">
      <fieldset className={styles.theme}>
        <legend className={styles.legend}>
          <span className={styles.heading}>Theme</span>
          <span className={styles.hint}>Change the Backstage theme.</span>
        </legend>

        <div className={styles.options}>
          {available.map(option => (
            <label
              key={option.id}
              className={styles.option}
              data-selected={selected === option.id || undefined}
            >
              <input
                type="radio"
                name="theme"
                className={styles.input}
                checked={selected === option.id}
                onChange={() => choose(option.id)}
              />
              <ThemePreview kind={option.id} />
              <span className={styles.choice}>
                <span className={styles.radio} />
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </SettingsCard>
  );
}
