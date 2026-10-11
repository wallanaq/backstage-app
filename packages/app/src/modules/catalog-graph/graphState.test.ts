import {
  DEFAULT_STATE,
  GraphState,
  parseGraphState,
  serializeGraphState,
} from './graphState';

describe('parseGraphState', () => {
  it('uses the defaults of the plugin when the URL has nothing', () => {
    expect(parseGraphState('')).toEqual(DEFAULT_STATE);
  });

  it('lets the configuration change the defaults', () => {
    const state = parseGraphState('', {
      maxDepth: 2,
      direction: 'TB',
      selectedKinds: ['Component'],
    });

    expect(state.maxDepth).toBe(2);
    expect(state.direction).toBe('TB');
    expect(state.selectedKinds).toEqual(['component']);
  });

  it('reads a link made by the plugin itself', () => {
    const state = parseGraphState(
      '?rootEntityRefs%5B%5D=component%3Adefault%2Fartist-lookup&maxDepth=%E2%88%9E&unidirectional=true&mergeRelations=true&direction=LR&showFilters=true&curve=curveMonotoneX',
    );

    expect(state.rootEntityRefs).toEqual(['component:default/artist-lookup']);
    expect(state.maxDepth).toBe(Infinity);
    expect(state.direction).toBe('LR');
  });

  it('reads several roots, kinds and relations', () => {
    const state = parseGraphState(
      'rootEntityRefs[]=a:default/x&rootEntityRefs[]=b:default/y&selectedKinds[]=API&selectedRelations[]=ownedBy&selectedRelations[]=partOf',
    );

    expect(state.rootEntityRefs).toEqual(['a:default/x', 'b:default/y']);
    expect(state.selectedKinds).toEqual(['api']);
    expect(state.selectedRelations).toEqual(['ownedBy', 'partOf']);
  });

  it('ignores values it does not understand', () => {
    const state = parseGraphState('maxDepth=abc&direction=XX&curve=zig');

    expect(state.maxDepth).toBe(Infinity);
    expect(state.direction).toBe('LR');
    expect(state.curve).toBe('curveMonotoneX');
  });

  it('reads booleans and a finite depth', () => {
    const state = parseGraphState(
      'maxDepth=3&unidirectional=false&mergeRelations=false&showFilters=false',
    );

    expect(state.maxDepth).toBe(3);
    expect(state.unidirectional).toBe(false);
    expect(state.mergeRelations).toBe(false);
    expect(state.showFilters).toBe(false);
  });
});

describe('serializeGraphState', () => {
  it('round trips the state', () => {
    const state: GraphState = {
      rootEntityRefs: ['component:default/artist-lookup'],
      maxDepth: 2,
      selectedKinds: ['api', 'component'],
      selectedRelations: ['ownedBy'],
      unidirectional: false,
      mergeRelations: true,
      direction: 'TB',
      curve: 'curveStepBefore',
      showFilters: false,
    };

    expect(parseGraphState(serializeGraphState(state))).toEqual(state);
  });

  it('writes an infinite depth like the plugin and leaves out the empty lists', () => {
    const query = serializeGraphState(DEFAULT_STATE);

    expect(decodeURIComponent(query)).toContain('maxDepth=∞');
    expect(query).not.toContain('selectedKinds');
    expect(query).not.toContain('selectedRelations');
    expect(parseGraphState(query)).toEqual(DEFAULT_STATE);
  });
});
