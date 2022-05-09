import * as React from 'react';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../../../Features';
import UsersListsList from './OldUserListPage';
import UserListPage from './UserListPage';

type Props = InjectedFeaturesProps;

class UserListPageContainer extends React.Component<Props> {
  render() {
    const { hasFeature } = this.props;
    return hasFeature('new-userSettings') ? <UserListPage /> : <UsersListsList />;
  }
}

export default compose<Props, {}>(injectFeatures)(UserListPageContainer);
