import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { Col, Row, Tooltip } from 'antd';

import { EmptyRecords, Form, McsIcons } from '../../../../../../../components';
import PlacementSearch from './PlacementSearch';
import PlacementList from './PlacementList';
import { setTableRowIndex } from '../../../../../../../utils/TableUtils';
import messages from '../../../messages';

const { FormRadioGroup, FormSection } = Form;

class Placement extends Component {

  state = {
    placementOption: 'auto',
    displaySearchOptions: false
  }

  updateDisplaySearchOptions = (bool) => (e) => {
    this.setState({ displaySearchOptions: bool });
    e.preventDefault();
  }

  render() {
    const {
      formName,
      formValues,
      formatMessage,
    } = this.props;
    const { placementOption, displaySearchOptions } = this.state;

    const formattedPlacements = [
      ...setTableRowIndex(formValues.web),
      ...setTableRowIndex(formValues.mobile)
    ];

    const commonProps = {
      emptyTableMessage: formatMessage(messages.contentSection9SearchEmptyTable),
      formatMessage,
      formName: formName,
    };

    return (
      <div id="media">
        <FormSection
          subtitle={messages.sectionSubtitle9}
          title={messages.sectionTitle9}
        />

        <Row className="ad-group-placement">
          <Col offset={2}>
            <FormRadioGroup
              elementClassName="bold font-size radio"
              elements={[
                { id: 1, title: formatMessage(messages.contentSection9Radio1), value: 'auto' },
                { id: 2, title: formatMessage(messages.contentSection9Radio2), value: 'custom' },
              ]}
              groupClassName="display-flex-column"
              input={{
                onChange: (option) => this.setState({ placementOption: option }),
                value: this.state.placementOption,
              }}
            />
          </Col>

          {placementOption === 'custom' && (formValues.mobile.length || formValues.web.length)
          && (
            <Col className="custom-content font-size" offset={2}>
              <Row>
                <Col span={3} className="bold">
                  {formatMessage(messages.contentSection9Properties)}
                </Col>

                <Col span={14} className="content-wrapper">
                  <PlacementSearch
                    {...commonProps}
                    displaySearchOptions={this.state.displaySearchOptions}
                    placements={formattedPlacements}
                    updateDisplayOptions={this.updateDisplaySearchOptions}
                  />

                  <div className={displaySearchOptions ? 'hide-section' : ''}>
                    <FieldArray
                      component={PlacementList}
                      name="placements.web"
                      props={{
                        ...commonProps,
                        placements: formattedPlacements.filter(({ type }) => type === 'web'),
                        title: messages.contentSection9TypeWebsites,
                        type: 'web',
                      }}
                    />

                    <FieldArray
                      component={PlacementList}
                      name="placements.mobile"
                      props={{
                        ...commonProps,
                        displayHeaderTopBorder: true,
                        placements: formattedPlacements.filter(({ type }) => type === 'mobile'),
                        title: messages.contentSection9TypeMobileApps,
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

          {placementOption === 'custom' && !formValues.mobile.length && !formValues.web.length
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
    web: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })),

    mobile: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })),
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default Placement;
