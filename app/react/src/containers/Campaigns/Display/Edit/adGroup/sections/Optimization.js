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
      text: 'PreBid - Retargeting',
    },
    data: ['Click Prediction (DTLR)'],
  },
];

function Optimization() {

  return (
    <div id="optimization">
      <FormSection
        dropdownItems={[
          {
            id: messages.dropdownAdd.id,
            message: messages.dropdownAdd,
            onClick: () => {},
          },
        ]}
        subtitle={messages.sectionSubtitle6}
        title={messages.sectionTitle6}
      />

      <Row>
        <AdGroupTable dataSource={mockDataSource} />
      </Row>
    </div>
  );
}

export default Optimization;
