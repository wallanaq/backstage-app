import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SearchResult } from '@backstage/plugin-search-common';
import { iconsApiRef, useApi } from '@backstage/frontend-plugin-api';
import ArrowOutwardIcon from '@material-ui/icons/CallMade';
import LayersIcon from '@material-ui/icons/Layers';
import BookIcon from '@material-ui/icons/MenuBookOutlined';
import { Highlight } from './Highlight';
import styles from './ResultItem.module.css';

type Document = Record<string, unknown>;

const text = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined;

function metadataOf(type: string, document: Document) {
  const items: [string, string | undefined][] = [
    ['Kind', text(document.kind)],
    ['Type', text(document.componentType) ?? text(document.type)],
    ['Owner', text(document.owner)],
    ['Lifecycle', text(document.lifecycle)],
    ...(type === 'techdocs'
      ? ([['Entity', text(document.name)]] as [string, string][])
      : []),
  ];
  return items.flatMap(([label, value]) =>
    value ? [`${label}: ${value}`] : [],
  );
}

function ResultIcon({ type, kind }: { type: string; kind?: string }) {
  const iconsApi = useApi(iconsApiRef);
  let icon: ReactNode = <LayersIcon />;
  if (type === 'techdocs') {
    icon = <BookIcon />;
  } else if (kind) {
    icon = iconsApi.icon(`kind:${kind.toLocaleLowerCase('en-US')}`) ?? icon;
  }
  return <span className={styles.icon}>{icon}</span>;
}

export function ResultItem({ result }: { result: SearchResult }) {
  const { type, highlight } = result;
  const document = result.document as unknown as Document;
  const location = text(document.location);
  const title = text(document.title) ?? 'Untitled';

  const heading = (
    <>
      <Highlight text={title} highlight={highlight} field="title" />
    </>
  );
  const isInternal = location?.startsWith('/');

  return (
    <article className={styles.result}>
      <header className={styles.header}>
        <ResultIcon type={type} kind={text(document.kind)} />
        {location && isInternal && (
          <Link className={styles.title} to={location}>
            {heading}
          </Link>
        )}
        {location && !isInternal && (
          <a
            className={styles.title}
            href={location}
            target="_blank"
            rel="noreferrer"
          >
            {heading}
          </a>
        )}
        {!location && <span className={styles.titleText}>{heading}</span>}
        {location && <ArrowOutwardIcon className={styles.arrow} />}
      </header>

      <ul className={styles.metadata}>
        {metadataOf(type, document).map(item => (
          <li key={item} className={styles.chip}>
            {item}
          </li>
        ))}
      </ul>

      {text(document.text) && (
        <p className={styles.snippet}>
          <Highlight
            text={text(document.text)}
            highlight={highlight}
            field="text"
          />
        </p>
      )}
    </article>
  );
}
