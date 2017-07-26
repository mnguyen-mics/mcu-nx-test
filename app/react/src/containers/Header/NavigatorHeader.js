import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Layout, Menu, Dropdown, Popover, Row, Col } from 'antd';
// installed by react-router
import pathToRegexp from 'path-to-regexp'; // eslint-disable-line import/no-extraneous-dependencies

import { McsIcons } from '../../components/McsIcons';
import {
  getWorkspaces,
  getWorkspace
} from '../../state/Session/selectors';
import log from '../../utils/Logger';

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
      history
    } = this.props;

    const organisationId = params.organisationId;

    const organisationName = workspace(organisationId).organisation_name;

    const popoverContent = (
      <div>
        <p><Link to={{ pathname: `/v2/o/${organisationId}/settings`, search: '&tab=user_account' }} ><FormattedMessage id="ACCOUNT_SETTINGS" /></Link></p>
        <p><Link to="/logout"><FormattedMessage id="LOGOUT" /></Link></p>
      </div>
    );

    const hasMoreThanOneWorkspace = Object.keys(workspaces).length > 1;

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
            <span className="organisation-name">{ organisationName }</span>
            { hasMoreThanOneWorkspace &&
              <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                <a className="cascader-menu">
                  <McsIcons type="chevron" />
                </a>
              </Dropdown>
            }
          </Col>
          <Col span={2}>
            <Row>
              <Col span={12} className="icon-right-aligned">
                <Link to={{ pathname: `/v2/o/${organisationId}/settings`, search: '&tab=user_account' }}>
                  <McsIcons type="options" className="menu-icon" />
                </Link>
              </Col>
              <Col span={12} className="icon-right-aligned">
                <Popover placement="bottomRight" trigger="click" title={userEmail} content={popoverContent}>
                  <McsIcons type="user" className="menu-icon" />
                </Popover>
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
};

const mapStateToProps = state => ({
  workspaces: getWorkspaces(state),
  workspace: getWorkspace(state),
  userEmail: state.session.connectedUser.email
});

const mapDispatchToProps = {

};

NavigatorHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigatorHeader);

NavigatorHeader = withRouter(NavigatorHeader);

export default NavigatorHeader;
