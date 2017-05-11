import React, { Component, PropTypes } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar, ActionbarButton } from '../../Actionbar';
import * as ActionbarActions from '../../../state/Actionbar/actions';
import * as CampaignEmailActions from '../../../state/Campaign/Email/actions';

class CampaignEmailActionbar extends Component {

  constructor(props) {
    super(props);
    this.buildActionElement = this.buildActionElement.bind(this);
  }

  componentWillReceiveProps(nextProps) {

    const {
      translations,
      campaignEmail,
      setBreadcrumb
    } = this.props;

    const {
      campaignEmail: newCampaignEmail
    } = nextProps;

    if (newCampaignEmail.id !== campaignEmail.id) {
      const breadcrumb1 = {
        name: translations.EMAIL_CAMPAIGNS
      };
      const breadcrumb2 = {
        name: newCampaignEmail.name
      };
      setBreadcrumb(0, [breadcrumb1, breadcrumb2]);
    }

  }

  render() {

    const actionElement = this.buildActionElement();

    return (
      <Actionbar {...this.props}>
        { actionElement }
      </Actionbar>
    );

  }

  buildActionElement() {
    const {
      campaignEmail,
      updateCampaignEmail
    } = this.props;

    const onClickElement = status => updateCampaignEmail(campaignEmail.id, {
      status
    });

    const activeCampaignElement = (
      <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button" onClick={() => onClickElement('ACTIVE')}>
        <Icon type="play-circle-o" />
        <FormattedMessage id="ACTIVE" />
      </ActionbarButton>
    );
    const pauseCampaignElement = (
      <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button" onClick={() => onClickElement('PAUSED')}>
        <Icon type="pause-circle-o" />
        <FormattedMessage id="PAUSED" />
      </ActionbarButton>
    );

    return (campaignEmail.status === 'PAUSED' || campaignEmail.status === 'PENDING') ? activeCampaignElement : pauseCampaignElement;
  }

}

CampaignEmailActionbar.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  campaignEmail: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  setBreadcrumb: PropTypes.func.isRequired,
  updateCampaignEmail: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  campaignEmail: state.campaignEmailState.campaignEmail
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb,
  updateCampaignEmail: CampaignEmailActions.updateCampaignEmail
};

CampaignEmailActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmailActionbar);

export default CampaignEmailActionbar;
