import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';

const { FormSection } = Form;

// TODO: Remove mock data
const mockDataSource = [
  {
    type: {
      image: 'question',
      text: 'Google Ad Network',
    },
    data: [
      { image: 'check', text: 'Display' },
      { image: 'check', text: 'Video' },
      { image: 'check', text: 'Mobile' },
    ],
    switchButton: true,
  },
  {
    type: {
      image: 'question',
      text: 'LinkedIn',
    },
    data: [
      { image: 'check', text: 'Display' },
      { image: 'close-big', text: 'Video' },
      { image: 'check', text: 'Mobile' },
    ],
    switchButton: true,
  },
];

function Publisher({ formatMessage }) {

  return (
    <div id="publisher">
      <FormSection
        dropdownItems={[
          {
            id: messages.dropdownAdd.id,
            message: messages.dropdownAdd,
            onClick: () => {},
          },
        ]}
        subtitle={messages.sectionSubtitle4}
        title={messages.sectionTitle4}
      />

      <Row>
        {/* mockDataSource.length
          ? <AdGroupTable dataSource={mockDataSource} tableName="publisherTable" />
          : */<EmptyRecords
            iconType="plus"
            message={formatMessage(messages.contentSection4EmptyTitle)}
          />
        }
      </Row>
    </div>
  );
}

Publisher.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export default Publisher;
