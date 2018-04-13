import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import messages from '../../messages';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  FormSection,
  FormSelectField,
} from '../../../../../../components/Form';
import { compose } from 'recompose';
import DefaultSelect from "../../../../../../components/Form/FormSelect/DefaultSelect";
import {WrappedFieldProps} from "redux-form";

interface DeviceFormSectionProps extends WrappedFieldProps {}

type Props = DeviceFormSectionProps & InjectedIntlProps & ValidatorProps & NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
}

class DeviceFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayAdvancedSection: false,
    };
  }

  componentDidMount() {
    const { input } = this.props;
    if (input && !input.value) {
      input.onChange('All');
    }
  };

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  operatingSystems = () => {
    const { intl: { formatMessage } } = this.props;
    return [
      {
        value: 'ALL',
        title: formatMessage(messages.contentSectionDeviceOSAll),
      },
      {
        value: 'IOS',
        title: formatMessage(messages.contentSectionDeviceOSiOS),
      },
      {
        value: 'ANDROID',
        title: formatMessage(messages.contentSectionDeviceOSAndroid),
      },
      {
        value: 'WINDOWS_PHONE',
        title: formatMessage(messages.contentSectionDeviceOSWindowsPhone),
      }
    ]
  };

  medias = () => {
    const { intl: { formatMessage } } = this.props;
    return [
      {
        value: 'WEB',
        title: formatMessage(messages.contentSectionDeviceMediaTypeWebsite),
      },
      {
        value: 'MOBILE_APP',
        title: formatMessage(messages.contentSectionDeviceMediaTypeMobileApp),
      },
    ]
  };

  devices = () => {
    const { intl: { formatMessage } } = this.props;
    return [
      {
        value: 'ALL',
        title: formatMessage(messages.contentSectionDeviceTypeAll),
      },
      {
        value: 'ONLY_DESKTOP',
        title: formatMessage(messages.contentSectionDeviceTypeDesktop),

      },
      {
        value: 'ONLY_MOBILE',
        title: formatMessage(messages.contentSectionDeviceTypeMobile),
      },
      {
        value: 'ONLY_TABLET',
        title: formatMessage(messages.contentSectionDeviceTypeTablet),
      },
      {
        value: 'MOBILE_AND_TABLET',
        title: formatMessage(messages.contentSectionDeviceTypeMobileAndTablet),
      }
    ]
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage }
  } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleDevice}
          title={messages.sectionTitleDevice}
        />

        <div>
          <FormSelectField
            name="adGroup.targeted_medias"
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentSectionDeviceMediaTypeLabel),
              required: true,
            }}
            selectProps={{
              defaultValue: 'Web'
            }}
            options={this.medias()}
          />

          <FormSelectField
            name="adGroup.targeted_devices"
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentSectionDeviceTypeLabel),
              required: true,
            }}
            selectProps={{
              defaultValue: 'All'
            }}
            options={this.devices()}
          />

          <FormSelectField
            name="adGroup.targeted_operating_systems"
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentSectionDeviceOSLabel),
              required: true,
            }}
            selectProps={{
              defaultValue: 'All'
            }}
            options={this.operatingSystems()}
          />
        </div>

      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(
  DeviceFormSection
);
