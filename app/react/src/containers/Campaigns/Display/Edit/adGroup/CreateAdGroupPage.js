import React, { Component } from 'react';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../components/Layout';
import AdGroupForm from './AdGroupForm';
import { withMcsRouter } from '../../../../Helpers';

import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';


class CreateAdGroupPage extends Component {

  render() {
    const {
      match: { url },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1),
        url: '/v2/o/1218/campaigns/email', // TODO
      },
      {
        name: formatMessage(messages.breadcrumbTitle2),
        url: '/v2/o/1218/campaigns/email', // TODO
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

    const initialValues = {
      adGroupBudgetSplitPeriod: 'Per Day',
      // audienceTable
    };


    return (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={url}
      >
        <AdGroupForm formId={formId} initialValues={initialValues} />
      </EditContentLayout>
    );
  }
}

CreateAdGroupPage.propTypes = {
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
)(CreateAdGroupPage);
