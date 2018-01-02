import * as React from 'react';
import { Row, Col, Checkbox, Tooltip, Modal } from 'antd';
import { WrappedFieldArrayProps } from 'redux-form';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';

import { McsIcons } from '../../../../../../../components';
import { FormSection } from '../../../../../../../components/Form';
import messages from '../../../messages';
import LocationSelectionRenderer from './LocationSelectionRenderer';
import SelectGeoname from './SelectGeoname';
import { LocationFieldModel } from '../../domain';
import { DrawableContentProps } from '../../../../../../../components/Drawer/index';
import { ReduxFormChangeProps } from '../../../../../../../utils/FormHelper';

const confirm = Modal.confirm;

export interface LocationTargetingFormSectionProps extends DrawableContentProps, ReduxFormChangeProps {}

interface State {
  locationTargetingDisplayed: boolean;
}

type JoinedProps = LocationTargetingFormSectionProps &
  InjectedIntlProps &
  WrappedFieldArrayProps<LocationFieldModel>;

class LocationTargetingFormSection extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      locationTargetingDisplayed: false,
    };
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const currentFields = this.props.fields;
    const nextFields = nextProps.fields;
    if (nextFields.length === 0 && currentFields.length !== nextFields.length) {
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

  render() {
    const { fields, intl: { formatMessage } } = this.props;

    const { locationTargetingDisplayed } = this.state;

    const showLocationTargeting =
      locationTargetingDisplayed || fields.length > 0;

    const allFields = fields.getAll();

    const alreadySelectedGeonameIds: string[] = allFields.map(
      f => f.model.geoname_id,
    );

    const removeField = (field: LocationFieldModel, index: number) =>
      fields.remove(index);

    const addLocationField = (field: LocationFieldModel) => fields.push(field);

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleLocation}
          title={messages.sectionTitleLocationTargeting}
        />

        <Checkbox
          checked={showLocationTargeting}
          className="field-label checkbox-location-section"
          onChange={this.handleCheckbox}
        >
          <FormattedMessage
            id="location-checkbox-message"
            defaultMessage="I want to target a specific location"
          />
        </Checkbox>
        <div className={showLocationTargeting ? '' : 'hide-section'}>
          <Row align="middle" type="flex">
            <Col span={4} />
            <Col span={10}>
              <LocationSelectionRenderer
                locationFields={allFields}
                onClickOnRemove={removeField}
              />
            </Col>
          </Row>
          <Row align="middle" type="flex">
            <Col span={4} className="label-col field-label">
              <FormattedMessage
                id="label-location-targeting"
                defaultMessage="Location : "
              />
            </Col>
            <Col span={10}>
              <SelectGeoname
                onGeonameSelect={addLocationField}
                hiddenGeonameIds={alreadySelectedGeonameIds}
              />
            </Col>
            <Col span={2} className="field-tooltip">
              <Tooltip
                placement="right"
                title={formatMessage(
                  messages.contentSectionLocationTooltipMessage,
                )}
              >
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default injectIntl(LocationTargetingFormSection);
