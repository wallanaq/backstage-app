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
  { id: '1', label: '1 level' },
  { id: '2', label: '2 levels' },
  { id: '3', label: '3 levels' },
  { id: '4', label: '4 levels' },
  { id: 'all', label: 'All levels' },
];

const DIRECTIONS: { id: GraphDirection; label: string; icon: ReactNode }[] = [
  { id: 'LR', label: 'Left to right', icon: <ArrowForwardIcon /> },
  { id: 'RL', label: 'Right to left', icon: <ArrowBackIcon /> },
  { id: 'TB', label: 'Top to bottom', icon: <ArrowDownwardIcon /> },
  { id: 'BT', label: 'Bottom to top', icon: <ArrowUpwardIcon /> },
];

const CURVES: { id: GraphCurve; label: string }[] = [
  { id: 'curveMonotoneX', label: 'Smooth' },
  { id: 'curveStepBefore', label: 'Stepped' },
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
    <aside className={styles.column} aria-label="Graph filters">
      <Field label="Depth">
        <Select
          aria-label="Depth"
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
          label="Entity kinds"
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
          title="Relations"
          subtitle={
            state.selectedRelations
              ? `${state.selectedRelations.length} of ${ALL_RELATIONS.length}`
              : 'All'
          }
        />
        <AccordionPanel>
          <CheckboxGroup
            aria-label="Relations"
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

      <Field label="Direction">
        <ToggleButtonGroup
          aria-label="Direction"
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

      <Field label="Lines">
        <ToggleButtonGroup
          aria-label="Line style"
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
        label="Simplify"
        isSelected={state.unidirectional}
        onChange={unidirectional => onChange({ unidirectional })}
      />
      <Switch
        label="Merge relations"
        isSelected={state.mergeRelations}
        onChange={mergeRelations => onChange({ mergeRelations })}
      />
    </aside>
  );
}
