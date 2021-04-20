import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import * as React from 'react';

interface UsersCounterProps {
  style?: React.CSSProperties;
  iconName: McsIconType;
  numberOfUsers?: number;
}

type Props = UsersCounterProps;

class UsersCounter extends React.Component<Props> {
  render() {
    const { style, iconName, numberOfUsers } = this.props;

    return (
      <div
        className={'node-users-counter mcs-automation-userCounter'}
        style={style}
      >
        {numberOfUsers ? numberOfUsers.toLocaleString() : '0'}
        <McsIcon type={iconName} className={'node-users-counter-icon'} />
      </div>
    );
  }
}

export default UsersCounter;
