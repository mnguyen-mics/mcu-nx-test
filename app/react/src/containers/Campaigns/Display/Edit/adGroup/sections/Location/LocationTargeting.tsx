import * as React from 'react';
import {  Row, Col, Checkbox, Tooltip, Modal } from 'antd';
import { WrappedFieldArrayProps, InjectedFormProps } from 'redux-form';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';

import { McsIcons } from '../../../../../../../components';
import messages from '../../../messages';
import LocationSelectionRenderer from './LocationSelectionRenderer';
import { isFakeId } from '../../../../../../../utils/FakeIdHelper';
import SelectGeoname from './SelectGeoname';
import { LocationFieldModel } from './domain';

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

  componentWillReceiveProps(nextProps: JoinedProps) {
    const current = this.props.fields.getAll();
    const next = nextProps.fields.getAll();
    if (
      this.getDisplayedLocations(next).length === 0 &&
      this.getDisplayedLocations(current).length !== this.getDisplayedLocations(next).length
    ) {
      this.setState({ locationTargetingDisplayed: false });
    }
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
      if (found && !isFakeId(field.id)) {
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

  addLocationField = (localtionField: LocationFieldModel) => {
    const { fields } = this.props;
    const allFields = fields ? fields.getAll() : [];
    this.props.RxF.change((fields as any).name, allFields.concat([localtionField]));
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
