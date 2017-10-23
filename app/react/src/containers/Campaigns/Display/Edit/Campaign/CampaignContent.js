import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { isSubmitting } from 'redux-form';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../components/Layout/index.ts';
import CampaignForm from './CampaignForm';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from './messages';
import { Loading } from '../../../../../components/index.ts';


const formId = 'campaignForm';

class CampaignContent extends Component {
  render() {
    const {
      editionMode,
      history,
      location,
      initialValues,
      intl: { formatMessage },
      loading,
      match: {
        params: { organisationId },
        url
      },
      submitting,
    } = this.props;


    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1),
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
      {
        name: 'Create new Campaign',
        url: `/v2/o/${organisationId}/campaigns/display`,
      }
    ];

    let sidebarItems = {
      general: messages.sectionTitle1,
    };

    sidebarItems = {
      general: messages.sectionTitle1,
      goals: messages.sectionTitle2,
      adGroups: messages.sectionTitle3,
    };

    const buttonMetadata = {
      formId,
      message: messages.saveAdGroup,
      onClose: () => (location.state && location.state.goBack
            ? history.goBack()
            : history.push(`/v2/o/${organisationId}/campaigns/display`)
          )
    };

    return (
      <Layout>
        {(submitting || loading) ?

        (<Loading className="loading-full-screen" />) :

        (<div className="ant-layout">
          <EditContentLayout
            breadcrumbPaths={breadcrumbPaths}
            sidebarItems={sidebarItems}
            buttonMetadata={buttonMetadata}
            url={url}
          >
            <CampaignForm
              closeNextDrawer={this.props.closeNextDrawer}
              editionMode={editionMode}
              formId={formId}
              initialValues={initialValues}
              openNextDrawer={this.props.openNextDrawer}
            />
          </EditContentLayout>
        </div>)}
      </Layout>
    );
  }
}

CampaignContent.defaultProps = {
  editionMode: false,
  initialValues: {},
  loading: false,
  submitting: false,
};

CampaignContent.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  editionMode: PropTypes.bool,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.shape(),
  intl: intlShape.isRequired,
  location: PropTypes.shape().isRequired,
  loading: PropTypes.bool,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  submitting: isSubmitting(formId)(state),
});

export default compose(
  injectIntl,
  withMcsRouter,
  connect(mapStateToProps),
)(CampaignContent);
