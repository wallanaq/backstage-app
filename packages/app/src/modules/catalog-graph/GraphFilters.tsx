import { ReactNode, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ALL_RELATIONS } from '@backstage/plugin-catalog-graph';
import {
  Accordion,
  AccordionPanel,
  AccordionTrigger,
  CheckboxGroup,
  Checkbox,
  Select,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@backstage/ui';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { GraphCurve, GraphDirection, GraphState } from './graphState';
import styles from './GraphFilters.module.css';

const DEPTHS = [
  { id: '1', label: '1 nível' },
  { id: '2', label: '2 níveis' },
  { id: '3', label: '3 níveis' },
  { id: '4', label: '4 níveis' },
  { id: 'all', label: 'Todos os níveis' },
];

const DIRECTIONS: { id: GraphDirection; label: string; icon: ReactNode }[] = [
  { id: 'LR', label: 'Da esquerda para a direita', icon: <ArrowForwardIcon /> },
  { id: 'RL', label: 'Da direita para a esquerda', icon: <ArrowBackIcon /> },
  { id: 'TB', label: 'De cima para baixo', icon: <ArrowDownwardIcon /> },
  { id: 'BT', label: 'De baixo para cima', icon: <ArrowUpwardIcon /> },
];

const CURVES: { id: GraphCurve; label: string }[] = [
  { id: 'curveMonotoneX', label: 'Suave' },
  { id: 'curveStepBefore', label: 'Em degraus' },
];

/** The kinds of the catalog (lower case), for the list of kinds. */
function useKinds() {
  const catalogApi = useApi(catalogApiRef);
  const [kinds, setKinds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getEntityFacets({ facets: ['kind'] })
      .then(response => {
        if (!cancelled) {
          setKinds(
            (response.facets.kind ?? []).map(f => f.value.toLowerCase()).sort(),
          );
        }
      })
      .catch(() => {
        // The list stays empty and the graph shows every kind.
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi]);

  return kinds;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  );
}

export interface GraphFiltersProps {
  state: GraphState;
  onChange: (patch: Partial<GraphState>) => void;
}

/** The column of filters of the graph page. */
export function GraphFilters({ state, onChange }: GraphFiltersProps) {
  const kinds = useKinds();
  const selectedKinds = state.selectedKinds ?? kinds;
  const selectedRelations = state.selectedRelations ?? ALL_RELATIONS;

  // Selecting everything is the same as not filtering.
  const allOrUndefined = (picked: string[], all: string[]) =>
    all.every(item => picked.includes(item)) ? undefined : picked;

  return (
    <aside className={styles.column} aria-label="Filtros do grafo">
      <Field label="Profundidade">
        <Select
          aria-label="Profundidade"
          size="medium"
          className={styles.select}
          selectionMode="single"
          options={DEPTHS}
          value={
            Number.isFinite(state.maxDepth) ? String(state.maxDepth) : 'all'
          }
          onChange={key =>
            onChange({
              maxDepth: !key || key === 'all' ? Infinity : Number(key),
            })
          }
        />
      </Field>

      {kinds.length > 0 && (
        <CheckboxGroup
          label="Tipos de entidade"
          value={selectedKinds}
          onChange={picked =>
            onChange({ selectedKinds: allOrUndefined(picked, kinds) })
          }
        >
          {kinds.map(kind => (
            <Checkbox key={kind} value={kind}>
              {kind}
            </Checkbox>
          ))}
        </CheckboxGroup>
      )}

      <Accordion>
        <AccordionTrigger
          title="Relações"
          subtitle={
            state.selectedRelations
              ? `${state.selectedRelations.length} de ${ALL_RELATIONS.length}`
              : 'Todas'
          }
        />
        <AccordionPanel>
          <CheckboxGroup
            aria-label="Relações"
            value={selectedRelations}
            onChange={picked =>
              onChange({
                selectedRelations: allOrUndefined(picked, ALL_RELATIONS),
              })
            }
          >
            {ALL_RELATIONS.map(relation => (
              <Checkbox key={relation} value={relation}>
                {relation}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </AccordionPanel>
      </Accordion>

      <Field label="Direção">
        <ToggleButtonGroup
          aria-label="Direção"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[state.direction]}
          onSelectionChange={keys => {
            const [key] = [...keys];
            if (key) onChange({ direction: key as GraphDirection });
          }}
        >
          {DIRECTIONS.map(({ id, label, icon }) => (
            <ToggleButton key={id} id={id} aria-label={label}>
              {icon}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Field>

      <Field label="Linhas">
        <ToggleButtonGroup
          aria-label="Formato das linhas"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[state.curve]}
          onSelectionChange={keys => {
            const [key] = [...keys];
            if (key) onChange({ curve: key as GraphCurve });
          }}
        >
          {CURVES.map(({ id, label }) => (
            <ToggleButton key={id} id={id}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Field>

      <Switch
        label="Simplificar"
        isSelected={state.unidirectional}
        onChange={unidirectional => onChange({ unidirectional })}
      />
      <Switch
        label="Mesclar relações"
        isSelected={state.mergeRelations}
        onChange={mergeRelations => onChange({ mergeRelations })}
      />
    </aside>
  );
}
