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
  Device,
  General,
  Location,
  Media,
  Optimization,
  Placement,
  Publisher,
  Summary,
} from './sections';
import { Loading } from '../../../../../components/index.ts';
import { withNormalizer, withValidators } from '../../../../../components/Form/index.ts';

import { withMcsRouter } from '../../../../Helpers';
import * as actions from '../../../../../state/Notifications/actions';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';

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

  updateTableFieldStatus = ({ index, toBeRemoved = true, tableName }) => (e) => {
    if (e) {
      e.preventDefault();
    }

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
        this.props.arrayPush(
          FORM_NAME,
          tableName,
          { ...newField, modelId: generateFakeId(), toBeRemoved: false }
        );
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
        updateTableFieldStatus: this.updateTableFieldStatus,
        updateTableFields: this.updateTableFields,
      },
      organisationId,
    };
    const {
      audienceTable,
      optimizerTable,
      placements,
      publisherTable,
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
                <Audience {...commonProps} formValues={audienceTable} />
              </div>
             }
            <hr />
            <Device {...commonProps} formValues={formValues} />
            <hr />
            <Location {...commonProps} />
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
  // formInitialValues: PropTypes.shape().isRequired,
  formValues: PropTypes.shape().isRequired,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  // match: PropTypes.shape().isRequired,
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
