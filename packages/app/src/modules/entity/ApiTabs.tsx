import { RelationTableCard } from './RelationTableCard';
import styles from './ApiTabs.module.css';

/** Cards of the APIs of a component, one below the other. */
export function ProvidedApisCard() {
  return (
    <RelationTableCard
      title="APIs fornecidas"
      relationType="providesApi"
      kind="API"
      columns="api"
      noun={['API', 'APIs']}
      emptyMessage="Este componente não fornece nenhuma API."
    />
  );
}

export function ConsumedApisCard() {
  return (
    <RelationTableCard
      title="APIs consumidas"
      relationType="consumesApi"
      kind="API"
      columns="api"
      noun={['API', 'APIs']}
      emptyMessage="Este componente não consome nenhuma API."
    />
  );
}

export function ProvidingComponentsCard() {
  return (
    <RelationTableCard
      title="Fornecida por"
      relationType="apiProvidedBy"
      kind="Component"
      columns="component"
      noun={['componente', 'componentes']}
      emptyMessage="Nenhum componente fornece esta API."
    />
  );
}

export function ConsumingComponentsCard() {
  return (
    <RelationTableCard
      title="Consumida por"
      relationType="apiConsumedBy"
      kind="Component"
      columns="component"
      noun={['componente', 'componentes']}
      emptyMessage="Nenhum componente consome esta API."
    />
  );
}

/** The "API" tab of a component. */
export function ApisTab() {
  return (
    <div className={styles.stack}>
      <ProvidedApisCard />
      <ConsumedApisCard />
    </div>
  );
}
