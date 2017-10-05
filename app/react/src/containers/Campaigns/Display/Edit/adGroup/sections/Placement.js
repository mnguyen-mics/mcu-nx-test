import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Col, Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import PlacementTable from '../PlacementTable';
import messages from '../../messages';

const { FormRadioGroup, FormSection } = Form;

function Placement({ formValues, formatMessage }) {

  const { placementType, placements } = formValues;

  console.log('formValues = ', formValues);

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

        {placementType === 'custom' && placements.length
          && (
            <Col offset={2}>
              <PlacementTable placements={placements} />
            </Col>
          )
        }

        {placementType === 'custom' && !placements.length
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
