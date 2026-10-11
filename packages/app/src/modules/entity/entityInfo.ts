import {
  CompoundEntityRef,
  Entity,
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_CHILD_OF,
  RELATION_CONSUMES_API,
  RELATION_DEPENDENCY_OF,
  RELATION_DEPENDS_ON,
  RELATION_HAS_MEMBER,
  RELATION_HAS_PART,
  RELATION_MEMBER_OF,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_PARENT_OF,
  RELATION_PART_OF,
  RELATION_PROVIDES_API,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';

/** Plural names of the kinds, as shown in the breadcrumb and the lists. */
const KIND_PLURALS: Record<string, string> = {
  component: 'Components',
  api: 'APIs',
  system: 'Systems',
  domain: 'Domains',
  resource: 'Resources',
  group: 'Groups',
  user: 'Users',
  template: 'Templates',
  location: 'Locations',
};

// Where the entities of a kind are listed; the other kinds have no list page.
const KIND_LIST_PAGES: Record<string, string> = {
  component: '/catalog',
  api: '/api-docs',
};

export function kindListPage(kind: string): string | undefined {
  return KIND_LIST_PAGES[kind.toLocaleLowerCase('en-US')];
}

export function kindPlural(kind: string): string {
  const key = kind.toLocaleLowerCase('en-US');
  return KIND_PLURALS[key] ?? `${kind}s`;
}

// Relation type -> its inverse, to label an edge as "ownedBy → / ← ownerOf".
const INVERSES: Record<string, string> = {
  [RELATION_OWNED_BY]: RELATION_OWNER_OF,
  [RELATION_OWNER_OF]: RELATION_OWNED_BY,
  [RELATION_PART_OF]: RELATION_HAS_PART,
  [RELATION_HAS_PART]: RELATION_PART_OF,
  [RELATION_DEPENDS_ON]: RELATION_DEPENDENCY_OF,
  [RELATION_DEPENDENCY_OF]: RELATION_DEPENDS_ON,
  [RELATION_PROVIDES_API]: RELATION_API_PROVIDED_BY,
  [RELATION_API_PROVIDED_BY]: RELATION_PROVIDES_API,
  [RELATION_CONSUMES_API]: RELATION_API_CONSUMED_BY,
  [RELATION_API_CONSUMED_BY]: RELATION_CONSUMES_API,
  [RELATION_PARENT_OF]: RELATION_CHILD_OF,
  [RELATION_CHILD_OF]: RELATION_PARENT_OF,
  [RELATION_MEMBER_OF]: RELATION_HAS_MEMBER,
  [RELATION_HAS_MEMBER]: RELATION_MEMBER_OF,
};

// The relations that matter most come first; the others follow alphabetically.
const RELATION_ORDER = [
  RELATION_OWNED_BY,
  RELATION_PART_OF,
  RELATION_DEPENDS_ON,
  RELATION_PROVIDES_API,
  RELATION_CONSUMES_API,
  RELATION_MEMBER_OF,
  RELATION_CHILD_OF,
];

export interface RelationGroup {
  type: string;
  inverse?: string;
  targets: CompoundEntityRef[];
}

/** The direct relations of an entity, one group per relation type. */
export function relationGroups(entity: Entity): RelationGroup[] {
  const self = stringifyEntityRef(entity);
  const byType = new Map<string, CompoundEntityRef[]>();

  for (const relation of entity.relations ?? []) {
    if (relation.targetRef === self) {
      continue;
    }
    const targets = byType.get(relation.type) ?? [];
    targets.push(parseEntityRef(relation.targetRef));
    byType.set(relation.type, targets);
  }

  const rank = (type: string) => {
    const index = RELATION_ORDER.indexOf(type);
    return index === -1 ? RELATION_ORDER.length : index;
  };

  return [...byType.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([type, targets]) => ({
      type,
      inverse: INVERSES[type],
      targets,
    }));
}

/** Targets of the relations of one type, in the order of the entity. */
export function relationTargets(
  entity: Entity,
  type: string,
): CompoundEntityRef[] {
  return (entity.relations ?? [])
    .filter(relation => relation.type === type)
    .map(relation => parseEntityRef(relation.targetRef));
}

export interface HierarchyGroup {
  label: string;
  refs: CompoundEntityRef[];
}

const PARENT_LABELS: Record<string, string> = {
  system: 'System',
  domain: 'Domain',
};

/** What the entity is part of, labelled by the kind of the parent. */
export function hierarchy(entity: Entity): HierarchyGroup[] {
  const groups = new Map<string, CompoundEntityRef[]>();

  for (const ref of relationTargets(entity, RELATION_PART_OF)) {
    const label =
      PARENT_LABELS[ref.kind.toLocaleLowerCase('en-US')] ?? 'Part of';
    groups.set(label, [...(groups.get(label) ?? []), ref]);
  }

  return [...groups.entries()].map(([label, refs]) => ({ label, refs }));
}

export type AboutField =
  | { id: string; label: string; type: 'text'; value: string }
  | { id: string; label: string; type: 'refs'; refs: CompoundEntityRef[] }
  | { id: string; label: string; type: 'tags'; tags: string[] }
  | { id: string; label: string; type: 'lifecycle'; value: string };

export interface AboutFields {
  /** Description, owner, hierarchy and tags. */
  primary: AboutField[];
  /** Kind, type and lifecycle. */
  secondary: AboutField[];
}

/** The fields of the "About" card; the ones the entity does not have are left out. */
export function aboutFields(entity: Entity): AboutFields {
  const primary: AboutField[] = [];
  const secondary: AboutField[] = [];

  const owners = relationTargets(entity, RELATION_OWNED_BY);
  if (owners.length > 0) {
    primary.push({
      id: 'owner',
      label: 'Owner',
      type: 'refs',
      refs: owners,
    });
  }

  for (const group of hierarchy(entity)) {
    primary.push({
      id: group.label,
      label: group.label,
      type: 'refs',
      refs: group.refs,
    });
  }

  const tags = entity.metadata.tags ?? [];
  if (tags.length > 0) {
    primary.push({ id: 'tags', label: 'Tags', type: 'tags', tags });
  }

  secondary.push({
    id: 'kind',
    label: 'Kind',
    type: 'text',
    value: entity.kind,
  });

  const type = entity.spec?.type;
  if (typeof type === 'string' && type) {
    secondary.push({ id: 'type', label: 'Type', type: 'text', value: type });
  }

  const lifecycle = entity.spec?.lifecycle;
  if (typeof lifecycle === 'string' && lifecycle) {
    secondary.push({
      id: 'lifecycle',
      label: 'Lifecycle',
      type: 'lifecycle',
      value: lifecycle,
    });
  }

  return { primary, secondary };
}

/** "1 recurso vinculado", "3 recursos vinculados". */
export function linkedCountLabel(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? `1 ${singular} linked` : `${count} ${plural} linked`;
}
