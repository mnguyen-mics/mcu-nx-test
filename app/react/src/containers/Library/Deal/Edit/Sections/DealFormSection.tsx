import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { message, Pagination } from 'antd';
import cuid from 'cuid';
import { compose } from 'recompose';
import { UploadFile } from 'antd/lib/upload/interface';
import { WrappedFieldArrayProps } from 'redux-form';

import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import { FormSection } from '../../../../../components/Form';
import { RouteComponentProps } from 'react-router';
import { injectDrawer } from '../../../../../components/Drawer/index';
import DealForm from '../DealForm/DealForm'
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import {
  ReduxFormChangeProps,
  FieldArrayModel,
} from '../../../../../utils/FormHelper';

import {
  RecordElement,
  EmptyRecords,
  RelatedRecords,
} from '../../../../../components/RelatedRecord/index';
import { DealResource } from '../../../../../models/dealList/dealList';
import { DealFieldModel } from '../domain';


const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.deal.list.form.deal.subtitle',
    defaultMessage: 'This is the list of all Deals added to your Deal List. You can target or exclude it directly within an Ad Group.',
  },
  sectionTitleGeneral: {
    id: 'edit.deal.list.form.deal.title',
    defaultMessage: 'Deal List',
  },
  addDeal: {
    id: 'edit.deal.list.form.add.new',
    defaultMessage: 'Add New Deal',
  },
  addNewDeal: {
    id: 'edit.deal.list.form.add.new.text.button',
    defaultMessage: 'Add',
  },
  emptyRecordTitle: {
    id: 'edit.deal.list.no.placementDescriptor.title',
    defaultMessage:
      'Click on the pen to add a Deal to your Deal List',
  },
  formError: {
    id: 'form.deal.descriptor.empty.select.message.error',
    defaultMessage: 'Error: Empty fields are forbidden. Please select values.',
  },
});

interface DealFormSectionProps extends ReduxFormChangeProps {}

type Props = DealFormSectionProps &
  InjectedDrawerProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  WrappedFieldArrayProps<FieldArrayModel<DealResource>> &
  RouteComponentProps<{ organisationId: string; dealListId: string }>;

interface State {
  isModalOpen: boolean;
  fileList: UploadFile[];
  page: number;
  pageSize: number;
}

class DealFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isModalOpen: false,
      fileList: [],
      page: 1,
      pageSize: 10,
    };
  }

 
  updateDeal = (
    formData: Partial<DealResource>,
    existingKey?: string,
  ) => {
    const { fields, formChange, closeNextDrawer, intl } = this.props;
    const newFields: DealFieldModel[] = [];
    if (
      formData
    ) {
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
    } else {
      message.error(intl.formatMessage(messages.formError), 5);
    }
  };

  openDealForm = (
    field?: FieldArrayModel<Partial<DealResource>>,
  ) => () => {
    const { openNextDrawer , closeNextDrawer, intl } = this.props;
    const handleSave = (formData: Partial<DealResource>) =>
      this.updateDeal(formData, field && field.key);
    const additionalProps = {
      initialValues: field
        ? field.model
        : {
          currency: 'EUR'
        },
      onSave: handleSave,
      actionBarButtonText: intl.formatMessage(messages.addNewDeal),
      close: closeNextDrawer,
    };

    const options = {
      additionalProps,
    };

    openNextDrawer(DealForm, options);
  };


  getDealRecords = (
    fieldsToDisplay?: Array<FieldArrayModel<DealResource>>,
  ) => {
    const { fields } = this.props;
    const { page, pageSize } = this.state;
    const start = page !== 1 ? (page - 1) * pageSize : 0;
    const end = page * pageSize;
    const dealFields = fieldsToDisplay
      ? fieldsToDisplay
      : fields.getAll();

    return dealFields
      .slice(start, end)
      .map((dealField, index) => {
        const removeField = () => {
          const newIndex = fields.getAll().indexOf(dealField);
          fields.remove(newIndex);
        };
        const getName = (
          placementDescriptor: FieldArrayModel<DealResource>,
        ) => placementDescriptor.model.value;
        
        const edit = this.openDealForm(
          dealField,
        );

        return (
          <RecordElement
            key={cuid()}
            recordIconType="display"
            record={dealField}
            title={getName}
            onEdit={edit}
            onRemove={removeField}
          />
        );
      });
  };

  renderFieldArray() {
    const { intl, fields } = this.props;
    return fields.length === 0 ? (
      <EmptyRecords message={intl.formatMessage(messages.emptyRecordTitle)} />
    ) : (
      <RelatedRecords
        emptyOption={{
          iconType: 'users',
          message: intl.formatMessage(messages.emptyRecordTitle),
        }}
      >
        {this.getDealRecords()}
      </RelatedRecords>
    );
  }

  onPaginationChange = (page: number, pageSize: number) => {
    const { fields } = this.props;
    const start = page !== 1 ? (page - 1) * pageSize : 0;
    const end = page * pageSize;
    this.setState({
      page: page,
      pageSize: pageSize,
    });
    const fieldsToDisplay = fields
      ? fields.getAll().slice(start, end)
      : undefined;
    this.getDealRecords(fieldsToDisplay);
  };

  render() {
    const { fields } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
          dropdownItems={[
            {
              id: messages.addDeal.id,
              message: messages.addDeal,
              onClick: this.openDealForm(),
            },
          ]}
        />

        <div>{this.renderFieldArray()}</div>
        <br />
        {fields.getAll().length >= this.state.pageSize + 1 && (
          <Pagination
            style={{ float: 'right' }}
            onChange={this.onPaginationChange}
            defaultCurrent={1}
            pageSize={this.state.pageSize}
            total={fields.length}
            current={this.state.page}
            size="small"
          />
        )}
      </div>
    );
  }
}

export default compose<Props, DealFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  injectDrawer,
)(DealFormSection);