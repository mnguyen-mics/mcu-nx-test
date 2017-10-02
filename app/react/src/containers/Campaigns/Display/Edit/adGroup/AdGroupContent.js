import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../components/Layout';
import AdGroupForm from './AdGroupForm';
import { withMcsRouter } from '../../../../Helpers';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';

class AdGroupContent extends Component {

  state = {
    campaignName: '',
  }

  componentDidMount() {
    DisplayCampaignService.getCampaignName(this.props.match.params.campaignId)
      .then((campaignName) => {
        this.setState({ campaignName });
      });
  }

  render() {
    const {
    editionMode,
    history,
    initialValues,
    intl: { formatMessage },
    match: {
      params: { campaignId, organisationId },
      url,
    },
  } = this.props;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1),
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
      {
        name: this.state.campaignName,
        url: `/v2/o/${organisationId}/campaigns/display/${campaignId}`,
      },
      { name: (editionMode
        ? initialValues.adGroupName
        : formatMessage(messages.breadcrumbTitle2))
      },
    ];

    const sidebarItems = {
      general: messages.sectionTitle1,
      audience: messages.sectionTitle2,
      deviceAndLocation: messages.sectionTitle3,
      publisher: messages.sectionTitle4,
      media: messages.sectionTitle5,
      optimization: messages.sectionTitle6,
      ads: messages.sectionTitle7,
      summary: messages.sectionTitle8,
    };

    const formId = 'adGroupForm';

    const buttonMetadata = {
      formId,
      message: messages.saveAdGroup,
      onClose: () => history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}`),
    };

    return (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={url}
      >
        <AdGroupForm
          closeNextDrawer={this.props.closeNextDrawer}
          editionMode={editionMode}
          formId={formId}
          initialValues={{ adGroupMaxBudgetPeriod: 'DAY', ...initialValues }}
          openNextDrawer={this.props.openNextDrawer}
        />
      </EditContentLayout>
    );
  }
}

AdGroupContent.defaultProps = {
  editionMode: false,
  initialValues: {},
};

AdGroupContent.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  editionMode: PropTypes.bool,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.shape(),
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
)(AdGroupContent);
