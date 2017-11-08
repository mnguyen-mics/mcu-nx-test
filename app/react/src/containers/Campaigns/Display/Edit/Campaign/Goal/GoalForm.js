import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  getFormInitialValues,
  getFormValues,
  reduxForm,
} from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import {
  General,
  Attribution,
} from './Sections';
import { withNormalizer, withValidators } from '../../../../../../components/Form/index.ts';
import { Loading } from '../../../../../../components/index.ts';

import { withMcsRouter } from '../../../../../Helpers';

const { Content } = Layout;
const FORM_NAME = 'goalForm';


class GoalForm extends Component {

  state = { loading: false }

  onSubmit = () => {
    const values = this.props.formValues;
    // pass values
    values.toBeCreated = true;
    if (!values.id) {
      values.id = parseInt(Math.random() * 1000, 10).toString();
    }
    this.props.save(values);
  }


  render() {
    const {
      closeNextDrawer,
      fieldNormalizer,
      fieldValidators,
      formId: scrollLabelContentId,
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
            <General {...commonProps} />

            <hr />
            <Attribution {...commonProps} />
          </Content>
        </Form>
      </Layout>
    );
  }
}

GoalForm.defaultProps = {
  fieldValidators: {},
  formValues: {},
  pristine: true,
};

GoalForm.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  fieldNormalizer: PropTypes.shape().isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,
  formValues: PropTypes.shape(),
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => ({
  formInitialValues: getFormInitialValues(FORM_NAME)(state),
  formValues: getFormValues(FORM_NAME)(state),
});

export default compose(
  withMcsRouter,
  injectIntl,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withNormalizer,
  withValidators,
  connect(mapStateToProps),
)(GoalForm);
