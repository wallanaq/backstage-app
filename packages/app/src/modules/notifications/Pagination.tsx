import ChevronDownIcon from '@material-ui/icons/KeyboardArrowDown';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import NextIcon from '@material-ui/icons/ChevronRight';
import PreviousIcon from '@material-ui/icons/ChevronLeft';
import styles from './Pagination.module.css';

const PAGE_SIZES = [5, 10, 20];

export interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  /** "notifications", used in "Showing 1–5 of 8 notifications". */
  noun: string;
  onOffsetChange: (offset: number) => void;
  onLimitChange: (limit: number) => void;
}

/** The footer of the list card: range label, rows per page and page buttons. */
export function Pagination({
  offset,
  limit,
  total,
  noun,
  onOffsetChange,
  onLimitChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  const lastOffset = Math.max(0, Math.ceil(total / limit) - 1) * limit;
  const atStart = offset === 0;
  const atEnd = offset + limit >= total;

  const button = (
    label: string,
    icon: JSX.Element,
    disabled: boolean,
    target: number,
  ) => (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      disabled={disabled}
      onClick={() => onOffsetChange(target)}
    >
      {icon}
    </button>
  );

  return (
    <footer className={styles.root}>
      <span className={styles.label}>
        Showing {from}–{to} of {total} {noun}
      </span>
      <div className={styles.controls}>
        <label className={styles.rows}>
          Rows per page:
          <span className={styles.select}>
            <select
              aria-label="Rows per page"
              value={limit}
              onChange={event => onLimitChange(Number(event.target.value))}
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
        <span className={styles.divider} />
        {button('First page', <FirstPageIcon />, atStart, 0)}
        {button(
          'Previous page',
          <PreviousIcon />,
          atStart,
          Math.max(0, offset - limit),
        )}
        {button('Next page', <NextIcon />, atEnd, offset + limit)}
        {button('Last page', <LastPageIcon />, atEnd, lastOffset)}
      </div>
    </footer>
  );
}
