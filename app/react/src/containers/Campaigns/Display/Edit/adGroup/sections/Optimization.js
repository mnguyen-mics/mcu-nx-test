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
      text: 'PreBid - Retargeting',
    },
    data: ['Click Prediction (DTLR)'],
  },
];

function Optimization({ formatMessage }) {

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
        {/* mockDataSource.length
          ? <AdGroupTable dataSource={mockDataSource} tableName="optimizationTable" />
          : */<EmptyRecords
            iconType="plus"
            message={formatMessage(messages.contentSection6EmptyTitle)}
          />
        }
      </Row>
    </div>
  );
}

Optimization.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export default Optimization;
