import { useEffect, useRef, useState } from 'react';
import { useSearch } from '@backstage/plugin-search-react';
import ChevronDownIcon from '@material-ui/icons/KeyboardArrowDown';
import NextIcon from '@material-ui/icons/ChevronRight';
import PreviousIcon from '@material-ui/icons/ChevronLeft';
import styles from './SearchPagination.module.css';

const PAGE_SIZES = [10, 25, 50];
const DEFAULT_LIMIT = 25;

/** Rows per page and next/previous, with the range of the shown results. */
export function SearchPagination({ count }: { count: number }) {
  const {
    term,
    types,
    filters,
    pageLimit,
    setPageLimit,
    fetchNextPage,
    fetchPreviousPage,
  } = useSearch();
  const limit = pageLimit ?? DEFAULT_LIMIT;

  // The search returns cursors, so the page number is counted here.
  const [page, setPage] = useState(0);
  const key = JSON.stringify([term, types, filters, limit]);
  const lastKey = useRef(key);
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      setPage(0);
    }
  }, [key]);

  const from = page * limit + 1;

  return (
    <footer className={styles.root}>
      <label className={styles.rows}>
        Resultados por página:
        <span className={styles.select}>
          <select
            value={limit}
            onChange={event => setPageLimit(Number(event.target.value))}
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <ChevronDownIcon />
        </span>
      </label>

      <div className={styles.pages}>
        <span>
          {from}–{from + count - 1}
        </span>
        <button
          type="button"
          className={styles.button}
          aria-label="Página anterior"
          disabled={!fetchPreviousPage}
          onClick={() => {
            fetchPreviousPage?.();
            setPage(value => Math.max(0, value - 1));
          }}
        >
          <PreviousIcon />
        </button>
        <button
          type="button"
          className={styles.button}
          aria-label="Próxima página"
          disabled={!fetchNextPage}
          onClick={() => {
            fetchNextPage?.();
            setPage(value => value + 1);
          }}
        >
          <NextIcon />
        </button>
      </div>
    </footer>
  );
}
