import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
// import Scrollspy from 'react-scrollspy';
import { Form, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
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
import SegmentSelector from '../../../Email/Edit/SegmentSelector';
import withDrawer from '../../../../../components/Drawer';
import * as SessionHelper from '../../../../../state/Session/selectors';
import { withMcsRouter } from '../../../../Helpers';


// import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
// import { withMcsRouter } from '../../../../Helpers';
// import { Actionbar } from '../../../../Actionbar';
// import McsIcons from '../../../../../components/McsIcons';
// import { RecordElement, RelatedRecords } from '../../../../../components/RelatedRecord';
// import { generateFakeId, isFakeId } from '../../../../../utils/FakeIdHelper';
// import messages from '../messages';
// // import EmailBlastForm from './EmailBlastForm';
// import EmailRouterService from '../../../../../services/EmailRouterService';

const { Content } = Layout;

class AdGroupForm extends Component {

  state = { segments: this.props.segments };

  onSubmit = (finalValues) => {
    console.log('finalValues = ', finalValues);

    // const { save } = this.props;
    // const { segments } = this.state;
    // if (segments.length === 0) {
    //   this.setState({ segmentRequired: true });
    // } else {
    //   save({
    //     ...formValues.blast,
    //     segments,
    //   });
    // }
  }

  openWindow = (/* type */) => () => {
    const {
      openNextDrawer,
      closeNextDrawer,
    } = this.props;

    const { segments } = this.state;

    const segmentSelectorProps = {
      save: this.updateSegments,
      close: closeNextDrawer,
      selectedSegmentIds: segments.map(s => s.audience_segment_id),
    };

    const options = {
      additionalProps: segmentSelectorProps,
    };

    openNextDrawer(SegmentSelector, options);
  }

  updateSegments = (selectedAudienceSegments) => {
    const { closeNextDrawer } = this.props;

    const buildSegmentSelection = segment => ({
      audience_segment_id: segment.id,
      name: segment.name,
    });

    this.setState(prevState => ({
      segments: selectedAudienceSegments.map(buildSegmentSelection),
      segmentRequired: !prevState.segmentRequired,
    }));
    closeNextDrawer();
  }

  render() {
    const {
      fieldValidators,
      formId,
      handleSubmit,
      hasDatamarts,
      organisationId,
    } = this.props;

    const displaySegmentSelector = hasDatamarts(organisationId);

    return (
      <Form
        className="edit-layout ant-layout"
        id={formId}
        onSubmit={handleSubmit(this.onSubmit)}
      >
        <Content className="mcs-content-container mcs-form-container">
          <General fieldValidators={fieldValidators} />
          {
            displaySegmentSelector &&
            <div>
              <hr />
              <Audience openWindow={this.openWindow('segments')} />
            </div>
          }
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
  segments: [],
};

AdGroupForm.propTypes = {
  organisationId: PropTypes.string.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  segments: PropTypes.arrayOf(PropTypes.shape()),
  hasDatamarts: PropTypes.func.isRequired,
};

const ConnectedAdGroupForm = compose(
  withMcsRouter,
  reduxForm({
    form: 'adGroupForm',
    enableReinitialize: true,
  }),
  withDrawer,
  withValidators,
  connect(
    state => ({
      hasDatamarts: SessionHelper.hasDatamarts(state),
    }),
  ),
)(AdGroupForm);

export default ConnectedAdGroupForm;
