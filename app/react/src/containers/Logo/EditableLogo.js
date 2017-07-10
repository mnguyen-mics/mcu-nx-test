import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Upload, Icon } from 'antd';

import { getWorkspace } from '../../state/Session/selectors';
import { getLogo, putLogo } from '../../state/Session/actions';

const Dragger = Upload.Dragger;

class EditableLogo extends Component {
  componentDidMount() {
    const {
      match: {
        params: { organisationId }
      }
    } = this.props;

    this.props.getLogoRequest({ organisationId });
  }

  buildDragLabel() {
    return (<div className="mcs-logo-dragger">
      <p className="ant-upload-drag-icon">
        <Icon type="inbox" />
      </p>
      <p className="ant-upload-text">
        <FormattedMessage id="DRAGGER_MESSAGE" defaultMessage="Click or drag an image in this area to upload" />
      </p>
      <p className="ant-upload-hint" />
    </div>);
  }

  buildLogoImageWithUpload(logoUrl) {
    return (<div className="mcs-logo-dragger">
      <img alt="logo" src={logoUrl} />
      <span id="logoDropzone" className="mcs-dropzone-overlay">
        <label htmlFor="logoDropzone" className="mcs-dropzone-overlay-label">
          <FormattedMessage id="UPLOAD_IMAGE_MESSAGE" defaultMessage="Upload image" />
        </label>
      </span>
    </div>);
  }

  handleUpload(organisationId, uploadData) {
    const {
      putLogoRequest
    } = this.props;

    const file = uploadData.file;
    putLogoRequest({ organisationId, file });
  }

  wrapInDraggerComponent(component) {
    const {
      match: {
        params: { organisationId }
      }
    } = this.props;

    return (<Dragger
      {...this.props}
      showUploadList={false}
      customRequest={(uploadData) => this.handleUpload(organisationId, uploadData)}
    >
      { component }
    </Dragger>);
  }

  render() {
    const {
      mode,
      isUploadingLogo,
      logoUrl
    } = this.props;

    const insideComponent = (!logoUrl) ? this.buildDragLabel() : this.buildLogoImageWithUpload(logoUrl);
    const uploadLogoComponent = this.wrapInDraggerComponent(insideComponent);

    return (
      <div className="mcs-logo-placeholder">
        { mode === 'inline' &&
          <div className="mcs-logo" >
            { uploadLogoComponent }
            { isUploadingLogo && <div>Logo is Loading</div> }
          </div>
        }
      </div>
    );
  }
}

EditableLogo.defaultProps = {
  logoUrl: null
};

EditableLogo.propTypes = {
  mode: PropTypes.string.isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getLogoRequest: PropTypes.func.isRequired,
  putLogoRequest: PropTypes.func.isRequired,
  isUploadingLogo: PropTypes.bool.isRequired,
  logoUrl: PropTypes.string
};

const mapStateToProps = state => ({
  getWorkspaceByOrganisation: getWorkspace(state),
  isUploadingLogo: state.session.isUploadingLogo,
  logoUrl: state.session.logoUrl
});

const mapDispatchToProps = {
  getLogoRequest: getLogo.request,
  putLogoRequest: putLogo.request
};

EditableLogo = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter
)(EditableLogo);


export default EditableLogo;
