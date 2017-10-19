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
import { Loading } from '../../../../../components/index.ts';
import { withNormalizer, withValidators } from '../../../../../components/Form/index.ts';

import { withMcsRouter } from '../../../../Helpers';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import * as actions from '../../../../../state/Notifications/actions';
import { unformatMetric } from '../../../../../utils/MetricHelper';

const { Content } = Layout;
const FORM_NAME = 'adGroupForm';

class AdGroupForm extends Component {

  state = { loading: false }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.formValues, this.props.formValues)
      || !isEqual(nextState.loading, this.state.loading)
    );
  }

  onSubmit = () => {
    const {
      formValues,
      editionMode
    } = this.props;

    if (editionMode === false) {
      formValues.id = formValues.id ? formValues.id : Math.round(Math.random() * 1000);
    }
    this.props.save(formValues);
  }

  saveOrUpdateAdGroup = () => {
    const {
      editionMode,
      formValues,
      match: { params: { adGroupId, campaignId } },
    } = this.props;

    let bidOptimizer = null;
    if (formValues.optimizerTable && formValues.optimizerTable.length) {
      bidOptimizer = formValues.optimizerTable.find(elem => !elem.toBeRemoved);
    }

    const body = {
      bid_optimizer_id: bidOptimizer ? bidOptimizer.id : null,
      end_date: formValues.adGroupEndDate.valueOf(),
      max_budget_per_period: unformatMetric(formValues.adGroupMaxBudgetPerPeriod),
      max_budget_period: formValues.adGroupMaxBudgetPeriod,
      name: formValues.adGroupName,
      start_date: formValues.adGroupStartDate.valueOf(),
      technical_name: formValues.adGroupTechnicalName,
      total_budget: unformatMetric(formValues.adGroupTotalBudget),
    };

    const request = (!editionMode
      ? DisplayCampaignService.createAdGroup(campaignId, body)
      : DisplayCampaignService.updateAdGroup(campaignId, adGroupId, body)
    );

    return request.then(result => result.data.id);
  }

  saveAudience = (adGroupId) => {
    const options = {
      adGroupId,
      getBody: (row) => ({ audience_segment_id: row.id, exclude: !row.include }),
      requests: {
        create: DisplayCampaignService.createAudience,
        update: DisplayCampaignService.updateAudience,
        delete: DisplayCampaignService.deleteAudience,
      },
      tableName: 'audienceTable',
    };

    return this.saveTableFields(options);
  }

  savePublishers = (adGroupId) => {
    const options = {
      adGroupId,
      getBody: (row) => ({ display_network_access_id: row.id }),
      requests: {
        create: DisplayCampaignService.createPublisher,
        delete: DisplayCampaignService.deletePublisher,
      },
      tableName: 'publisherTable',
    };

    return this.saveTableFields(options);
  }

  saveTableFields = (options) => {
    const { match, formInitialValues, formValues } = this.props;
    const { campaignId } = match.params;
    const { adGroupId, getBody, requests, tableName } = options;
    const table = formValues[tableName] || [];

    return table.reduce((promise, row) => {
      const body = getBody(row);
      const { include, otherId, toBeRemoved } = row;

      return promise.then(() => {
        let newPromise;

        if (!toBeRemoved) {
          /* In case we want to add or update a element */

          if (!otherId) {
            /* creation */
            newPromise = requests.create({ campaignId, adGroupId, body });
          } else if (requests.update) {
            const needsUpdating = formInitialValues[tableName].find(elem => (
              elem.otherId === otherId && elem.include !== include
            ));

            /* update if modified element */
            if (needsUpdating) {
              newPromise = requests.update({ campaignId, adGroupId, id: otherId, body });
            }
          }
        } else if (otherId) {
          /* In case we want to delete an existing element */
          newPromise = requests.delete({ campaignId, adGroupId, id: otherId });
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
      displayAudience,
      fieldNormalizer,
      fieldValidators,
      formId: scrollLabelContentId,
      formValues,
      handleSubmit,
      intl: { formatMessage },
      openNextDrawer,
      organisationId,
    } = this.props;

    const commonProps = {
      fieldNormalizer,
      fieldValidators,
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
      <Layout>
        {this.state.loading ? <Loading className="loading-full-screen" /> : null}

        <Form
          className={this.state.loading ? 'hide-section' : 'edit-layout ant-layout'}
          onSubmit={handleSubmit(this.onSubmit)}
        >
          <Content
            className="mcs-content-container mcs-form-container"
            id={scrollLabelContentId}
          >
            <General {...commonProps} formValues={formValues} />
            {
              displayAudience &&
              <div id="audience">
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
            <Summary {...commonProps} formValues={formValues} />
          </Content>
        </Form>
      </Layout>
    );
  }
}

AdGroupForm.defaultProps = {
  displayAudience: false,
  editionMode: false,
  fieldValidators: {},
};

AdGroupForm.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  displayAudience: PropTypes.bool,
  editionMode: PropTypes.bool,
  fieldNormalizer: PropTypes.shape().isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,
  formInitialValues: PropTypes.shape().isRequired,
  formValues: PropTypes.shape().isRequired,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  match: PropTypes.shape().isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => ({
  formInitialValues: getFormInitialValues(FORM_NAME)(state),
  formValues: getFormValues(FORM_NAME)(state),
});

const mapDispatchToProps = {
  arrayInsert,
  arrayPush,
  arrayRemove,
  notifyError: actions.notifyError
};

export default compose(
  withMcsRouter,
  injectIntl,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  connect(mapStateToProps, mapDispatchToProps),
  withNormalizer,
  withValidators,
)(AdGroupForm);
