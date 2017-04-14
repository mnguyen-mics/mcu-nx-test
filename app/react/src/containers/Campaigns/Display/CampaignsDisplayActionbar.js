import React, { Component, PropTypes } from 'react';
import { Menu, Dropdown, Button, Icon, Checkbox } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar, ActionbarButton, SecondaryActionbar } from '../../Actionbar';
import { ActionbarActions } from '../../Actionbar/redux';

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
      },
      filters,
      archived,
      onArchivedCheckboxChange,
      handleChange,
      handleVisibleChange
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

    const statusMenu = (
      <Menu onClick={value => handleChange('status', value, true)}>
        <Menu.Item key="ACTIVE">
          <FormattedMessage id="ACTIVE" />
        </Menu.Item>
        <Menu.Item key="PENDING">
          <FormattedMessage id="PENDING" />
        </Menu.Item>
        <Menu.Item key="PAUSED">
          <FormattedMessage id="PAUSED" />
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar {...this.props}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button">
            <Icon type="plus" />
          </ActionbarButton>
        </Dropdown>

        <ActionbarButton secondaryBar="filterActionBar">
          <Icon type="filter" />
        </ActionbarButton>

        <SecondaryActionbar id="filterActionBar">
          <div className="mcs-actionbar-button-wrapper">
            <Dropdown overlay={statusMenu} trigger={['click']} onVisibleChange={visible => handleVisibleChange('status', visible)} visible={filters.status.visible}>
              <Button>
                <FormattedMessage id="STATUS" />
                <Icon type="down" />
              </Button>
            </Dropdown>
          </div>

          <div className="mcs-actionbar-button-wrapper">
            <Checkbox className="mcs-campaigns-checkbox" checked={archived} onChange={onArchivedCheckboxChange}>
              <FormattedMessage id="ARCHIVED" />
            </Checkbox>
          </div>
        </SecondaryActionbar>

      </Actionbar>
    );

  }

}

CampaignsDisplayActionbar.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  archived: PropTypes.bool.isRequired,
  setBreadcrumb: PropTypes.func.isRequired,
  onArchivedCheckboxChange: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleVisibleChange: PropTypes.func.isRequired
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
