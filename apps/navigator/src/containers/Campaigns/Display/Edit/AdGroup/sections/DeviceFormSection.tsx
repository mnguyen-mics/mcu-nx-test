import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { compose } from 'recompose';
import { WrappedFieldProps } from 'redux-form';

import messages from '../../messages';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { FormSection, FormSelectField } from '../../../../../../components/Form';
import DefaultSelect from '../../../../../../components/Form/FormSelect/DefaultSelect';
import { AdGroupResource } from '../../../../../../models/campaign/display';
import { TargetedMedia } from '../../../../../../models/campaign/constants';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { formatAdGroupProperty } from '../../../../Display/messages';

interface DeviceFormSectionProps extends WrappedFieldProps, ReduxFormChangeProps {
  initialValues: Partial<AdGroupResource>;
  small?: boolean;
  name?: string;
  disabled: boolean;
}

type Props = DeviceFormSectionProps & WrappedComponentProps & ValidatorProps & NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
  mediaValue?: TargetedMedia;
}

class DeviceFormSection extends React.Component<Props, State> {
  static defaultProps = {
    name: 'adGroup',
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      displayAdvancedSection: false,
      mediaValue: this.props.initialValues.targeted_medias,
    };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  operatingSystems = () => {
    return [
      {
        value: 'ALL',
        children: formatAdGroupProperty('targeted_operating_systems', 'ALL').formattedValue,
      },
      {
        value: 'IOS',
        children: formatAdGroupProperty('targeted_operating_systems', 'IOS').formattedValue,
      },
      {
        value: 'ANDROID',
        children: formatAdGroupProperty('targeted_operating_systems', 'ANDROID').formattedValue,
      },
      {
        value: 'WINDOWS_PHONE',
        children: formatAdGroupProperty('targeted_operating_systems', 'WINDOWS_PHONE')
          .formattedValue,
      },
    ];
  };

  medias = () => {
    return [
      {
        value: 'WEB',
        children: formatAdGroupProperty('targeted_medias', 'WEB').formattedValue,
      },
      {
        value: 'MOBILE_APP',
        children: formatAdGroupProperty('targeted_medias', 'MOBILE_APP').formattedValue,
      },
    ];
  };

  devices = () => {
    const { mediaValue } = this.state;
    return [
      {
        value: 'ALL',
        children: formatAdGroupProperty('targeted_devices', 'ALL').formattedValue,
        disabled: mediaValue === 'MOBILE_APP',
      },
      {
        value: 'ONLY_DESKTOP',
        children: formatAdGroupProperty('targeted_devices', 'ONLY_DESKTOP').formattedValue,
        disabled: mediaValue === 'MOBILE_APP',
      },
      {
        value: 'ONLY_MOBILE',
        children: formatAdGroupProperty('targeted_devices', 'ONLY_MOBILE').formattedValue,
      },
      {
        value: 'ONLY_TABLET',
        children: formatAdGroupProperty('targeted_devices', 'ONLY_TABLET').formattedValue,
      },
      {
        value: 'MOBILE_AND_TABLET',
        children: formatAdGroupProperty('targeted_devices', 'MOBILE_AND_TABLET').formattedValue,
      },
    ];
  };

  connectionTypes = () => {
    const { mediaValue } = this.state;
    return [
      {
        value: 'ALL',
        children: formatAdGroupProperty('targeted_connection_types', 'ALL').formattedValue,
      },
      {
        value: 'ETHERNET',
        children: formatAdGroupProperty('targeted_connection_types', 'ETHERNET').formattedValue,
        disabled: mediaValue === 'MOBILE_APP',
      },
      {
        value: 'WIFI',
        children: formatAdGroupProperty('targeted_connection_types', 'WIFI').formattedValue,
      },
      {
        value: 'CELLULAR_NETWORK_2G',
        children: formatAdGroupProperty('targeted_connection_types', 'CELLULAR_NETWORK_2G')
          .formattedValue,
      },
      {
        value: 'CELLULAR_NETWORK_3G',
        children: formatAdGroupProperty('targeted_connection_types', 'CELLULAR_NETWORK_3G')
          .formattedValue,
      },
      {
        value: 'CELLULAR_NETWORK_4G',
        children: formatAdGroupProperty('targeted_connection_types', 'CELLULAR_NETWORK_4G')
          .formattedValue,
      },
    ];
  };

  browserFamilies = () => {
    return [
      {
        value: 'ALL',
        children: formatAdGroupProperty('targeted_browser_families', 'ALL').formattedValue,
      },
      {
        value: 'CHROME',
        children: formatAdGroupProperty('targeted_browser_families', 'CHROME').formattedValue,
      },
      {
        value: 'FIREFOX',
        children: formatAdGroupProperty('targeted_browser_families', 'FIREFOX').formattedValue,
      },
      {
        value: 'SAFARI',
        children: formatAdGroupProperty('targeted_browser_families', 'SAFARI').formattedValue,
      },
      {
        value: 'INTERNET_EXPLORER',
        children: formatAdGroupProperty('targeted_browser_families', 'INTERNET_EXPLORER')
          .formattedValue,
      },
      {
        value: 'OPERA',
        children: formatAdGroupProperty('targeted_browser_families', 'OPERA').formattedValue,
      },
    ];
  };

  onMediaChange = (value: TargetedMedia) => {
    const { name } = this.props;
    this.setState({
      mediaValue: value,
    });
    this.props.formChange(`${name}.targeted_devices`, value === 'WEB' ? 'ALL' : 'ONLY_MOBILE');
    this.props.formChange('adGroup.targeted_operating_systems', 'ALL');
    this.props.formChange('adGroup.targeted_connection_types', 'ALL');
    this.props.formChange('adGroup.targeted_browser_families', 'ALL');
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      small,
      name,
      disabled,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleDevice}
          title={messages.sectionTitleDevice}
        />

        <div>
          <FormSelectField
            name={`${name}.targeted_medias`}
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('targeted_medias').message),
              required: true,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionDeviceMediaTypeTooltip),
            }}
            selectProps={{
              onSelect: this.onMediaChange,
            }}
            options={this.medias()}
            small={small}
            disabled={disabled}
          />

          <FormSelectField
            name={`${name}.targeted_devices`}
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('targeted_devices').message),
              required: true,
            }}
            selectProps={{}}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionDeviceTypeTooltip),
            }}
            options={this.devices()}
            small={small}
            disabled={disabled}
          />

          <FormSelectField
            name={`${name}.targeted_operating_systems`}
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('targeted_operating_systems').message),
              required: true,
            }}
            selectProps={{}}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionDeviceOSTooltip),
            }}
            options={this.operatingSystems()}
            small={small}
            disabled={disabled}
          />

          <FormSelectField
            name={`${name}.targeted_connection_types`}
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('targeted_connection_types').message),
              required: true,
            }}
            selectProps={{}}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionDeviceConnectionTypeTooltip),
            }}
            disabled={disabled}
            options={this.connectionTypes()}
            small={small}
          />

          <FormSelectField
            name={`${name}.targeted_browser_families`}
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('targeted_browser_families').message),
              required: true,
            }}
            selectProps={{}}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionDeviceBrowserTooltip),
            }}
            options={this.browserFamilies()}
            small={small}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
}

export default compose<Props, any>(injectIntl, withValidators, withNormalizer)(DeviceFormSection);
