import { ReactNode, useMemo, useState } from 'react';
import { useResolvedPath } from 'react-router-dom';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { BreadcrumbEntry } from '@backstage/frontend-plugin-api';
import { useStarredEntities } from '@backstage/plugin-catalog-react';
import { SearchField } from '@backstage/ui';
import CategoryIcon from '@material-ui/icons/Category';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import ExtensionIcon from '@material-ui/icons/Extension';
import LayersIcon from '@material-ui/icons/Layers';
import StarIcon from '@material-ui/icons/StarBorder';
import StorageIcon from '@material-ui/icons/Storage';
import { FilterSelect } from '../entities/FilterSelects';
import { PageNote } from '../entities/PageNote';
import {
  FilterColumn,
  FilterDivider,
  FilterItem,
  FilterSection,
} from '../entities/UserFilters';
import { TemplateCard } from './TemplateCard';
import {
  GROUPS,
  OTHER_GROUP,
  searchText,
  TemplateGroup,
  TemplateView,
} from './templateMeta';
import { useTemplates } from './useTemplates';
import styles from './TemplatesPage.module.css';

const ALL = 'all';

const GROUP_ICONS: Record<string, ReactNode> = {
  backend: <StorageIcon />,
  frontend: <DesktopIcon />,
  libraries: <CategoryIcon />,
  other: <ExtensionIcon />,
};

const unique = (values: string[]) => [...new Set(values)].sort();

export function DevPortalTemplatesPage() {
  const { templates, loading, error } = useTemplates();
  const { starredEntities } = useStarredEntities();
  const basePath = useResolvedPath('.').pathname.replace(/\/$/, '');

  const [search, setSearch] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [groupId, setGroupId] = useState(ALL);
  const [owner, setOwner] = useState(ALL);
  const [technology, setTechnology] = useState(ALL);
  const [tag, setTag] = useState(ALL);

  const options = useMemo(
    () => ({
      owners: unique(
        templates.flatMap(t => (t.owner ? [stringifyEntityRef(t.owner)] : [])),
      ),
      technologies: unique(templates.flatMap(t => t.stack)),
      tags: unique(templates.flatMap(t => t.tags)),
    }),
    [templates],
  );

  // Everything except the group, so that the group counts follow the filters.
  const matching = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return templates.filter(
      t =>
        (!query || searchText(t).includes(query)) &&
        (!onlyStarred || starredEntities.has(t.ref)) &&
        (owner === ALL || (t.owner && stringifyEntityRef(t.owner) === owner)) &&
        (technology === ALL || t.stack.includes(technology)) &&
        (tag === ALL || t.tags.includes(tag)),
    );
  }, [templates, search, onlyStarred, starredEntities, owner, technology, tag]);

  const groups = [...GROUPS, OTHER_GROUP]
    .map(group => ({
      group,
      templates: matching.filter(t => t.groupId === group.id),
    }))
    .filter(({ templates: items }) => items.length > 0);
  const visibleGroups = groups.filter(
    ({ group }) => groupId === ALL || group.id === groupId,
  );
  const visibleCount = visibleGroups.reduce(
    (total, { templates: items }) => total + items.length,
    0,
  );
  const starredCount = templates.filter(t => starredEntities.has(t.ref)).length;

  const renderGroup = (group: TemplateGroup, items: TemplateView[]) => (
    <section key={group.id} className={styles.group}>
      <header className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{group.label}</h3>
        <span className={styles.count}>{items.length}</span>
        <p className={styles.groupDescription}>{group.description}</p>
      </header>
      <div className={styles.grid}>
        {items.map(template => (
          <TemplateCard
            key={template.ref}
            template={template}
            icon={GROUP_ICONS[group.id]}
            href={`${basePath}/${template.namespace}/${template.name}`}
          />
        ))}
      </div>
    </section>
  );

  let content: ReactNode;
  if (loading) {
    content = <p className={styles.message}>Carregando templates...</p>;
  } else if (error) {
    content = (
      <p className={styles.message}>
        Não foi possível carregar os templates: {error.message}
      </p>
    );
  } else if (visibleCount === 0) {
    content = <p className={styles.message}>Nenhum template encontrado.</p>;
  } else {
    content = visibleGroups.map(({ group, templates: items }) =>
      renderGroup(group, items),
    );
  }

  return (
    <BreadcrumbEntry entry={{ label: 'Templates', href: '' }}>
      <div className={styles.body}>
        <FilterColumn>
          <FilterSelect
            label="Tipo"
            options={[{ id: 'template', label: 'Template' }]}
            value="template"
            onChange={() => {}}
          />

          <FilterSection title="Pessoal">
            <FilterItem
              icon={<StarIcon />}
              label="Favoritos"
              count={starredCount}
              active={onlyStarred}
              onClick={() => setOnlyStarred(value => !value)}
            />
          </FilterSection>

          <FilterDivider />

          <FilterSection title="Grupos">
            <FilterItem
              icon={<LayersIcon />}
              label="Todos"
              count={matching.length}
              active={groupId === ALL}
              onClick={() => setGroupId(ALL)}
            />
            {groups.map(({ group, templates: items }) => (
              <FilterItem
                key={group.id}
                icon={GROUP_ICONS[group.id]}
                label={group.label}
                count={items.length}
                active={groupId === group.id}
                onClick={() => setGroupId(group.id)}
              />
            ))}
          </FilterSection>

          <FilterDivider />

          <FilterSelect
            label="Responsável"
            value={owner}
            onChange={setOwner}
            options={[
              { id: ALL, label: 'Todos' },
              ...options.owners.map(ref => ({
                id: ref,
                label: ref.split('/').pop() ?? ref,
              })),
            ]}
          />
          <FilterSelect
            label="Tecnologia"
            value={technology}
            onChange={setTechnology}
            options={[
              { id: ALL, label: 'Todas' },
              ...options.technologies.map(id => ({ id, label: id })),
            ]}
          />
          <FilterSelect
            label="Tags"
            value={tag}
            onChange={setTag}
            options={[
              { id: ALL, label: 'Todas' },
              ...options.tags.map(id => ({ id, label: id })),
            ]}
          />
        </FilterColumn>

        <div className={styles.results}>
          <div className={styles.bar}>
            <h2 className={styles.heading}>
              Todos os templates
              <span className={styles.count}>{visibleCount}</span>
            </h2>
            <div className={styles.search}>
              <SearchField
                aria-label="Buscar templates"
                placeholder="Buscar por nome, tecnologia ou tag..."
                value={search}
                onChange={setSearch}
              />
            </div>
          </div>

          {content}

          <PageNote flush>
            Os templates são definidos em arquivos template.yaml e mantidos
            pelas equipes responsáveis.
          </PageNote>
        </div>
      </div>
    </BreadcrumbEntry>
  );
}
