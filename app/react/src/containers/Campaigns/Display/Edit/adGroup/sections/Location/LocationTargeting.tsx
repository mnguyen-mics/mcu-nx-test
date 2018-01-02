import * as React from 'react';
import {  Row, Col, Checkbox, Tooltip, Modal } from 'antd';
import { WrappedFieldArrayProps, InjectedFormProps } from 'redux-form';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';

import { McsIcons } from '../../../../../../../components';
import messages from '../../../messages';
import LocationSelectionRenderer from './LocationSelectionRenderer';
import { isFakeId } from '../../../../../../../utils/FakeIdHelper';
import GeonameRenderer from '../../../../../../Geoname/GeonameRenderer';
import SelectGeoname from './SelectGeoname';
import { LocationFieldModel } from './domain';
import { Geoname } from '../../../../../../../services/GeonameService';

const confirm = Modal.confirm;

export interface LocationTargetingProps {
  RxF: InjectedFormProps;
}

interface LocationTargetingState {
  locationTargetingDisplayed: boolean;
}

type JoinedProps =
  LocationTargetingProps &
  InjectedIntlProps &
  WrappedFieldArrayProps<LocationFieldModel>;

class LocationTargeting extends React.Component<JoinedProps, LocationTargetingState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      locationTargetingDisplayed: false,
    };
  }

  markAsDeleted = (locationField: LocationFieldModel) => {
    const {
      fields,
      RxF,
    } = this.props;

    const locationFields = fields.getAll();
    const newLocationFields: LocationFieldModel[] = [];

    locationFields.forEach(field => {
      const found = field.id === locationField.id;
      if (found && !isFakeId(field.id) && field.deleted !== true) {
        newLocationFields.push({
          ...field,
          deleted: true,
        });
      } else if (!found) {
        newLocationFields.push(field);
      }
    });
    RxF.change((fields as any).name, newLocationFields);
  }

  addLocationField = (locationField: LocationFieldModel) => {
    const { fields, intl: { formatMessage } } = this.props;
    const allFields = fields ? fields.getAll().filter(item => !item.deleted) : [];
    const allFieldsWithDeleted = fields ? fields.getAll() : [];

    const formattedLocationField = {
      ...locationField,
    };

    let isUnderneath = false;
    let parentIsExcluded = false;
    const idsToRemove: string[] = [];
    allFields.forEach(item => {
      if (item.resource.country === locationField.resource.country) {
        if (item.resource.admin1 === '00') {
          // is coutry
          isUnderneath = true;
          if (item.resource.exclude) {
            parentIsExcluded = true;
          }
        } else if (item.resource.admin1 === locationField.resource.admin1 && locationField.resource.admin2 && !item.resource.admin2) {
          // is same admin1
          isUnderneath = true;
          if (item.resource.exclude) {
            parentIsExcluded = true;
          }
        }
      }
    });

    // need to exclude
    if (!parentIsExcluded && isUnderneath) {
      formattedLocationField.resource.exclude = true;
    }

    allFields.forEach(item => {
      if (item.resource.country === locationField.resource.country) {
        if (locationField.resource.admin1 === '00') {
          // adding a country so we need to remove subsequent underneath locations
          if (locationField.resource.exclude) {
            idsToRemove.push(item.id);
          } else if (!item.resource.exclude) {
            idsToRemove.push(item.id);
          }

        } else if (locationField.resource.admin1 === item.resource.admin1 && locationField.resource.admin2 === null) {
          // is admin 1 and has subsequent underneath location
          if (locationField.resource.exclude) {
            idsToRemove.push(item.id);
          } else if (!item.resource.exclude) {
            idsToRemove.push(item.id);
          }
        }
      }
    });

    if (parentIsExcluded) {
      Modal.warning({
        title: formatMessage(messages.contentSectionLocationModal1Title),
        content: formatMessage(messages.contentSectionLocationModal1),
      });
    } else if (idsToRemove.length) {
      const geonameIds = allFields.reduce((acc: string[], val, i) => {
        if (idsToRemove.includes(val.id)) {
          return [...acc, val.resource.geoname_id];
        }
        return acc;
      }, []);
      const renderGeoname = (el: Geoname) => (<div>{el.name}</div>);
      const content = (
        <div>
          <div>{formatMessage(messages.contentSectionLocationModal2)}</div>
          <br />
          {
            geonameIds.map(id => {
              return (<GeonameRenderer key={id} geonameId={id} renderMethod={renderGeoname} />);
            })
          }

        </div>
      );
      Modal.confirm({
        title: formatMessage(messages.contentSectionLocationModal2Title),
        content: content,
        onOk: () => {
          const newFields = allFieldsWithDeleted.filter(item => !idsToRemove.includes(item.id));
          this.props.RxF.change((fields as any).name, newFields.concat([formattedLocationField]));
        },
      });
    } else {
      this.props.RxF.change((fields as any).name, allFieldsWithDeleted.concat([formattedLocationField]));
    }

  }

  toggleDisplayLocationTargetingSection = () => {
    this.setState({
      locationTargetingDisplayed: !this.state.locationTargetingDisplayed,
    });
  }

  getDisplayedLocations = (locationFields: LocationFieldModel[]) => {
    return locationFields.filter(f => !f.deleted);
  }

  handleCheckbox = () => {
    const {
      intl: {
        formatMessage,
       },
      fields,
      RxF,
    } = this.props;

    if (this.getDisplayedLocations(fields.getAll()).length > 0) {
      confirm({
        cancelText: formatMessage(messages.cancel),
        content: formatMessage(messages.notificationWarning),
        maskClosable: true,
        okText: formatMessage(messages.ok),
        onOk: () => {
          const locationFields = fields.getAll();
          const newLocationFields: LocationFieldModel[] = [];

          locationFields.forEach(field => {
            if (!isFakeId(field.id)) {
              newLocationFields.push({
                ...field,
                deleted: true,
              });
            }
          });
          RxF.change((fields as any).name, newLocationFields);
        },
      });
    } else if (fields.length === 0) {
      this.setState({
        locationTargetingDisplayed: !this.state.locationTargetingDisplayed,
      });
    } else {
      this.toggleDisplayLocationTargetingSection();
    }
  }

  render() {

    const {
      fields,
      intl: {
        formatMessage,
      },
    } = this.props;

    const {
      locationTargetingDisplayed,
    } = this.state;

    const locationFields = fields.getAll();
    const showLocationTargeting =
      (locationTargetingDisplayed || this.getDisplayedLocations(locationFields).length > 0);

    const excludedGeonamesIds = this.getDisplayedLocations(locationFields).map(field => field.resource.geoname_id);

    return (
      <div>
        <Checkbox
          checked={showLocationTargeting}
          className="field-label checkbox-location-section"
          onChange={this.handleCheckbox}
        >
          <FormattedMessage id="location-checkbox-message" defaultMessage="I want to target a specific location" />
        </Checkbox>
        <div className={showLocationTargeting ? '' : 'hide-section'}>
          <Row align="middle" type="flex">
            <Col span={4} />
            <Col span={10} >
              <LocationSelectionRenderer
                locationFields={locationFields}
                onClickOnRemove={this.markAsDeleted}
              />
            </Col>
          </Row>
          <Row align="middle" type="flex">
            <Col span={4} className="label-col field-label">
              <FormattedMessage id="label-location-targeting" defaultMessage="Location : " />
            </Col>
            <Col span={10}>
              <SelectGeoname
                onGeonameSelect={this.addLocationField}
                excludedGeonamesIds={excludedGeonamesIds}
              />
            </Col>
            <Col span={2} className="field-tooltip">
              <Tooltip placement="right" title={formatMessage(messages.contentSectionLocationTooltipMessage)}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default injectIntl(LocationTargeting);
