import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
  DefaultSelectField,
  DefaultSelect,
} from '../../../../../components/Form';

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'edit.import.form.general.title',
    defaultMessage: 'General Informations',
  },
  sectionSubTitleGeneral: {
    id: 'edit.import.form.general.subtitle',
    defaultMessage: 'Give your Import a name',
  },
  labelImportName: {
    id: 'edit.import.general.infos.label.name',
    defaultMessage: 'Import Name',
  },
  tootltipImportName: {
    id: 'edit.import.general.infos.tooltip.name',
    defaultMessage:
      'Give your Import a Name so you can find it back in the different screens.',
  },
  labelImportEnconding: {
    id: 'edit.import.general.infos.label.encoding',
    defaultMessage: 'Encoding',
  },
  tootltipImportEncoding: {
    id: 'edit.import.general.infos.tooltip.encoding',
    defaultMessage: 'Choose the encoding.',
  },
  labelImportMimeType: {
    id: 'edit.import.general.infos.label.mime.type',
    defaultMessage: 'Mime-Type',
  },
  tootltipImportMimeType: {
    id: 'edit.import.general.infos.tooltip.mime.type',
    defaultMessage: 'Choose the mime-type.',
  },
  labelImportDocumentType: {
    id: 'edit.import.general.infos.label.dcoument.type',
    defaultMessage: 'Document Type',
  },
  tootltipImportDocumentType: {
    id: 'edit.import.general.infos.tooltip.document.type',
    defaultMessage: 'Choose the document type.',
  },
});

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          title={messages.sectionTitleGeneral}
          subtitle={messages.sectionSubTitleGeneral}
        />

        <div>
          <FormInputField
            name="name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelImportName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelImportName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipImportName),
            }}
          />
          <DefaultSelectField
            name="document_type"
            component={DefaultSelect}
            validate={[isRequired]}
            options={[
              {
                title: 'USER_ACTIVITY',
                value: 'USER_ACTIVITY',
              },
              {
                title: 'USER_PROFILE',
                value: 'USER_PROFILE',
              },
              {
                title: 'USER_SEGMENT',
                value: 'USER_SEGMENT',
              },
            ]}
            formItemProps={{
              label: formatMessage(messages.labelImportDocumentType),
              colon: false,
              required: true,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipImportDocumentType),
            }}
          />
          <DefaultSelectField
            name="mime_type"
            component={DefaultSelect}
            validate={[isRequired]}
            options={[
              {
                title: 'X_NDJSON',
                value: 'X_NDJSON',
              },
              {
                title: 'TEXT_CSV',
                value: 'TEXT_CSV',
              },
            ]}
            formItemProps={{
              label: formatMessage(messages.labelImportMimeType),
              colon: false,
              required: true,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipImportMimeType),
            }}
          />
          <DefaultSelectField
            name="encoding"
            component={DefaultSelect}
            validate={[isRequired]}
            options={[
              {
                title: 'utf-8',
                value: 'utf-8',
              },
            ]}
            formItemProps={{
              label: formatMessage(messages.labelImportEnconding),
              colon: false,
              required: true,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipImportEncoding),
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralFormSection);
