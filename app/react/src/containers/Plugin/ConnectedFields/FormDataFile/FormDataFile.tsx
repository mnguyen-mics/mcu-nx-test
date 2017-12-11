import * as React from 'react';
import { Tooltip, Col, Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { UploadProps } from 'antd/lib/upload/interface';
import { WrappedFieldProps } from 'redux-form';
import { TooltipPlacement, TooltipProps } from 'antd/lib/tooltip';
import { isEmpty } from 'lodash';
import FormDataFileDrawer from './FormDataFileDrawer';
import withDrawer from '../../../../components/Drawer';
import DataFileService from '../../../../services/DataFileService';

import {McsIcons, ButtonStyleless} from '../../../../components';
import { FormFieldWrapper } from '../../../../components/Form';

import messages from '../../messages';

const defaultTooltipPlacement: TooltipPlacement = 'right';

export interface FormDataFileProps {
  formItemProps?: FormItemProps;
  inputProps?: UploadProps;
  helpToolTipProps: TooltipProps;
  buttonText: string;
  closeNextDrawer: () => void;
  openNextDrawer: (a: React.ComponentClass, options: { additionalProps: any; isModal: boolean; }) => void;
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

type JoinedProps = FormDataFileProps & WrappedFieldProps;

class FormDataFile extends React.Component<JoinedProps, FormDataFileState> {

  static defaultprops = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

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
    const {
      input,
    } = this.props;
    if (input.value.uri) {
      // fetch initial data
      this.fetchDataFileData(input.value.uri);
    } else {
      input.onChange({});
      this.changeCanRemoveFile(true);
    }
  }

  fetchDataFileData = (uri: string) => {
    const {
      input,
    } = this.props;

    DataFileService.getDatafileData(uri).then((res: any) => {
     this.onFileUpdate(res)
        .then((fileContent: string) => {
          const fileName = this.parseFileName(uri);
          const basePath = this.parseFileName(uri, true);
          this.setState({ canEdit: true, fileContent: fileContent, fileName: fileName, basePath: basePath });
          input.onChange({ uri: uri, fileContent: fileContent, fileName: fileName });
        });

    });
  }

  parseFileName = (uri: string, basePath?: boolean) => {
    const parsedUri = uri.split('/');
    if (basePath) {
      parsedUri.pop();
      return parsedUri.join('/');
    }
    return parsedUri[parsedUri.length - 1];
  }

  changeCanRemoveFile = (canRemoveFile: boolean) => {
    this.setState({ canRemoveFile: canRemoveFile });
  }

  changeFileName = (fileName: string) => {
    this.setState({ fileName: fileName });
  }

  onRemoveFile = () => {
    const {
      input,
    } = this.props;
    this.changeFileName('');
    input.onChange({});
    this.setState({ canEdit: false });
  }

  onFileUpdate = (file: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (fileLoadedEvent: any) => {
        const textFromFileLoaded = fileLoadedEvent.target.result;
        return resolve(textFromFileLoaded);
      };

      fileReader.readAsText(file, 'UTF-8');
    });
  }

  onDrawerClose = (content: string, fileName: string) => {
    const {
      input,
    } = this.props;
    if (fileName && content) {
      this.setState({ fileContent: content, fileName: fileName, canEdit: true });
      if (this.state.basePath) {
        input.onChange({ fileContent: content, fileName: fileName, uri: `${this.state.basePath}/${fileName}` });
      } else {
        input.onChange({ fileContent: content, fileName: fileName });
      }

    }
    this.props.closeNextDrawer();
  }

  render() {
    const {
      meta,
      helpToolTipProps,
      input,
    } = this.props;

    const {
      canEdit,
    } = this.state;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

    const editProps = {
      onClick: () => {
        const additionalProps = {
          content: this.state.fileContent,
          type: this.state.type,
          fileName: this.state.fileName,
          close: this.onDrawerClose,
        };

        const options = {
          additionalProps,
          isModal: true,
        };

        this.props.openNextDrawer(FormDataFileDrawer, options);
      },
    };

    const removeProps = {
      onClick: () => {
        // remove data from store
        this.setState({ fileContent: '', fileName: '', canEdit: false });
        input.onChange({});
      },
    };

    const click = () => {
      // test
      const additionalProps = {
        content: this.state.fileContent,
        close: this.onDrawerClose,
      };

      const options = {
        additionalProps,
        isModal: true,
      };

      this.props.openNextDrawer(FormDataFileDrawer, options);
    };

    return (
      <FormFieldWrapper
        help={this.props.meta.touched && (this.props.meta.warning || this.props.meta.error)}
        helpToolTipProps={this.props.helpToolTipProps}
        validateStatus={validateStatus}
        {...this.props.formItemProps}
      >
          <Col span={22} >
           {!canEdit ? (<span>
              <Button onClick={click}>
                <FormattedMessage {...messages.datafileFileSelect} />
              </Button>
            </span>) : null}

            {canEdit ?
            <span>
              <span className="m-r-20">{this.state.fileName}</span>
              <ButtonStyleless
                {...editProps}
              >
                <McsIcons type="pen" />
              </ButtonStyleless>
              <ButtonStyleless
                {...removeProps}
              >
                <McsIcons type="close" />
              </ButtonStyleless>
            </span> : null}

          </Col>
          {displayHelpToolTip &&
            <Col span={2} className="field-tooltip">
              <Tooltip {...mergedTooltipProps}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          }
      </FormFieldWrapper>
    );
  }
}

export default withDrawer(FormDataFile);
