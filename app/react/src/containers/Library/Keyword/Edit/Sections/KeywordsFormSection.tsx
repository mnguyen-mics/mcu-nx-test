import * as React from 'react';
import { compose } from 'recompose';
import Papa from 'papaparse';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Tag, Input, Tooltip, Icon, Modal, Upload, message } from 'antd';
import cuid from 'cuid';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import { FormSection } from '../../../../../components/Form';
import { RouteComponentProps, withRouter } from 'react-router';
import { WrappedFieldArrayProps } from 'redux-form';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { KeywordResource } from '../../../../../models/keywordList/keywordList';
import { KeywordFieldModel } from '../domain';
import { UploadFile } from 'antd/lib/upload/interface';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.keywordList.form.keywords.part.subtitle',
    defaultMessage:
      'This is the list of all keywords added to your keyword list. You can target or exclude it directly within an Ad Group. Click on New Keyword button to add keyword to your list.',
  },
  sectionTitleKeywords: {
    id: 'edit.keywordList.form.keywords.part.title',
    defaultMessage: 'Keywords',
  },
  replaceWithCsv: {
    id: 'edit.keywordList.replace.data.with.csv',
    defaultMessage: 'Replace data with CSV',
  },
  addDataWithCsv: {
    id: 'edit.keywordList.add.data.with.csv',
    defaultMessage: 'Add data with CSV',
  },
  download: {
    id: 'edit.keywordList.download',
    defaultMessage: 'Download CSV',
  },
  modalTitle: {
    id: 'drag.and.drop.modal.title',
    defaultMessage: 'Replace the current keywords by CSV ',
  },
  dragAndDrop: {
    id: 'drag.and.drop.file.or.click.line.1',
    defaultMessage: 'Drag & Drop your file or click to upload your CSV file.',
  },
  csvRules: {
    id: 'drag.and.drop.file.or.click.line.2',
    defaultMessage: 'Your CSV file must have 1 column and no empty cells',
  },
});

const CustomTag = Tag as any;

const Dragger = Upload.Dragger;

interface KeywordsFormSectionProps extends ReduxFormChangeProps {
  keywords: KeywordResource[];
}

type Props = KeywordsFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  WrappedFieldArrayProps<KeywordFieldModel> &
  RouteComponentProps<{ organisationId: string; keywordsListId: string }>;

interface State {
  inputVisible: boolean;
  inputValue: string;
  fileList: UploadFile[];
  isModalOpen: boolean;
}

class KeywordsFormSection extends React.Component<Props, State> {
  input: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      inputVisible: false,
      inputValue: '',
      fileList: [],
      isModalOpen: false,
    };
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { fields } = this.props;
    const inputValue = this.state.inputValue;
    fields.push({
      key: cuid(),
      model: {
        expression: inputValue,
        exclude: false,
      },
    });
    this.setState({
      inputVisible: false,
      inputValue: '',
    });
  };

  saveInputRef = (input: any) => (this.input = input);

  handleCsvReplacement = (data: string[][]) => {
    const { fields, formChange } = this.props;
    const newFields: KeywordFieldModel[] = [];
    data.forEach(row => {
      newFields.push({
        key: cuid(),
        model: {
          expression: row[0],
          exclude: false,
        },
      });
    });

    formChange((fields as any).name, newFields);
  };

  handleOpenCloseModal = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen, fileList: [] });
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
        title={this.props.intl.formatMessage(messages.modalTitle)}
        visible={this.state.isModalOpen}
        onOk={this.handleOk}
        okText={'ok'}
        onCancel={this.handleOpenCloseModal}
      >
        <Dragger {...props}>
          {this.props.intl.formatMessage(messages.dragAndDrop)}
          <br />
          {this.props.intl.formatMessage(messages.csvRules)}
        </Dragger>
      </Modal>
    );
  };

  validateFormat = (fileData: string[][]) => {
    return new Promise((resolve, reject) => {
      fileData.forEach((row, i) => {
        if (row.length === 1) {
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

  handleOk = () => {
    const { fileList } = this.state;
    const config = {
      complete: (results: any, file: any) => {
        const data = results.data.splice(0, results.data.length - 1);
        this.validateFormat(data)
          .then(res => {
            this.closeModalAndNotify(true);
            this.handleCsvReplacement(data);
          })
          .catch(() => {
            this.closeModalAndNotify();
          });
      },
    };
    const fileToParse = fileList[0] as any;
    Papa.parse(fileToParse, config);
  };

  closeModalAndNotify = (validationSuccess: boolean = false) => {
    this.setState({
      isModalOpen: false,
    });
    if (validationSuccess) {
      message.success('Success');
    } else {
      message.error(this.props.intl.formatMessage(messages.csvRules), 5);
    }
  };

  download = () => {
    const { fields } = this.props;
    const rowsToUpload: string[][] = [];
    if (fields.getAll().length > 1) {
      fields.getAll().forEach(field => {
        rowsToUpload.push([field.model.expression]);
      });
    } else {
      // Examples
      rowsToUpload.push(['car']);
      rowsToUpload.push(['moto']);
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    rowsToUpload.forEach(rowArray => {
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

  render() {
    const { inputVisible, inputValue } = this.state;
    const { fields } = this.props;

    return (
      <div>
        {this.renderModal()}
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleKeywords}
          dropdownItems={[
            {
              id: messages.replaceWithCsv.id,
              message:
                fields.getAll().length >= 1
                  ? messages.replaceWithCsv
                  : messages.addDataWithCsv,
              onClick: this.handleOpenCloseModal,
            },
            {
              id: messages.download.id,
              message: messages.download,
              onClick: this.download,
            },
          ]}
        />

        <div>
          {fields.getAll() &&
            fields.getAll().length >= 1 &&
            fields.getAll().map((field, index) => {
              const removeField = () => {
                fields.remove(index);
              };
              const isLongExpression =
                field.model.expression && field.model.expression.length > 20;
              const tagElem = (
                <Tag key={cuid()} closable={true} afterClose={removeField}>
                  {isLongExpression
                    ? `${field.model.expression.slice(0, 20)}...`
                    : field.model.expression}
                </Tag>
              );
              return isLongExpression ? (
                <Tooltip title={cuid()} key={field.model.expression}>
                  {tagElem}
                </Tooltip>
              ) : (
                tagElem
              );
            })}
          {inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 78 }}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
          )}
          {!inputVisible && (
            <CustomTag
              onClick={this.showInput}
              style={{ background: '#fff', borderStyle: 'dashed' }}
            >
              <Icon type="plus" /> New Keyword
            </CustomTag>
          )}
        </div>
      </div>
    );
  }
}

export default compose<Props, KeywordsFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(KeywordsFormSection);
