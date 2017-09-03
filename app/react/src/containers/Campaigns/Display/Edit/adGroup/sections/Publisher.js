import React from 'react';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';

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

function Publisher() {

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
        <AdGroupTable dataSource={mockDataSource} />
      </Row>
    </div>
  );
}

export default Publisher;
