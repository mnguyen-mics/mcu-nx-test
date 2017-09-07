import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { arrayPush, Form, formValueSelector, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

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
import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
import ReportService from '../../../../../services/ReportService';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { normalizeReportView } from '../../../../../utils/MetricHelper';

const { Content } = Layout;

// const segmentsWithMetadata = DisplayCampaignService.getSegment(campaignId, adGroupId);
// console.log('YOOO segmentsWithMetadata = ', segmentsWithMetadata);
class AdGroupForm extends Component {

  onSubmit = (finalValues) => {
    console.log('finalValues = ', finalValues);
  }

  openWindow = (/* type */) => () => {
    const {
      openNextDrawer,
      closeNextDrawer,
      formValues,
    } = this.props;

    const selectedSegmentIds = (formValues.audienceTable
      ? formValues.audienceTable.map(segment => segment.audience_segment_id)
      : []
    );
    const additionalProps = {
      close: closeNextDrawer,
      selectedSegmentIds,
      save: this.updateSegments,
    };

    openNextDrawer(SegmentSelector, { additionalProps });
  }

  updateSegments = (selectedSegmentsIds) => {
    const {
      closeNextDrawer,
      organisationId,
      // match: {
      //   params: {
      //     campaignId,
      //     adGroupId,
      //   },
      // },
    } = this.props;

    const buildSegmentSelection = segment => ({
      audience_segment_id: segment.id,
      desktop_cookie_ids: segment.desktop_cookie_ids,
      name: segment.name,
      user_points: segment.user_points,
      target: true,
      isDeleted: false,
    });

    Promise.all(selectedSegmentsIds.map(segmentId => {
      return AudienceSegmentService.getSegment(segmentId).then(segment => {
        return buildSegmentSelection(segment);
      });
    })).then(selectedSegments => {
      return {
        metadata: ReportService.getAudienceSegmentReport(
          organisationId,
          moment().subtract(1, 'days'),
          moment(),
          'audience_segment_id',
        ),
        selectedSegments,
      };
    }).then(results => {
      const metadata = normalizeArrayOfObject(
          normalizeReportView(results.metadata.data.report_view),
          'audience_segment_id',
        );

      return results.selectedSegments.map(segment => {
        const { user_points, desktop_cookie_ids } = metadata[segment.id];

        return { ...segment, user_points, desktop_cookie_ids };
      });
    }).then(selectedSegments => {
      selectedSegments.forEach(segment => {
        this.props.arrayPush('adGroupForm', 'audienceTable', segment);
      });
    });

    // selectedSegments.forEach(segment => {
    //   const params = {
    //     audience_segment_id: segment.id,
    //     desktop_cookie_ids: segment.desktop_cookie_ids,
    //     name: segment.name,
    //     user_points: segment.user_points,
    //   };
    //
    //   this.props.arrayPush('adGroupForm', `audienceTable.#${segment.id}`, params);
    // });

    closeNextDrawer();
  }

  render() {
    const {
      formValues,
      fieldValidators,
      formId,
      handleSubmit,
      hasDatamarts,
      intl: { formatMessage },
      organisationId,
    } = this.props;

    const displaySegmentSelector = hasDatamarts(organisationId);
    const commonProps = {
      formatMessage
    };

    console.log('formValues.audienceTable = ', formValues.audienceTable);

    /* TODO: remove empty array line 151 */
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
              <Audience
                {...commonProps}
                openWindow={this.openWindow('segments')}
                segments={formValues.audienceTable}
              />
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
  arrayPush: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,

  formValues: PropTypes.shape({
    audienceTable: PropTypes.arrayOf(PropTypes.shape()),
  }).isRequired,

  handleSubmit: PropTypes.func.isRequired,
  hasDatamarts: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
};


function mapStateToProps(state) {
  const formSelector = formValueSelector('adGroupForm');

  return {
    formValues: {
      audienceTable: formSelector(state, 'audienceTable'),
    },
    hasDatamarts: SessionHelper.hasDatamarts(state),
  };
}

const mapDispatchToProps = { arrayPush };

const ConnectedAdGroupForm = compose(
  withMcsRouter,
  reduxForm({
    form: 'adGroupForm',
    enableReinitialize: true,
  }),
  withDrawer,
  withValidators,
  connect(mapStateToProps, mapDispatchToProps),
)(AdGroupForm);

export default compose(
  injectIntl,
)(ConnectedAdGroupForm);
