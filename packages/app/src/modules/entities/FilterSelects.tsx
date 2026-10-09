import { ReactNode, useEffect, useState } from 'react';
import { parseEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  DefaultEntityFilters,
  EntityLifecycleFilter,
  EntityOwnerFilter,
  EntityTagFilter,
  EntityTypeFilter,
  humanizeEntityRef,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { Select } from '@backstage/ui';
import { ListScope, scopeFilter } from './useListCounts';
import styles from './FilterSelects.module.css';

/** Distinct values (sorted) of a catalog facet for the entities of a scope. */
function useFacet({ kind, annotation }: ListScope, facet: string) {
  const catalogApi = useApi(catalogApiRef);
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getEntityFacets({
        filter: scopeFilter({ kind, annotation }),
        facets: [facet],
      })
      .then(response => {
        if (!cancelled) {
          setValues((response.facets[facet] ?? []).map(f => f.value).sort());
        }
      })
      .catch(() => {
        // The select simply stays empty.
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi, kind, annotation, facet]);

  return values;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  );
}

const ALL = 'all';

/** Single choice over the `spec.type` of the entities, with "Todos". */
export function TypeSelect({ scope }: { scope: ListScope }) {
  const types = useFacet(scope, 'spec.type');
  const { queryParameters, updateFilters } = useEntityList();
  const [selected, setSelected] = useState<string>(
    [queryParameters.type].flat().filter(Boolean)[0] ?? ALL,
  );

  useEffect(() => {
    updateFilters({
      type: selected === ALL ? undefined : new EntityTypeFilter(selected),
    });
  }, [selected, updateFilters]);

  return (
    <Field label="Tipo">
      <Select
        aria-label="Tipo"
        size="medium"
        className={styles.select}
        selectionMode="single"
        options={[
          { id: ALL, label: 'Todos' },
          ...types.map(type => ({ id: type, label: type })),
        ]}
        value={selected}
        onChange={key => setSelected(key ? String(key) : ALL)}
      />
    </Field>
  );
}

interface MultiSelectProps {
  label: string;
  scope: ListScope;
  facet: string;
  /** Key of the filter in the URL query parameters. */
  queryKey: keyof DefaultEntityFilters;
  apply: (values: string[]) => Partial<DefaultEntityFilters>;
  format?: (value: string) => string;
}

function MultiSelect({
  label,
  scope,
  facet,
  queryKey,
  apply,
  format = value => value,
}: MultiSelectProps) {
  const values = useFacet(scope, facet);
  const { queryParameters, updateFilters } = useEntityList();
  const [selected, setSelected] = useState<string[]>(
    [queryParameters[queryKey]].flat().filter(Boolean) as string[],
  );

  useEffect(() => {
    updateFilters(apply(selected));
    // `apply` is a new closure on every render of the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, updateFilters]);

  return (
    <Field label={label}>
      <Select
        aria-label={label}
        size="medium"
        className={styles.select}
        selectionMode="multiple"
        options={values.map(value => ({ id: value, label: format(value) }))}
        value={selected}
        onChange={keys => setSelected([...keys].map(String))}
      />
    </Field>
  );
}

export function OwnerSelect({ scope }: { scope: ListScope }) {
  return (
    <MultiSelect
      label="Responsável"
      scope={scope}
      facet="relations.ownedBy"
      queryKey="owners"
      apply={refs => ({
        owners: refs.length ? new EntityOwnerFilter(refs) : undefined,
      })}
      format={ref => humanizeEntityRef(parseEntityRef(ref))}
    />
  );
}

export function LifecycleSelect({ scope }: { scope: ListScope }) {
  return (
    <MultiSelect
      label="Ciclo de vida"
      scope={scope}
      facet="spec.lifecycle"
      queryKey="lifecycles"
      apply={values => ({
        lifecycles: values.length
          ? new EntityLifecycleFilter(values)
          : undefined,
      })}
    />
  );
}

export function TagSelect({ scope }: { scope: ListScope }) {
  return (
    <MultiSelect
      label="Tags"
      scope={scope}
      facet="metadata.tags"
      queryKey="tags"
      apply={values => ({
        tags: values.length ? new EntityTagFilter(values) : undefined,
      })}
    />
  );
}

export interface FilterSelectProps {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

/** A single choice select that is not tied to the entity list. */
export function FilterSelect({
  label,
  options,
  value,
  onChange,
}: FilterSelectProps) {
  return (
    <Field label={label}>
      <Select
        aria-label={label}
        size="medium"
        className={styles.select}
        selectionMode="single"
        options={options}
        value={value}
        onChange={key => key && onChange(String(key))}
      />
    </Field>
  );
}
