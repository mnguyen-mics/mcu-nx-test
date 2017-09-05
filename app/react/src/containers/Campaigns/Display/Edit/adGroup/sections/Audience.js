import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';

const formatSegments = (segments) => {
  return segments.map(segment => ({
    type: { image: 'users', text: segment.name },
    data: [`${segment.user_points} User Points`, `${segment.desktop_cookie_ids} Desktop`],
    switchButton: true, // TODO: set switchButton
  }));
};

function Audience({ openWindow, segments }) {

  const dataSource = formatSegments(segments);

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
        <AdGroupTable dataSource={dataSource} />
      </Row>
    </div>
  );
}

Audience.defaultProps = {
  segments: [],
};

Audience.propTypes = {
  openWindow: PropTypes.func.isRequired,
  segments: PropTypes.arrayOf(PropTypes.shape({
    audience_segment_id: PropTypes.string.isRequired,
    desktop_cookie_ids: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    user_points: PropTypes.number.isRequired,
  }.isRequired))
};

export default Audience;
