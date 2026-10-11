import ArrowOutwardIcon from '@material-ui/icons/CallMade';
import CompassIcon from '@material-ui/icons/ExploreOutlined';
import GitHubIcon from '@material-ui/icons/GitHub';
import BookIcon from '@material-ui/icons/MenuBookOutlined';
import LayersIcon from '@material-ui/icons/Layers';
import { WidgetCard } from '../WidgetCard';
import styles from './GettingStarted.module.css';

const RESOURCES = [
  {
    label: 'Documentation',
    href: 'https://backstage.io/docs',
    icon: <BookIcon />,
  },
  {
    label: 'Backstage on GitHub',
    href: 'https://github.com/backstage/backstage',
    icon: <GitHubIcon />,
  },
];

export function GettingStarted() {
  return (
    <WidgetCard icon={<CompassIcon />} title="Getting started">
      <div className={styles.content}>
        <section className={styles.intro}>
          <span className={styles.logo}>
            <LayersIcon />
          </span>
          <h3 className={styles.welcome}>Welcome to Backstage! 👋</h3>
          <p className={styles.text}>
            A central place to manage your software services, APIs and
            documentation.
          </p>
        </section>

        <section className={styles.about}>
          <p className={styles.text}>
            Backstage is an open platform for building developer portals. It
            brings tools, standards and information together to make your
            day-to-day easier.
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
          <h3 className={styles.customTitle}>Your portal, your way</h3>
          <p className={styles.text}>
            This is a demo installation. Explore the features and see how
            Backstage can adapt to your organization.
          </p>
          <p className={styles.text}>
            You can also customize this page and its widgets to follow what
            matters most to you.
          </p>
        </section>
      </div>
    </WidgetCard>
  );
}
