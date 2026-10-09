import ArrowOutwardIcon from '@material-ui/icons/CallMade';
import CompassIcon from '@material-ui/icons/ExploreOutlined';
import GitHubIcon from '@material-ui/icons/GitHub';
import BookIcon from '@material-ui/icons/MenuBookOutlined';
import LayersIcon from '@material-ui/icons/Layers';
import { WidgetCard } from '../WidgetCard';
import styles from './GettingStarted.module.css';

const RESOURCES = [
  {
    label: 'Documentação',
    href: 'https://backstage.io/docs',
    icon: <BookIcon />,
  },
  {
    label: 'GitHub do Backstage',
    href: 'https://github.com/backstage/backstage',
    icon: <GitHubIcon />,
  },
];

export function GettingStarted() {
  return (
    <WidgetCard icon={<CompassIcon />} title="Primeiros passos">
      <div className={styles.content}>
        <section className={styles.intro}>
          <span className={styles.logo}>
            <LayersIcon />
          </span>
          <h3 className={styles.welcome}>Bem-vindo ao Backstage! 👋</h3>
          <p className={styles.text}>
            Um lugar central para gerenciar seus serviços de software, APIs e
            documentação.
          </p>
        </section>

        <section className={styles.about}>
          <p className={styles.text}>
            O Backstage é uma plataforma aberta para construir portais de
            desenvolvedores. Reúne ferramentas, padrões e informações para
            facilitar o seu dia a dia.
          </p>
          <ul className={styles.resources}>
            {RESOURCES.map(resource => (
              <li key={resource.href}>
                <a
                  className={styles.resource}
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {resource.icon}
                  <span className={styles.resourceLabel}>{resource.label}</span>
                  <ArrowOutwardIcon className={styles.arrow} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <hr className={styles.divider} />

        <section className={styles.custom}>
          <h3 className={styles.customTitle}>Seu portal, do seu jeito</h3>
          <p className={styles.text}>
            Esta é uma instalação de demonstração. Explore as funcionalidades e
            veja como o Backstage pode se adaptar à sua organização.
          </p>
          <p className={styles.text}>
            Você também pode personalizar esta página e os widgets para
            acompanhar o que é mais importante para você.
          </p>
        </section>
      </div>
    </WidgetCard>
  );
}
