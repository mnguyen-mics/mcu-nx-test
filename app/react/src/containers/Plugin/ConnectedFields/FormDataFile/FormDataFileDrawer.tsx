import * as React from 'react';
import { Layout, Button, Select, Upload, Input } from 'antd';
import { FormattedMessage } from 'react-intl';
import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import {
  Actionbar,
  McsIcon,
} from '@mediarithmics-private/mcs-components-library';
import { FormTitle } from '../../../../components/Form';
import messages from '../../messages';
import { Content } from './HtmlEditor/ContentArea';
import { HtmlEditor } from './HtmlEditor';

import { AcceptedFile } from './FormDataFile';

const Option = Select.Option;

import AceEditor from 'react-ace';

import 'brace/ext/searchbox';
import 'brace/mode/java';
import 'brace/mode/javascript';
import 'brace/mode/python';
import 'brace/mode/xml';
import 'brace/mode/ruby';
import 'brace/mode/sass';
import 'brace/mode/markdown';
import 'brace/mode/mysql';
import 'brace/mode/json';
import 'brace/mode/html';
import 'brace/mode/handlebars';
import 'brace/mode/golang';
import 'brace/mode/csharp';
import 'brace/mode/elixir';
import 'brace/mode/typescript';
import 'brace/mode/css';
import 'brace/theme/monokai';
import { lazyInject } from '../../../../config/inversify.config';
import { IDataFileService } from '../../../../services/DataFileService';
import { TYPES } from '../../../../constants/types';

const { Content } = Layout;

const env = [
  'javascript',
  'java',
  'python',
  'xml',
  'ruby',
  'sass',
  'markdown',
  'mysql',
  'json',
  'html',
  'handlebars',
  'golang',
  'csharp',
  'elixir',
  'typescript',
  'css',
];

export interface FormDataFileDrawerProps {
  content: string;
  close: (e: any, name?: string) => void;
  type?: string;
  fileName?: string;
  inputProps?: UploadProps;
  accept: AcceptedFile;
}

interface FormDataFileDrawerState {
  updatedContent: string;
  type: string;
  editMode: boolean;
  fileName: string;
  fileSelectorValue?: string;
  iframeHeight: number;
}

class FormDataFileDrawer extends React.Component<
  FormDataFileDrawerProps,
  FormDataFileDrawerState
> {
  @lazyInject(TYPES.IDataFileService)
  private _dataFileService: IDataFileService;

  constructor(props: FormDataFileDrawerProps) {
    super(props);
    this.state = {
      updatedContent: props.content,
      type: this.defineMode(props.fileName),
      editMode: props.content !== '' ? true : false,
      fileName: props.fileName && props.fileName ? props.fileName : '',
      iframeHeight: 0,
    };
  }

  onChange = (e: any) => {
    this.setState({ updatedContent: e });
  };

  parseFileName = (uri: string, basePath?: boolean) => {
    const parsedUri = uri.split('/');
    if (basePath) {
      parsedUri.pop();
      return parsedUri.join('/');
    }
    return parsedUri[parsedUri.length - 1];
  };

  defineMode = (fileName?: string) => {
    const fileExtension = fileName && fileName.split('.').pop();
    switch (fileExtension) {
      case 'js':
        return 'javascript';
      case 'py':
        return 'python';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      default:
        return 'text';
    }
  };

  handleAdd = () => {
    this.props.close(this.state.updatedContent, this.state.fileName);
  };

  handleEditorChange = (value: string) => this.setState({ type: value });

  onFileUpdate = (file: any) => {
    const fileReader = new FileReader();
    fileReader.onload = (fileLoadedEvent: any) => {
      const textFromFileLoaded = fileLoadedEvent.target.result;
      this.setState({ updatedContent: textFromFileLoaded });
    };

    fileReader.readAsText(file, 'UTF-8');
  };

  changeFileName = (fileName: string) => {
    this.setState({ fileName: fileName });
  };

  render() {
    const { editMode } = this.state;

    let uploadDetailProps: any = {
      action: '/',
      beforeUpload: (file: UploadFile) => {
        // add data to store
        this.changeFileName(file.name);
        const formData = new FormData(); /* global FormData */
        formData.append('file', file as any, file.name);
        this.onFileUpdate(file);
        this.setState({ editMode: true, type: this.defineMode(file.name) });
        return false;
      },
    };

    if (this.props.accept !== '*') {
      uploadDetailProps = {
        ...uploadDetailProps,
        accept: this.props.accept,
      };
    }

    const onFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ fileName: e.target.value });
    };

    const onFileSelectorValueChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      this.setState({ fileSelectorValue: e.target.value });
    };

    const onFileSelectorValidate = () => {
      const { fileSelectorValue } = this.state;

      if (fileSelectorValue) {
        this._dataFileService
          .getDatafileData(fileSelectorValue)
          .then(res => {
            this.onFileUpdate(res);
            const fileName = this.parseFileName(fileSelectorValue);
            this.changeFileName(fileName);
            this.setState({
              editMode: true,
              fileName: fileName,
              type: this.defineMode(fileName),
            });
          })
          .catch((err: any) => {
            // TODO notify error
          });
      }
    };

    const FileSelectionRendered = (
      <div className="text-center">
        <div className="m-t-20 m-b-20">
          <FormTitle title={messages.datafileDrawerUpload} />
        </div>
        <Upload {...uploadDetailProps}>
          <Button>
            <FormattedMessage {...messages.datafileDrawerUpload} />
          </Button>
        </Upload>
        <div className="m-t-20 m-b-20">
          <FormTitle title={messages.datafileDrawerSelect} />
        </div>
        <div>
          <Input
            style={{ maxWidth: 300 }}
            onChange={onFileSelectorValueChange}
          />
        </div>
        <div className="m-t-20">
          <Button onClick={onFileSelectorValidate}>
            <FormattedMessage {...messages.datafileDrawerSelectOk} />
          </Button>
        </div>
      </div>
    );

    const EditorRendered = (
      <AceEditor
        mode={this.state.type}
        theme="monokai"
        name="blah2"
        onChange={this.onChange}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={this.state.updatedContent}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
        width={'100%'}
        wrapEnabled={true}
      />
    );

    const EditModeAnyFile = (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Select
            defaultValue={this.state.type}
            style={{ width: 120, float: 'right' }}
            onChange={this.handleEditorChange}
          >
            {env.map(item => {
              return (
                <Option key={item} value={item}>
                  {item}
                </Option>
              );
            })}
          </Select>
          <Input
            defaultValue={this.state.fileName}
            style={{ width: '50%' }}
            onChange={onFileNameChange}
          />
        </div>
        {EditorRendered}
      </div>
    );

    const EditModeHtmlFile = (
      <HtmlEditor
        onChange={this.onChange}
        content={this.state.updatedContent}
      />
    );

    const RenderedEditMode =
      this.props.accept === 'text/html' ? EditModeHtmlFile : EditModeAnyFile;

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar paths={[{ name: 'Add a Data File' }]} edition={true}>
            <Button
              type="primary"
              className="mcs-primary"
              onClick={this.handleAdd}
            >
              <McsIcon type="plus" />
              <span>Update</span>
            </Button>
            <McsIcon
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-table-edit-container">
              {editMode ? RenderedEditMode : FileSelectionRendered}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default FormDataFileDrawer;
