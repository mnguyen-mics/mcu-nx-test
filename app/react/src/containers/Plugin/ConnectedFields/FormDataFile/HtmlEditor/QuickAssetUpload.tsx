import * as React from 'react';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Upload, message, Button } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '../../../../../components/Form/FormFieldWrapper';
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import { injectDrawer } from '../../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IAssetFileService } from '../../../../../services/Library/AssetFileService';

export interface QuickAssetUploadProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  inputProps?: UploadProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
  helpToolTipProps?: TooltipPropsWithTitle;
}

export interface QuickAssetUploadState {
  imageUrl: string;
  loading: boolean;
}

const acceptedFormat = 'image/*';

type OuterProps = QuickAssetUploadProps &
  WrappedFieldProps &
  RouteComponentProps<{ organisationId: string }>;

type JoinedProps = OuterProps & InjectedDrawerProps & InjectedNotificationProps;

class QuickAssetUpload extends React.Component<JoinedProps, QuickAssetUploadState> {
  @lazyInject(TYPES.IAssetFileService)
  private _assetFileService: IAssetFileService;
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      imageUrl: this.props.input.value,
      loading: false,
    };
  }

  beforeUpload = (file: UploadFile) => {
    const isLt2M = file.size && file.size / 1024 < 200;
    if (!isLt2M) {
      message.error('Image must smaller than 200kb!');
      return false;
    }
    const formData = new FormData(); /* global FormData */
    formData.append('file', file as any, file.name);
    this.setState({ loading: true }, () => {
      this._assetFileService
        .uploadAssetsFile(this.props.match.params.organisationId, formData)
        .then(item => item.data)
        .then(item => {
          const imageUrl = `${(global as any).window.MCS_CONSTANTS.ASSETS_URL}${item.path}`;
          this.setState({ loading: false, imageUrl: imageUrl });
          this.props.input.onChange(imageUrl);
          return false;
        })
        .catch(e => {
          this.props.notifyError(e);
          this.setState({ loading: false });
          return false;
        });
      return false;
    });
    return false;
  };

  addExistingAsset = () => {
    // const props = {
    //   size: 'large',
    //   modal: false,
    // }
    // this.props.openNextDrawer()
    // TODO
  };

  render() {
    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (this.props.meta.touched && this.props.meta.invalid) validateStatus = 'error';
    if (this.props.meta.touched && this.props.meta.warning) validateStatus = 'warning';
    const uploadButton = (
      <div className='m-r-20 m-t-10'>
        <Button>
          {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
          Upload
        </Button>
      </div>
    );

    // TODO WHEN NEW TABLESELECTOR IS CREATED
    // const addExistingButton = (
    //   <Button className="m-t-10" onClick={this.addExistingAsset}>Add Existing</Button>
    // )

    const imageUrl = this.state.imageUrl;

    return (
      <FormFieldWrapper
        help={this.props.meta.touched && (this.props.meta.warning || this.props.meta.error)}
        helpToolTipProps={this.props.helpToolTipProps}
        validateStatus={validateStatus}
        {...this.props.formItemProps}
      >
        <div style={{ maxWidth: '100%', marginBottom: 10 }}>
          {this.state.loading ? (
            <LoadingOutlined />
          ) : (
            <img src={imageUrl} alt='' style={{ maxWidth: '100%' }} />
          )}
        </div>
        {!this.state.loading && (
          <Upload
            {...this.props.input}
            {...this.props.inputProps}
            showUploadList={false}
            action='/'
            beforeUpload={this.beforeUpload}
            accept={acceptedFormat}
          >
            {uploadButton}
          </Upload>
        )}
        {/* {(!this.state.loading) && addExistingButton} */}
      </FormFieldWrapper>
    );
  }
}

export default compose<JoinedProps, QuickAssetUploadProps & WrappedFieldProps>(
  withRouter,
  injectDrawer,
  injectNotifications,
)(QuickAssetUpload);
