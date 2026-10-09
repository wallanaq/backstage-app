import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  SearchContextProvider,
  useSearch,
} from '@backstage/plugin-search-react';
import { SearchResult } from '@backstage/plugin-search-common';
import ChevronUpIcon from '@material-ui/icons/KeyboardArrowUp';
import FilterIcon from '@material-ui/icons/FilterList';
import LayersIcon from '@material-ui/icons/Layers';
import BookIcon from '@material-ui/icons/MenuBookOutlined';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import { FilterSelect } from '../entities/FilterSelects';
import { SupportMenu } from '../entities/SupportMenu';
import {
  FilterColumn,
  FilterDivider,
  FilterItem,
} from '../entities/UserFilters';
import { ResultItem } from './ResultItem';
import { SearchPagination } from './SearchPagination';
import { readUrlState, writeUrlState } from './urlState';
import styles from './SearchPage.module.css';

const ALL = 'all';

const TYPES = [
  { id: '', label: 'Todos', icon: <FilterIcon /> },
  {
    id: 'software-catalog',
    label: 'Catálogo de software',
    icon: <LayersIcon />,
  },
  { id: 'techdocs', label: 'Documentação', icon: <BookIcon /> },
];

function useFacetValues(facet: string) {
  const catalogApi = useApi(catalogApiRef);
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getEntityFacets({ facets: [facet] })
      .then(({ facets }) => {
        if (!cancelled) {
          setValues(
            (facets[facet] ?? [])
              .map(entry => entry.value)
              .sort((a, b) => a.localeCompare(b)),
          );
        }
      })
      .catch(() => {
        // The filter simply has no options.
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi, facet]);

  return values;
}

/** Keeps the address bar in sync with the search. */
function useUrlSync() {
  const { term, types, filters } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const search = writeUrlState({ term, types, filters });
    if (search !== location.search) {
      navigate({ pathname: location.pathname, search }, { replace: true });
    }
    // Only the search state is a trigger: the URL is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, types, filters]);
}

function SearchField() {
  const { term, setTerm } = useSearch();
  const [value, setValue] = useState(term);

  // The term waits for a pause in typing.
  useEffect(() => {
    if (value === term) {
      return undefined;
    }
    const timeout = setTimeout(() => setTerm(value), 200);
    return () => clearTimeout(timeout);
  }, [value, term, setTerm]);

  return (
    <div className={styles.field}>
      <SearchIcon className={styles.fieldIcon} />
      <input
        className={styles.input}
        type="search"
        aria-label="Buscar no portal"
        placeholder="Buscar no portal"
        value={value}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        onChange={event => setValue(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => {
            setValue('');
            setTerm('');
          }}
        >
          <CloseIcon />
          Limpar
        </button>
      )}
    </div>
  );
}

function Filters() {
  const { types, setTypes, filters, setFilters } = useSearch();
  const [typesOpen, setTypesOpen] = useState(true);
  const kinds = useFacetValues('kind');
  const lifecycles = useFacetValues('spec.lifecycle');

  const kind = typeof filters.kind === 'string' ? filters.kind : ALL;
  const selectedLifecycles = Array.isArray(filters.lifecycle)
    ? (filters.lifecycle as string[])
    : [];

  const setFilter = (name: string, value: string | string[] | undefined) =>
    setFilters(current => {
      const { [name]: _removed, ...rest } = current;
      return value === undefined ? rest : { ...rest, [name]: value };
    });

  const toggleLifecycle = (lifecycle: string) => {
    const next = selectedLifecycles.includes(lifecycle)
      ? selectedLifecycles.filter(value => value !== lifecycle)
      : [...selectedLifecycles, lifecycle];
    setFilter('lifecycle', next.length ? next : undefined);
  };

  return (
    <FilterColumn>
      <section className={styles.types}>
        <button
          type="button"
          className={styles.typesHeader}
          aria-expanded={typesOpen}
          onClick={() => setTypesOpen(open => !open)}
        >
          Tipo de resultado
          <ChevronUpIcon
            className={typesOpen ? styles.chevron : styles.chevronClosed}
          />
        </button>
        {typesOpen &&
          TYPES.map(type => (
            <FilterItem
              key={type.id}
              icon={type.icon}
              label={type.label}
              active={(types[0] ?? '') === type.id}
              onClick={() => setTypes(type.id ? [type.id] : [])}
            />
          ))}
      </section>

      <FilterDivider />

      <FilterSelect
        label="Categoria (kind)"
        value={kind}
        options={[
          { id: ALL, label: 'Todos' },
          ...kinds.map(value => ({ id: value, label: value })),
        ]}
        onChange={value => setFilter('kind', value === ALL ? undefined : value)}
      />

      <fieldset className={styles.lifecycles}>
        <legend className={styles.legend}>Ciclo de vida (lifecycle)</legend>
        {lifecycles.map(lifecycle => (
          <label key={lifecycle} className={styles.checkbox}>
            <input
              type="checkbox"
              checked={selectedLifecycles.includes(lifecycle)}
              onChange={() => toggleLifecycle(lifecycle)}
            />
            <span className={styles.box} />
            {lifecycle}
          </label>
        ))}
      </fieldset>
    </FilterColumn>
  );
}

function Results() {
  const { term, result } = useSearch();
  const results: SearchResult[] = result.value?.results ?? [];

  let content;
  if (result.error) {
    content = (
      <p className={styles.message}>
        Não foi possível buscar: {result.error.message}
      </p>
    );
  } else if (!term) {
    content = (
      <p className={styles.message}>
        Digite algo para buscar no catálogo e na documentação.
      </p>
    );
  } else if (!result.loading && results.length === 0) {
    content = <p className={styles.message}>Nenhum resultado para “{term}”.</p>;
  } else {
    content = (
      <div
        aria-busy={result.loading}
        className={result.loading ? styles.busy : ''}
      >
        {results.map((item, index) => (
          <ResultItem key={`${item.type}-${index}`} result={item} />
        ))}
      </div>
    );
  }

  return (
    <section className={styles.card} aria-live="polite">
      <header className={styles.bar}>
        <h2 className={styles.heading}>
          {term ? `Resultados para “${term}”` : 'Resultados'}
        </h2>
      </header>
      {content}
      {results.length > 0 && <SearchPagination count={results.length} />}
    </section>
  );
}

function SearchBody() {
  useUrlSync();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.title}>Busca</h1>
            <p className={styles.description}>
              Encontre entidades do catálogo e conteúdo de documentação no
              Backstage.
            </p>
          </div>
          <SupportMenu variant="button" />
        </div>
        <div className={styles.band}>
          <SearchField />
        </div>
      </header>

      <div className={styles.body}>
        <Filters />
        <Results />
      </div>
    </>
  );
}

export function DevPortalSearchPage() {
  const location = useLocation();
  // The state of the URL when the page opens; after that the search context
  // is the source of truth.
  const [initialState] = useState(() => readUrlState(location.search));

  return (
    <SearchContextProvider initialState={initialState}>
      <SearchBody />
    </SearchContextProvider>
  );
}
