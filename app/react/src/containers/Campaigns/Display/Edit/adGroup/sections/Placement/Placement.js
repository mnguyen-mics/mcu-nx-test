import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Col, Row, Tooltip } from 'antd';

import { EmptyRecords, Form, McsIcons } from '../../../../../../../components';
import PlacementSearch from './PlacementSearch';
import PlacementTable from './PlacementTable';
import { setTableRowIndex } from '../../../../../../../utils/TableUtils';
import messages from '../../../messages';

const { FormRadioGroup, FormSection } = Form;

class Placement extends Component {

  state = { displaySearchOptions: false }

  setDisplaySearchOptions = (bool) => (e) => {
    this.setState({ displaySearchOptions: bool });
    e.preventDefault();
  }

  render() {
    const {
    formName,
    formValues: { placementType, placements },
    formatMessage,
  } = this.props;

    const formattedPlacements = [
      ...setTableRowIndex(placements.web),
      ...setTableRowIndex(placements.mobile)
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
                elements: [
                { id: 1, title: formatMessage(messages.contentSection9Radio1), value: 'auto' },
                { id: 2, title: formatMessage(messages.contentSection9Radio2), value: 'custom' },
                ],
                groupClassName: 'display-flex-column',
              }}
            />
          </Col>

          {placementType === 'custom' && (placements.mobile.length || placements.web.length)
          && (
            <Col className="customContent font-size" offset={2}>
              <Row>
                <Col span={3} className="bold">
                  {formatMessage(messages.contentSection9Properties)}
                </Col>

                <Col span={14} style={{ marginTop: '-3em' }}>

                  <PlacementSearch
                    displaySearchOptions={this.state.displaySearchOptions}
                    emptyTableMessage={formatMessage(messages.contentSection9SearchEmptyTable)}
                    placeholder={formatMessage(messages.contentSection9SearchPlaceholder)}
                    formName={formName}
                    placements={formattedPlacements}
                    setDisplaySearchOptions={this.setDisplaySearchOptions}
                  />

                  {!this.state.displaySearchOptions
                    && (
                    <div className="placement-table">
                      <FieldArray
                        component={PlacementTable}
                        name="placements.web"
                        props={{
                          className: 'remove-margin-between-tables',
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
                  )
                }
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
}


Placement.propTypes = {
  formName: PropTypes.string.isRequired,

  formValues: PropTypes.shape({
    placementType: PropTypes.string,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default Placement;
