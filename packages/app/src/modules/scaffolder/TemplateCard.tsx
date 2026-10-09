import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  useEntityPresentation,
  useStarredEntity,
} from '@backstage/plugin-catalog-react';
import { ButtonLink } from '@backstage/ui';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import PeopleIcon from '@material-ui/icons/PeopleOutline';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { TemplateView } from './templateMeta';
import styles from './TemplateCard.module.css';

function Owner({ owner }: { owner: NonNullable<TemplateView['owner']> }) {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(owner);

  return (
    <Link
      className={styles.owner}
      to={entityRoute({
        kind: owner.kind.toLocaleLowerCase('en-US'),
        namespace: owner.namespace.toLocaleLowerCase('en-US'),
        name: owner.name,
      })}
    >
      <PeopleIcon />
      {primaryTitle}
    </Link>
  );
}

export interface TemplateCardProps {
  template: TemplateView;
  /** Icon of the technology/group, shown in the square on the left. */
  icon: ReactNode;
  /** Where "Escolher" leads to. */
  href: string;
}

export function TemplateCard({ template, icon, href }: TemplateCardProps) {
  const { isStarredEntity, toggleStarredEntity } = useStarredEntity(
    template.entity,
  );

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <div className={styles.heading}>
          <h4 className={styles.title}>{template.title}</h4>
          {template.stack.length > 0 && (
            <p className={styles.stack}>{template.stack.join(' · ')}</p>
          )}
        </div>
        {template.version && (
          <span className={styles.version}>{template.version}</span>
        )}
        <button
          type="button"
          className={styles.star}
          aria-pressed={isStarredEntity}
          aria-label={isStarredEntity ? 'Remover dos favoritos' : 'Favoritar'}
          onClick={toggleStarredEntity}
        >
          {isStarredEntity ? (
            <StarIcon className={styles.starred} />
          ) : (
            <StarBorderIcon />
          )}
        </button>
      </header>

      <p className={styles.description}>{template.description}</p>

      {template.tags.length > 0 && (
        <ul className={styles.tags}>
          {template.tags.map(tag => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}

      <footer className={styles.footer}>
        <div className={styles.ownerBlock}>
          {template.owner && (
            <>
              <span className={styles.ownerLabel}>Responsável</span>
              <Owner owner={template.owner} />
            </>
          )}
        </div>
        <ButtonLink
          variant="primary"
          href={href}
          iconStart={<ArrowForwardIcon />}
        >
          Escolher
        </ButtonLink>
      </footer>
    </article>
  );
}
