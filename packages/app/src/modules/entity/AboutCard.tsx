import { ReactNode, useCallback } from 'react';
import {
  ANNOTATION_EDIT_URL,
  ANNOTATION_LOCATION,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { alertApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogEntityRefreshPermission } from '@backstage/plugin-catalog-common/alpha';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useEntityPermission } from '@backstage/plugin-catalog-react/alpha';
import CachedIcon from '@material-ui/icons/Cached';
import EditIcon from '@material-ui/icons/Edit';
import { EntityLink, Lifecycle, Muted } from '../entities/cells';
import { CardAction, DpCard } from './DpCard';
import { AboutField, aboutFields } from './entityInfo';
import { KindIcon } from './kindIcons';
import styles from './AboutCard.module.css';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}

function FieldValue({ field }: { field: AboutField }) {
  switch (field.type) {
    case 'refs':
      return (
        <span className={styles.refs}>
          {field.refs.map(ref => (
            <EntityLink
              key={`${ref.kind}:${ref.namespace}/${ref.name}`}
              entityRef={ref}
              className={styles.link}
            />
          ))}
        </span>
      );
    case 'tags':
      return (
        <span className={styles.tags}>
          {field.tags.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </span>
      );
    case 'lifecycle':
      return <Lifecycle value={field.value} />;
    default:
      return <>{field.value}</>;
  }
}

function Fields({ fields }: { fields: AboutField[] }) {
  return (
    <dl className={styles.row}>
      {fields.map(field => (
        <Field key={field.id} label={field.label}>
          <FieldValue field={field} />
        </Field>
      ))}
    </dl>
  );
}

/**
 * The "Sobre" card: the description and the main facts of any kind of entity.
 * Which fields show up depends on what the entity has (see `aboutFields`).
 */
export function AboutCard() {
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);
  const alertApi = useApi(alertApiRef);
  const errorApi = useApi(errorApiRef);
  const { allowed: canRefresh } = useEntityPermission(
    catalogEntityRefreshPermission,
  );

  const annotations = entity.metadata.annotations;
  const editUrl = annotations?.[ANNOTATION_EDIT_URL];
  const location = annotations?.[ANNOTATION_LOCATION];
  // Only entities read from a URL or a file can be refreshed by the catalog.
  const canRefreshLocation =
    location?.startsWith('url:') || location?.startsWith('file:');

  const refresh = useCallback(async () => {
    try {
      await catalogApi.refreshEntity(stringifyEntityRef(entity));
      alertApi.post({
        message: 'Atualização agendada. Pode levar alguns instantes.',
        severity: 'info',
        display: 'transient',
      });
    } catch (error) {
      errorApi.post(error as Error);
    }
  }, [catalogApi, alertApi, errorApi, entity]);

  const { primary, secondary } = aboutFields(entity);

  return (
    <DpCard
      icon={<KindIcon kind={entity.kind} />}
      title="Sobre"
      actions={
        <>
          {canRefreshLocation && canRefresh && (
            <CardAction label="Atualizar entidade" onClick={refresh}>
              <CachedIcon />
            </CardAction>
          )}
          {editUrl && (
            <CardAction label="Editar metadados" href={editUrl}>
              <EditIcon />
            </CardAction>
          )}
        </>
      }
    >
      <dl className={styles.about}>
        <Field label="Descrição">
          {entity.metadata.description ?? <Muted>Sem descrição</Muted>}
        </Field>
      </dl>
      {primary.length > 0 && <Fields fields={primary} />}
      <div className={styles.divider} />
      <Fields fields={secondary} />
    </DpCard>
  );
}
