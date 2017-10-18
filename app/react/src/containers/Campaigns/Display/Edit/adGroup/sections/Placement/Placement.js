import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { isEmpty } from 'lodash';
import { Col, Form as AntForm, Row, Tooltip } from 'antd';

import { EmptyRecords, Form, McsIcons } from '../../../../../../../components/index.ts';
import PlacementSearch from './PlacementSearch';
import PlacementList from './PlacementList';
import { setTableRowIndex } from '../../../../../../../utils/TableUtils';
import messages from '../../../messages';

const { FormRadioGroup, FormSection } = Form;

class Placement extends Component {

  state = {
    placementOption: 'auto',
    displaySearchOptions: false,
  }

  updateDisplaySearchOptions = (bool) => (e) => {
    this.setState({ displaySearchOptions: bool });
    e.preventDefault();
  }

  render() {
    const {
      fieldGridConfig,
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
      emptyTableMessage: formatMessage(messages.contentSectionPlacementSearchEmptyTable),
      formatMessage,
      formName: formName,
    };

    const helpToolTipProps = {
      title: formatMessage(messages.contentSectionPlacementTooltip),
    };
    const mergedTooltipProps = {
      placement: 'right',
      ...helpToolTipProps,
    };

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    return (
      <div id="media">
        <FormSection
          subtitle={messages.sectionSubtitlePlacement}
          title={messages.sectionTitlePlacement}
        />

        <Row className="ad-group-placement">
          <Col offset={1}>
            <FormRadioGroup
              elementClassName="field-label radio"
              elements={[
                { id: 1, title: formatMessage(messages.contentSectionPlacementRadio1), value: 'auto' },
                { id: 2, title: formatMessage(messages.contentSectionPlacementRadio2), value: 'custom' },
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
            <AntForm.Item
              label={<span className="field-label">{formatMessage(messages.contentSectionPlacementProperties)}</span>}
              {...fieldGridConfig}
            >
              <Row align="middle" type="flex">
                <Col span={22} className="content-wrapper">
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
                        title: messages.contentSectionPlacementTypeWebsites,
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
                        title: messages.contentSectionPlacementTypeMobileApps,
                        type: 'mobile',
                      }}
                    />
                  </div>
                </Col>

                {displayHelpToolTip
                  && (
                    <Col span={2} className="field-tooltip" style={{ alignSelf: 'flex-start', paddingTop: '.7em' }}>
                      <Tooltip {...mergedTooltipProps}>
                        <McsIcons type="info" />
                      </Tooltip>
                    </Col>
                  )
                }
              </Row>
            </AntForm.Item>
            )
          }

          {placementOption === 'custom' && !formValues.mobile.length && !formValues.web.length
            && (
              <EmptyRecords
                iconType="plus"
                message={formatMessage(messages.contentSectionPlacementEmptyTitle)}
              />
            )
          }
        </Row>
      </div>
    );
  }
}

Placement.propTypes = {
  fieldGridConfig: PropTypes.shape().isRequired,
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
