import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  arrayInsert,
  arrayPush,
  arrayRemove,
  Form,
  getFormInitialValues,
  getFormValues,
  reduxForm
} from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { capitalize, isEqual } from 'lodash';

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
      [formatMessage(messages.contentSection1Row2OptionDAY)]: 'DAY',
      [formatMessage(messages.contentSection1Row2OptionWEEK)]: 'WEEK',
      [formatMessage(messages.contentSection1Row2OptionMONTH)]: 'MONTH',
    };

    const generalBody = {
      end_date: finalValues.adGroupEndDate.valueOf(),
      max_budget_per_period: finalValues.adGroupMaxBudgetPerPeriod,
      max_budget_period: formatBudgetPeriod[finalValues.adGroupMaxBudgetPeriod],
      name: finalValues.adGroupName,
      start_date: finalValues.adGroupStartDate.valueOf(),
      technical_name: finalValues.adGroupTechnicalName,
      total_budget: finalValues.adGroupTotalBudget,
    };

    let adGroupRequest = null;

    if (!editionMode) {
      adGroupRequest = DisplayCampaignService.createAdGroup(campaignId, generalBody);
    } else {
      adGroupRequest = DisplayCampaignService.updateAdGroup(campaignId, adGroupId, generalBody);
    }

    adGroupRequest
      .then((result) => {
        const newAdGroupId = result.data.id;

        return this.saveTableModifications('audience', newAdGroupId);
      })
      .catch(error => notifyError(error));
  }

  saveTableModifications = (tableName, newAdGroupId) => {
    const {
      formInitialValues,
      formValues,
      match: { params: { campaignId, ...rest } },
    } = this.props;

    const formName = `${tableName}Table`;

    const table = formValues[formName] || [];
    const capitalName = capitalize(tableName);

    const adGroupId = rest.adGroupId || newAdGroupId;
    console.log('table = ', table);

    return table.reduce((promise, row) => {
      const { id, include, otherId, toBeRemoved } = row;
      const body = { audience_segment_id: id, exclude: !include };  // RENDRE GENERIQUE

      return promise.then(() => {
        let newPromise;

        if (!toBeRemoved) {
          /* In case we want to add or update a segment */

          if (!otherId) {
            console.log('creation pour : ', body.audience_segment_id);
            /* creation */
            newPromise = DisplayCampaignService[`create${capitalName}`](campaignId, adGroupId, body)
            .then((newElement) => {
              console.log('APRES creation ok pour ', newElement);
              return newElement;
            });
          } else {
            const needsUpdating = formInitialValues[formName].find(seg => (
              seg.otherId === otherId && seg.include !== include
            ));

            if (!needsUpdating) {
              console.log('ne devrait pas modifier pour : ', otherId);
            }

            /* update if modified segment */
            if (needsUpdating) {
              console.log('modification pour : ', otherId);

              newPromise = DisplayCampaignService[`update${capitalName}`](campaignId, adGroupId, otherId, body)
                .then(newElement => {
                  console.log('APRES modification ok pour ', newElement);
                  return newElement;
                });
            }

            newPromise = Promise.resolve();
          }
        } else if (otherId) {
          console.log('suppression pour : ', otherId);

          /* In case we want to delete an existing segment */
          DisplayCampaignService[`delete${capitalName}`](campaignId, adGroupId, otherId)
            .then(newElement => {
              console.log('APRES suppression ok pour ', newElement);
              return newElement;
            });
        } else {
          newPromise = Promise.resolve();
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
    const newFieldIds = newFields.map(field => field.id);
    const prevFields = this.props.formValues[tableName] || [];

    if (prevFields.length) {
      prevFields.forEach((prevField, index) => {
        const toBeRemoved = !newFieldIds.includes(prevField.id);

        this.updateTableFieldStatus({ index, toBeRemoved, tableName })();
      });
    }

    newFields.forEach((newField) => {
      if (!prevFields.length
        || !prevFields.find(prevField => (prevField.id === newField.id))
      ) {
        this.props.arrayPush(FORM_NAME, `${tableName}`, { ...newField, toBeRemoved: false });
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
        openNextDrawer,
        updateTableFieldStatus: this.updateTableFieldStatus,
        updateTableFields: this.updateTableFields,
      },
      organisationId,
    };
    const {
      audienceTable,
      optimizerTable,
      publisherTable,
    } = formValues;

    console.log('formValues = ', formValues);

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
          <Publisher {...commonProps} formValues={publisherTable} />
          <hr />
          <Media {...commonProps} />
          <hr />
          <Optimization {...commonProps} formValues={optimizerTable} />
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
  formInitialValues: PropTypes.shape().isRequired,
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
  formInitialValues: getFormInitialValues(FORM_NAME)(state),
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
