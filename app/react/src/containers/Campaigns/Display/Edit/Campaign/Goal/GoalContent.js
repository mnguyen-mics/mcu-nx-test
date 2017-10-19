import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';

import { EditContentLayout } from '../../../../../../components/Layout';
import GoalForm from './GoalForm';
import { withMcsRouter } from '../../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../../validators/proptypes';
import messages from './messages';


const formId = 'goalForm';

class CampaignContent extends Component {
  render() {
    const {
      editionMode,
      initialValues,
      intl: { formatMessage },
      match: {
        url,
      },
    } = this.props;


    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1)
      }
    ];

    let sidebarItems = {
      general: messages.sectionTitle1,
    };

    sidebarItems = {
      general: messages.sectionTitle1,
      goals: messages.sectionTitle2,
    };

    const buttonMetadata = {
      formId,
      message: messages.saveGoal,
      onClose: this.props.close
    };


    return (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={url}
      >

        <GoalForm
          closeNextDrawer={this.props.close}
          editionMode={editionMode}
          formId={formId}
          initialValues={initialValues}
          save={this.props.save}
          openNextDrawer={this.props.openNextDrawer}
        />
      </EditContentLayout>
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
  editionMode: PropTypes.bool,
  initialValues: PropTypes.shape(),
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
};


export default compose(
  injectIntl,
  withMcsRouter,
)(CampaignContent);
