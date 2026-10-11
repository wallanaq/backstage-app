/** Directions of the graph, the values the plugin uses in the URL. */
export type GraphDirection = 'LR' | 'RL' | 'TB' | 'BT';
export type GraphCurve = 'curveMonotoneX' | 'curveStepBefore';

/** Everything the page lets the user change. It lives in the URL, like in the plugin's own page. */
export interface GraphState {
  rootEntityRefs: string[];
  /** `Infinity` shows every level. */
  maxDepth: number;
  /** Lower case kinds; `undefined` means all of them. */
  selectedKinds?: string[];
  /** `undefined` means all the relations. */
  selectedRelations?: string[];
  unidirectional: boolean;
  mergeRelations: boolean;
  direction: GraphDirection;
  curve: GraphCurve;
  showFilters: boolean;
}

export const DEFAULT_STATE: GraphState = {
  rootEntityRefs: [],
  maxDepth: Number.POSITIVE_INFINITY,
  unidirectional: true,
  mergeRelations: true,
  direction: 'LR',
  curve: 'curveMonotoneX',
  showFilters: true,
};

const INFINITY = '∞';
const DIRECTIONS: GraphDirection[] = ['LR', 'RL', 'TB', 'BT'];
const CURVES: GraphCurve[] = ['curveMonotoneX', 'curveStepBefore'];

function bool(value: string | null, fallback: boolean) {
  return value === null ? fallback : value === 'true';
}

function list(params: URLSearchParams, key: string) {
  const values = params.getAll(`${key}[]`);
  return values.length > 0 ? values : undefined;
}

/**
 * Reads the state from a query string. The format is the one of the plugin's
 * page (`qs` with brackets), so links made by the plugin keep working.
 */
export function parseGraphState(
  search: string,
  defaults: Partial<GraphState> = {},
): GraphState {
  const base = { ...DEFAULT_STATE, ...defaults };
  const params = new URLSearchParams(search);

  const depth = params.get('maxDepth');
  const parsedDepth = depth === INFINITY ? Infinity : Number(depth);
  const direction = params.get('direction') as GraphDirection | null;
  const curve = params.get('curve') as GraphCurve | null;
  const kinds = list(params, 'selectedKinds') ?? base.selectedKinds;

  return {
    rootEntityRefs: list(params, 'rootEntityRefs') ?? base.rootEntityRefs,
    maxDepth:
      depth !== null && (depth === INFINITY || Number.isFinite(parsedDepth))
        ? parsedDepth
        : base.maxDepth,
    selectedKinds: kinds?.map(kind => kind.toLocaleLowerCase('en-US')),
    selectedRelations:
      list(params, 'selectedRelations') ?? base.selectedRelations,
    unidirectional: bool(params.get('unidirectional'), base.unidirectional),
    mergeRelations: bool(params.get('mergeRelations'), base.mergeRelations),
    direction:
      direction && DIRECTIONS.includes(direction) ? direction : base.direction,
    curve: curve && CURVES.includes(curve) ? curve : base.curve,
    showFilters: bool(params.get('showFilters'), base.showFilters),
  };
}

/** Writes the state as a query string (without the leading `?`). */
export function serializeGraphState(state: GraphState): string {
  const params = new URLSearchParams();
  state.rootEntityRefs.forEach(ref => params.append('rootEntityRefs[]', ref));
  params.set(
    'maxDepth',
    Number.isFinite(state.maxDepth) ? String(state.maxDepth) : INFINITY,
  );
  state.selectedKinds?.forEach(kind => params.append('selectedKinds[]', kind));
  state.selectedRelations?.forEach(relation =>
    params.append('selectedRelations[]', relation),
  );
  params.set('unidirectional', String(state.unidirectional));
  params.set('mergeRelations', String(state.mergeRelations));
  params.set('direction', state.direction);
  params.set('showFilters', String(state.showFilters));
  params.set('curve', state.curve);
  return params.toString();
}
