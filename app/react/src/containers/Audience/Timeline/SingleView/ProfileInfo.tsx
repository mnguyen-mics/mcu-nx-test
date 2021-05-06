import * as React from 'react';
import { UserProfileWithAccountId } from '../../../../models/timeline/timeline';
import SingleProfileInfo from './SingleProfileInfo';
import cuid from 'cuid';

export interface ProfileInfoProps {
  profiles: UserProfileWithAccountId[];
}

interface State {}

export default class ProfileInfo extends React.Component<ProfileInfoProps, State> {
  static defaultProps = {
    profiles: [],
  };

  constructor(props: ProfileInfoProps) {
    super(props);
  }

  public render() {
    const { profiles } = this.props;

    return (
      <div>
        {profiles.map(profil => {
          return <SingleProfileInfo key={cuid()} profileGlobal={profil} />;
        })}
      </div>
    );
  }
}
