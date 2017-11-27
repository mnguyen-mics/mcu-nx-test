import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  getFormValues,
  reduxForm,
  formPropTypes,
} from 'redux-form';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { isEqual } from 'lodash';

import {
  Ads,
  Audience,
  Device,
  General,
  LocationTargeting,
  Media,
  Optimization,
  Placement,
  Publisher,
  Summary,
} from './sections/index.ts';
import { AudienceCatalogContainer } from './sections/AudienceCatalog/index.ts';
import { withNormalizer, withValidators, formErrorMessage } from '../../../../../components/Form/index.ts';
import FeatureSwitch from '../../../../../components/FeatureSwitch.tsx';
import { Loading } from '../../../../../components/index.ts';

import { withMcsRouter } from '../../../../Helpers';
import * as actions from '../../../../../state/Notifications/actions';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';
import messages from '../messages';

const { Content } = Layout;
const FORM_NAME = 'adGroupForm';

class AdGroupForm extends Component {

  state = { loading: false }

  // code smell... (component can be out of sync with his props)
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.formValues, this.props.formValues)
      || !isEqual(nextState.loading, this.state.loading)
    );
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.submitFailed && (this.props.submitFailed !== nextProps.submitFailed)) ||
      (nextProps.RxF.submitFailed && (this.props.RxF.submitFailed !== nextProps.RxF.submitFailed))
    ) {
      const {
        intl: {
          formatMessage
        }
      } = this.props;
      formErrorMessage(formatMessage(messages.errorFormMessage));
    }
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

  updateTableFieldStatus = ({ index, toBeRemoved = true, tableName }) => () => {

    const updatedField = { ...this.props.formValues[tableName][index], toBeRemoved };

    this.props.RxF.array.remove(tableName, index);
    this.props.RxF.array.insert(tableName, index, updatedField);
  }

  updateTableFields = ({ newFields, tableName }) => {
    const newFieldIds = newFields.map(field => field.id);
    const prevFields = this.props.formValues[tableName] || [];

    if (prevFields.length > 0) {
      prevFields.forEach((prevField, index) => {
        const toBeRemoved = prevField.exclude === undefined ? !newFieldIds.includes(prevField.id) : false;
        this.updateTableFieldStatus({ index, toBeRemoved, tableName })();
      });
    }

    newFields.forEach((newField) => {
      if (!prevFields.length
        || !prevFields.find(prevField => (prevField.id === newField.id))
      ) {
        this.props.RxF.array.push(tableName, { ...newField, modelId: generateFakeId(), toBeRemoved: false });
      }
    });
  }

  emptyTableFields = (tableName) => {
    this.props.RxF.change(tableName, []);
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
      RxF: { handleSubmit },
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
        updateTableFieldStatus: this.updateTableFieldStatus,
        updateTableFields: this.updateTableFields,
        emptyTableFields: this.emptyTableFields,
      },
      organisationId,
    };
    const {
      audienceTable,
      optimizerTable,
      placements,
      publisherTable,
      locationTargetingTable,
      adTable,
    } = formValues;

    return (
      <Layout>
        {this.state.loading ? <Loading className="loading-full-screen" /> : null}

        <Form
          className={this.state.loading ? 'hide-section' : 'edit-layout ant-layout'}
          onSubmit={handleSubmit(this.onSubmit)}
        >
          <Content
            className="mcs-content-container mcs-form-container ad-group-form"
            id={scrollLabelContentId}
          >
            {editionMode
              ? <div><Summary {...commonProps} displayAudience={displayAudience} formValues={formValues} /><hr /></div>
              : null
            }
            <General {...commonProps} formValues={formValues} />
            {
              displayAudience &&
                <div id="audience">
                  <hr />
                  <FeatureSwitch
                    featureName="campaigns.display.edition.audience_catalog"
                    enabledComponent={<AudienceCatalogContainer RxF={this.props.RxF} />}
                    disabledComponent={<Audience {...commonProps} formValues={audienceTable} />}
                  />
                </div>
            }
            <hr />
            <LocationTargeting {...commonProps} formValues={locationTargetingTable} />
            <hr />
            <Device {...commonProps} formValues={formValues} />
            <hr />
            <Media {...commonProps} />
            <hr />
            <Publisher {...commonProps} formValues={publisherTable} />
            <hr />
            <Placement {...commonProps} formValues={placements} />
            <hr />
            <Ads {...commonProps} formValues={adTable} />
            <hr />
            <Optimization {...commonProps} formValues={optimizerTable} />
            {!editionMode
              ? <div><hr /><Summary {...commonProps} displayAudience={displayAudience} formValues={formValues} /></div>
              : null
            }
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
  submitFailed: false,
};

AdGroupForm.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  displayAudience: PropTypes.bool,
  editionMode: PropTypes.bool,
  fieldNormalizer: PropTypes.shape().isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,
  formValues: PropTypes.shape().isRequired,
  intl: intlShape.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
  RxF: PropTypes.shape(formPropTypes).isRequired,
  submitFailed: PropTypes.bool,
};


const mapStateToProps = (state, ownProps) => ({
  formValues: getFormValues(ownProps.RxF.form)(state),
});

const mapDispatchToProps = {
  notifyError: actions.notifyError
};

export default compose(
  withMcsRouter,
  injectIntl,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    propNamespace: 'RxF',
  }),
  mapProps(
    // https://github.com/erikras/redux-form/issues/3529
    // Add missing redux form props to the namespace
    props => {
      const {
        RxF,
        array,
        pure,
        autofill,
        clearAsyncError,
        clearSubmit,
        clearSubmitErrors,
        submit,
        ...rest
      } = props;
      return {
        RxF: {
          ...RxF,
          array,
          pure,
          autofill,
          clearAsyncError,
          clearSubmit,
          clearSubmitErrors,
          submit,
        },
        ...rest
      };
    }
  ),
  withNormalizer,
  withValidators,
  connect(mapStateToProps, mapDispatchToProps),
)(AdGroupForm);
