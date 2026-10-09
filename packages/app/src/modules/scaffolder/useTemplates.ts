import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { TemplateView, toTemplateView } from './templateMeta';

interface TemplatesState {
  templates: TemplateView[];
  loading: boolean;
  error?: Error;
}

/** All the templates of the catalog, sorted by title. */
export function useTemplates(): TemplatesState {
  const catalogApi = useApi(catalogApiRef);
  const [state, setState] = useState<TemplatesState>({
    templates: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getEntities({ filter: { kind: 'template' } })
      .then(({ items }) => {
        if (cancelled) return;
        setState({
          loading: false,
          templates: items
            .map(toTemplateView)
            .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
        });
      })
      .catch(error => {
        if (!cancelled) setState({ templates: [], loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi]);

  return state;
}
