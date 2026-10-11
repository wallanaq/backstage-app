import { useApp } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import LanguageIcon from '@material-ui/icons/Language';
import LinkIcon from '@material-ui/icons/Link';
import { DpCard } from './DpCard';
import styles from './LinksCard.module.css';

/** The "Links" card: `metadata.links`, with the icon each link asks for. */
export function LinksCard() {
  const { entity } = useEntity();
  const app = useApp();
  const links = entity.metadata.links ?? [];

  return (
    <DpCard icon={<LinkIcon />} title="Links">
      <ul className={styles.list}>
        {links.map(link => {
          const Icon =
            (link.icon && app.getSystemIcon(link.icon)) || LanguageIcon;
          return (
            <li key={`${link.url}-${link.title}`} className={styles.item}>
              <a
                className={styles.link}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <Icon className={styles.icon} />
                <span>{link.title ?? link.url}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </DpCard>
  );
}
