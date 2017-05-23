import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar, ActionbarButton } from '../../Actionbar';
import * as ActionbarActions from '../../../state/Actionbar/actions';
import { Icons } from '../../../components/Icons';

class CampaignsDisplayActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.AUDIENCE_SEGMENTS
    };

    setBreadcrumb(0, [breadcrumb]);

  }

  render() {

    const {
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const addMenu = (
      <Menu>
        <Menu.Item key="USER_LIST">
          <Link to={`${organisationId}/datamart/segments/USER_LIST`}>
            <FormattedMessage id="USER_LIST" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_QUERY">
          <Link to={`${organisationId}/datamart/segments/USER_QUERY`}>
            <FormattedMessage id="USER_QUERY" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_LOOK_ALIKE">
          <Link to={`${organisationId}/datamart/segments/USER_LOOK_ALIKE`}>
            <FormattedMessage id="USER_LOOK_ALIKE" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar {...this.props}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button">
            <Icons type="plus" /> <FormattedMessage id="NEW_SEGMENT" />
          </ActionbarButton>
        </Dropdown>
      </Actionbar>
    );

  }

}

CampaignsDisplayActionbar.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  setBreadcrumb: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

CampaignsDisplayActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsDisplayActionbar);

export default CampaignsDisplayActionbar;
