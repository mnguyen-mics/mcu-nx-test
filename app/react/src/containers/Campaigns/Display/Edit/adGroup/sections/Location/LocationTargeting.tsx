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

  handleCheckbox = () => {
    const {
      intl: {
        formatMessage,
       },
      fields,
      RxF,
    } = this.props;
    if (fields && fields.length > 0) {
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
          this.toggleDisplayLocationTargetingSection();
        },
      });
    } else {
      this.toggleDisplayLocationTargetingSection();
    }
  }

  render() {

    const {
      fields,
    } = this.props;

    const { locationTargetingDisplayed } = this.state;

    const locationFields = fields.getAll();
    const showLocationTargeting = locationTargetingDisplayed || locationFields.length > 0;

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
              />
            </Col>
            <Col span={2} className="field-tooltip">
              <Tooltip placement="right" title={<FormattedMessage id="tooltip-location-message" defaultMessage="Lorem ipsum" />}>
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
