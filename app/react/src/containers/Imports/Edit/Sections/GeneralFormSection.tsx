import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import withValidators, { ValidatorProps } from '../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
  DefaultSelectField,
  DefaultSelect,
} from '../../../../components/Form';
import { FORM_ID } from '../ImportEditForm';
import { Import } from '../../../../models/imports/imports';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'edit.import.form.general.title',
    defaultMessage: 'General Information',
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
    defaultMessage: 'Give your Import a Name so you can find it back in the different screens.',
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
    id: 'edit.import.general.infos.label.mimeType',
    defaultMessage: 'Mime-Type',
  },
  tootltipImportMimeType: {
    id: 'edit.import.general.infos.tooltip.mimeType',
    defaultMessage: 'Choose the mime-type.',
  },
  labelImportDocumentType: {
    id: 'edit.import.general.infos.label.documentType',
    defaultMessage: 'Document Type',
  },
  tootltipImportDocumentType: {
    id: 'edit.import.general.infos.tooltip.documentType',
    defaultMessage: 'Choose the document type.',
  },
  labelImportPriority: {
    id: 'edit.import.general.infos.label.priority',
    defaultMessage: 'Priority',
  },
  tootltipImportPriority: {
    id: 'edit.import.general.infos.tooltip.priority',
    defaultMessage: 'Choose the document import priority.',
  },
});

interface MapStateToProps {
  formValues: Partial<Import>;
}

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps & MapStateToProps;

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
      formValues,
    } = this.props;

    const getDocumentTypeOptions = () => {
      return [
        {
          title: 'User Segment',
          value: 'USER_SEGMENT',
        },
        {
          title: 'User Activity',
          value: 'USER_ACTIVITY',
        },
        {
          title: 'User Profile',
          value: 'USER_PROFILE',
        },
        {
          title: 'User Identifiers Association',
          value: 'USER_IDENTIFIERS_ASSOCIATION_DECLARATIONS',
        },
        {
          title: 'User Identifiers Dissociation',
          value: 'USER_IDENTIFIERS_DISSOCIATION_DECLARATIONS',
        },
        {
          title: 'User Identifiers Deletion',
          value: 'USER_IDENTIFIERS_DELETION',
        },
      ];
    };

    const getMimeTypeOptions = () => {
      return [
        {
          title: 'New Line Delimited JSON',
          value: 'APPLICATION_X_NDJSON',
        },
        {
          title: 'CSV',
          value: 'TEXT_CSV',
        },
      ];
    };

    return (
      <div>
        <FormSection
          title={messages.sectionTitleGeneral}
          subtitle={messages.sectionSubTitleGeneral}
        />

        <div>
          <FormInputField
            name='name'
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
            name='document_type'
            component={DefaultSelect}
            validate={[isRequired]}
            options={
              formValues.mime_type === 'TEXT_CSV'
                ? [getDocumentTypeOptions()[0]]
                : getDocumentTypeOptions()
            }
            formItemProps={{
              label: formatMessage(messages.labelImportDocumentType),
              colon: false,
              required: true,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipImportDocumentType),
            }}
            selectProps={{
              className: `mcs-imports_selectField_${messages.tootltipImportDocumentType.id}`,
            }}
          />
          <DefaultSelectField
            name='mime_type'
            component={DefaultSelect}
            validate={[isRequired]}
            options={
              formValues.document_type === 'USER_SEGMENT'
                ? getMimeTypeOptions()
                : [getMimeTypeOptions()[0]]
            }
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
            name='encoding'
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
          <DefaultSelectField
            name='priority'
            component={DefaultSelect}
            validate={[isRequired]}
            options={[
              {
                title: 'LOW',
                value: 'LOW',
              },
              {
                title: 'MEDIUM',
                value: 'MEDIUM',
              },
              {
                title: 'HIGH',
                value: 'HIGH',
              },
            ]}
            formItemProps={{
              label: formatMessage(messages.labelImportPriority),
              colon: false,
              required: true,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipImportPriority),
            }}
            selectProps={{
              className: `mcs-imports_selectField_${messages.tootltipImportPriority.id}`,
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose(
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(GeneralFormSection);
