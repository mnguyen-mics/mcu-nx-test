import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Col, Row, Tooltip } from 'antd';

import { EmptyRecords, Form, McsIcons } from '../../../../../../components';
import PlacementSearch from '../PlacementSearch';
import PlacementTable from '../PlacementTable';
import messages from '../../messages';

const { FormRadioGroup, FormSection } = Form;

function Placement({
  formName,
  formValues: { placementType, placements },
  formatMessage,
}) {

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
              elements: [
                { id: 1, title: formatMessage(messages.contentSection9Radio1), value: 'auto' },
                { id: 2, title: formatMessage(messages.contentSection9Radio2), value: 'custom' },
              ],
              groupClassName: 'display-flex-column',
            }}
          />
        </Col>

        <PlacementSearch
          formName={formName}
          placements={[...placements.web, ...placements.mobile]}
        />

        {placementType === 'custom' && (placements.mobile.length || placements.web.length)
          && (
            <Col className="customContent font-size" offset={2}>
              <Row>
                <Col span={3} className="bold">
                  {formatMessage(messages.contentSection9Properties)}
                </Col>

                <Col span={14} style={{ marginTop: '-3em' }}>
                  <div className="placement-table">
                    <FieldArray
                      component={PlacementTable}
                      name="placements.web"
                      props={{
                        formName,
                        placements: placements.web,
                        title: formatMessage(messages.contentSection9TypeWebsites),
                        type: 'web',
                      }}
                    />

                    <FieldArray
                      component={PlacementTable}
                      name="placements.mobile"
                      props={{
                        className: 'remove-margin-between-tables',
                        formName,
                        placements: placements.mobile,
                        title: formatMessage(messages.contentSection9TypeMobileApps),
                        type: 'mobile',
                      }}
                    />
                  </div>
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

        {placementType === 'custom' && !placements.mobile.length && !placements.web.length
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
  formName: PropTypes.string.isRequired,

  formValues: PropTypes.shape({
    placementType: PropTypes.string,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default Placement;
