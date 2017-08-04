import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { compose } from 'recompose';
// import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
// import { pick } from 'lodash';
// import { Link } from 'react-router-dom';
import { Layout, Form } from 'antd';
// import { injectIntl, intlShape } from 'react-intl';

import EditContentLayout from '../../../../components/Layout/EditContentLayout';
import { withMcsRouter } from '../../../Helpers';

import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import messages from './messages';

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
      general: 'General Settings',
      audience: 'Audience',
      device: 'Device Targeting',
      location: 'Location Targeting',
      publisher: 'Publisher',
      media: 'Media Content',
      optimization: 'Optimization',
      ads: 'Ads',
      summary: 'Summary',
    };

    const submitMetadata = {
      disabled: false,
      onClick: () => {},
      message: messages.saveAdGroup,
    };

    return (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        submitMetadata={submitMetadata}
        url={url}
      >
        <Content id="adBlockCampaignSteps">
          <div id="general">pouet</div>
        </Content>
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
