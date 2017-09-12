import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  arrayInsert,
  arrayPush,
  arrayRemove,
  Form,
  getFormValues,
  reduxForm
} from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { isEqual } from 'lodash';

import {
  Ads,
  Audience,
  DeviceAndLocation,
  General,
  Media,
  Optimization,
  Publisher,
  Summary,
} from './sections';
import { withValidators } from '../../../../../components/Form';
import withDrawer from '../../../../../components/Drawer';
import * as SessionHelper from '../../../../../state/Session/selectors';
import { withMcsRouter } from '../../../../Helpers';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import { isFakeId } from '../../../../../utils/FakeIdHelper';
import * as actions from '../../../../../state/Notifications/actions';
import messages from '../messages';

const { Content } = Layout;
const FORM_NAME = 'adGroupForm';

class AdGroupForm extends Component {

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.formValues, this.props.formValues);
  }

  onSubmit = (finalValues) => {
    const {
      editionMode,
      intl: { formatMessage },
      match: { params: { adGroupId, campaignId } },
      notifyError,
    } = this.props;

    const formatBudgetPeriod = {
      [formatMessage(messages.contentSection1Row2Option1)]: 'DAY',
      [formatMessage(messages.contentSection1Row2Option2)]: 'WEEK',
      [formatMessage(messages.contentSection1Row2Option3)]: 'MONTH',
    };

    const adGroupBody = {
      end_date: finalValues.adGroupBudgetEndDate.valueOf(),
      max_budget_per_period: finalValues.adGroupBudgetSplit,
      max_budget_period: formatBudgetPeriod[finalValues.adGroupBudgetSplitPeriod],
      name: finalValues.adGroupName,
      start_date: finalValues.adGroupBudgetStartDate.valueOf(),
      technical_name: finalValues.adGroupTechnicalName,
      total_budget: finalValues.adGroupBudgetTotal,
    };

    let asyncOperations = null;

    if (!editionMode) {
      asyncOperations = DisplayCampaignService.createAdGroup(campaignId, adGroupBody)
        .then((result) => {
          return this.updateAudienceSegments(result.data.id);
        });
    } else {
      asyncOperations = DisplayCampaignService.updateAdGroup(campaignId, adGroupId, adGroupBody);
    }

    asyncOperations.catch(error => notifyError(error));
  }

  updateAudienceSegments = (newAdGroupId) => {
    const {
      formValues: { audienceTable },
      match: { params: { campaignId, ...rest } },
    } = this.props;

    const adGroupId = rest.adGroupId || newAdGroupId;

    return audienceTable.reduce((promise, segment) => {
      const { audience_segment_id, id, toBeRemoved, target } = segment;
      const body = { audience_segment_id, exclude: !target };

      /* In case of a new adGroup */
      return promise.then(() => {
        let newPromise;

        if (isFakeId(id)) {
          newPromise = DisplayCampaignService.createSegment(campaignId, adGroupId, body)
            .then((seg) => seg);
        } else {
          /* In case the adGroup exists already */
          newPromise = (!toBeRemoved
            ? DisplayCampaignService.updateSegment(campaignId, adGroupId, id, body)
              .then(seg => seg)
            : DisplayCampaignService.deleteSegment(campaignId, adGroupId, id)
              .then(seg => seg)
          );
        }

        return newPromise;
      });
    }, Promise.resolve());
  };

  updateTableFieldStatus = ({ index, toBeRemoved = true, tableName }) => () => {
    const updatedField = { ...this.props.formValues[tableName][index], toBeRemoved };

    this.props.arrayRemove(FORM_NAME, tableName, index);
    this.props.arrayInsert(FORM_NAME, tableName, index, updatedField);
  }

  updateTableFields = ({ newFields, tableName }) => {
    const newFieldIds = newFields.map(field => field.audience_segment_id);
    const prevFields = this.props.formValues[tableName] || [];

    if (prevFields.length) {
      prevFields.forEach((field, index) => {
        const toBeRemoved = !newFieldIds.includes(field.audience_segment_id);

        this.updateTableFieldStatus({ index, toBeRemoved, tableName })();
      });
    }

    newFields.forEach((segment) => {
      if (!prevFields.length
        || !prevFields.find(field => (field.audience_segment_id === segment.audience_segment_id))
      ) {
        this.props.arrayPush(FORM_NAME, `${tableName}`, { ...segment, toBeRemoved: false });
      }
    });
  }

  render() {
    const {
      closeNextDrawer,
      fieldValidators,
      formId,
      formValues,
      handleSubmit,
      hasDatamarts,
      intl: { formatMessage },
      openNextDrawer,
      organisationId,
    } = this.props;

    const displaySegmentSelector = hasDatamarts(organisationId);
    const commonProps = {
      formatMessage,
      handlers: {
        closeNextDrawer,
        updateTableFieldStatus: this.updateTableFieldStatus,
        openNextDrawer,
        updateTableFields: this.updateTableFields,
      },
      organisationId,
    };
    const { audienceTable } = formValues;

    return (
      <Form
        className="edit-layout ant-layout"
        id={formId}
        onSubmit={handleSubmit(this.onSubmit)}
      >
        <Content className="mcs-content-container mcs-form-container">
          <General {...commonProps} fieldValidators={fieldValidators} />
          {
            displaySegmentSelector &&
            <div>
              <hr />
              <Audience {...commonProps} formValues={audienceTable} />
            </div>
          }
          <hr />
          <DeviceAndLocation {...commonProps} />
          <hr />
          <Publisher {...commonProps} />
          <hr />
          <Media {...commonProps} />
          <hr />
          <Optimization {...commonProps} />
          <hr />
          <Ads {...commonProps} />
          <hr />
          <Summary {...commonProps} />
        </Content>
      </Form>
    );
  }
}

AdGroupForm.defaultProps = {
  editionMode: false,
  fieldValidators: {},
};

AdGroupForm.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  editionMode: PropTypes.bool,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,

  formValues: PropTypes.shape().isRequired,

  handleSubmit: PropTypes.func.isRequired,
  hasDatamarts: PropTypes.func.isRequired,
  intl: intlShape.isRequired,

  match: PropTypes.shape().isRequired,

  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,

  notifyError: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM_NAME)(state),
  hasDatamarts: SessionHelper.hasDatamarts(state),
});

const mapDispatchToProps = {
  arrayInsert,
  arrayPush,
  arrayRemove,
  notifyError: actions.notifyError
};

export default compose(
  withMcsRouter,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withDrawer,
  withValidators,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(AdGroupForm);
