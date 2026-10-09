import { SearchContextState } from '@backstage/plugin-search-react';

/**
 * The search state in the URL: `?query=teste&type=techdocs&kind=Component
 * &lifecycle=production,experimental`. `query` is also what the links of the
 * Backstage search components use.
 */
export function readUrlState(search: string): SearchContextState {
  const params = new URLSearchParams(search);
  const type = params.get('type');
  const kind = params.get('kind');
  const lifecycle = params.get('lifecycle')?.split(',').filter(Boolean);

  return {
    term: params.get('query') ?? '',
    types: type ? [type] : [],
    filters: {
      ...(kind && { kind }),
      ...(lifecycle?.length && { lifecycle }),
    },
  };
}

export function writeUrlState({
  term,
  types,
  filters,
}: Pick<SearchContextState, 'term' | 'types' | 'filters'>): string {
  const params = new URLSearchParams();
  if (term) params.set('query', term);
  if (types[0]) params.set('type', types[0]);
  if (typeof filters.kind === 'string') params.set('kind', filters.kind);
  if (Array.isArray(filters.lifecycle) && filters.lifecycle.length) {
    params.set('lifecycle', filters.lifecycle.join(','));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}
