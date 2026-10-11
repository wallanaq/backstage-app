import { Entity } from '@backstage/catalog-model';
import {
  aboutFields,
  hierarchy,
  kindListPage,
  kindPlural,
  linkedCountLabel,
  relationGroups,
} from './entityInfo';

const component: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'artist-lookup',
    namespace: 'default',
    description: 'Artist Lookup',
    tags: ['java', 'data'],
  },
  spec: { type: 'service', lifecycle: 'experimental' },
  relations: [
    { type: 'dependsOn', targetRef: 'resource:default/artists-db' },
    { type: 'ownedBy', targetRef: 'group:default/team-a' },
    { type: 'partOf', targetRef: 'system:default/artist-engagement-portal' },
    { type: 'consumesApi', targetRef: 'api:default/artist-api' },
    { type: 'consumesApi', targetRef: 'api:default/other-api' },
  ],
};

describe('kindPlural', () => {
  it('translates the known kinds', () => {
    expect(kindPlural('Component')).toBe('Componentes');
    expect(kindPlural('API')).toBe('APIs');
    expect(kindPlural('group')).toBe('Grupos');
  });

  it('falls back to an "s" for custom kinds', () => {
    expect(kindPlural('Widget')).toBe('Widgets');
  });
});

describe('kindListPage', () => {
  it('points components and APIs to their list pages', () => {
    expect(kindListPage('Component')).toBe('/catalog');
    expect(kindListPage('API')).toBe('/api-docs');
  });

  it('has no page for the other kinds', () => {
    expect(kindListPage('Group')).toBeUndefined();
  });
});

describe('relationGroups', () => {
  it('orders the main relations first and groups the targets', () => {
    const groups = relationGroups(component);

    expect(groups.map(group => group.type)).toEqual([
      'ownedBy',
      'partOf',
      'dependsOn',
      'consumesApi',
    ]);
    expect(groups[0]).toEqual({
      type: 'ownedBy',
      inverse: 'ownerOf',
      targets: [{ kind: 'group', namespace: 'default', name: 'team-a' }],
    });
    expect(groups[3].targets).toHaveLength(2);
  });

  it('skips relations to the entity itself', () => {
    const entity: Entity = {
      ...component,
      relations: [
        { type: 'dependsOn', targetRef: 'component:default/artist-lookup' },
      ],
    };

    expect(relationGroups(entity)).toEqual([]);
  });

  it('is empty for an entity without relations', () => {
    expect(relationGroups({ ...component, relations: undefined })).toEqual([]);
  });
});

describe('hierarchy', () => {
  it('labels the parent by its kind', () => {
    expect(hierarchy(component)).toEqual([
      {
        label: 'Sistema',
        refs: [
          {
            kind: 'system',
            namespace: 'default',
            name: 'artist-engagement-portal',
          },
        ],
      },
    ]);
  });
});

describe('aboutFields', () => {
  it('lists every field of a component', () => {
    const { primary, secondary } = aboutFields(component);

    expect(primary.map(field => field.id)).toEqual([
      'owner',
      'Sistema',
      'tags',
    ]);
    expect(secondary.map(field => field.id)).toEqual([
      'kind',
      'type',
      'lifecycle',
    ]);
  });

  it('leaves out what the entity does not have', () => {
    const { primary, secondary } = aboutFields({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: { name: 'portal' },
      spec: {},
    });

    expect(primary).toEqual([]);
    expect(secondary.map(field => field.id)).toEqual(['kind']);
  });
});

describe('linkedCountLabel', () => {
  it('pluralizes', () => {
    expect(linkedCountLabel(1, 'recurso', 'recursos')).toBe(
      '1 recurso vinculado',
    );
    expect(linkedCountLabel(3, 'recurso', 'recursos')).toBe(
      '3 recursos vinculados',
    );
  });
});
