import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';
import { WrappedFieldArrayProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { FormSection } from '../../../../../../components/Form';
import CreativeCardSelector, {
  CreativeCardSelectorProps,
} from '../../../../Common/CreativeCardSelector';
import { RelatedRecords, RecordElement } from '../../../../../../components/RelatedRecord';
import { CreativeResourceShape } from '../../../../../../models/creative/CreativeResource';
import messages from '../../messages';
import { TemplateFieldModel } from '../../domain';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { injectDrawer } from '../../../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';

export interface TemplateFormSectionProps extends ReduxFormChangeProps {
  disabled?: boolean;
}

type Props = InjectedIntlProps &
  WrappedFieldArrayProps<TemplateFieldModel> &
  TemplateFormSectionProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

class TemplateFormSection extends React.Component<Props> {
  updateTemplates = (creatives: CreativeResourceShape[]) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const creativeIds = creatives.map(s => s.id);
    const fieldCreativeIds = fields.getAll().map(field => field.model.email_template_id);

    const keptCreatives = fields
      .getAll()
      .filter(field => creativeIds.includes(field.model.email_template_id));
    const addedCreatives = creatives
      .filter(s => !fieldCreativeIds.includes(s.id))
      .map(creative => ({
        key: cuid(),
        model: {
          email_template_id: creative.id,
        },
        meta: { name: creative.name },
      }));

    formChange((fields as any).name, keptCreatives.concat(addedCreatives));
    closeNextDrawer();
  };

  openCreativeCardSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;

    const selectedCreativeIds = fields.getAll().map(field => field.model.email_template_id);

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

    const getTemplateName = (templateField: TemplateFieldModel) => templateField.meta.name;

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
    const {
      meta,
      intl: { formatMessage },
      disabled,
    } = this.props;

    const showError = meta.error;

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.blastTemplateSelectionSelectButton),
            onClick: this.openCreativeCardSelector,
            disabled: !!disabled,
          }}
          subtitle={messages.emailBlastEditorStepSubTitleTemplateSelection}
          title={messages.emailBlastEditorStepTitleTemplateSelection}
        />
        <RelatedRecords
          emptyOption={{
            iconType: 'email',
            message: showError
              ? formatMessage(messages.blastTemplateSelectionRequired)
              : formatMessage(messages.blastTemplateSelectionEmpty),
            className: showError ? 'required' : '',
          }}
        >
          {this.getEmailTemplateRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<Props, TemplateFormSectionProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(TemplateFormSection);
