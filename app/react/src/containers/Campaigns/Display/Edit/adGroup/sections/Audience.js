import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';
import SegmentSelector from '../../../../Email/Edit/SegmentSelector';
import AudienceSegmentService from '../../../../../../services/AudienceSegmentService';

const { FormSection } = Form;

class Audience extends Component {

  openWindow = () => {
    const { formValues, handlers } = this.props;
    const additionalProps = {
      close: handlers.closeNextDrawer,
      save: this.updateData,
      selectedIds: formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id),
    };

    handlers.openNextDrawer(SegmentSelector, { additionalProps });
  }

  updateData = (selectedIds) => {
    const { formValues, handlers, organisationId } = this.props;
    const fetchSelectedSegments = Promise.all(selectedIds.map(segmentId => {
      return AudienceSegmentService.getFormattedSegment(segmentId);
    }));
    const fetchMetadata = AudienceSegmentService.getSegmentMetaData(organisationId);

    handlers.closeNextDrawer();

    Promise.all([fetchSelectedSegments, fetchMetadata])
        .then(results => {
          const segments = results[0];
          const metadata = results[1];

          return segments.map(segment => {
            const { desktop_cookie_ids, user_points } = metadata[segment.id];
            const prevSeg = formValues.find(elem => elem.id === segment.id);
            const include = (prevSeg ? prevSeg.include : true);

            return { ...segment, desktop_cookie_ids, include, user_points };
          });
        })
        .then(newFields => {
          handlers.updateTableFields({ newFields, tableName: 'audienceTable' });
        });
  }

  render() {
    const { formatMessage, formValues, handlers } = this.props;

    const dataSource = formValues.reduce((tableData, segment, index) => {
      return (!segment.toBeRemoved
        ? [
          ...tableData,
          {
            key: segment.id,
            type: { image: 'users', name: segment.name },
            info: [
              `${segment.user_points} ${formatMessage(messages.contentSection2Medium1)}`,
              `${segment.desktop_cookie_ids} ${formatMessage(messages.contentSection2Medium2)}`,
            ],
            include: { bool: segment.include, index },
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
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFields: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired,
};

export default Audience;
