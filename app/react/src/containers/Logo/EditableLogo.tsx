import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  FormattedMessage,
  injectIntl,
  InjectedIntlProps,
  defineMessages,
} from 'react-intl';
import { compose } from 'recompose';
import { InboxOutlined } from '@ant-design/icons';
import { Upload } from 'antd';

import { getLogo, putLogo } from '../../redux/Session/actions';
import { MenuMode } from 'antd/lib/menu';
import injectNotifications, {
  InjectedNotificationProps,
} from '../Notifications/injectNotifications';
import { MicsReduxState } from '../../utils/ReduxHelper';

const Dragger = Upload.Dragger;

export interface EditableLogoProps {
  mode: MenuMode;
}

export interface EditableLogoStoreProps {
  getLogoRequest: (a: { organisationId: string }) => void;
  putLogoRequest: (a: { organisationId: string; file: any }) => void;
  isUploadingLogo: boolean;
  logoUrl: string;
}

type Props = EditableLogoProps &
  EditableLogoStoreProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedIntlProps;

const messages = defineMessages({
  error: {
    id: 'logo.error.upload',
    defaultMessage:
      'The logo file should be a PNG with a maximum size of 200kb. Please make sure the file you have selected meets those criterias.',
  },
});

class EditableLogo extends React.Component<Props> {
  static defaultProps = {
    logoUrl: '',
  };

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.props.getLogoRequest({ organisationId });
  }

  buildDragLabel() {
    return (
      <div className="mcs-logo-dragger">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          <FormattedMessage
            id="components.logo.draggerMessage"
            defaultMessage="Click or drag an image in this area to upload"
          />
        </p>
        <p className="ant-upload-hint" />
      </div>
    );
  }

  buildLogoImageWithUpload(logoUrl: string) {
    return (
      <div className="mcs-logo-dragger">
        <img alt="logo" src={logoUrl} />
        <span id="logoDropzone" className="mcs-dropzone-overlay">
          <label htmlFor="logoDropzone" className="mcs-dropzone-overlay-label">
            <FormattedMessage
              id="components.logo.uploadImageMessage"
              defaultMessage="Upload image"
            />
          </label>
        </span>
      </div>
    );
  }

  handleUpload(organisationId: string, uploadData: any) {
    const { putLogoRequest, notifyError, intl } = this.props;

    const file = uploadData.file;
    if (file.type !== 'image/png' || file.size / 1024 > 200) {
      notifyError({
        status: 'error',
        error: intl.formatMessage(messages.error),
        error_id: '',
      });
    } else {
      putLogoRequest({ organisationId, file });
    }
  }

  wrapInDraggerComponent(component: React.ReactNode) {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const customRequest = (uploadData: any) =>
      this.handleUpload(organisationId, uploadData);
    return (
      <Dragger
        {...this.props}
        showUploadList={false}
        customRequest={customRequest}
      >
        {component}
      </Dragger>
    );
  }

  render() {
    const { mode, isUploadingLogo, logoUrl } = this.props;

    const insideComponent = !logoUrl
      ? this.buildDragLabel()
      : this.buildLogoImageWithUpload(logoUrl);
    const uploadLogoComponent = this.wrapInDraggerComponent(insideComponent);

    return (
      <div className="mcs-logo-placeholder">
        {mode === 'inline' && (
          <div className="mcs-logo">
            {uploadLogoComponent}
            {isUploadingLogo && (
              <div>
                <FormattedMessage
                  id="components.logo.loading"
                  defaultMessage="Logo is loading"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  isUploadingLogo: state.session.isUploadingLogo,
  logoUrl: state.session.logoUrl,
});

const mapDispatchToProps = {
  getLogoRequest: getLogo.request,
  putLogoRequest: putLogo.request,
};

export default compose<Props, EditableLogo>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withRouter,
  injectNotifications,
  injectIntl,
)(EditableLogo);
