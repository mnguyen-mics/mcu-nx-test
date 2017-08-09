import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
// import Scrollspy from 'react-scrollspy';
// import { Field, reduxForm } from 'redux-form';
// import { compose } from 'recompose';
// import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Form, Layout } from 'antd';

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

// import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
// import { withMcsRouter } from '../../../../Helpers';
// import { Actionbar } from '../../../../Actionbar';
// import { McsIcons } from '../../../../../components/McsIcons';
// import { FormInput, FormTitle, FormSelect, withValidators } from '../../../../../components/Form';
// import { RecordElement, RelatedRecords } from '../../../../../components/RelatedRecord';
// import { generateFakeId, isFakeId } from '../../../../../utils/FakeIdHelper';
// import messages from '../messages';
// // import EmailBlastForm from './EmailBlastForm';
// import EmailRouterService from '../../../../../services/EmailRouterService';

const { Content } = Layout;

class AdGroupForm extends Component {

  render() {
    const {
      form: {
        getFieldDecorator
      }
    } = this.props;

    return (
      <Form
        id="adBlockCampaignSteps"
        className="edit-layout ant-layout"
        onSubmit={() => {}}
      >
        <Content className="mcs-content-container mcs-form-container">
          <General getFieldDecorator={getFieldDecorator} />
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

AdGroupForm.propTypes = {
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
  }).isRequired,
};

AdGroupForm = Form.create()(AdGroupForm);

export default AdGroupForm;
