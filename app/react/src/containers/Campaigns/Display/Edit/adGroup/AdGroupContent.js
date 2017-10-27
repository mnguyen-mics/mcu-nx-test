import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { isSubmitting } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../components/Layout/index.ts';
import AdGroupForm from './AdGroupForm';
import { withMcsRouter } from '../../../../Helpers';
import * as SessionHelper from '../../../../../state/Session/selectors';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';
import { Loading } from '../../../../../components/index.ts';

const formId = 'adGroupForm';

// TODO: remove TEMPDATA
const webPlacements = [
  { id: '21', checked: true, icon: 'http://is3.mzstatic.com/image/thumb/Purple71/v4/08/de/87/08de8741-4a7f-19c2-ccf0-0d5fb0681d88/source/175x175bb.jpg', name: 'liberation', text: 'Libération', type: 'web' },
  { id: '22', checked: false, icon: 'https://cdn6.aptoide.com/imgs/3/2/1/3216b5660a628c7d6a82b47f6f4a3856_icon.png?w=240', name: 'voici', text: 'Voici', type: 'web' },
  { id: '23', checked: false, icon: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/Gala_1993_logo.svg/800px-Gala_1993_logo.svg.png', name: 'gala', text: 'Gala', type: 'web' },
  { id: '24', checked: true, icon: 'http://is3.mzstatic.com/image/thumb/Purple71/v4/08/de/87/08de8741-4a7f-19c2-ccf0-0d5fb0681d88/source/175x175bb.jpg', name: 'journalmickey', text: 'Journal de Mickey', type: 'web' },
  { id: '25', checked: false, icon: 'https://cdn6.aptoide.com/imgs/3/2/1/3216b5660a628c7d6a82b47f6f4a3856_icon.png?w=240', name: 'jebouquine', text: 'Je Bouquine', type: 'web' },
  { id: '26', checked: false, icon: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/Gala_1993_logo.svg/800px-Gala_1993_logo.svg.png', name: 'telerama', text: 'Telerama', type: 'web' },
  { id: '27', checked: true, icon: 'http://is3.mzstatic.com/image/thumb/Purple71/v4/08/de/87/08de8741-4a7f-19c2-ccf0-0d5fb0681d88/source/175x175bb.jpg', name: 'lemonde', text: 'Le Monde', type: 'web' },
  { id: '28', checked: false, icon: 'https://cdn6.aptoide.com/imgs/3/2/1/3216b5660a628c7d6a82b47f6f4a3856_icon.png?w=240', name: 'canardenchaine', text: 'Le Canard Enchaîné', type: 'web' },
  { id: '29', checked: false, icon: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/Gala_1993_logo.svg/800px-Gala_1993_logo.svg.png', name: 'newyorktimes', text: 'The New York Times', type: 'web' },
];

const mobilePlacements = [
  { id: '10', checked: true, icon: 'http://is3.mzstatic.com/image/thumb/Purple71/v4/08/de/87/08de8741-4a7f-19c2-ccf0-0d5fb0681d88/source/175x175bb.jpg', name: 'liberation', text: 'Libération', type: 'mobile' },
  { id: '11', checked: false, icon: 'https://cdn6.aptoide.com/imgs/3/2/1/3216b5660a628c7d6a82b47f6f4a3856_icon.png?w=240', name: 'voici', text: 'Voici', type: 'mobile' },
  { id: '12', checked: false, icon: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/Gala_1993_logo.svg/800px-Gala_1993_logo.svg.png', name: 'gala', text: 'Gala', type: 'mobile' },
  { id: '13', checked: true, icon: 'http://is3.mzstatic.com/image/thumb/Purple71/v4/08/de/87/08de8741-4a7f-19c2-ccf0-0d5fb0681d88/source/175x175bb.jpg', name: 'journalmickey', text: 'Journal de Mickey', type: 'mobile' },
  { id: '14', checked: false, icon: 'https://cdn6.aptoide.com/imgs/3/2/1/3216b5660a628c7d6a82b47f6f4a3856_icon.png?w=240', name: 'jebouquine', text: 'Je Bouquine', type: 'mobile' },
  { id: '15', checked: false, icon: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/Gala_1993_logo.svg/800px-Gala_1993_logo.svg.png', name: 'telerama', text: 'Telerama', type: 'mobile' },
  { id: '16', checked: true, icon: 'http://is3.mzstatic.com/image/thumb/Purple71/v4/08/de/87/08de8741-4a7f-19c2-ccf0-0d5fb0681d88/source/175x175bb.jpg', name: 'lemonde', text: 'Le Monde', type: 'mobile' },
  { id: '17', checked: false, icon: 'https://cdn6.aptoide.com/imgs/3/2/1/3216b5660a628c7d6a82b47f6f4a3856_icon.png?w=240', name: 'canardenchaine', text: 'Le Canard Enchaîné', type: 'mobile' },
  { id: '18', checked: false, icon: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/Gala_1993_logo.svg/800px-Gala_1993_logo.svg.png', name: 'newyorktimes', text: 'The New York Times', type: 'mobile' },
];

class AdGroupContent extends Component {

  state = {
    campaignName: '',
  }

  componentDidMount() {
    DisplayCampaignService.getCampaignName(this.props.match.params.campaignId)
      .then((campaignName) => {
        this.setState({ campaignName });
      }).catch(() => {
        this.setState({ campaignName: 'New Campaign' });
      });
  }

  render() {
    const {
      editionMode,
      hasDatamarts,
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
      general: messages.sectionTitleGeneral,
    };

    if (displayAudience) {
      sidebarItems.audience = messages.sectionTitleAudience;
    }

    sidebarItems = {
      ...sidebarItems,
      locationTargeting: messages.sectionTitleLocationTargeting,
      device: messages.sectionTitleDevice,
      media: messages.sectionTitleMedia,
      publisher: messages.sectionTitlePublisher,
      placement: messages.sectionTitlePlacement,
      ads: messages.sectionTitleAds,
      optimization: messages.sectionTitleOptimizer,
      summary: messages.sectionTitleSummary,
    };

    sidebarItems = (editionMode
      ? { summary: messages.sectionTitleSummary, ...sidebarItems }
      : { ...sidebarItems, summary: messages.sectionTitleSummary }
    );

    const buttonMetadata = {
      formId,
      message: messages.saveAdGroup,
      onClose: this.props.onClose,
    };

    const formValues = {
      adGroupMaxBudgetPeriod: 'DAY',
      ...initialValues,
      adGroupMaxBudgetPerPeriod: initialValues.adGroupMaxBudgetPerPeriod || '',
      adGroupTotalBudget: initialValues.adGroupTotalBudget || '',
      adGroupMaxBidPrice: initialValues.adGroupMaxBidPrice || '',
      adGroupTotalImpressionCapping: initialValues.adGroupTotalImpressionCapping || '',
      adGroupPerDayImpressionCapping: initialValues.adGroupPerDayImpressionCapping || '',
      placements: {
        mobile: mobilePlacements, // TODO: remove temp data
        web: webPlacements, // TODO: remove temp data
      },
      adGroupDeviceType: ['1', '2'] // TODO: remove temp data
    };

    return (
      <div className="ant-layout">
        { (loading || submitting) &&
          <Loading className={'loading-full-screen'} />
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
              save={this.props.save}
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
  initialValues: PropTypes.shape(),
  intl: intlShape.isRequired,
  loading: PropTypes.bool,
  match: ReactRouterPropTypes.match.isRequired,
  onClose: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  save: PropTypes.func.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(mapStateToProps),
)(AdGroupContent);
