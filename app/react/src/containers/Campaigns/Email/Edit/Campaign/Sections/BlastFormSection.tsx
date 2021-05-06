import * as React from 'react';
import moment from 'moment';
import cuid from 'cuid';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { WrappedFieldArrayProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';

import { FormSection } from '../../../../../../components/Form';
import { RelatedRecords, RecordElement } from '../../../../../../components/RelatedRecord';
import messages from '../../messages';
import { BlastFieldModel, EmailBlastFormData, INITIAL_EMAIL_BLAST_FORM_DATA } from '../../domain';
import EmailBlastForm, { EmailBlastFormProps } from '../../Blast/EmailBlastForm';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { injectDrawer } from '../../../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';

export interface BlastFormSectionProps extends ReduxFormChangeProps {}

type Props = InjectedIntlProps &
  WrappedFieldArrayProps<BlastFieldModel> &
  BlastFormSectionProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

class BlastFormSection extends React.Component<Props> {
  updateBlasts = (formData: EmailBlastFormData, existingKey?: string) => {
    const { fields, formChange, closeNextDrawer } = this.props;

    const newFields: BlastFieldModel[] = [];
    if (existingKey) {
      fields.getAll().forEach(field => {
        if (field.key === existingKey) {
          newFields.push({
            key: existingKey,
            model: formData,
          });
        } else {
          newFields.push(field);
        }
      });
    } else {
      newFields.push(...fields.getAll());
      newFields.push({
        key: cuid(),
        model: formData,
      });
    }

    formChange((fields as any).name, newFields);
    closeNextDrawer();
  };

  openEmailBlastForm = (field?: BlastFieldModel) => {
    const {
      intl: { formatMessage },
      openNextDrawer,
      closeNextDrawer,
    } = this.props;

    const breadCrumbPaths = [
      field && field.model.blast.blast_name
        ? formatMessage(messages.emailBlastEditorBreadcrumbTitleEditBlast, {
            blastName: field.model.blast.blast_name,
          })
        : formatMessage(messages.emailBlastEditorBreadcrumbTitleNewBlast),
    ];

    const handleSave = (formData: EmailBlastFormData) =>
      this.updateBlasts(formData, field && field.key);

    const props: EmailBlastFormProps = {
      breadCrumbPaths,
      close: closeNextDrawer,
      onSubmit: handleSave,
    };

    props.initialValues = field ? field.model : INITIAL_EMAIL_BLAST_FORM_DATA;

    const options = {
      additionalProps: props,
    };

    openNextDrawer<EmailBlastFormProps>(EmailBlastForm, options);
  };

  getBlastRecords = () => {
    const {
      fields,
      intl: { formatMessage },
    } = this.props;

    const getBlastName = (blastField: BlastFieldModel) => blastField.model.blast.blast_name;

    const getAdditionalData = (blastField: BlastFieldModel) => {
      const sendDate = blastField.model.blast.send_date;
      if (sendDate) {
        return (
          <span>
            {formatMessage(messages.emailBlastEditorDatePickerLabelSentDate)}:{' '}
            {moment(sendDate).format('DD/MM/YYYY HH:mm')}
          </span>
        );
      }
      return null;
    };

    return fields.getAll().map((blastField, index) => {
      const removeRecord = () => fields.remove(index);
      const editRecord = () => this.openEmailBlastForm(blastField);
      return (
        <RecordElement
          key={blastField.key}
          recordIconType={'email'}
          record={blastField}
          title={getBlastName}
          additionalData={getAdditionalData}
          onEdit={editRecord}
          onRemove={removeRecord}
        />
      );
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const newBlast = () => this.openEmailBlastForm();

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.emailBlastEditorBreadcrumbTitleNewBlast),
            onClick: newBlast,
          }}
          subtitle={messages.emailEditorEmailBlastSubTitle}
          title={messages.emailEditorEmailBlastTitle}
        />
        <RelatedRecords
          emptyOption={{
            iconType: 'email',
            message: formatMessage(messages.emailEditorEmailBlastEmpty),
          }}
        >
          {this.getBlastRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<Props, BlastFormSectionProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(BlastFormSection);
