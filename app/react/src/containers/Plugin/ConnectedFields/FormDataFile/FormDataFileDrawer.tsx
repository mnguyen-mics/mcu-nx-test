import React, { Component } from 'react';
import { Layout, Button, Select, Upload, Input } from 'antd';
import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import { FormTitle } from '../../../../components/Form';
import DataFileService from '../../../../services/DataFileService.js';
import messages from '../../messages';

const Option = Select.Option;
const Dragger = Upload.Dragger;

import AceEditor from 'react-ace';

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

const { Content } = Layout;

const env = ['javascript', 'java',
'python', 'xml', 'ruby', 'sass', 'markdown', 'mysql', 'json', 'html',
'handlebars', 'golang', 'csharp', 'elixir', 'typescript', 'css'];

interface FormDataFileDrawerProps {
  content: string;
  close: (e: any, name?: string) => void;
  type?: string;
  fileName?: string;
  inputProps: UploadProps;
}

interface FormDataFileDrawerState {
  updatedContent: string;
  type: string;
  editMode: boolean;
  fileName: string;
  fileSelectorValue?: string;
}

class FormDataFileDrawer extends Component<FormDataFileDrawerProps, FormDataFileDrawerState> {

  constructor(props: FormDataFileDrawerProps) {
    super(props);
    this.state = {
      updatedContent: props.content,
      type: this.defineMode(props.type),
      editMode: props.content !== '' ? true : false,
      fileName: props.fileName && props.fileName ? props.fileName : '',
    };
  }

  onChange = (e: any) => {
    this.setState({ updatedContent: e });
  }

  parseFileName = (uri: string, basePath?: boolean) => {
    const parsedUri = uri.split('/');
    if (basePath) {
      parsedUri.pop();
      return parsedUri.join('/');
    }
    return parsedUri[parsedUri.length - 1];
  }

  defineMode = (type?: string) => {

    if (type && env.indexOf(type) > -1) {
      return type;
    }
    return 'javascript';
  }

  handleAdd = () => {
    this.props.close(this.state.updatedContent, this.state.fileName);
  }

  handleEditorChange = (value: string) => this.defineMode(value);

  onFileUpdate = (file: any) => {
    const fileReader = new FileReader();
    fileReader.onload = (fileLoadedEvent: any) => {
      const textFromFileLoaded = fileLoadedEvent.target.result;
      this.setState({  updatedContent: textFromFileLoaded, type: file.type });
    };

    fileReader.readAsText(file, 'UTF-8');
  }

  changeFileName = (fileName: string) => {
    this.setState({ fileName: fileName });
  }

  render() {
    const {
      editMode,
    } = this.state;

    const uploadDetailProps = {
      action: '/',
      beforeUpload: (file: UploadFile) => {
        // add data to store
        this.changeFileName(file.name);
        const formData = new FormData(); /* global FormData */
        formData.append('file', file as any, file.name);
        this.onFileUpdate(file);
        this.setState({ editMode: true });
        return false;
      },
    };

    const onFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ fileName: e.target.value });
    };

    const onFileSelectorValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ fileSelectorValue: e.target.value });
    };

    const onFileSelectorValidate = (e: React.ChangeEvent<HTMLInputElement>) => {
      // test
      const {
        fileSelectorValue,
      } = this.state;

      if (fileSelectorValue) {
        DataFileService.getDatafileData(fileSelectorValue).then(res => {
          this.onFileUpdate(res);
          const fileName = this.parseFileName(fileSelectorValue);
          this.changeFileName(fileName);
          this.setState({ editMode: true, fileName: fileName });
        })
        .catch(err => {
          console.log(err);
        });
      }
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar path={[{ name: 'Add an audience' }]} edition={true}>
            <Button type="primary" className="mcs-primary" onClick={this.handleAdd}>
              <McsIcons type="plus" /><span>Add</span>
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-table-edit-container">
              {editMode ? (<div>
                <div style={{ marginBottom: 20 }}>
                  <Select defaultValue={env[0]} style={{ width: 120, float: 'right' }} onChange={this.handleEditorChange}>
                    { env.map(item => {
                      return (<Option key={item} value={item}>{item}</Option>);
                    }) }
                  </Select>
                  <Input defaultValue={this.state.fileName} style={{ width: '50%' }} onChange={onFileNameChange} />
                </div>
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
                />
              </div>) :
              (<div className="text-center">
                <div className="m-t-20 m-b-20">
                  <FormTitle title={messages.datafileDrawerUpload} />
                </div>
                <Dragger {...uploadDetailProps} >
                  <div style={{ height: 300 }}>Upload</div>
                </Dragger>
                <div className="m-t-20 m-b-20">
                  <FormTitle title={messages.datafileDrawerSelect} />
                </div>
                <div>
                  <Input style={{ maxWidth: 300 }} onChange={onFileSelectorValueChange} />
                </div>
                <div>
                  <Button onClick={onFileSelectorValidate}>Ok</Button>
                </div>
              </div>)}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default FormDataFileDrawer;
;
