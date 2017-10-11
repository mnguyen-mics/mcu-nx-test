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
        dropdownItems={[
          {
            id: messages.dropdownAdd.id,
            message: messages.dropdownAdd,
            onClick: () => {},
          },
        ]}
        subtitle={messages.sectionSubtitle5}
        title={messages.sectionTitle5}
      />

      <Row>
        <EmptyRecords
          iconType="plus"
          message={formatMessage(messages.contentSection5EmptyTitle)}
        />
      </Row>
    </div>
  );
}

Media.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export default Media;
