import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../../Actionbar';
import messages from '../messages';

class AdGroupActionbar extends Component {

  buildActionElement = () => {
    const {
      adGroup,
      updateAdGroup,
    } = this.props;

    const onClickElement = status => updateAdGroup(adGroup.id, {
      status,
      type: 'DISPLAY',
    });

    const activeCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={() => onClickElement('ACTIVE')}>
        <Icon type="play-circle-o" />
        <FormattedMessage {...messages.activateAdGroup} />
      </Button>
    );
    const pauseCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={() => onClickElement('PAUSED')}>
        <Icon type="pause-circle-o" />
        <FormattedMessage {...messages.pauseAdGroup} />
      </Button>
    );

    return adGroup.id ? ((adGroup.status === 'PAUSED' || adGroup.status === 'PENDING') ? activeCampaignElement : pauseCampaignElement) : null;
  }

  buildMenu = () => {

    const {
      translations,
      adGroup,
      archiveAdGroup,
    } = this.props;

    const handleArchiveGoal = displayCampaignId => {
      Modal.confirm({
        title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
        content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
        iconType: 'exclamation-circle',
        okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
        cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
        onOk() {
          return archiveAdGroup(displayCampaignId);
        },
        onCancel() { },
      });
    };

    const onClick = event => {
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(adGroup.id);
        default:
          return () => {};
      }
    };

    const addMenu = (
      <Menu onClick={onClick}>
        <Menu.Item key="ARCHIVED">
          <FormattedMessage {...messages.archiveAdGroup} />
        </Menu.Item>
      </Menu>
    );

    return addMenu;
  }

  render() {

    const {
      match: {
        params: {
          organisationId,
          campaignId,
          adGroupId,
        },
      },
      adGroup,
      displayCampaign,
      intl: {
        formatMessage,
      },
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: formatMessage(messages.display), url: `/v2/o/${organisationId}/campaigns/display`, key: formatMessage(messages.display) },
      { name: displayCampaign.name, url: `/v2/o/${organisationId}/campaigns/display/${campaignId}`, key: displayCampaign.id },
      { name: adGroup.name, key: adGroup.id },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        { actionElement }
        <Link
          to={{
            pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/edit/${adGroupId}`,
            state: { goBack: true },
          }}
        >
          <Button>
            <Icon type="edit" />
            <FormattedMessage {...messages.editAdGroup} />
          </Button>
        </Link>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <Icon type="ellipsis" />
          </Button>
        </Dropdown>
      </Actionbar>
    );

  }
}

AdGroupActionbar.propTypes = {
  translations: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,
  adGroup: PropTypes.shape().isRequired,
  displayCampaign: PropTypes.shape().isRequired,
  updateAdGroup: PropTypes.func.isRequired,
  archiveAdGroup: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
});

const mapDispatchToProps = {
};

AdGroupActionbar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdGroupActionbar);

AdGroupActionbar = compose(
  injectIntl,
  withRouter,
)(AdGroupActionbar);

export default AdGroupActionbar;
