import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { WrappedFieldArrayProps } from 'redux-form';
import { compose } from 'recompose';
import cuid from 'cuid';
import messages from '../messages';

import FormMultiValueInput from '../../../../../../components/Form/FormMultiValueInput';

import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { FormSection, withValidators } from '../../../../../../components/Form';
import { AliasesFieldModel } from '../domain';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';

export interface DomainFieldProps extends ReduxFormChangeProps {}

type Props = WrappedFieldArrayProps<AliasesFieldModel> &
  WrappedComponentProps &
  ValidatorProps &
  DomainFieldProps;

class DomainField extends React.Component<Props> {
  markAsDeleted = (e: string) => {
    const fields = this.props.fields.getAll();
    const foundIndex = fields.findIndex(f => f.model.name === e);
    if (foundIndex > -1) {
      const newFields = [...fields];
      newFields.splice(foundIndex, 1);
      this.props.formChange((this.props.fields as any).name, newFields);
    }
  };

  addItem = (stringValue: string) => {
    const fields = this.props.fields.getAll();
    const foundField = fields.find(f => f.model.name === stringValue);
    if (foundField) {
      this.props.formChange((this.props.fields as any).name, fields);
    }
    const newFields = [...fields];
    newFields.push({ key: cuid(), model: { name: stringValue } } as any);
    this.props.formChange((this.props.fields as any).name, newFields);
  };

  getStringValues = () => {
    const { fields } = this.props;

    return fields.getAll().map(f => (f as any).model.name);
  };

  formatStringValues = (stringValues: string[]) => {
    const fields: AliasesFieldModel[] = this.props.fields.getAll();
    return stringValues.map(s => {
      const foundField = fields.find(f => (f as any).model.name === s);
      if (foundField) {
        return foundField;
      }
      return { key: cuid(), model: { name: s } };
    });
  };

  render() {
    const {
      intl,
      fieldValidators: { isValidDomain },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionAliasesSubTitle}
          title={messages.sectionAliasesTitle}
        />
        <div className='audience-catalog'>
          <FormMultiValueInput
            {...this.props}
            values={this.getStringValues()}
            handleClickOnRemove={this.markAsDeleted}
            handleClickOnItem={this.addItem}
            validate={[isValidDomain]}
            formItemProps={{
              label: intl.formatMessage(messages.contentSectionAliasesNameLabel),
            }}
            inputProps={{
              placeholder: intl.formatMessage(messages.contentSectionAliasesNamePlaceholder),
            }}
            helpToolTipProps={{
              title: intl.formatMessage(messages.contentSectionGAliasesNameTooltip),
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose<Props, DomainFieldProps>(injectIntl, withValidators)(DomainField);
