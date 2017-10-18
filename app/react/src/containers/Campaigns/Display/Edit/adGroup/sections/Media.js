import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components/index.ts';
import messages from '../../messages';

const { FormSection } = Form;

function Media({
  formatMessage,
}) {

  return (
    <div id="media">
      <FormSection
        dropdownItems={[]}
        subtitle={messages.sectionSubtitleMedia}
        title={messages.sectionTitleMedia}
      />

      <Row>
        <EmptyRecords
          iconType="plus"
          message={formatMessage(messages.contentSectionMediaEmptyTitle)}
        />
      </Row>
    </div>
  );
}

Media.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export default Media;
