import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraphState, parseGraphState, serializeGraphState } from './graphState';

/**
 * The state of the graph page. The URL is the only copy of it, so a link, a
 * reload and the back button always agree with what is on the screen.
 */
export function useGraphState(defaults: Partial<GraphState>) {
  const [params, setParams] = useSearchParams();
  const search = params.toString();

  const state = useMemo(
    () => parseGraphState(search, defaults),
    [search, defaults],
  );

  const update = useCallback(
    (patch: Partial<GraphState>, options: { push?: boolean } = {}) => {
      setParams(serializeGraphState({ ...state, ...patch }), {
        // Choosing another entity is a step you can go back from; a filter is not.
        replace: !options.push,
      });
    },
    [state, setParams],
  );

  return [state, update] as const;
}
