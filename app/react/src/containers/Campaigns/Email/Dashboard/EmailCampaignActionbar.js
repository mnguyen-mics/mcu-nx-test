import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import messages from '../messages';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import modalMessages from '../../../../common/messages/modalMessages';
import ExportService from '../../../../services/ExportService';
import { Actionbar } from '../../../Actionbar';
import * as EmailCampaignActions from '../../../../state/Campaign/Email/actions';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import McsIcons from '../../../../components/McsIcons';

class EmailCampaignActionbar extends Component {

  handleRunExport = () => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      intl: { formatMessage },
      location: { search },
      campaign,
      blastsStats
    } = this.props;

    const filter = parseSearch(search, null);
    ExportService.exportEmailCampaignDashboard(organisationId, [campaign], blastsStats, filter, formatMessage);
  };

  buildActionElement = () => {
    const {
      campaign,
      updateCampaign
    } = this.props;

    const onClickElement = status => updateCampaign(campaign.id, {
      status,
      type: 'EMAIL'
    });

    const activeCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={() => onClickElement('ACTIVE')}>
        <Icon type="play-circle-o" />
        <FormattedMessage id="ACTIVATE_CAMPAIGN" />
      </Button>
    );

    const pauseCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={() => onClickElement('PAUSED')}>
        <Icon type="pause-circle-o" />
        <FormattedMessage id="PAUSE_CAMPAIGN" />
      </Button>
    );

    if (!campaign.id) {
      return null;
    }

    return (campaign.status === 'PAUSED' || campaign.status === 'PENDING'
        ? activeCampaignElement
        : pauseCampaignElement
    );
  };

  buildMenu = () => {
    const {
      campaign,
      archiveCampaign,
      intl: { formatMessage }
    } = this.props;

    const handleArchiveGoal = displayCampaignId => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveCampaignConfirm),
        content: formatMessage(modalMessages.archiveCampaignMessage),
        iconType: 'exclamation-circle',
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk() {
          return archiveCampaign(displayCampaignId);
        },
        onCancel() { },
      });
    };

    const onClick = event => {
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(campaign.id);
        default:
          return () => {};
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="ARCHIVED">
          <FormattedMessage id="ARCHIVED" />
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const {
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
      intl: { formatMessage },
      campaign,
      isFetchingStats
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: formatMessage(messages.email), url: `/v2/o/${organisationId}/campaigns/email` },
      { name: campaign.name },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        { actionElement }
        <Button onClick={this.handleRunExport}>
          { !isFetchingStats && <McsIcons type="download" /> }<FormattedMessage id="EXPORT" />
        </Button>
        <Link to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/edit`}>
          <Button>
            <Icon type="edit" />
            <FormattedMessage id="EDIT" />
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

EmailCampaignActionbar.propTypes = {
  intl: intlShape.isRequired,
  match: PropTypes.shape().isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  campaign: PropTypes.shape().isRequired,
  updateCampaign: PropTypes.func.isRequired,
  archiveCampaign: PropTypes.func.isRequired,
  isFetchingStats: PropTypes.bool.isRequired,
  blastsStats: PropTypes.arrayOf(PropTypes.object).isRequired
};

const mapDispatchToProps = {
  updateCampaign: EmailCampaignActions.updateEmailCampaign.request,
  archiveCampaign: EmailCampaignActions.archiveEmailCampaign.request
};

EmailCampaignActionbar = compose(
  withRouter,
  injectIntl,
  connect(
    undefined,
    mapDispatchToProps
  )
)(EmailCampaignActionbar);

export default EmailCampaignActionbar;
