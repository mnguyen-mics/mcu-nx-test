import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';

import { EmptyRecords, Form } from '../../../../../../../components/index.ts';
import PlacementSearch from './PlacementSearch';
import PlacementList from './PlacementList';
import { setTableRowIndex } from '../../../../../../../utils/TableUtils';
import messages from '../../../messages';

const { FormFieldWrapper, FormRadioGroup, FormSection } = Form;

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
      className: 'tooltip-top-right',
      title: formatMessage(messages.contentSectionPlacementTooltip),
    };

    return (
      <div id="placement">
        <FormSection
          subtitle={messages.sectionSubtitlePlacement}
          title={messages.sectionTitlePlacement}
        />

        <div className="ad-group-placement-section">
          <div className="placement-radio-group">
            <FormRadioGroup
              elementClassName="field-label checkbox-options"
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
          </div>

          {placementOption === 'custom' && (formValues.mobile.length || formValues.web.length)
            && (
            <FormFieldWrapper
              className="custom-content"
              helpToolTipProps={helpToolTipProps}
              label={formatMessage(messages.contentSectionPlacementProperties)}
            >
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
            </FormFieldWrapper>
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
        </div>
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
