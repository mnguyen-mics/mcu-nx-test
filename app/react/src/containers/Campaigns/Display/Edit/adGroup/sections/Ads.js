import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import messages from '../../messages';

const { FormSection } = Form;

function Ads({ formatMessage }) {

  return (
    <div id="ads">
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
            onClick: () => {},
          },
        ]}
        subtitle={messages.sectionSubtitle7}
        title={messages.sectionTitle7}
      />

      <Row>
        <EmptyRecords
          iconType="plus"
          message={formatMessage(messages.contentSection7EmptyTitle)}
        />
      </Row>
    </div>
  );
}

Ads.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export default Ads;
