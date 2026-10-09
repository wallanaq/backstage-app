import { Fragment } from 'react';
import { ResultHighlight } from '@backstage/plugin-search-common';
import styles from './Highlight.module.css';

/**
 * Renders a text in which the search engine wrapped the matched terms in the
 * highlight tags (`preTag`/`postTag`) as `<mark>` elements.
 */
export function Highlight({
  text,
  highlight,
  field,
}: {
  text?: string;
  highlight?: ResultHighlight;
  field: string;
}) {
  const marked = highlight?.fields[field];
  if (!marked || !highlight) {
    return <>{text}</>;
  }

  const { preTag, postTag } = highlight;
  return (
    <>
      {marked.split(preTag).map((part, index) => {
        if (index === 0) {
          return <Fragment key={index}>{part}</Fragment>;
        }
        const [match, ...rest] = part.split(postTag);
        return (
          <Fragment key={index}>
            <mark className={styles.mark}>{match}</mark>
            {rest.join(postTag)}
          </Fragment>
        );
      })}
    </>
  );
}
