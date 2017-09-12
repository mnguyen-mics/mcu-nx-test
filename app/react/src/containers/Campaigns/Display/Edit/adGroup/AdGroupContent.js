import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../components/Layout';
import AdGroupForm from './AdGroupForm';
import { withMcsRouter } from '../../../../Helpers';

import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';


function AdGroupContent({
  editionMode,
  initialValues,
  intl: { formatMessage },
  match: {
    params: { campaignId, organisationId },
    url,
  },
}) {

  const breadcrumbPaths = [
    {
      name: formatMessage(messages.breadcrumbTitle1),
      url: `/v2/o/${organisationId}/campaigns/display`,
    },
    {
      name: formatMessage(messages.breadcrumbTitle2), // TODO: add title (now: XXXXXXXXXX)
      url: `/v2/o/${organisationId}/campaigns/display/${campaignId}`,
    },
      { name: formatMessage(messages.breadcrumbTitle3) },
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
    onClose: () => {},
  };

  return (
    <EditContentLayout
      breadcrumbPaths={breadcrumbPaths}
      sidebarItems={sidebarItems}
      buttonMetadata={buttonMetadata}
      url={url}
    >
      <AdGroupForm
        editionMode={editionMode}
        formId={formId}
        initialValues={initialValues}
      />
    </EditContentLayout>
  );
}

AdGroupContent.defaultProps = {
  editionMode: false,

  initialValues: {
    adGroupBudgetSplitPeriod: 'Per Day',
  },
};

AdGroupContent.propTypes = {
  editionMode: PropTypes.bool,
  initialValues: PropTypes.shape(),
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
)(AdGroupContent);
