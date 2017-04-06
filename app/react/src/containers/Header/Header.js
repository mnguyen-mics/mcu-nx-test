import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router/lib/Link';
import { Cascader, Popover, Icon, Menu, Row, Col } from 'antd';
import classNames from 'classnames';

import * as sessionActions from '../../services/session/SessionActions';

class NavigatorHeader extends Component {

  constructor(props) {
    super(props);
    this.buildNavigationItems = this.buildNavigationItems.bind(this);
    this.buildWorkspaceItems = this.buildWorkspaceItems.bind(this);
    this.buildProfileItems = this.buildProfileItems.bind(this);
    this.setActiveHeaderItem = this.setActiveHeaderItem.bind(this);
    this.getCampaignsUrl = this.getCampaignsUrl.bind(this);
    this.state = {
      // retrieve activeRoute from location
      activeRoute: 'campaigns'
    };
  }

  render() {

    const {
      authenticated,
      activeWorkspace: {
        workspaceId,
        organisationName
      }
    } = this.props;

    const {
      activeRoute
    } = this.state;

    const homeUrl = authenticated ? this.getCampaignsUrl() : '';
    const navigationItems = this.displayNavigationItems();
    const workspaceItems = this.buildWorkspaceItems();
    const profileItems = this.buildProfileItems();


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

    return (
      <header id="header" className={headerClassName}>
        <Row>
          <Col lg={3}>
            <Cascader options={workspaceItems.workspaces} defaultValue={[workspaceId]} onChange={this.onWorkspaceChange} className="mcs-header-cascader-menu" popupClassName="mcs-header-cascader-popover" />
          </Col>
          <Col lg={3}>
            <Link to={homeUrl} id="logo" className="mcs-header-logo-name">{organisationName}</Link>
          </Col>
          <Col lg={18} >
            <Menu onClick={this.setActiveHeaderItem} selectedKeys={[activeRoute]} mode="horizontal" className="mcs-header-menu-horizontal">
              {navigationItems}
            </Menu>
            <div className="mcs-header-menu-icons" >
              <Link to={`/${workspaceId}/settings/useraccount`}>
                <Icon type="setting" className="mcs-header-anticon" />
              </Link>
              <div className="mcs-header-divider" />
              <Popover placement="bottomRight" title={text} content={content}>
                <Icon type="user" className="mcs-header-anticon" />
              </Popover>
            </div>
          </Col>
        </Row>
      </header>
    );

  }

  onWorkspaceChange(value, selectedOptions) {
    if (value.length) {
      selectedOptions[0].onClick();
    }
  }

  setActiveHeaderItem(/* item */) {
    /* this.setState({
      activeRoute: item.key,
    });
    */
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

    return `/${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/campaigns/display`; // eslint-disable-line no-undef
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
        url: `/${workspaceId}/datamart/segments`,
        label: 'AUDIENCE',
        path: 'segments'
      },
      {
        url: `/${workspaceId}/datamart/categories`,
        label: 'CATALOGS',
        path: 'categories'
      },
    ] : [];

    const reactEntries = [
      {
        url: this.getCampaignsUrl(),
        label: 'CAMPAIGNS',
        path: 'campaigns'
      }
    ];

    const angularEntries = [
      {
        url: `/${workspaceId}/creatives/display-ad`,
        label: 'CREATIVES',
        path: 'display-ad'
      },
      {
        url: `/${workspaceId}/library/placementlists`,
        label: 'LIBRARY',
        path: 'placementlists'
      }
    ];

    return authenticated ? datamartEntries.concat(reactEntries).concat(angularEntries) : [];
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
  logout: PropTypes.func.isRequired
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
