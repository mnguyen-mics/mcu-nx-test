import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { AppstoreFilled } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import * as SessionHelper from '../../redux/Session/selectors';
import messages from './messages';
import { compose } from 'recompose';
import { injectDatamart, InjectedDatamartProps } from '../Datamart';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { KeycloakService, MicsReduxState } from '@mediarithmics-private/advanced-components';
import { McsIcon, PopupContainer } from '@mediarithmics-private/mcs-components-library';
import { InjectedFeaturesProps, injectFeatures } from '../Features';
import { ProductionApiEnvironment } from '../Navigator/Layout/LayoutHelper';

const { Header } = Layout;
const { Dropdown } = PopupContainer;

interface NavigatorHeaderStoreProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
  userEmail: string;
}

export interface NavigatorHeaderProps {
  isInSettings: boolean;
  menu?: React.ReactElement;
}

type Props = NavigatorHeaderProps &
  NavigatorHeaderStoreProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedFeaturesProps &
  InjectedDatamartProps;

class NavigatorHeader extends React.Component<Props> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      userEmail,
      menu,
    } = this.props;


    const logoutMessage = (
      <FormattedMessage id='components.header.logOut' defaultMessage='Log out' />
    );

    const logOutFunction = () => KeycloakService.doLogout();

    const logOut = KeycloakService.isKeycloakEnabled() ? (
      <div onClick={logOutFunction} key={1}>
        {logoutMessage}
      </div>
    ) : (
      <Link to='/logout'>{logoutMessage}</Link>
    );

    const accountMenu = (
      <Menu>
        <Menu.Item key='email' disabled={true}>
          {userEmail}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key='account'>
          <Link
            to={{
              pathname: `/v2/o/${organisationId}/settings/account/my_profile`,
            }}
          >
            <FormattedMessage {...messages.account} />
          </Link>
        </Menu.Item>
        <Menu.Item key='logout'>{logOut}</Menu.Item>
      </Menu>
    );

    return (
      <Header className='mcs-navigator-header'>
        <div className='mcs-navigator-header-title'>
          <span className='left-component'>
            {menu ? (
              <span className='launcher'>
                <Dropdown overlay={menu} trigger={['click']}>
                  <a>
                    <AppstoreFilled className='menu-icon' />
                  </a>
                </Dropdown>
              </span>
            ) : null}
          </span>
          {process.env.API_ENV === 'prod' ? ProductionApiEnvironment : null}
        </div>
        <div className='mcs-navigator-header-actions'>
          <Link
            className='mcs-navigator-header-actions-settings'
            to={`/v2/o/${organisationId}/settings/organisation/labels`}
          >
            <McsIcon type='options' className='menu-icon' />
          </Link>
          <div className='mcs-navigator-header-actions-account'>
            <Dropdown overlay={accountMenu} trigger={['click']} placement='bottomRight'>
              <a>
                <McsIcon type='user' className='menu-icon' />
              </a>
            </Dropdown>
          </div>
        </div>
      </Header>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: SessionHelper.getWorkspace(state),
  userEmail: state.session.connectedUser.email,
});

export default compose<Props, NavigatorHeaderProps>(
  withRouter,
  injectDatamart,
  injectFeatures,
  connect(mapStateToProps),
)(NavigatorHeader);
