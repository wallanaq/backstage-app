import { ComponentType } from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CategoryIcon from '@material-ui/icons/Category';
import CodeIcon from '@material-ui/icons/Code';
import DescriptionIcon from '@material-ui/icons/Description';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import PublicIcon from '@material-ui/icons/Public';
import StorageIcon from '@material-ui/icons/Storage';

const ICONS: Record<string, ComponentType<SvgIconProps>> = {
  component: CategoryIcon,
  api: CodeIcon,
  system: AccountTreeIcon,
  domain: PublicIcon,
  resource: StorageIcon,
  group: GroupIcon,
  user: PersonIcon,
};

/** The icon of an entity kind (a generic one for kinds without their own). */
export function KindIcon({
  kind,
  className,
  ...props
}: { kind: string } & SvgIconProps) {
  const Icon = ICONS[kind.toLocaleLowerCase('en-US')] ?? DescriptionIcon;
  return <Icon className={className} {...props} />;
}
