import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Modal, message, Upload } from 'antd';
import cuid from 'cuid';
import Papa from 'papaparse';
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
import PlacementDescriptorForm from '../PlacementDescriptorForm';
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import {
  ReduxFormChangeProps,
  FieldArrayModel,
} from '../../../../../utils/FormHelper';
import { PlacementDescriptorResource } from '../../../../../models/placement/PlacementDescriptorResource';
import { PlacementDescriptorListFieldModel } from '../domain';
import {
  RecordElement,
  EmptyRecords,
  RelatedRecords,
} from '../../../../../components/RelatedRecord/index';

const Dragger = Upload.Dragger;

// const PlacementDescriptorFieldArray = FieldArray as new () => GenericFieldArray<
//   Field,
//   ReduxFormChangeProps
// >;

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.placement.list.form.placement.subtitle',
    defaultMessage: 'This is the subtitle part.',
  },
  sectionTitleGeneral: {
    id: 'edit.placement.list.form.placement.title',
    defaultMessage: 'Placement List',
  },
  addPlacement: {
    id: 'edit.placement.list.form.add.new',
    defaultMessage: 'Add New Placement',
  },
  replaceWithCsv: {
    id: 'edit.placement.list.form.replace.with.csv',
    defaultMessage: 'Replace with CSV',
  },
  downloadCsvTemplate: {
    id: 'edit.placement.list.form.download.csv.template',
    defaultMessage: 'Download CSV Template',
  },
  addNewPlacement: {
    id: 'edit.placement.list.form.add.new.text.button',
    defaultMessage: 'Add',
  },
  emptyRecordTitle: {
    id: 'edit.placement.list.no.placementDescriptor.title',
    defaultMessage:
      'Click on the pen to add a placement to your placement list',
  },
});

interface PlacementsFormSectionProps extends ReduxFormChangeProps {}

type Props = PlacementsFormSectionProps &
  InjectDrawerProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  WrappedFieldArrayProps<FieldArrayModel<PlacementDescriptorResource>> &
  RouteComponentProps<{ organisationId: string; placementListId: string }>;

interface State {
  isModalOpen: boolean;
  fileList: UploadFile[];
}

class PlacementsFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isModalOpen: false,
      fileList: [],
    };
  }

  downloadCsvTemplate = () => {
    const rows = [['Value', 'Type', 'Holder']];
    let csvContent = 'data:text/csv;charset=utf-8,';
    rows.forEach(rowArray => {
      const row = rowArray.join(',');
      csvContent += row + '\r\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'my_data.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
  };

  validateFormat = (fileData: string[][]) => {
    return new Promise((resolve, reject) => {
      fileData.filter(row => row.length !== 1).forEach((row, i) => {
        if (row.length === 10) {
          row.forEach((cell, j) => {
            if (!cell || cell === '') {
              return reject('failed');
            }
          });
        } else {
          return reject('failed');
        }
      });
      return resolve('succes');
    });
  };

  closeModalAndNotify = (validationSuccess: boolean = false) => {
    this.setState({
      isModalOpen: false,
    });
    if (validationSuccess) {
      message.success('success');
    } else {
      message.error('error');
    }
  };

  handleOk = () => {
    const { fileList } = this.state;
    const config = {
      complete: (results: any, file: any) => {
        this.validateFormat(results.data)
          .then(res => {
            this.closeModalAndNotify(true);
          })
          .catch(() => {
            this.closeModalAndNotify();
          });
      },
    };
    const fileToParse = fileList[0] as any;
    Papa.parse(fileToParse, config);
  };

  handleOpenClose = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen, fileList: [] });
  };

  // saveNewPlacement = () => {
  //   //
  // };

  updatePlacementDescriptors = (
    formData: Partial<PlacementDescriptorResource>,
    existingKey?: string,
  ) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const newFields: PlacementDescriptorListFieldModel[] = [];
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

  // addNewPlacement = () => {
  //   const { openNextDrawer, closeNextDrawer, intl } = this.props;
  //   const additionalProps = {
  //     onSave: this.saveNewPlacement,
  //     actionBarButtonText: intl.formatMessage(messages.addNewPlacement),
  //     close: closeNextDrawer,
  //   };

  //   const options = {
  //     additionalProps,
  //   };

  //   openNextDrawer<PlacementDescriptorFormProps>(
  //     PlacementDescriptorForm,
  //     options,
  //   );
  // };

  openPlacementDescriptorForm = (
    field?: FieldArrayModel<Partial<PlacementDescriptorResource>>,
  ) => {
    const { openNextDrawer, closeNextDrawer, intl } = this.props;
    const handleSave = (formData: Partial<PlacementDescriptorResource>) =>
      this.updatePlacementDescriptors(formData, field && field.key);
    const additionalProps = {
      initialValues: field ? field.model : {},
      onSave: handleSave,
      actionBarButtonText: intl.formatMessage(messages.addNewPlacement),
      close: closeNextDrawer,
    };

    const options = {
      additionalProps,
    };

    openNextDrawer(PlacementDescriptorForm, options);
  };

  renderModal = () => {
    const props = {
      name: 'file',
      action: '/',
      accept: '.csv',
      beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
        const newFileList = [file];
        this.setState({ fileList: newFileList });
        return false;
      },
      fileList: this.state.fileList,
      onRemove: (file: UploadFile) => {
        this.setState({
          fileList: this.state.fileList.filter(item => item.uid !== file.uid),
        });
      },
    };

    return (
      <Modal
        title="test"
        visible={this.state.isModalOpen}
        onOk={this.handleOk}
        okText={'ok'}
        onCancel={this.handleOpenClose}
      >
        <Dragger {...props}>Drag & Drop or Click</Dragger>
      </Modal>
    );
  };

  getSegmentRecords = () => {
    const { fields } = this.props;

    return fields.getAll().map((placementDescriptorField, index) => {
      const removeField = () => fields.remove(index);
      const getName = (
        placementDescriptor: FieldArrayModel<PlacementDescriptorResource>,
      ) => placementDescriptor.model.value;
      const edit = () =>
        this.openPlacementDescriptorForm(placementDescriptorField);

      return (
        <RecordElement
          key={cuid()}
          recordIconType="display"
          record={placementDescriptorField}
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
        {this.getSegmentRecords()}
      </RelatedRecords>
    );
  }

  render() {
    const {} = this.props;

    return (
      <div>
        {this.renderModal()}
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
          dropdownItems={[
            {
              id: messages.addPlacement.id,
              message: messages.addPlacement,
              onClick: this.openPlacementDescriptorForm,
            },
            {
              id: messages.replaceWithCsv.id,
              message: messages.replaceWithCsv,
              onClick: this.handleOpenClose,
            },
            {
              id: messages.downloadCsvTemplate.id,
              message: messages.downloadCsvTemplate,
              onClick: this.downloadCsvTemplate,
            },
          ]}
        />

        <div>{this.renderFieldArray()}</div>
      </div>
    );
  }
}

export default compose<Props, PlacementsFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  injectDrawer,
)(PlacementsFormSection);
