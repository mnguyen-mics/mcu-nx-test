import * as React from 'react';
import { Col, Button, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { UploadProps } from 'antd/lib/upload/interface';
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { compose } from 'recompose';
import FormDataFileDrawer, {
  FormDataFileDrawerProps,
} from './FormDataFileDrawer';
import { Button as McsButton, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { FormFieldWrapper } from '../../../../components/Form';

import messages from '../../messages';
import { injectDrawer } from '../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { lazyInject } from '../../../../config/inversify.config';
import { IDataFileService } from '../../../../services/DataFileService';
import { TYPES } from '../../../../constants/types';

export type AcceptedFile = 'text/html' | '*';

export interface FormDataFileProps {
  formItemProps?: FormItemProps;
  inputProps?: UploadProps;
  helpToolTipProps: TooltipPropsWithTitle;
  buttonText: string;
  accept: AcceptedFile;
  disabled?: boolean;
  small?: boolean;
}

export interface FormDataFileState {
  canEdit: boolean;
  fileName: string;
  canRemoveFile: boolean;
  fileContent: string;
  type: string;
  modalVisible: boolean;
  basePath?: string;
}

type JoinedProps = FormDataFileProps & WrappedFieldProps & InjectedDrawerProps;

class FormDataFile extends React.Component<JoinedProps, FormDataFileState> {

  @lazyInject(TYPES.IDataFileService)
  private _dataFileService: IDataFileService;


  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      fileName: '',
      canRemoveFile: false,
      canEdit: false,
      fileContent: '',
      type: '',
      modalVisible: false,
    };
  }

  componentDidMount() {
    const { input } = this.props;
    if (input.value.uri) {
      // fetch initial data
      this.fetchDataFileData(input.value.uri);
    } else {
      input.onChange({});
      this.changeCanRemoveFile(true);
    }
  }

  fetchDataFileData = (uri: string) => {
    const { input } = this.props;

    this._dataFileService.getDatafileData(uri).then(res => {
      this.onFileUpdate(res).then((fileContent: string) => {
        const fileName = this.parseFileName(uri);
        const basePath = this.parseFileName(uri, true);

        this.setState({
          canEdit: true,
          fileContent: fileContent,
          fileName: fileName,
          basePath: basePath,
        });
        input.onChange({
          uri: uri,
          fileContent: fileContent,
          fileName: fileName,
        });
      });
    });
  };

  parseFileName = (uri: string, basePath?: boolean) => {
    const parsedUri = uri.split('/');
    if (basePath) {
      parsedUri.pop();
      return parsedUri.join('/');
    }
    return parsedUri[parsedUri.length - 1];
  };

  changeCanRemoveFile = (canRemoveFile: boolean) => {
    this.setState({ canRemoveFile: canRemoveFile });
  };

  changeFileName = (fileName: string) => {
    this.setState({ fileName: fileName });
  };

  onRemoveFile = () => {
    const { input } = this.props;
    this.changeFileName('');
    input.onChange({});
    this.setState({ canEdit: false });
  };

  onFileUpdate = (file: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (fileLoadedEvent: any) => {
        const textFromFileLoaded = fileLoadedEvent.target.result;
        return resolve(textFromFileLoaded);
      };

      fileReader.readAsText(file, 'UTF-8');
    });
  };

  onDrawerClose = (content: string, fileName: string) => {
    const { input } = this.props;
    if (fileName && content) {
      this.setState({
        fileContent: content,
        fileName: fileName,
        canEdit: true,
      });
      if (this.state.basePath) {
        input.onChange({
          fileContent: content,
          fileName: fileName,
          uri: `${this.state.basePath}/${fileName}`,
        });
      } else {
        input.onChange({ fileContent: content, fileName: fileName });
      }
    }
    this.props.closeNextDrawer();
  };

  render() {
    const { meta, input, disabled } = this.props;

    const { canEdit } = this.state;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';


    const editProps = {
      onClick: () => {
        const additionalProps = {
          content: this.state.fileContent,
          type: this.state.type,
          fileName: this.state.fileName,
          close: this.onDrawerClose,
          accept: this.props.accept,
          openNextDrawer: this.props.openNextDrawer,
          closeNextDrawer: this.props.closeNextDrawer,
        };

        const options = {
          additionalProps,
          isModal: true,
        };

        this.props.openNextDrawer<FormDataFileDrawerProps>(
          FormDataFileDrawer,
          options,
        );
      },
    };

    const remove = () => {
      this.setState({ fileContent: '', fileName: '', canEdit: false });
      input.onChange({});
    };

    const removeProps = {
      onClick: () => {
        // remove data from store
        Modal.confirm({
          title: 'Do you want to delete this datafile',
          content:
            'If you delete an unsaved file you will loose all your work, are you sure you want to proceed?',
          okText: 'Yes',
          cancelText: 'No',
          onOk() {
            remove();
          },
        });
      },
    };

    const click = () => {
      // test
      const additionalProps = {
        content: this.state.fileContent,
        close: this.onDrawerClose,
        accept: this.props.accept,
        openNextDrawer: this.props.openNextDrawer,
        closeNextDrawer: this.props.closeNextDrawer,
      };

      const options = {
        additionalProps,
        isModal: true,
      };

      this.props.openNextDrawer(FormDataFileDrawer, options);
    };

    return (
      <FormFieldWrapper
        help={
          this.props.meta.touched &&
          (this.props.meta.warning || this.props.meta.error)
        }
        helpToolTipProps={this.props.helpToolTipProps}
        validateStatus={validateStatus}
        {...this.props.formItemProps}
        small={this.props.small}
      >
        <Col span={24}>
          {!canEdit ? (
            <span>
              <Button onClick={click} disabled={disabled}>
                <FormattedMessage {...messages.datafileFileSelect} />
              </Button>
            </span>
          ) : null}

          {canEdit ? (
            <span>
              <span className="m-r-20">{this.state.fileName}</span>
              <McsButton {...editProps}>
                <McsIcon type="pen" />
              </McsButton>
              <McsButton {...removeProps}>
                <McsIcon type="close" />
              </McsButton>
            </span>
          ) : null}
        </Col>
      </FormFieldWrapper>
    );
  }
}

export default compose<any, FormDataFileProps & WrappedFieldProps>(injectDrawer)(FormDataFile);
