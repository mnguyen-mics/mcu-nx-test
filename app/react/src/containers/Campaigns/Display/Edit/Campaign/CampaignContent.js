import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { isSubmitting } from 'redux-form';
import { Layout } from 'antd';
import { injectIntl } from 'react-intl';

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
      loading,
      match: {
        params: { organisationId },
        url
      },
      submitting,
      breadcrumbPaths,
    } = this.props;

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
            : history.push(`/v2/o/${organisationId}/campaigns/display/`)
          )
    };

    return (
      <Layout>
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
            <CampaignForm
              closeNextDrawer={this.props.closeNextDrawer}
              editionMode={editionMode}
              formId={formId}
              initialValues={initialValues}
              openNextDrawer={this.props.openNextDrawer}
            />
          </EditContentLayout>
        </div>
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
  location: PropTypes.shape().isRequired,
  loading: PropTypes.bool,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
  })).isRequired,
};

const mapStateToProps = (state) => ({
  submitting: isSubmitting(formId)(state),
});

export default compose(
  injectIntl,
  withMcsRouter,
  connect(mapStateToProps),
)(CampaignContent);
