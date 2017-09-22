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
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { withValidators } from '../../../../../components/Form';
import withDrawer from '../../../../../components/Drawer';
import { LoadingChart } from '../../../../../components/EmptyCharts';

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
    loading: false,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.formValues, this.props.formValues)
      || !isEqual(nextState.loading, this.state.loading)
    );
  }

  changeLoadingStatus(status, callback) {
    this.setState(
      () => ({ loading: status }),
      () => callback
    );
  }

  onSubmit = () => {
    const {
      history,
      match: { params: { campaignId, organisationId } },
    } = this.props;

    this.setState({ loading: true });
    this.saveAdGroup()
    .then(() => this.saveAudience())
    .then(() => this.savePublishers())
    .then(() => {
      this.setState({ loading: false });
      history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}`);
    })
    .catch(error => {
      this.setState({ loading: false });
      this.props.notifyError(error);
    });
  }

  saveAdGroup = () => {
    const {
      editionMode,
      formValues,
      intl: { formatMessage },
      match: { params: { adGroupId, campaignId } },
    } = this.props;

    const formatBudgetPeriod = {
      [formatMessage(messages.contentSection1Row2OptionDAY)]: 'DAY',
      [formatMessage(messages.contentSection1Row2OptionWEEK)]: 'WEEK',
      [formatMessage(messages.contentSection1Row2OptionMONTH)]: 'MONTH',
    };

    let bidOptimizer = null;
    if (formValues.optimizerTable && formValues.optimizerTable.length) {
      bidOptimizer = formValues.optimizerTable.find(elem => !elem.toBeRemoved);
    }

    const body = {
      bid_optimizer_id: bidOptimizer ? bidOptimizer.id : null,
      end_date: formValues.adGroupEndDate.valueOf(),
      max_budget_per_period: formValues.adGroupMaxBudgetPerPeriod,
      max_budget_period: formatBudgetPeriod[formValues.adGroupMaxBudgetPeriod],
      name: formValues.adGroupName,
      start_date: formValues.adGroupStartDate.valueOf(),
      technical_name: formValues.adGroupTechnicalName,
      total_budget: formValues.adGroupTotalBudget,
    };

    const request = (!editionMode
      ? DisplayCampaignService.createAdGroup(campaignId, body)
      : DisplayCampaignService.updateAdGroup(campaignId, adGroupId, body)
    );

    return request.then((result) => this.setState({ adGroupId: result.data.id }));
  }

  saveAudience = () => {
    const options = {
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

  savePublishers = () => {
    const options = {
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
    const { adGroupId, campaignId } = match.params;
    const { getBody, requests, tableName } = options;
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
      fieldValidators,
      formId,
      formValues: {
        audienceTable,
        optimizerTable,
        publisherTable,
      },
      handleSubmit,
      hasDatamarts,
      intl: { formatMessage },
      openNextDrawer,
      organisationId,
    } = this.props;

    const displayAudience = hasDatamarts(organisationId);
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

    return (
      <div>
        {this.state.loading ? <LoadingChart /> : null}

        <Form
          className={this.state.loading ? 'hide-section' : 'edit-layout ant-layout'}
          id={formId}
          onSubmit={handleSubmit(this.onSubmit)}
        >
          <Content className="mcs-content-container mcs-form-container">
            <General {...commonProps} fieldValidators={fieldValidators} />
            {
              displayAudience &&
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
      </div>
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
  history: ReactRouterPropTypes.history.isRequired,
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
