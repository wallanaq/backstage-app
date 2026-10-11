import { ReactNode } from 'react';
import { iconsApiRef, useApi } from '@backstage/frontend-plugin-api';
import LinkIcon from '@material-ui/icons/Link';
import BuildIcon from '@material-ui/icons/BuildOutlined';
import { WidgetCard } from '../WidgetCard';
import styles from './Toolkit.module.css';

export interface Tool {
  url: string;
  label: string;
  /** Id of an app icon, e.g. `docs` or `github`. */
  icon?: string;
}

export function Toolkit({ tools }: { tools: Tool[] }) {
  const iconsApi = useApi(iconsApiRef);

  return (
    <WidgetCard icon={<BuildIcon />} title="Tools">
      <ul className={styles.tools}>
        {tools.map(tool => {
          const icon: ReactNode = (tool.icon && iconsApi.icon(tool.icon)) || (
            <LinkIcon />
          );
          return (
            <li key={`${tool.url}-${tool.label}`}>
              <a
                className={styles.tool}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.toolIcon}>{icon}</span>
                <span className={styles.toolLabel}>{tool.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
