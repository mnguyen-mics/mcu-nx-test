import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { isSubmitting } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../components/Layout';
import AdGroupForm from './AdGroupForm';
import { withMcsRouter } from '../../../../Helpers';
import * as SessionHelper from '../../../../../state/Session/selectors';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';
import { Loading } from '../../../../../components';
import { formatMetric } from '../../../../../utils/MetricHelper';

const formId = 'adGroupForm';

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
    hasDatamarts,
    history,
    location,
    initialValues,
    intl: { formatMessage },
    loading,
    match: {
      params: { campaignId, organisationId },
      url,
    },
    submitting,
  } = this.props;

    const displayAudience = hasDatamarts(organisationId);

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

    let sidebarItems = {
      general: messages.sectionTitle1,
    };

    if (displayAudience) {
      sidebarItems.audience = messages.sectionTitle2;
    }

    sidebarItems = {
      ...sidebarItems,
      deviceAndLocation: messages.sectionTitle3,
      publisher: messages.sectionTitle4,
      media: messages.sectionTitle5,
      optimization: messages.sectionTitle6,
      ads: messages.sectionTitle7,
    };

    sidebarItems = (editionMode
      ? { summary: messages.sectionTitle8, ...sidebarItems }
      : { ...sidebarItems, summary: messages.sectionTitle8 }
    );

    const buttonMetadata = {
      formId,
      message: messages.saveAdGroup,
      onClose: () => (location.state && location.state.from
        ? history.push(location.state.from)
        : history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}`)
      ),
    };

    const formValues = {
      adGroupMaxBudgetPeriod: 'DAY',
      ...initialValues,
      adGroupMaxBudgetPerPeriod: formatMetric(initialValues.adGroupMaxBudgetPerPeriod, '0,0'),
      adGroupTotalBudget: formatMetric(initialValues.adGroupTotalBudget, '0,0'),
    };

    return (
      <div className="ant-layout">
        { (loading || submitting) &&
          <Loading className={loading || submitting ? 'loading-full-screen' : 'hide-section'} />
        }

        <div className={(!loading && !submitting ? 'ant-layout' : 'hide-section')}>
          <EditContentLayout
            breadcrumbPaths={breadcrumbPaths}
            sidebarItems={sidebarItems}
            buttonMetadata={buttonMetadata}
            url={url}
          >
            <AdGroupForm
              closeNextDrawer={this.props.closeNextDrawer}
              displayAudience={displayAudience}
              editionMode={editionMode}
              formId={formId}
              initialValues={formValues}
              openNextDrawer={this.props.openNextDrawer}
            />
          </EditContentLayout>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  hasDatamarts: SessionHelper.hasDatamarts(state),
  submitting: isSubmitting(formId)(state),
});

AdGroupContent.defaultProps = {
  editionMode: false,
  initialValues: {},
  loading: false,
  submitting: false,
};

AdGroupContent.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  editionMode: PropTypes.bool,
  hasDatamarts: PropTypes.func.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.shape(),
  intl: intlShape.isRequired,
  location: PropTypes.shape().isRequired,
  loading: PropTypes.bool,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(mapStateToProps),
)(AdGroupContent);
