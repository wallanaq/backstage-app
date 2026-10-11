import { useState } from 'react';
import { ApiEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  apiDocsConfigRef,
  PlainApiDefinitionWidget,
} from '@backstage/plugin-api-docs';
import { useEntity } from '@backstage/plugin-catalog-react';
import CodeIcon from '@material-ui/icons/Code';
import { DpCard } from './DpCard';
import styles from './DefinitionCard.module.css';

/**
 * The definition of an API: the rendered view (OpenAPI, AsyncAPI, GraphQL...)
 * and the raw text, behind two tabs inside the card.
 */
export function DefinitionCard() {
  const { entity } = useEntity();
  const config = useApi(apiDocsConfigRef);
  const widget = config.getApiDefinitionWidget(entity as ApiEntity);
  const definition = String(entity.spec?.definition ?? '');
  const type = String(entity.spec?.type ?? '');
  const language = widget?.rawLanguage ?? type;

  const views = [
    ...(widget
      ? [
          {
            id: 'widget',
            label: widget.title,
            render: () => widget.component(definition),
          },
        ]
      : []),
    {
      id: 'raw',
      label: widget ? 'Code' : type,
      render: () => (
        <PlainApiDefinitionWidget definition={definition} language={language} />
      ),
    },
  ];
  const [selected, setSelected] = useState(views[0].id);
  const view = views.find(item => item.id === selected) ?? views[0];

  return (
    <DpCard icon={<CodeIcon />} title="Definition" flush>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Definition format"
      >
        {views.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`definition-tab-${item.id}`}
            aria-selected={item.id === view.id}
            aria-controls="definition-panel"
            className={
              item.id === view.id
                ? `${styles.tab} ${styles.active}`
                : styles.tab
            }
            onClick={() => setSelected(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id="definition-panel"
        role="tabpanel"
        aria-labelledby={`definition-tab-${view.id}`}
        className={styles.panel}
      >
        {view.render()}
      </div>
    </DpCard>
  );
}
