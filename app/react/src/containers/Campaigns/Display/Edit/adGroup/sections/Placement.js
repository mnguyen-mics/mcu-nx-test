import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Col, Row, Tooltip } from 'antd';

import { EmptyRecords, Form, McsIcons } from '../../../../../../components';
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
        subtitle={messages.sectionSubtitle9}
        title={messages.sectionTitle9}
      />

      <Row className="ad-group-placement">
        <Col offset={2}>
          <Field
            component={FormRadioGroup}
            name="placementType"
            props={{
              elementClassName: 'bold font-size radio',
              elements: radios,
              groupClassName: 'display-flex-column',
            }}
          />
        </Col>

        {placementType === 'custom' && placements.length
          && (
            <Col className="customContent font-size" offset={2}>
              <Row>
                <Col span={3} className="bold">
                  {formatMessage(messages.contentSection9Properties)}
                </Col>

                <Col span={14} style={{ marginTop: '-3em' }}>
                  <PlacementTable formatMessage={formatMessage} placements={placements} />
                </Col>
                <Col span={1} className="field-tooltip">
                  <Tooltip title="Test">
                    <McsIcons type="info" />
                  </Tooltip>
                </Col>
              </Row>
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
