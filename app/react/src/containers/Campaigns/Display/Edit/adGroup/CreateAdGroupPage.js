import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { compose } from 'recompose';
// import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
// import { pick } from 'lodash';
// import { Link } from 'react-router-dom';
import { Form, Layout, Row } from 'antd';
// import { injectIntl, intlShape } from 'react-intl';

import EditContentLayout from '../../../../../components/Layout/EditContentLayout';
import AdGroupEditor from './AdGroupEditor';
import { withMcsRouter } from '../../../../Helpers';

import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';

const { Content } = Layout;


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
      device: messages.sectionTitle3,
      location: messages.sectionTitle4,
      publisher: messages.sectionTitle5,
      media: messages.sectionTitle6,
      optimization: messages.sectionTitle7,
      ads: messages.sectionTitle8,
      summary: messages.sectionTitle9,
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
        <AdGroupEditor />
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
