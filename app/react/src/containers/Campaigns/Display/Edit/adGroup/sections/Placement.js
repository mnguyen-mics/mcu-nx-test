import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Col, Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import PlacementTable from '../PlacementTable';
import messages from '../../messages';

const { FormRadioGroup, FormSection } = Form;

// TODO: remove TEMPDATA
const TEMPDATA = [
  { id: 1, name: 'Libération', type: 'web' },
  { id: 2, name: 'Voici', type: 'web' },
  { id: 3, name: 'Gala', type: 'web' },
  { id: 4, name: 'Libération', type: 'mobile' },
  { id: 5, name: 'Voici', type: 'mobile' },
  { id: 6, name: 'Gala', type: 'mobile' },
];

function Placement({ formValues, formatMessage }) {

  const radios = [
    { id: 1, title: formatMessage(messages.contentSection9Radio1), value: 'auto' },
    { id: 2, title: formatMessage(messages.contentSection9Radio2), value: 'custom' },
  ];

  return (
    <div id="media">
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
        subtitle={messages.sectionSubtitle9}
        title={messages.sectionTitle9}
      />

      <Row>
        <Col offset={2}>
          <Field
            component={FormRadioGroup}
            name="placementType"
            props={{ elements: radios }}
          />
        </Col>

        {formValues.placementType === 'custom' && TEMPDATA.length
          && (
            <Col offset={2}>
              <PlacementTable />
            </Col>
          )
        }

        {formValues.placementType === 'custom' && !TEMPDATA.length
          && <EmptyRecords
            iconType="plus"
            message={formatMessage(messages.contentSection9EmptyTitle)}
          />
        }
      </Row>
    </div>
  );
}


Placement.propTypes = {
  formValues: PropTypes.shape({
    placementType: PropTypes.string,
  }).isRequired,
  formatMessage: PropTypes.func.isRequired,
};

export default Placement;
