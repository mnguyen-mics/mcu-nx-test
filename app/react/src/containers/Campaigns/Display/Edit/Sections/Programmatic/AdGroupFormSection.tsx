import * as React from 'react';
import cuid from 'cuid';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { WrappedFieldArrayProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectDrawer } from '../../../../../../components/Drawer';
import { FormSection } from '../../../../../../components/Form';
import {
  RelatedRecords,
  RecordElement,
} from '../../../../../../components/RelatedRecord';
import messages from '../../messages';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import AdGroupForm, { AdGroupFormProps } from '../../AdGroup/AdGroupForm';
import { AdGroupFieldModel } from '../../domain';
import {
  AdGroupFormData,
  INITIAL_AD_GROUP_FORM_DATA,
} from '../../AdGroup/domain';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';

export interface AdGroupFormSectionProps extends ReduxFormChangeProps {}

type Props = InjectedIntlProps &
  WrappedFieldArrayProps<AdGroupFieldModel> &
  AdGroupFormSectionProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

class AdGroupFormSection extends React.Component<Props> {
  updateAdGroups = (formData: AdGroupFormData, existingKey?: string) => {
    const { fields, formChange } = this.props;

    const newFields: AdGroupFieldModel[] = [];
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
    this.props.closeNextDrawer();
  };

  openAdGroupForm = (field?: AdGroupFieldModel) => {
    // prevent opening multiple drawer
    this.props.closeNextDrawer();

    const {
      intl: { formatMessage },
    } = this.props;

    const breadCrumbPaths = [
      {
        name:
          field && field.model.adGroup.name
            ? formatMessage(messages.editAdGroup, {
                adGroupName: field.model.adGroup.name,
              })
            : formatMessage(messages.breadcrumbTitle2),
      },
    ];

    const handleSave = (formData: AdGroupFormData) =>
      this.updateAdGroups(formData, field && field.key);

    const props: AdGroupFormProps = {
      breadCrumbPaths,
      close: this.props.closeNextDrawer,
      onSubmit: handleSave,
    };

    props.initialValues = field ? field.model : INITIAL_AD_GROUP_FORM_DATA;

    const options = {
      additionalProps: props,
    };

    this.props.openNextDrawer<AdGroupFormProps>(AdGroupForm, options);
  };

  getAdGroupRecords = () => {
    const { fields } = this.props;

    const getAdGroupName = (adGroupField: AdGroupFieldModel) =>
      adGroupField.model.adGroup.name;

    return fields.getAll().map((adGroupField, index) => {
      const removeRecord = () => fields.remove(index);
      const editRecord = () => this.openAdGroupForm(adGroupField);
      return (
        <RecordElement
          key={adGroupField.key}
          recordIconType={'adGroups'}
          record={adGroupField}
          title={getAdGroupName}
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

    const newAdGroup = () => this.openAdGroupForm();

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.breadcrumbTitle2),
            onClick: newAdGroup,
          }}
          subtitle={messages.sectionSubtitle3}
          title={messages.sectionTitle3}
        />
        <RelatedRecords
          emptyOption={{
            iconType: 'adGroups',
            message: formatMessage(messages.contentSection3EmptyTitle),
          }}
        >
          {this.getAdGroupRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<Props, AdGroupFormSectionProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(AdGroupFormSection);
