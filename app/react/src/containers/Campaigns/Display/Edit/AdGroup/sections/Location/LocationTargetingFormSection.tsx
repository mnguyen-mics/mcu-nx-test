import * as React from 'react';
import { Checkbox, Modal } from 'antd';
import { WrappedFieldArrayProps } from 'redux-form';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';


import { FormSection, FormFieldWrapper } from '../../../../../../../components/Form';
import messages from '../../../messages';
import LocationSelectionRenderer from './LocationSelectionRenderer';
import SelectGeoname from './SelectGeoname';
import { LocationFieldModel } from '../../domain';
import ObjectRenderer from '../../../../../../ObjectRenderer/ObjectRenderer';
import { ReduxFormChangeProps } from '../../../../../../../utils/FormHelper';
import { lazyInject } from '../../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../../constants/types';
import { IGeonameService, Geoname } from '../../../../../../../services/GeonameService';

const confirm = Modal.confirm;

export interface LocationTargetingFormSectionProps
  extends ReduxFormChangeProps {
    small?: boolean;
    disabled?: boolean;
  }

interface State {
  locationTargetingDisplayed: boolean;
}

type JoinedProps = LocationTargetingFormSectionProps &
  InjectedIntlProps &
  WrappedFieldArrayProps<LocationFieldModel>;

class LocationTargetingFormSection extends React.Component<JoinedProps, State> {

  @lazyInject(TYPES.IGeonameService)
  private _geonameService: IGeonameService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      locationTargetingDisplayed: false,
    };
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const currentFields = this.props.fields;
    const previousFields = previousProps.fields;
    const { locationTargetingDisplayed } = this.state;
    if (currentFields.length === 0 && currentFields.length !== previousFields.length && locationTargetingDisplayed !== false) {
      this.setState({ locationTargetingDisplayed: false });
    }
  }

  toggleDisplayLocationTargetingSection = () => {
    this.setState({
      locationTargetingDisplayed: !this.state.locationTargetingDisplayed,
    });
  };

  handleCheckbox = () => {
    const { intl: { formatMessage }, fields, formChange } = this.props;

    if (fields.length > 0) {
      confirm({
        cancelText: formatMessage(messages.cancel),
        content: formatMessage(messages.notificationWarning),
        maskClosable: true,
        okText: formatMessage(messages.ok),
        onOk: () => {
          formChange((fields as any).name, []);
        },
      });
    } else if (fields.length === 0) {
      this.setState({
        locationTargetingDisplayed: !this.state.locationTargetingDisplayed,
      });
    } else {
      this.toggleDisplayLocationTargetingSection();
    }
  };

  addLocationField = (locationField: LocationFieldModel) => {
    const { fields, formChange, intl: { formatMessage } } = this.props;

    const allFields = fields.getAll();

    let isUnderneath = false;
    let parentIsExcluded = false;
    const keysToRemove: string[] = [];
    allFields.forEach(field => {
      if (field.model.country === locationField.model.country) {
        if (field.model.admin1 === '00') {
          // is coutry
          isUnderneath = true;
          if (field.model.exclude) {
            parentIsExcluded = true;
          }
        } else if (
          field.model.admin1 === locationField.model.admin1 &&
          locationField.model.admin2 &&
          !field.model.admin2
        ) {
          // is same admin1
          isUnderneath = true;
          if (field.model.exclude) {
            parentIsExcluded = true;
          }
        }
      }
    });

    // need to exclude
    if (!parentIsExcluded && isUnderneath) {
      locationField.model.exclude = true;
    }

    allFields.forEach(field => {
      if (field.model.country === locationField.model.country) {
        if (locationField.model.admin1 === '00') {
          // adding a country so we need to remove subsequent underneath locations
          if (locationField.model.exclude) {
            keysToRemove.push(field.key);
          } else if (!field.model.exclude) {
            keysToRemove.push(field.key);
          }
        } else if (
          locationField.model.admin1 === field.model.admin1 &&
          locationField.model.admin2 === null
        ) {
          // is admin 1 and has subsequent underneath location
          if (locationField.model.exclude) {
            keysToRemove.push(field.key);
          } else if (!field.model.exclude) {
            keysToRemove.push(field.key);
          }
        }
      }
    });

    if (parentIsExcluded) {
      Modal.warning({
        title: formatMessage(messages.contentSectionLocationModal1Title),
        content: formatMessage(messages.contentSectionLocationModal1),
      });
    } else if (keysToRemove.length) {
      const geonameIds = allFields.reduce((acc: string[], field) => {
        if (keysToRemove.includes(field.key)) {
          return [...acc, field.model.geoname_id];
        }
        return acc;
      }, []);
      const renderGeoname = (el: Geoname) => <div>{el.name}</div>;
      const content = (
        <div>
          <div>{formatMessage(messages.contentSectionLocationModal2)}</div>
          <br />
          {geonameIds.map(id => {
            return (
              <ObjectRenderer
                key={id}
                id={id}
                renderMethod={renderGeoname}
                fetchingMethod={this._geonameService.getGeoname}
              />
            );
          })}
        </div>
      );
      Modal.confirm({
        title: formatMessage(messages.contentSectionLocationModal2Title),
        content: content,
        onOk: () => {
          const newFields = allFields.filter(
            field => !keysToRemove.includes(field.key),
          );
          formChange((fields as any).name, newFields.concat([locationField]));
        },
      });
    } else {
      fields.push(locationField);
    }
  };

  render() {
    const { fields, intl: { formatMessage }, disabled } = this.props;

    const { locationTargetingDisplayed } = this.state;

    const showLocationTargeting =
      locationTargetingDisplayed || fields.length > 0;

    const allFields = fields.getAll();

    const alreadySelectedGeonameIds: string[] = allFields.map(
      f => f.model.geoname_id,
    );

    const removeField = (field: LocationFieldModel, index: number) =>
      fields.remove(index);

    const flexAlign = allFields.length > 0 ? 'top' : 'middle';

    return (
      <div className="locationTargeting">
        <FormSection
          subtitle={messages.sectionSubtitleLocation}
          title={messages.sectionTitleLocationTargeting}
        />

        <Checkbox
          checked={showLocationTargeting}
          className="field-label checkbox-location-section"
          onChange={this.handleCheckbox}
          disabled={!!disabled}
        >
          <FormattedMessage
            id="display.campaign.edit.adGroup.locationTargetingSection.checkboxMessage"
            defaultMessage="I want to target a specific location"
          />
        </Checkbox>
        <div className={showLocationTargeting ? '' : 'hide-section'}>
          <FormFieldWrapper
            label={<FormattedMessage
              id="display.campaign.edit.adGroup.locationTargetingSection.label"
              defaultMessage="Location"
            />}
            rowProps={{ align: flexAlign }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionLocationTooltipMessage,
              )
            }}
            small={this.props.small}
          >
            <LocationSelectionRenderer
              locationFields={allFields}
              onClickOnRemove={removeField}
              disabled={disabled}
            />
            <SelectGeoname
                onGeonameSelect={this.addLocationField}
                hiddenGeonameIds={alreadySelectedGeonameIds}
                disabled={disabled}
              />
          </FormFieldWrapper>
          
        </div>
      </div>
    );
  }
}

export default injectIntl(LocationTargetingFormSection);
