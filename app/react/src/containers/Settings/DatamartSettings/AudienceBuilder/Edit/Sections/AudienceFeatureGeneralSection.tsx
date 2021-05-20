import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IAudienceFeatureService } from '../../../../../../services/AudienceFeatureService';
import { messages } from '../../messages';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSelectField,
  DefaultSelect,
} from '../../../../../../components/Form';
import { Field, GenericField } from 'redux-form';
import { FormSearchObjectProps } from '../../../../../../components/Form/FormSelect/FormSearchObject';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { RouteComponentProps, withRouter } from 'react-router';
import { AudienceFeatureFolderResource } from '../../../../../../models/audienceFeature';

export const FormSearchObjectField = Field as new () => GenericField<FormSearchObjectProps>;

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<{ datamartId: string }>;

interface State {
  displayAdvancedSection: boolean;
  audienceFeatureFolders: AudienceFeatureFolderResource[];
}

class AudienceFeatureGeneralSection extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false, audienceFeatureFolders: [] };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this._audienceFeatureService.getAudienceFeatureFolders(datamartId).then(folders =>
      this.setState({
        audienceFeatureFolders: folders.data,
      }),
    );
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;
    const { audienceFeatureFolders } = this.state;
    return (
      <div>
        <FormSection title={messages.audienceFeatureSectionGeneralTitle} />

        <FormInputField
          name='name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.audienceFeatureNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.audienceFeatureNamePlaceholder),
            className: 'mcs-audienceFeatureName',
          }}
          helpToolTipProps={{
            title: formatMessage(messages.audienceFeatureNameTooltip),
          }}
        />
        <FormInputField
          name='description'
          component={FormInput}
          formItemProps={{
            label: formatMessage(messages.audienceFeatureDescriptionLabel),
            required: false,
          }}
          inputProps={{
            placeholder: formatMessage(messages.audienceFeatureDescriptionPlaceholder),
            className: 'mcs-audienceFeatureDescription',
          }}
          helpToolTipProps={{
            title: formatMessage(messages.audienceFeatureDescriptionTooltip),
          }}
        />
        <FormSelectField
          name='folder_id'
          component={DefaultSelect}
          options={audienceFeatureFolders.map(folder => {
            return { title: folder.name, value: folder.id };
          })}
          formItemProps={{
            label: formatMessage(messages.audienceFeatureFolderLabel),
            required: false,
            className: 'mcs-audienceFeatureFolder',
          }}
          helpToolTipProps={{
            title: formatMessage(messages.audienceFeatureFolderTooltip),
          }}
          autoSetDefaultValue={false}
        />
      </div>
    );
  }
}

export default compose<Props, State>(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(AudienceFeatureGeneralSection);
