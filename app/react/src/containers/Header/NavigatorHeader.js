import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Layout, Menu, Dropdown, Row, Col } from 'antd';

import * as SessionHelper from '../../state/Session/selectors';
import McsIcon from '../../components/McsIcon.tsx';
import messages from './messages';

const { Header } = Layout;

function NavigatorHeader({
  match: {
    params,
  },
  workspace,
  userEmail,
}) {

  const organisationId = params.organisationId;
  const organisationName = workspace(organisationId).organisation_name;

  const accountMenu = (
    <Menu>
      <Menu.Item key="email" disabled>{userEmail}</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="account">
        <Link
          to={{
            pathname: `/v2/o/${organisationId}/account`,
            search: '&tab=user_account',
          }}
        >
          <FormattedMessage {...messages.account} />
        </Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <Link to="/logout">
          <FormattedMessage id="LOGOUT" />
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="mcs-header">
      <Row>
        <Col span={22}>
          {
            <span className="organisation-name">{ organisationName }</span>
          }
        </Col>
        <Col span={2}>
          <Row >
            <Col span={12} className="icon-right-align">
              <Link to={{ pathname: `/v2/o/${organisationId}/settings`, search: 'tab=labels' }}>
                <McsIcon type="options" className="menu-icon" />
              </Link>
            </Col>
            <Col span={12} className="icon-right-align">
              <Dropdown overlay={accountMenu} trigger={['click']} placement="bottomRight">
                <a><McsIcon type="user" className="menu-icon" /></a>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  );
}

NavigatorHeader.propTypes = {
  match: PropTypes.shape().isRequired,
  workspace: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  workspace: SessionHelper.getWorkspace(state),
  userEmail: state.session.connectedUser.email,
  hasDatamarts: SessionHelper.hasDatamarts(state),
});

const ConnectedNavigatorHeader = connect(
  mapStateToProps,
)(NavigatorHeader);

export default withRouter(ConnectedNavigatorHeader);
