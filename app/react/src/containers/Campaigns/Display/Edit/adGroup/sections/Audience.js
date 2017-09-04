import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';

// TODO: Remove mock data
const mockDataSource = [
  {
    type: {
      image: 'users',
      text: 'Sunday Visitors',
    },
    data: ['850k User Points', '850k Desktop', '850k Mobile'],
    switchButton: true,
  },
  {
    type: {
      image: 'users',
      text: 'Frequent Visitor',
    },
    data: ['850k User Points', '850k Desktop', '850k Mobile'],
    switchButton: true,
  },
  {
    type: {
      image: 'users',
      text: 'Frequent Buyer',
    },
    data: ['850k User Points', '850k Desktop', '850k Mobile'],
    switchButton: false,
  },
];

function Audience({ openWindow }) {

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
        <AdGroupTable dataSource={mockDataSource} />
      </Row>
    </div>
  );
}

Audience.propTypes = {
  openWindow: PropTypes.func.isRequired,
};

export default Audience;
