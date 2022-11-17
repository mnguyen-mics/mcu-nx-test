import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import ComponentPropsAdapter from './ComponentPropsAdapter';

interface DimensionNameDisplayProps {
  resource: NamedResource;
  showId?: boolean;
}

type Props = DimensionNameDisplayProps & InjectedNotificationProps & WrappedComponentProps;

interface NamedResource {
  id: string;
  name: string;
}

function resourceAdapter<T extends NamedResource>(s: T): DimensionNameDisplayProps {
  return { resource: s };
}

function displayNameAdapted<T extends NamedResource>() {
  return ComponentPropsAdapter(DimensionNameDisplay, (x: T) => resourceAdapter(x));
}

class DimensionNameDisplayWrapped extends React.Component<Props> {
  ellipsizeResourceName = (name: string) => {
    return name.length > 100 ? `${name.substring(0, 100)}...` : name;
  };

  displayId = () => {
    const { resource } = this.props;
    return resource.name === resource.id ? <span /> : <span> {resource.id} - </span>;
  };

  render() {
    const { resource, showId } = this.props;
    return (
      <span title={resource.name}>
        {showId && this.displayId()} {this.ellipsizeResourceName(resource.name)}
      </span>
    );
  }
}
const DimensionNameDisplay = compose<Props, DimensionNameDisplayProps>(
  injectIntl,
  injectNotifications,
)(DimensionNameDisplayWrapped);
export { displayNameAdapted };
