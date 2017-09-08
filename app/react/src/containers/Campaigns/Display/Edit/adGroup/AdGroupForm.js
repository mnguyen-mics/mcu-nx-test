import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { arrayInsert, arrayPush, arrayRemove, Form, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

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

const { Content } = Layout;
const FORM_NAME = 'adGroupForm';

class AdGroupForm extends Component {

  onSubmit = (finalValues) => {
    console.log('finalValues = ', finalValues);
  }

  updateTableFields = ({ prevFields, newFields, tableName }) => {
    newFields.forEach(segment => {
      if (!prevFields.length || !prevFields.find(field => field.id === segment.id)) {
        this.props.arrayPush(FORM_NAME, tableName, { ...segment, isSelected: true });
      }
    });

    const newFieldIds = newFields.map(field => field.id);

    if (prevFields.length) {
      prevFields.forEach((field, index) => {
        const updatedField = {
          ...field,
          isSelected: newFieldIds.includes(field.id)
        };

        this.props.arrayRemove(FORM_NAME, tableName, index);
        this.props.arrayInsert(FORM_NAME, tableName, index, updatedField);
      });
    }
  }

  render() {
    const {
      closeNextDrawer,
      fieldValidators,
      formId,
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
        updateTableFields: this.updateTableFields,
      },
      organisationId,
    };

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
              <Audience {...commonProps} />
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
  handleSubmit: PropTypes.func.isRequired,
  hasDatamarts: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
};


const mapStateToProps = (state) => ({
  hasDatamarts: SessionHelper.hasDatamarts(state)
});

const mapDispatchToProps = { arrayInsert, arrayPush, arrayRemove };

const ConnectedAdGroupForm = compose(
  withMcsRouter,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withDrawer,
  withValidators,
  connect(mapStateToProps, mapDispatchToProps),
)(AdGroupForm);

export default compose(
  injectIntl,
)(ConnectedAdGroupForm);
