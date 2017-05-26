import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router/lib/Link';
import { Dropdown, Popover, Icon, Menu, Row, Col } from 'antd';
import classNames from 'classnames';

import * as sessionActions from '../../state/Session/actions';

class NavigatorHeader extends Component {

  constructor(props) {
    super(props);
    this.buildNavigationItems = this.buildNavigationItems.bind(this);
    this.buildWorkspaceItems = this.buildWorkspaceItems.bind(this);
    this.buildProfileItems = this.buildProfileItems.bind(this);
    this.getCampaignsUrl = this.getCampaignsUrl.bind(this);
    this.onWorkspaceChange = this.onWorkspaceChange.bind(this);
  }

  render() {

    const {
      authenticated,
      activeWorkspace: {
        workspaceId,
        organisationName
      },
      router: {
        location: {
          pathname
        }
      }
    } = this.props;


    const homeUrl = authenticated ? this.getCampaignsUrl() : '';
    const navigationItems = this.displayNavigationItems();
    const workspaceItems = this.buildWorkspaceItems();
    const profileItems = this.buildProfileItems();

    const activeItem = this.buildNavigationItems().find(item => {
      return pathname.search(item.path) >= 0;
    });
    const activeKey = activeItem ? activeItem.path : 'campaigns';

    const headerClassName = classNames([
      'mcs-header',
      'clearfix'
    ]);

    const text = profileItems.title;

    const content = (
      <div>
        { profileItems.content.map((profileItem, index) => {
          return <div key={index.toString()}>{profileItem}</div>;
        })}
      </div>
    );

    const menu = (
      <Menu onClick={this.onWorkspaceChange}>
        {workspaceItems.workspaces.map(workspaceItem => {
          return <Menu.Item data={workspaceItem.data} key={workspaceItem.value}>{workspaceItem.label}</Menu.Item>;
        })}
      </Menu>
    );

    return (
      <header id="header" className={headerClassName}>
        <Row>
          <Col sm={4} md={4} lg={4} className="mcs-header-logo">
            <div className="mcs-header-logo-item">
              <Dropdown overlay={menu} trigger={['click']}>
                <a className="ant-dropdown-link mcs-header-cascader-menu">
                  <Icon type="down" />
                </a>
              </Dropdown>
            </div>
            <div className="mcs-header-logo-item mcs-header-logo-name">
              <Link to={homeUrl} id="logo" className="mcs-header-logo-name">{organisationName}</Link>
            </div>
          </Col>
          <Col sm={20} md={20} lg={20} className="mcs-header-navigation">
            <Menu selectedKeys={[activeKey]} mode="horizontal" className="mcs-header-menu-horizontal">
              {navigationItems}
            </Menu>
            <div className="mcs-header-menu-icons" >
              <Link to={`/${workspaceId}/settings/useraccount`}>
                <Icon type="setting" className="mcs-header-anticon" />
              </Link>
              <div className="mcs-header-divider" />
              <Popover placement="bottomRight" trigger="click" title={text} content={content}>
                <Icon type="user" className="mcs-header-anticon" />
              </Popover>
            </div>
          </Col>
        </Row>
      </header>
    );

  }

  onWorkspaceChange(value) {

    const {
      switchWorkspace
    } = this.props;

    const {
      item: {
        props: {
          data: workspace
        }
      }
    } = value;

    switchWorkspace(workspace);

  }


  displayNavigationItems() {

    const items = this.buildNavigationItems();

    return items.map(item => {
      return (
        <Menu.Item key={item.path}>
          <Link to={item.url}><FormattedMessage id={item.label} /></Link>
        </Menu.Item>
      );
    });

  }

  getCampaignsUrl() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      }
    } = this.props;

    return `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/campaigns/display`; // eslint-disable-line no-undef
  }

  getAudienceUrl() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      }
    } = this.props;

    return `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/segments`; // eslint-disable-line no-undef
  }

  getAutomationsUrl() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      }
    } = this.props;

    return `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/automations/list`; // eslint-disable-line no-undef
  }

  getLibraryUrl() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      }
    } = this.props;

    return `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/placements`; // eslint-disable-line no-undef
  }

  buildNavigationItems() {

    const {
      activeWorkspace: {
        datamartId,
        workspaceId
      },
      location: {
        pathname
      },
      authenticated
    } = this.props;

    /*
      To add a new link to the navbar use an object with the property active.
      Use isActiveUrl function by passing the path of the route.
      The property is used by the NavLink component to apply an active class to the element.
    */
    const isActiveUrl = path => pathname.search(path) >= 0; // eslint-disable-line no-unused-vars
    const datamartEntries = datamartId ? [
      {
        url: this.getAudienceUrl(),
        label: 'AUDIENCE',
        path: 'audience'
      },
      {
        url: `/${workspaceId}/datamart/categories/`,
        label: 'CATALOGS',
        path: 'categories'
      },
    ] : [];

    const reactEntries = [
      {
        url: this.getCampaignsUrl(),
        label: 'CAMPAIGNS',
        path: 'campaigns'
      },
      {
        url: this.getAutomationsUrl(),
        label: 'AUTOMATIONS_LIST',
        path: 'automations'
      },
      {
        url: `/${workspaceId}/creatives/display-ad`,
        label: 'CREATIVES',
        path: 'display-ad'
      },
      {
        url: this.getLibraryUrl(),
        label: 'LIBRARY',
        path: 'library'
      }
    ];

    return authenticated ? datamartEntries.concat(reactEntries) : [];
  }

  buildWorkspaceItems() {

    const {
      activeWorkspace,
      workspaces,
      switchWorkspace
    } = this.props;

    const getLabel = workspace => `${workspace.organisationName} ${workspace.datamartName ? `[${workspace.datamartName}]` : ''}`;

    const getActiveWorkespace = () => {
      return {
        label: getLabel(activeWorkspace),
        onClick: () => {}
      };
    };

    const getWorkspaceItems = () => workspaces.map(workspace => {

      const isActive = (workspace.organisationId === activeWorkspace.organisationId) && (workspace.role === activeWorkspace.role) && (workspace.datamartId === activeWorkspace.datamartId);

      return {
        value: workspace.workspaceId,
        label: getLabel(workspace),
        data: workspace,
        onClick: () => switchWorkspace(workspace),
        isActive
      };

    });

    return {
      activeWorkspace: getActiveWorkespace(),
      workspaces: getWorkspaceItems()
    };
  }

  buildProfileItems() {

    const {
      authenticated,
      user,
      activeWorkspace: {
        workspaceId
      },
      logout
    } = this.props;

    const loginUrl = `${PUBLIC_URL}/login`; // eslint-disable-line no-undef

    const loginItem = <Link to={loginUrl}><FormattedMessage id="LOGIN" /></Link>;

    const onLogoutClick = () => {
      logout();
    };

    const logoutItem = <Link to="/logout" onClick={onLogoutClick}><FormattedMessage id="LOGOUT" /></Link>; // eslint-disable-line jsx-a11y/no-static-element-interactions
    const accountUrl = `${workspaceId}/settings/useraccount`;

    const account = <Link to={accountUrl}><FormattedMessage id="ACCOUNT_SETTINGS" /></Link>;

    const userItem = user ? <p>{user.email}</p> : null;
    const accountItem = user ? account : null;
    const authenticatedItem = authenticated ? logoutItem : loginItem;

    return {
      title: userItem,
      content: [
        accountItem,
        authenticatedItem
      ]
    };

  }

}

NavigatorHeader.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workspaces: PropTypes.arrayOf(PropTypes.object).isRequired,
  authenticated: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  switchWorkspace: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  authenticated: state.sessionState.authenticated,
  user: state.sessionState.user,
  activeWorkspace: state.sessionState.activeWorkspace,
  workspaces: state.sessionState.workspaces
});

const mapDispatchToProps = {
  switchWorkspace: sessionActions.switchWorkspace,
  logout: sessionActions.logout
};

NavigatorHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigatorHeader);

export default NavigatorHeader;
