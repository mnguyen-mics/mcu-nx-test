import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { compose, withState, withHandlers } from 'recompose';
import { Upload, Icon } from 'antd'
const Dragger = Upload.Dragger;

import { Logo } from './Logo';
import { getWorkspace } from '../../state/Session/selectors';
import { getLogo, putLogo } from '../../state/Session/actions';

import mediarithmicsLogo from '../../assets/images/logo-mediarithmics.png';

function handleUpload(props, organisationId, uploadData) {
  const file = uploadData.file;
  props.putLogoRequest({organisationId, file});
}

class EditableLogo extends Component {
  componentDidMount() {
    const {
      match: {
        params: { organisationId }
      },
      updateLogo
    } = this.props;

    this.props.getLogoRequest({ organisationId });
  }

  buildDragLabel() {
    return (<div className="mcs-logo-dragger">
      <p className="ant-upload-drag-icon">
        <Icon type="inbox" />
      </p>
      <p className="ant-upload-text">Click or drag an image in this area to upload</p>
      <p className="ant-upload-hint"></p>
    </div>);
  }

  buildLogoImageWithUpload(logoUrl) {
    return (<div className="mcs-logo-dragger">
      <img alt="logo" src={logoUrl}/>
      <span className="mcs-dropzone-overlay">
        <label className="mcs-dropzone-overlay-label">Upload Logo</label>
      </span>
    </div>);
  }

  wrapInDraggerComponent(component) {
    const {
      match: {
        params: { organisationId }
      },
      updateLogo
    } = this.props;

    return ( <Dragger {...this.props} showUploadList={false}
      customRequest={(uploadData) => handleUpload(this.props, organisationId, uploadData)}>
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
    const uploadLogoComponent =  this.wrapInDraggerComponent(insideComponent);

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
