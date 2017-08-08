/* eslint-disajble */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
// import Scrollspy from 'react-scrollspy';
// import { Field, reduxForm } from 'redux-form';
// import { compose } from 'recompose';
// import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Form, Layout, Row } from 'antd';

import FormSection from '../../../../../components/Partials/FormSection';

import messages from '../messages';

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

class AdGroupEditor extends Component {

  render() {
    return (
      <Form
        id="adBlockCampaignSteps"
        className="edit-layout ant-layout"
        onSubmit={() => {}}
      >
        <Content className="mcs-content-container mcs-form-container">
          <div id="general">
            <FormSection
              subtitle={messages.sectionSubtitle1}
              title={messages.sectionTitle1}
            />
            <Row />
          </div>

          <hr />

          <div id="audience">
            <FormSection
              subtitle={messages.sectionSubtitle2}
              title={messages.sectionTitle2}
            />
            <Row />
          </div>

          <hr />

          <div id="device">
            <FormSection
              subtitle={messages.sectionSubtitle3}
              title={messages.sectionTitle3}
            />
            <Row />
          </div>

          <hr />

          <div id="location">
            <FormSection
              subtitle={messages.sectionSubtitle4}
              title={messages.sectionTitle4}
            />
            <Row />
          </div>

          <hr />

          <div id="publisher">
            <FormSection
              subtitle={messages.sectionSubtitle5}
              title={messages.sectionTitle5}
            />
            <Row />
          </div>

          <hr />

          <div id="media">
            <FormSection
              subtitle={messages.sectionSubtitle6}
              title={messages.sectionTitle6}
            />
            <Row />
          </div>

          <hr />

          <div id="optimization">
            <FormSection
              subtitle={messages.sectionSubtitle7}
              title={messages.sectionTitle7}
            />
            <Row />
          </div>

          <hr />

          <div id="ads">
            <FormSection
              subtitle={messages.sectionSubtitle8}
              title={messages.sectionTitle8}
            />
            <Row />
          </div>

          <hr />

          <div id="summary">
            <FormSection
              subtitle={messages.sectionSubtitle9}
              title={messages.sectionTitle9}
            />
            <Row />
          </div>
        </Content>
      </Form>
    );
  }
}

export default AdGroupEditor;
