import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import * as React from 'react';

interface UsersCounterProps {
  height?: number;
  iconName: McsIconType;
  numberOfUsers: number;
}

type Props = UsersCounterProps;

class UsersCounter extends React.Component<Props> {
  render() {
    const { height, iconName, numberOfUsers } = this.props;

    return (
      <div
        className={'node-users-counter'}
        style={{
          height,
        }}
      >
        {numberOfUsers.toLocaleString()}
        <McsIcon type={iconName} className={'node-users-counter-icon'} />
      </div>
    );
  }
}

export default UsersCounter;
