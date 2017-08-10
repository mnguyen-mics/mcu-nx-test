import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { compose } from 'recompose';
// import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
// import { pick } from 'lodash';
// import { Link } from 'react-router-dom';
// import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../components/Layout';
import AdGroupForm from './AdGroupForm';
import { withMcsRouter } from '../../../../Helpers';

import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';


class CreateAdGroupPage extends Component {
  // constructor(props) {
  //   super(props);
  //   this.createEmailCampaign = this.createEmailCampaign.bind(this);
  //   this.redirect = this.redirect.bind(this);
  // }

  render() {
    const {
      match: { url },
      // organisationId,
      intl: { formatMessage }
    } = this.props;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1),
        url: '/v2/o/1218/campaigns/email' // TODO
      },
      {
        name: formatMessage(messages.breadcrumbTitle2),
        url: '/v2/o/1218/campaigns/email' // TODO
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

    const buttonMetadata = {
      disabled: false,
      onClick: () => {},
      message: messages.saveAdGroup,
    };

    return (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        scrollId="adBlockCampaignSteps"
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={url}
      >
        <AdGroupForm />
      </EditContentLayout>
    );
  }
}

CreateAdGroupPage.propTypes = {
  // organisationId: PropTypes.string.isRequired,
  // // history: ReactRouterPropTypes.history.isRequired,
  // openNextDrawer: PropTypes.func.isRequired,
  // closeNextDrawer: PropTypes.func.isRequired,
  // notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
  // connect(
  //   undefined,
  //   { notifyError: actions.notifyError }
  // ),
  // withDrawer,
)(CreateAdGroupPage);
