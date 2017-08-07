import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Layout, Menu, Dropdown, Row, Col } from 'antd';
// installed by react-router
import pathToRegexp from 'path-to-regexp'; // eslint-disable-line import/no-extraneous-dependencies
import * as SessionHelper from '../../state/Session/selectors';

import { McsIcons } from '../../components/McsIcons';
import {
  getWorkspaces,
  getWorkspace
} from '../../state/Session/selectors';
import log from '../../utils/Logger';
import messages from './messages';

const { Header } = Layout;

class NavigatorHeader extends Component {

  render() {

    const {
      match: {
        params,
        path,
      },
      workspaces,
      workspace,
      userEmail,
      history,
      hasDatamarts
    } = this.props;

    const organisationId = params.organisationId;
    const organisationName = workspace(organisationId).organisation_name;

    const hasMoreThanOneWorkspace = Object.keys(workspaces).length > 1;

    const accountMenu = (
      <Menu>
        <Menu.Item key="email" disabled>{userEmail}</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="account"><Link to={{ pathname: `/v2/o/${organisationId}/account`, search: '&tab=user_account' }}><FormattedMessage {...messages.account} /></Link></Menu.Item>
        <Menu.Item key="logout"><Link to="/logout"><FormattedMessage id="LOGOUT"/></Link></Menu.Item>
      </Menu>
    );

    const changeWorkspace = ({ key }) => {
      const toPath = pathToRegexp.compile(path);
      const fullUrl = toPath({
        ...params,
        organisationId: key
      });
      log.debug(`Change workspace, redirect to ${fullUrl}`);
      history.push(fullUrl);
    };

    const menu = (
      <Menu onClick={changeWorkspace}>
        {
          Object.keys(workspaces).map(orgId => <Menu.Item key={orgId}>{workspaces[orgId].organisation_name}</Menu.Item>)
        }
      </Menu>
    );

    return (
      <Header className="mcs-header">
        <Row>
          <Col span={22}>
            {
              hasMoreThanOneWorkspace
                ? <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft"><a className="organisation-name-clickable">{ organisationName }&nbsp;<McsIcons type="chevron"/></a></Dropdown>
                : <span className="organisation-name">{ organisationName }</span>
            }
          </Col>
          <Col span={2}>
            <Row >
              <Col span={12} className="icon-right-align">
                {
                  hasDatamarts(organisationId) &&
                  <Link to={{ pathname: `/v2/o/${organisationId}/settings`, search: 'tab=sites' }}>
                    <McsIcons type="options" className="menu-icon"/>
                  </Link>
                }
              </Col>
              <Col span={12} className="icon-right-align">
                <Dropdown overlay={accountMenu} trigger={['click']} placement="bottomRight">
                  <a><McsIcons type="user" className="menu-icon "/></a>
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Row>
      </Header>
    );
  }
}

NavigatorHeader.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workspace: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  workspaces: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  userEmail: PropTypes.string.isRequired,
  hasDatamarts: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  workspaces: getWorkspaces(state),
  workspace: getWorkspace(state),
  userEmail: state.session.connectedUser.email,
  hasDatamarts: SessionHelper.hasDatamarts(state)
});

NavigatorHeader = connect(
  mapStateToProps
)(NavigatorHeader);

NavigatorHeader = withRouter(NavigatorHeader);

export default NavigatorHeader;
