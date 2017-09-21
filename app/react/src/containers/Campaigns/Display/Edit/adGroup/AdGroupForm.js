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
import * as actions from '../../../../../state/Notifications/actions';
import messages from '../messages';

const { Content } = Layout;
const FORM_NAME = 'adGroupForm';

class AdGroupForm extends Component {

  state = {
    adGroupId: this.props.match.params.adGroupId,
  }

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

    let bidOptimizerId = null;

    if (finalValues.optimizerTable && finalValues.optimizerTable.length) {
      const bidObject = finalValues.optimizerTable.find(elem => !elem.toBeRemoved);

      if (bidObject) {
        bidOptimizerId = bidObject.id;
      }
    }

    const generalBody = {
      bid_optimizer_id: bidOptimizerId,
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
        return this.setState({ adGroupId: result.data.id });
      })
      .then(() => this.saveAudiences())
      .then(() => this.savePublishers())
      .catch(error => notifyError(error));
  }

  saveAudiences = () => {
    const { adGroupId } = this.state;
    const {
      formInitialValues,
      formValues,
      match: { params: { campaignId } },
    } = this.props;

    const audienceTable = formValues.audienceTable || [];

    return audienceTable.reduce((promise, row) => {
      const { id, include, otherId, toBeRemoved } = row;
      const body = { audience_segment_id: id, exclude: !include };

      return promise.then(() => {
        let newPromise;

        if (!toBeRemoved) {
          /* In case we want to add or update a element */

          if (!otherId) {
            /* creation */
            newPromise = DisplayCampaignService.createAudience({ campaignId, adGroupId, body });
          } else {
            const needsUpdating = formInitialValues.audienceTable.find(elem => (
              elem.otherId === otherId && elem.include !== include
            ));

            /* update if modified element */
            if (needsUpdating) {
              newPromise = DisplayCampaignService.updateAudience({ campaignId, adGroupId, id: otherId, body });
            }
          }
        } else if (otherId) {
          /* In case we want to delete an existing element */
          newPromise = DisplayCampaignService.deleteAudience({ campaignId, adGroupId, id: otherId });
        }

        return newPromise || Promise.resolve();
      });
    }, Promise.resolve());
  }

  savePublishers = () => {
    const {
      formValues,
      match: { params: { campaignId } },
    } = this.props;

    const publisherTable = formValues.publisherTable || [];

    return publisherTable.reduce((promise, row) => {
      const { id, otherId, toBeRemoved } = row;
      const body = { display_network_access_id: id };

      return promise.then(() => {
        let newPromise;

        if (!toBeRemoved) {
          if (!otherId) {
            newPromise = DisplayCampaignService.createPublisher({ campaignId, body });
          }
        } else if (otherId) {
          newPromise = DisplayCampaignService.deletePublisher({ campaignId, id: otherId });
        }

        return newPromise || Promise.resolve();
      });
    }, Promise.resolve());
  }

  updateTableFieldStatus = ({ index, toBeRemoved = true, tableName }) => () => {
    const updatedField = { ...this.props.formValues[tableName][index], toBeRemoved };

    this.props.arrayRemove(FORM_NAME, tableName, index);
    this.props.arrayInsert(FORM_NAME, tableName, index, updatedField);
  }

  updateTableFields = ({ newFields, tableName }) => {
    const newFieldIds = newFields.map(field => field.id);
    const prevFields = this.props.formValues[tableName] || [];

    if (prevFields.length > 0) {
      prevFields.forEach((prevField, index) => {
        const toBeRemoved = !newFieldIds.includes(prevField.id);

        this.updateTableFieldStatus({ index, toBeRemoved, tableName })();
      });
    }

    newFields.forEach((newField) => {
      if (!prevFields.length
        || !prevFields.find(prevField => (prevField.id === newField.id))
      ) {
        this.props.arrayPush(FORM_NAME, tableName, { ...newField, toBeRemoved: false });
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
  connect(mapStateToProps, mapDispatchToProps),
  withDrawer,
  withValidators,
  injectIntl
)(AdGroupForm);
