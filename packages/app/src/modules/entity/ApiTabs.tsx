import { RelationTableCard } from './RelationTableCard';
import styles from './ApiTabs.module.css';

/** Cards of the APIs of a component, one below the other. */
export function ProvidedApisCard() {
  return (
    <RelationTableCard
      title="Provided APIs"
      relationType="providesApi"
      kind="API"
      columns="api"
      noun={['API', 'APIs']}
      emptyMessage="This component does not provide any API."
    />
  );
}

export function ConsumedApisCard() {
  return (
    <RelationTableCard
      title="Consumed APIs"
      relationType="consumesApi"
      kind="API"
      columns="api"
      noun={['API', 'APIs']}
      emptyMessage="This component does not consume any API."
    />
  );
}

export function ProvidingComponentsCard() {
  return (
    <RelationTableCard
      title="Provided by"
      relationType="apiProvidedBy"
      kind="Component"
      columns="component"
      noun={['component', 'components']}
      emptyMessage="No component provides this API."
    />
  );
}

export function ConsumingComponentsCard() {
  return (
    <RelationTableCard
      title="Consumed by"
      relationType="apiConsumedBy"
      kind="Component"
      columns="component"
      noun={['component', 'components']}
      emptyMessage="No component consumes this API."
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
