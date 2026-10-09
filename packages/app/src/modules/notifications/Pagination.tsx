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
  /** "notificações", used in "Mostrando 1–5 de 8 notificações". */
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
        Mostrando {from}–{to} de {total} {noun}
      </span>
      <div className={styles.controls}>
        <label className={styles.rows}>
          Linhas por página:
          <span className={styles.select}>
            <select
              aria-label="Linhas por página"
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
        {button('Primeira página', <FirstPageIcon />, atStart, 0)}
        {button(
          'Página anterior',
          <PreviousIcon />,
          atStart,
          Math.max(0, offset - limit),
        )}
        {button('Próxima página', <NextIcon />, atEnd, offset + limit)}
        {button('Última página', <LastPageIcon />, atEnd, lastOffset)}
      </div>
    </footer>
  );
}
