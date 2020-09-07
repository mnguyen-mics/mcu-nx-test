import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Layout, Menu, Icon, Alert } from 'antd';
import { Dropdown } from '../../components/PopupContainers';
import * as SessionHelper from '../../redux/Session/selectors';
import McsIcon from '../../components/McsIcon';
import messages from './messages';
import { compose } from 'recompose';
import { injectDatamart, InjectedDatamartProps } from '../Datamart';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { MicsReduxState } from '../../utils/ReduxHelper';

const { Header } = Layout;

interface NavigatorHeaderStoreProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
  userEmail: string;
}

export interface NavigatorHeaderProps {
  isSetting?: boolean;
  menu?: React.ReactNode;
}

type Props = NavigatorHeaderProps &
  NavigatorHeaderStoreProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedDatamartProps;

class NavigatorHeader extends React.Component<Props> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      workspace,
      userEmail,
      isSetting,
      menu,
    } = this.props;

    const organisationName = workspace(organisationId).organisation_name;

    const accountMenu = (
      <Menu>
        <Menu.Item key="email" disabled={true}>
          {userEmail}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="account">
          <Link
            to={{
              pathname: `/v2/o/${organisationId}/settings/account/my_profile`,
            }}
          >
            <FormattedMessage {...messages.account} />
          </Link>
        </Menu.Item>
        <Menu.Item key="logout">
          <Link to="/logout">
            <FormattedMessage id="components.header.logOut" defaultMessage="Log out" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Header className="mcs-header">
        <div className="mcs-header-title">
          <span className="left-component">
            {isSetting ? (
              <span className="launcher">
                <Dropdown overlay={menu} trigger={['click']}>
                  <a>
                    <Icon
                      type="appstore"
                      className="menu-icon"
                      theme="filled"
                    />
                  </a>
                </Dropdown>
              </span>
            ) : null}
            {
              <Link
                to={`/v2/o/${organisationId}/campaigns/display`}
                className="organisation-name">
                  {organisationName}
              </Link>
            }
          </span>
          {
            process.env.API_ENV === 'prod' ?
              <Alert
                className="mcs-header-title-alert"
                message="You are using production API environment !"
                type="error"
                showIcon={true}
              />
              : null
          }
        </div>
        <div className="mcs-header-actions">
          <Link
            className="mcs-header-actions-settings"
            to={`/v2/o/${organisationId}/settings/organisation/labels`}
          >
            <McsIcon type="options" className="menu-icon" />
          </Link>
          <div className="mcs-header-actions-account">
            <Dropdown
              overlay={accountMenu}
              trigger={['click']}
              placement="bottomRight"
            >
              <a>
                <McsIcon type="user" className="menu-icon" />
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
  connect(mapStateToProps),
)(NavigatorHeader);
