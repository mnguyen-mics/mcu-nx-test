import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';

const { FormSection } = Form;

function Audience({
  formatMessage,
  openWindow,
  segments
}) {

  // const dataSource = segments.map(segment => {
  //   console.log('>>>> segment = ', segment);
  //
  //   return ({
  //     type: { image: 'users', text: segment.name },
  //     data: [
  //       `${segment.user_points} ${formatMessage(messages.contentSection2Medium1)}`,
  //       `${segment.desktop_cookie_ids} ${formatMessage(messages.contentSection2Medium2)}`,
  //     ],
  //     switchButton: { id: segment.audience_segment_id },
  //     deleteButton: { id: segment.audience_segment_id },
  //   });
  // });

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
            onClick: openWindow,
          },
        ]}
        subtitle={messages.sectionSubtitle2}
        title={messages.sectionTitle2}
      />

      <Row>
        {segments.length
          ? (
            <AdGroupTable
              segments={segments}
              tableName="audienceTable"
            />
          )
          : (
            <EmptyRecords
              iconType="plus"
              message={formatMessage(messages.contentSection2EmptyTitle)}
            />
          )
        }
      </Row>
    </div>
  );
}

Audience.defaultProps = {
  segments: [],
};

Audience.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  openWindow: PropTypes.func.isRequired,

  segments: PropTypes.arrayOf(PropTypes.shape({
    audience_segment_id: PropTypes.string.isRequired,
    desktop_cookie_ids: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    user_points: PropTypes.number.isRequired,
  }.isRequired))
};

export default Audience;
