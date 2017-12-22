import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { WrappedFieldArrayProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';

import { DrawableContentProps } from '../../../../../../components/Drawer';
import { FormSection } from '../../../../../../components/Form';
import CreativeCardSelector, {
  CreativeCardSelectorProps,
} from '../../../../Common/CreativeCardSelector';
import {
  RelatedRecords,
  RecordElement,
} from '../../../../../../components/RelatedRecord';
import {
  CreativeResourceShape,
} from '../../../../../../models/creative/CreativeResource';
import messages from '../../messages';
import { TemplateFieldModel } from '../../domain';
import { generateFakeId } from '../../../../../../utils/FakeIdHelper';

export interface TemplateFormSectionProps extends DrawableContentProps {
  formChange: (fieldName: string, value: any) => void;
}

type Props = InjectedIntlProps &
  WrappedFieldArrayProps<TemplateFieldModel> &
  TemplateFormSectionProps &
  RouteComponentProps<{ organisationId: string }>;

class TemplateFormSection extends React.Component<Props> {
  updateTemplates = (creatives: CreativeResourceShape[]) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const creativeIds = creatives.map(s => s.id);
    const fieldCreativeIds = fields
      .getAll()
      .map(field => field.model.email_template_id);

    const keptCreatives = fields
      .getAll()
      .filter(field => creativeIds.includes(field.model.email_template_id));
    const addedCreatives = creatives
      .filter(s => !fieldCreativeIds.includes(s.id))
      .map(creative => ({
        key: generateFakeId(),
        model: {
          email_template_id: creative.id,
        },
        meta: { name: creative.name }
      }));

    formChange((fields as any).name, keptCreatives.concat(addedCreatives));
    closeNextDrawer();
  };

  openCreativeCardSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;

    const selectedCreativeIds = fields
      .getAll()
      .map(field => field.model.email_template_id);

    const creativeCardSelectorProps: CreativeCardSelectorProps = {
      selectedCreativeIds,
      creativeType: 'EMAIL_TEMPLATE',
      singleSelection: true,
      close: closeNextDrawer,
      save: this.updateTemplates,
    };

    const options = {
      additionalProps: creativeCardSelectorProps,
    };

    openNextDrawer<CreativeCardSelectorProps>(CreativeCardSelector, options);
  };

  getEmailTemplateRecords = () => {
    const { fields } = this.props;

    const getTemplateName = (
      templateField: TemplateFieldModel,
    ) => templateField.meta.name;

    return fields.getAll().map(templateField => {
      return (
        <RecordElement
          key={templateField.key}
          recordIconType={'email'}
          record={templateField}
          title={getTemplateName}
        />
      );
    });
  };

  render() {
    const { meta, intl: { formatMessage } } = this.props;

    const showError = meta.error;

    const emptyOption = {
      message: showError
        ? formatMessage(messages.blastTemplateSelectionRequired)
        : formatMessage(messages.blastTemplateSelectionEmpty),
      className: showError ? 'required' : '',
    };

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.blastTemplateSelectionSelectButton),
            onClick: this.openCreativeCardSelector,
          }}
          subtitle={messages.emailBlastEditorStepSubTitleTemplateSelection}
          title={messages.emailBlastEditorStepTitleTemplateSelection}
        />
        <RelatedRecords emptyOption={emptyOption}>
          {this.getEmailTemplateRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<Props, TemplateFormSectionProps>(injectIntl, withRouter)(
  TemplateFormSection,
);
