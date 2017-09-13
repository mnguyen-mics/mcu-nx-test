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
      { image: 'check', name: 'Display' },
      { image: 'check', name: 'Video' },
      { image: 'check', name: 'Mobile' },
    ],
    switchButton: true,
  },
  {
    type: {
      image: 'question',
      text: 'LinkedIn',
    },
    data: [
      { image: 'check', name: 'Display' },
      { image: 'close-big', name: 'Video' },
      { image: 'check', name: 'Mobile' },
    ],
    switchButton: true,
  },
];

function Publisher({ formatMessage, handlers }) {

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
          ? (
            <AdGroupTable
              dataSource={mockDataSource}
              tableName="publisherTable"
              updateTableFieldStatus={handlers.updateTableFieldStatus}
            />
          )
          : */(
            <EmptyRecords
              iconType="plus"
              message={formatMessage(messages.contentSection4EmptyTitle)}
            />
          )
        }
      </Row>
    </div>
  );
}

Publisher.propTypes = {
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    updateTableFieldStatus: PropTypes.func.isRequired,
  }).isRequired,
};

export default Publisher;
