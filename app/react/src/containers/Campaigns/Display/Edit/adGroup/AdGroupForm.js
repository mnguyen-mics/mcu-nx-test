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
  Placement,
  Publisher,
  Summary,
} from './sections';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { withNormalizer, withValidators } from '../../../../../components/Form';
import { Loading } from '../../../../../components';

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
      history,
      match: { params: { campaignId, organisationId } },
    } = this.props;


    if (!this.props.pristine) {
      this.setState({ loading: true });

      return this.saveOrUpdateAdGroup()
        .then((adGroupId) => Promise.all([
          this.saveAudience(adGroupId),
          this.savePublishers(adGroupId),
          this.saveAds(adGroupId),
        ]))
        .then(() => {
          this.setState({ loading: false });
          history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}`);
        })
        .catch(error => {
          this.setState({ loading: false });
          this.props.notifyError(error);
        });
    }

    history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}`);
    return Promise.resolve();
  }

  saveAds = (adGroupId) => {
    const options = {
      adGroupId,
      getBody: (row) => ({ creative_id: row.id }),
      requests: {
        create: DisplayCampaignService.createAd,
        delete: DisplayCampaignService.deleteAd,
      },
      tableName: 'ads',
    };

    return this.saveTableFields(options);
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

  updateTableFieldState = ({ index, toBeRemoved = true, tableName }) => (e) => {
    const updatedField = { ...this.props.formValues[tableName][index], toBeRemoved };

    this.props.arrayRemove(FORM_NAME, tableName, index);
    this.props.arrayInsert(FORM_NAME, tableName, index, updatedField);

    if (e) {
      e.preventDefault();
    }
  }

  updateTableFields = ({ newFields, tableName }) => {
    const newFieldIds = newFields.map(field => field.id);
    const prevFields = this.props.formValues[tableName] || [];

    if (prevFields.length > 0) {
      prevFields.forEach((prevField, index) => {
        const toBeRemoved = !newFieldIds.includes(prevField.id);

        this.updateTableFieldState({ index, toBeRemoved, tableName })();
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
      editionMode,
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
      formName: FORM_NAME,
      formatMessage,
      handlers: {
        closeNextDrawer,
        openNextDrawer,
        updateTableFieldState: this.updateTableFieldState,
        updateTableFields: this.updateTableFields,
      },
      organisationId,
    };
    const {
      audienceTable,
      optimizerTable,
      placements,
      publisherTable,
      ads,
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
            {/* {editionMode
              ? <div><Summary {...commonProps} displayAudience={displayAudience} formValues={formValues} /><hr /></div>
              : null
            }
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
            <hr /> */}
            <Placement {...commonProps} formValues={placements} />
            <hr />
            {/* <Ads {...commonProps} formValues={ads} />
            {!editionMode
              ? <div><hr /><Summary {...commonProps} displayAudience={displayAudience} formValues={formValues} /></div>
              : null
            } */}
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
  history: ReactRouterPropTypes.history.isRequired,
  intl: intlShape.isRequired,
  match: PropTypes.shape().isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
  pristine: PropTypes.bool.isRequired,
  notifyError: PropTypes.func.isRequired,
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
