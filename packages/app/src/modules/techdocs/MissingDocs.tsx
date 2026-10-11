import { useEntity } from '@backstage/plugin-catalog-react';
import { ButtonLink } from '@backstage/ui';
import BookIcon from '@material-ui/icons/MenuBookOutlined';
import { DpCard, EmptyState } from '../entity/DpCard';
import styles from './MissingDocs.module.css';

const ANNOTATION = 'backstage.io/techdocs-ref';
const READ_MORE =
  'https://backstage.io/docs/features/techdocs/getting-started#prepare-your-component-repository-for-techdocs';

/** The YAML of the entity with the annotation that enables the docs. */
function exampleOf(kind: string, name: string, spec?: Record<string, unknown>) {
  return [
    'apiVersion: backstage.io/v1alpha1',
    `kind: ${kind}`,
    'metadata:',
    `  name: ${name}`,
    '  annotations:',
    `    ${ANNOTATION}: dir:.`,
    'spec:',
    `  type: ${spec?.type ?? 'service'}`,
    `  owner: ${spec?.owner ?? 'user:default/guest'}`,
  ];
}

/**
 * What the Docs tab shows for an entity without the techdocs annotation
 * (replaces the "Missing Annotation" state of the plugin).
 */
export function MissingDocs() {
  const { entity } = useEntity();
  const lines = exampleOf(
    entity.kind,
    entity.metadata.name,
    entity.spec as Record<string, unknown> | undefined,
  );
  const annotationLine = lines.findIndex(line => line.includes(ANNOTATION));

  return (
    <DpCard icon={<BookIcon />} title="Documentation">
      <div className={styles.intro}>
        <EmptyState icon={<BookIcon />}>
          This entity has no documentation yet. To enable TechDocs, add the{' '}
          <code className={styles.inline}>{ANNOTATION}</code> annotation to the
          entity YAML, as highlighted below.
        </EmptyState>
      </div>
      <pre className={styles.code} aria-label="Entity YAML example">
        {lines.map((line, index) => (
          <span
            key={line}
            className={
              index === annotationLine
                ? `${styles.line} ${styles.highlight}`
                : styles.line
            }
          >
            {line}
          </span>
        ))}
      </pre>
      <div className={styles.actions}>
        <ButtonLink
          href={READ_MORE}
          target="_blank"
          rel="noreferrer"
          variant="secondary"
          size="medium"
          className={styles.button}
        >
          Learn more
        </ButtonLink>
      </div>
    </DpCard>
  );
}
