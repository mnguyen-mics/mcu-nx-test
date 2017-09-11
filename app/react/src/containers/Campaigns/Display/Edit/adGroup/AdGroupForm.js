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

const { Content } = Layout;
const FORM_NAME = 'adGroupForm';

class AdGroupForm extends Component {

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.formValues, this.props.formValues);
  }

  onSubmit = (finalValues) => {
    const maxBudgetPeriod = {
      'Per day': 'DAY',
      'Per week': 'WEEK',
      'Per month': 'MONTH',
    };

    const body = {
      end_date: finalValues.adGroupBudgetEndDate.valueOf(),
      max_budget_per_period: finalValues.adGroupBudgetSplit,
      max_budget_period: maxBudgetPeriod[finalValues.adGroupBudgetSplitPeriod],
      name: finalValues.adGroupName,
      start_date: finalValues.adGroupBudgetStartDate.valueOf(),
      // time_zone: 'Europe/Paris',
      total_budget: finalValues.adGroupBudgetTotal,
    };

    console.log('finalValues = ', finalValues);
    console.log('body = ', body);

    DisplayCampaignService.createAdGroup(
      this.props.match.params.campaignId,
      body,
    );
  }

  updateTableFieldStatus = ({ index, isSelected = false, tableName }) => () => {
    const updatedField = { ...this.props.formValues[tableName][index], isSelected };

    this.props.arrayRemove(FORM_NAME, tableName, index);
    this.props.arrayInsert(FORM_NAME, tableName, index, updatedField);
  }

  updateTableFields = ({ newFields, tableName }) => {
    const newFieldIds = newFields.map(field => field.audience_segment_id);
    const prevFields = this.props.formValues[tableName] || [];

    if (prevFields.length) {
      prevFields.forEach((field, index) => {
        const isSelected = newFieldIds.includes(field.audience_segment_id);

        this.updateTableFieldStatus({ index, isSelected, tableName })();
      });
    }

    newFields.forEach((segment) => {
      if (!prevFields.length
        || !prevFields.find(field => (field.audience_segment_id === segment.audience_segment_id))
      ) {
        this.props.arrayPush(FORM_NAME, `${tableName}`, { ...segment, isSelected: true });
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
  fieldValidators: {},
};

AdGroupForm.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,

  formValues: PropTypes.shape().isRequired,

  handleSubmit: PropTypes.func.isRequired,
  hasDatamarts: PropTypes.func.isRequired,
  intl: intlShape.isRequired,

  match: PropTypes.shape().isRequired,

  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
};


const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM_NAME)(state),
  hasDatamarts: SessionHelper.hasDatamarts(state),
});

const mapDispatchToProps = { arrayInsert, arrayPush, arrayRemove };

export default compose(
  // withRouter,
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
