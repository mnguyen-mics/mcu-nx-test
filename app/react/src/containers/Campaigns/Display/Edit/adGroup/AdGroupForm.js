import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
// import Scrollspy from 'react-scrollspy';
import { Form, reduxForm } from 'redux-form';
import { compose } from 'recompose';
// import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Layout } from 'antd';

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

// import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
// import { withMcsRouter } from '../../../../Helpers';
// import { Actionbar } from '../../../../Actionbar';
<<<<<<< HEAD
// import { McsIcons } from '../../../../../components/McsIcons';
// import { FormInput, FormTitle, FormSelect, withValidators } from '../../../../../components/Form';
=======
// import McsIcons from '../../../../../components/McsIcons';
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff
// import { RecordElement, RelatedRecords } from '../../../../../components/RelatedRecord';
// import { generateFakeId, isFakeId } from '../../../../../utils/FakeIdHelper';
// import messages from '../messages';
// // import EmailBlastForm from './EmailBlastForm';
// import EmailRouterService from '../../../../../services/EmailRouterService';

const { Content } = Layout;

class AdGroupForm extends Component {

  onSubmit = (finalValues) => {
    console.log('finalValues = ', finalValues);
  }

  render() {
<<<<<<< HEAD
    const {
      form: {
        getFieldDecorator
      }
    } = this.props;
=======
    const { fieldValidators, formId, handleSubmit } = this.props;
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff

    return (
      <Form
        className="edit-layout ant-layout"
        id={formId}
        onSubmit={handleSubmit(this.onSubmit)}
      >
        <Content className="mcs-content-container mcs-form-container">
          <General fieldValidators={fieldValidators} />
          <hr />
          <Audience />
          <hr />
          <DeviceAndLocation />
          <hr />
          <Publisher />
          <hr />
          <Media />
          <hr />
          <Optimization />
          <hr />
          <Ads />
          <hr />
          <Summary />
        </Content>
      </Form>
    );
  }
}

AdGroupForm.defaultProps = {
  fieldValidators: {},
};

AdGroupForm.propTypes = {
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

const ConnectedAdGroupForm = compose(
  reduxForm({
    form: 'adGroupForm',
    enableReinitialize: true,
  }),
  withValidators,
)(AdGroupForm);

export default ConnectedAdGroupForm;
