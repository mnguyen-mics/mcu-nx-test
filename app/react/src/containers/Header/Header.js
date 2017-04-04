import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router/lib/Link';
import { Cascader, Popover, Icon, Menu, Row, Col } from 'antd';
import classNames from 'classnames';

import * as sessionActions from '../../services/session/SessionActions';

import logoUrl from '../../assets/images/mediarithmics-small-white.png';
import imgUrl from '../../assets/images/user.svg';

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

    const logo = {
      url: logoUrl,
      alt: 'mediarithmics'
    };

    const img = {
      url: imgUrl,
      alt: 'profile'
    };

    const headerClassName = classNames([
      'mcs-header',
      'clearfix'
    ]);

    const text = <span>Title</span>;
    const content = (
      <div>
        { profileItems.map(profileItem => {
          return <span onClick={profileItem.onClick}>{ profileItem.label }</span>;
        }) }
      </div>
    );

    return (
      <header id="header" className={headerClassName}>
        <Row>
          <Col lg={1}>
            <Cascader options={workspaceItems.workspaces} onChange={this.onWorkspaceChange} className="mcs-header-cascader-menu" popupClassName="mcs-header-cascader-popover" placeholder="" />
          </Col>
          <Col lg={3}>
            <Link to={homeUrl} id="logo">
              <span className="mcs-header-logo-name">{organisationName}</span>
            </Link>
          </Col>
          <Col lg={20} >
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
    selectedOptions[0].onClick();
  }

  setActiveHeaderItem(item) {
    this.setState({
      activeRoute: item.key,
    });
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

    return `/v2/organisation/${organisationId}${datamartId ? `/datamart/${datamartId}` : ''}/campaigns`;
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

    const getDatamarts = workspace => {
      return workspace.datamarts.map(datamart => {
        return {
          value: datamart.datamartName,
          label: datamart.datamartName,
          onClick: () => switchWorkspace(workspace),
        };
      });
    };

    const getWorkspaceItems = () => workspaces.map(workspace => {

      const isActive = (workspace.organisationId === activeWorkspace.organisationId) && (workspace.role === activeWorkspace.role) && (workspace.datamartId === activeWorkspace.datamartId);

      return {
        value: getLabel(workspace),
        label: getLabel(workspace),
        onClick: isActive ? () => {} : () => switchWorkspace(workspace),
        isActive,
        children: getDatamarts(workspace)
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
      logout,
      router
    } = this.props;

    const loginUrl = `${PUBLIC_URL}/login`; // eslint-disable-line no-undef

    const redirect = url => {
      return router.replace(url);
    };

    const login = () => {
      return redirect(loginUrl);
    };

    const loginItem = {
      label: <p><FormattedMessage id="LOGIN" /></p>,
      onClick: login
    };

    const logoutItem = {
      label: <p><FormattedMessage id="LOGOUT" /></p>,
      onClick: () => {
        logout();
        // should use redirect(loginUrl) later
        window.location = '/#/logout'; // eslint-disable-line no-undef
      }
    };

    const account = {
      label: <p><FormattedMessage id="ACCOUNT_SETTINGS" /></p>,
      onClick: () => {
        window.location = `/#/${workspaceId}/settings/useraccount`; // eslint-disable-line no-undef
      }
    };

    const userItem = user ? { label: <p>{user.email}</p> } : null;
    const accountItem = user ? account : null;
    const authenticatedItem = authenticated ? logoutItem : loginItem;

    return [
      userItem,
      accountItem,
      authenticatedItem
    ];

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
