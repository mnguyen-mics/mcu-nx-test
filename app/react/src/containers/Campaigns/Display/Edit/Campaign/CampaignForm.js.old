import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  arrayInsert,
  arrayPush,
  arrayRemove,
  arrayRemoveAll,
  Form,
  getFormInitialValues,
  getFormValues,
  reduxForm
} from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { camelCase } from 'lodash';

import {
  General,
  Goals,
  AdGroups
} from './Sections';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { withNormalizer, withValidators, formErrorMessage } from '../../../../../components/Form/index.ts';

import { withMcsRouter } from '../../../../Helpers';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService.ts';
import GoalService from '../../../../../services/GoalService';
import AttributionModelsService from '../../../../../services/AttributionModelsService';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import * as FeatureSelectors from '../../../../../state/Features/selectors';
import * as AdGroupServiceWrapper from '../../../../../formServices/AdGroupServiceWrapper';
import messages from '../messages';


const { Content } = Layout;
const FORM_NAME = 'campaignForm';

class CampaignForm extends Component {

  state = { loading: false }

  componentWillReceiveProps(nextProps) {
    if (nextProps.submitFailed && (this.props.submitFailed !== nextProps.submitFailed)) {
      const {
        intl: {
          formatMessage
        }
      } = this.props;
      formErrorMessage(formatMessage(messages.errorFormMessage));
    }
  }


  updateTableFieldStatus = ({ index, toBeRemoved = true, tableName }) => {
    const updatedField = { ...this.props.formValues[tableName][index], toBeRemoved };
    if (toBeRemoved && !this.props.formValues[tableName][index].main_id) {
      // can safely remove the item
      this.props.arrayRemove(FORM_NAME, tableName, index);
    } else {
      // need to be flagged for API
      this.props.arrayRemove(FORM_NAME, tableName, index);
      this.props.arrayInsert(FORM_NAME, tableName, index, updatedField);
    }
  }

  updateTableFields = ({ newFields, tableName }) => {
    const newFieldIds = newFields.map(field => field.id);
    const prevFields = this.props.formValues[tableName] || [];
    const prevFieldIds = prevFields.map(field => field.id);
    this.props.arrayRemoveAll(FORM_NAME, tableName);
    newFieldIds.forEach((newId, index) => {
      if (prevFieldIds.includes(newId)) {
        this.props.arrayInsert(FORM_NAME, tableName, index, newFields[index]);
      } else if (!prevFieldIds.includes(newId)) {
        this.props.arrayPush(FORM_NAME, tableName, newFields[index]);
      }
    });
    prevFields.forEach((prevField, index) => {
      const toBeRemoved = !newFieldIds.includes(prevField.id);
      if (toBeRemoved) {
        if (prevField.main_id) {
          // removing with API call
          this.props.arrayInsert(FORM_NAME, tableName, index, { ...prevField, toBeRemoved });
        } else {
          // can safely remove from list
          this.props.arrayRemove(FORM_NAME, tableName, index);
        }
      }
    });

  }

  onSubmit = () => {
    const {
      history,
      match: { params: { campaignId, organisationId } },
    } = this.props;

    this.setState({ loading: true });
    let newlyCreatedCampaignId = null;
    return this.saveOrUpdateCampaign(organisationId, campaignId)
      .then((campaignNewId) => {
        newlyCreatedCampaignId = campaignNewId;
        return this.saveGoals(newlyCreatedCampaignId);
      })
      .then(() => {
        return this.saveAdGroups(newlyCreatedCampaignId);
      })
      .then(() => {
        this.setState({ loading: false });
        history.push(`/v2/o/${organisationId}/campaigns/display/${newlyCreatedCampaignId}`);
      })
      .catch(error => {
        this.setState({ loading: false });
        this.props.notifyError(error);
      });

  }

  saveOrUpdateCampaign = (organisationId, campaignId = null) => {
    const {
      editionMode,
      formValues
    } = this.props;


    const body = {
      editor_version_id: '11',
      name: formValues.name,
      time_zone: 'Europe/Paris',
      model_version: formValues.model_version,
      type: 'DISPLAY'
    };

    const addFieldsBasedOnCondition = (id) => {
      if (formValues[id]) {
        body[id] = formValues[id];
      }
    };

    addFieldsBasedOnCondition('total_impression_capping');
    addFieldsBasedOnCondition('total_budget');
    addFieldsBasedOnCondition('max_budget_per_period');
    addFieldsBasedOnCondition('per_day_impression_capping');

    const request = (!editionMode
      ? DisplayCampaignService.createCampaign(organisationId, body)
      : DisplayCampaignService.updateCampaign(campaignId, body)
    );

    return request.then(result => result.data.id);
  }


  createAdGroup = (campaignId, organisationId, value, options) => {
    const {
      formValues,
      formInitialValues,
      hasFeature,
    } = this.props;

    const saveOptions = {
      ...options,
      catalogMode: hasFeature('campaigns.display.edition.audience_catalog')
    };

    const adGroupFormValue = formValues.adGroupsTable.find(item => item.id === value.id);
    const adGroupInitialFormValue = Object.keys(formInitialValues).length ? formInitialValues.adGroupsTable.find(item => item.id === value.id) : {};

    const formattedFormValue = Object.keys(adGroupFormValue).reduce((acc, key) => ({
      ...acc,
      [key.indexOf('Table') === -1 ? camelCase(`adGroup-${key}`) : key]: value[key]
    }), {});
    const formattedInitialFormValue = adGroupInitialFormValue ? Object.keys(adGroupInitialFormValue).reduce((acc, key) => ({
      ...acc,
      [key.indexOf('Table') === -1 ? camelCase(`adGroup-${key}`) : key]: formInitialValues[key]
    }), {}) : null;

    return AdGroupServiceWrapper.saveAdGroup(campaignId, formattedFormValue, formattedInitialFormValue, saveOptions);
  }

  updateAdGroup = (campaignId, adGroupId, organisationId, body) => {
    const saveOptions = {
      editionMode: true,
      catalogMode: this.props.hasFeature('campaigns.display.edition.audience_catalog')
    };
    return this.createAdGroup(campaignId, organisationId, body, saveOptions);
  }

  saveAdGroups = (campaignId) => {

    const options = {
      campaignId,
      getBody: (row) => (row),
      requests: {
        createThenAdd: this.createAdGroup,
        add: DisplayCampaignService.createAdGroup,
        update: this.updateAdGroup,
        delete: DisplayCampaignService.deleteAdGroup,
      },
      tableName: 'adGroupsTable',
    };

    return this.saveTableFields(options);
  }

  saveGoals = (campaignId) => {
    const options = {
      campaignId,
      getBody: (row) => ({
        id: 'T2',
        goal_id: row.id,
        default: row.default,
        name: row.name,
        goal_selection_type: 'CONVERSION',
        attribution: row.attribution ? { postView: row.attribution[0].post_view, postClick: row.attribution[0].post_click } : null
      }),
      requests: {
        createThenAdd: this.createGoal,
        add: DisplayCampaignService.createGoal,
        update: GoalService.updateGoalDeprecated,
        delete: DisplayCampaignService.deleteGoal,
      },
      tableName: 'goalsTable',
    };

    return this.saveTableFields(options);
  }

  saveTableFields = (options) => {
    const { match, formInitialValues, formValues } = this.props;
    const { campaignId, getBody, requests, tableName } = options;
    const table = formValues[tableName] || [];

    return table.reduce((promise, row) => {
      const body = getBody(row);
      const { id, toBeRemoved, toBeCreated, main_id } = row;
      return promise.then(() => {
        let newPromise;

        if (!toBeRemoved) {
          /* In case we want to add or update a element */

          if (toBeCreated) {
            /* Creating item and then linking it to the campaign */
            newPromise = requests.createThenAdd(campaignId, match.params.organisationId, body);
          } else if (id && main_id && requests.update) { // eslint-disable-line
            /* update of the goal to the campaign */
            const needsUpdating = formInitialValues[tableName].find(elem => (
              elem.id === id
            ));
            /* update if modified element */
            if (needsUpdating) {
              const updatedObject = formValues[tableName].find(elem => (
                elem.id === id
              ));
              newPromise = requests.update(campaignId, main_id, match.params.organisationId, updatedObject); // eslint-disable-line
            }
          } else {
            /* addition of the goal to the campaign */
            newPromise = requests.add(campaignId, body);
          }
        } else if (id > 1000) {
          /* In case we want to delete an existing element */
          newPromise = requests.delete(campaignId, id);
        }

        return newPromise || Promise.resolve();
      });
    }, Promise.resolve());
  }

  createUniqueGoal = (organisationId, goalId) => {
    const { formValues } = this.props;
    const tableName = 'goalsTable';
    const goalData = formValues[tableName].find(item => item.id === goalId);
    const goalIndex = formValues[tableName].findIndex(item => item.id === goalId);

    this.createGoalWithoutLinkingToCampaign(organisationId, goalData)
    .then((goal) => {
      this.props.arrayRemove(FORM_NAME, tableName, goalIndex);
      this.props.arrayInsert(FORM_NAME, tableName, goalIndex, goal);
    });
  }

  createGoalWithoutLinkingToCampaign = (organisationId, goalData) => {
    return new Promise((resolve, reject) => {
      const goalBody = {
        archived: false,
        default_goal_value: null,
        goal_value_currency: null,
        name: goalData.name,
        new_query_id: null,
        organisation_id: organisationId,
        query_id: null,
        technical_name: null
      };

      const attributionData = goalData.attribution;
      let goalSaved = null;
      let attributionModelId = null;
      GoalService.createGoal(organisationId, goalBody)
        .then(goal => goal.data)
        .then((goal) => { goalSaved = goal; return AttributionModelsService.getAttributionModels(organisationId, { firstResult: 0, maxResult: 1000 }); })
        .then(modelsData => modelsData.data)
        .then(models => {
          const isExitingModel = models.find((item) => {
            return item.name === `PV${attributionData.postView}PC${attributionData.postClick}` && item.artifact_id === 'lookback_window';
          });
          if (isExitingModel) {
            return GoalService.createAttributionModel(goalSaved.id, { attribution_model_id: isExitingModel.id, attribution_type: 'WITH_PROCESSOR' });
          }
          return AttributionModelsService.createAttributionModels(organisationId, {
            artifact_id: 'lookback_window',
            group_id: 'com.mediarithmics.attribution',
            mode: 'DISCOVERY',
            name: `PV${attributionData.postView}PC${attributionData.postClick}`
          })
          .then(attributionModel => attributionModel.data)
          .then(attributionModel => {
            attributionModelId = attributionModel.id;
            return Promise.all([
              AttributionModelsService.updateAttributionModelProperty(attributionModel.id, 'post_view', attributionData.postView),
              AttributionModelsService.updateAttributionModelProperty(attributionModel.id, 'post_click', attributionData.postClick),
            ]);
          }).then(() => {
            return GoalService.createAttributionModel(goalSaved.id, { attribution_model_id: attributionModelId, attribution_type: 'WITH_PROCESSOR' });
          });
        })
        .then(() => resolve(goalSaved))
        .catch(error => {
          reject(error);
        });
    });
  }

  createGoal = (campaignId, organisationId, goalData) => {
    return new Promise((resolve, reject) => {
      this.createGoalWithoutLinkingToCampaign(organisationId, goalData)
        .then((goalSaved) => {
          return DisplayCampaignService.createGoal(
            campaignId,
            {
              id: 'T2',
              goal_id: goalSaved.id,
              default: goalSaved.default,
              name: goalSaved.name,
              goal_selection_type: 'CONVERSION'
            }
          );
        })
        .then(() => resolve())
        .catch(error => {
          reject(error);
        });
    });
  }

  render() {

    const {
      closeNextDrawer,
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
      goalsTable,
      adGroupsTable
    } = formValues;

    return (
      <Layout>
        <Form
          className={this.state.loading ? 'hide-section' : 'edit-layout ant-layout'}
          onSubmit={handleSubmit(this.onSubmit)}
        >
          <Content
            className="mcs-content-container mcs-form-container"
            id={scrollLabelContentId}
          >
            <General {...commonProps} formValues={formValues} />
            <hr />
            <Goals {...commonProps} formValues={goalsTable} createUniqueGoal={this.createUniqueGoal} />
            <hr />
            <AdGroups {...commonProps} formValues={adGroupsTable} />
          </Content>
        </Form>
      </Layout>
    );
  }
}

CampaignForm.defaultProps = {
  editionMode: false,
  fieldValidators: {},
  formValues: {},
  pristine: true,
};

CampaignForm.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  arrayRemoveAll: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  editionMode: PropTypes.bool,
  fieldNormalizer: PropTypes.shape().isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,
  formInitialValues: PropTypes.shape().isRequired,
  formValues: PropTypes.shape(),
  handleSubmit: PropTypes.func.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  intl: intlShape.isRequired,
  match: PropTypes.shape().isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
  notifyError: PropTypes.func.isRequired,
  hasFeature: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool.isRequired,
};


const mapStateToProps = (state) => ({
  formInitialValues: getFormInitialValues(FORM_NAME)(state),
  formValues: getFormValues(FORM_NAME)(state),
  hasFeature: FeatureSelectors.hasFeature(state),
});

const mapDispatchToProps = {
  arrayInsert,
  arrayPush,
  arrayRemove,
  arrayRemoveAll,
  notifyError: NotificationActions.notifyError
};

export default compose(
  withMcsRouter,
  injectIntl,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withNormalizer,
  withValidators,
  connect(mapStateToProps, mapDispatchToProps),
)(CampaignForm);
