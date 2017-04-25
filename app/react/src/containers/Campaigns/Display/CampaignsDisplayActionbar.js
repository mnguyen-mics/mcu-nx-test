import React, { Component, PropTypes } from 'react';
import { Menu, Dropdown, Icon } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar, ActionbarButton } from '../../Actionbar';
import * as ActionbarActions from '../../../state/Actionbar/actions';

class CampaignsDisplayActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.DISPLAY_CAMPAIGNS
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
        <Menu.Item key="DESKTOP_AND_MOBILE">
          <Link to={`${organisationId}/campaigns/display/expert/edit/T1`}>
            <FormattedMessage id="DESKTOP_AND_MOBILE" />
          </Link>
        </Menu.Item>
        <Menu.Item key="SIMPLIFIED_KEYWORDS_TARGETING">
          <Link to={`${organisationId}/campaigns/display/keywords`}>
            <FormattedMessage id="SIMPLIFIED_KEYWORDS_TARGETING" />
          </Link>
        </Menu.Item>
        <Menu.Item key="EXTERNAL_CAMPAIGN">
          <Link to={`${organisationId}/campaigns/display/external/edit/T1`}>
            <FormattedMessage id="EXTERNAL_CAMPAIGN" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar {...this.props}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button">
            <Icon type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
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
