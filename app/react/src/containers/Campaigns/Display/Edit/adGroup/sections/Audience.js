import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import moment from 'moment';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';
import SegmentSelector from '../../../../Email/Edit/SegmentSelector';
import AudienceSegmentService from '../../../../../../services/AudienceSegmentService';
import ReportService from '../../../../../../services/ReportService';
import { normalizeArrayOfObject } from '../../../../../../utils/Normalizer';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';

const { FormSection } = Form;

class Audience extends Component {

  openWindow = () => {
    const { formValues, handlers } = this.props;

    const selectedSegmentIds = formValues
      .filter(segment => !segment.toBeRemoved)
      .map(segment => segment.audience_segment_id);

    const additionalProps = {
      close: handlers.closeNextDrawer,
      save: this.updateData(handlers.closeNextDrawer),
      selectedSegmentIds,
    };

    handlers.openNextDrawer(SegmentSelector, { additionalProps });
  }

  updateData = (callback) => {
    return (selectedSegmentIds) => {
      callback();

      const {
        handlers: { updateTableFields },
        organisationId,
      } = this.props;

      const fetchSelectedSegments = Promise.all(selectedSegmentIds.map(segmentId => {
        return AudienceSegmentService.getSegment(segmentId).then(segment => ({
          audience_segment_id: segment.id,
          name: segment.name,
          target: true,
        }));
      }));

      const fetchMetadata = ReportService.getAudienceSegmentReport(
        organisationId,
        moment().subtract(1, 'days'),
        moment(),
        'audience_segment_id',
      );

      Promise.all([fetchSelectedSegments, fetchMetadata])
      .then(results => {
        const selectedSegments = results[0];
        const metadata = normalizeArrayOfObject(
          normalizeReportView(results[1].data.report_view),
          'audience_segment_id',
        );

        return selectedSegments.map(segment => {
          const { user_points, desktop_cookie_ids } = metadata[segment.audience_segment_id];

          return { ...segment, user_points, desktop_cookie_ids };
        });
      })
      .then(newFields => {
        updateTableFields({ newFields, tableName: 'audienceTable' });
      });
    };
  }

  render() {
    const { formatMessage, formValues, handlers } = this.props;

    const dataSource = formValues.reduce((tableData, segment, index) => {
      return (!segment.toBeRemoved
        ? [
          ...tableData,
          {
            key: segment.audience_segment_id,
            type: { image: 'users', name: segment.name },
            info: [
              `${segment.user_points} ${formatMessage(messages.contentSection2Medium1)}`,
              `${segment.desktop_cookie_ids} ${formatMessage(messages.contentSection2Medium2)}`,
            ],
            target: { bool: segment.target, index },
            toBeRemoved: index,
          }
        ]
        : tableData
      );
    }, []);

    return (
      <div id="audience">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: () => {},
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitle2}
          title={messages.sectionTitle2}
        />

        <Row>
          <AdGroupTable
            dataSource={dataSource}
            tableName="audienceTable"
            updateTableFieldStatus={handlers.updateTableFieldStatus}
          />

          {!dataSource.length
            ? <EmptyRecords
              iconType="plus"
              message={formatMessage(messages.contentSection2EmptyTitle)}
            />
            : null
          }
        </Row>
      </div>
    );
  }
}

Audience.defaultProps = {
  formValues: [],
};

Audience.propTypes = {
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFields: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired,
  formValues: PropTypes.arrayOf(PropTypes.shape()),
};

export default Audience;
