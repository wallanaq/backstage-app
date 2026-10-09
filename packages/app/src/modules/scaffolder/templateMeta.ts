import {
  CompoundEntityRef,
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';

/**
 * Everything the templates page needs to know about a template. This is the
 * single place that interprets the template YAML, so that the conventions can
 * change without touching the UI.
 *
 * - `metadata.title`, `description`, `tags` and `spec.type`/`spec.owner` are
 *   plain Backstage fields.
 * - `devportal.io/stack` ("Java 21 · Spring Boot") and `devportal.io/version`
 *   ("v2.1.0") are optional annotations used by the cards.
 */
export interface TemplateView {
  entity: Entity;
  ref: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  type?: string;
  /** Technologies listed on the card, split on "·". */
  stack: string[];
  version?: string;
  tags: string[];
  owner?: CompoundEntityRef;
  groupId: string;
}

export const STACK_ANNOTATION = 'devportal.io/stack';
export const VERSION_ANNOTATION = 'devportal.io/version';

export interface TemplateGroup {
  id: string;
  label: string;
  description: string;
  /** `spec.type` values that belong to the group. */
  types: string[];
}

export const GROUPS: TemplateGroup[] = [
  {
    id: 'backend',
    label: 'Backend',
    description: 'Serviços e APIs prontos para evoluir.',
    types: ['service', 'backend', 'api'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    description: 'Aplicações web com uma base consistente.',
    types: ['website', 'frontend', 'webapp'],
  },
  {
    id: 'libraries',
    label: 'Bibliotecas',
    description: 'Código reutilizável para compartilhar entre projetos.',
    types: ['library'],
  },
];

/** Templates whose type is not listed in {@link GROUPS}. */
export const OTHER_GROUP: TemplateGroup = {
  id: 'other',
  label: 'Outros',
  description: 'Outros templates disponíveis.',
  types: [],
};

function groupOf(type?: string): TemplateGroup {
  return (
    GROUPS.find(group => type && group.types.includes(type)) ?? OTHER_GROUP
  );
}

function ownerOf(entity: Entity): CompoundEntityRef | undefined {
  const owner = entity.spec?.owner;
  if (typeof owner !== 'string' || !owner) {
    return undefined;
  }
  return parseEntityRef(owner, {
    defaultKind: 'group',
    defaultNamespace: 'default',
  });
}

export function toTemplateView(entity: Entity): TemplateView {
  const annotations = entity.metadata.annotations ?? {};
  const type =
    typeof entity.spec?.type === 'string' ? entity.spec.type : undefined;

  return {
    entity,
    ref: stringifyEntityRef(entity),
    namespace: entity.metadata.namespace ?? 'default',
    name: entity.metadata.name,
    title: entity.metadata.title ?? entity.metadata.name,
    description: entity.metadata.description,
    type,
    stack: (annotations[STACK_ANNOTATION] ?? '')
      .split('·')
      .map(part => part.trim())
      .filter(Boolean),
    version: annotations[VERSION_ANNOTATION],
    tags: entity.metadata.tags ?? [],
    owner: ownerOf(entity),
    groupId: groupOf(type).id,
  };
}

/** Text the search box matches against. */
export function searchText(template: TemplateView): string {
  return [
    template.title,
    template.name,
    template.description,
    ...template.stack,
    ...template.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('pt-BR');
}
