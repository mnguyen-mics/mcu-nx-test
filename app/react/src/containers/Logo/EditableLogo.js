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

function handleUpload(props, organisationId, uploadData, updateLogo) {
  const file = uploadData.file;
  props.putLogoRequest({organisationId, file, updateLogo});
}

class EditableLogo extends Component {
  componentDidMount() {
    const {
      match: {
        params: { organisationId }
      },
      updateLogo
    } = this.props;

    this.props.getLogoRequest({ organisationId, updateLogo });
  }

  buildDragLabel() {
    return (<div>
      <p className="ant-upload-drag-icon">
        <Icon type="inbox" />
      </p>
      <p className="ant-upload-text">Click or drag an image in this area to upload</p>
      <p className="ant-upload-hint"></p>
    </div>);
  }

  buildLogoImageWithUpload(logoUrl) {
    return (<div>
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
      customRequest={(uploadData) => handleUpload(this.props, organisationId, uploadData, updateLogo)}>
      { component }
    </Dragger>);
  }

  render() {
    const {
      mode,
      logoBlob,
      isUploadingLogo
    } = this.props;

    const logoUrl = logoBlob ? URL.createObjectURL(logoBlob) : null;  // eslint-disable-line no-undef
    const insideComponent = (!logoBlob) ? this.buildDragLabel() : this.buildLogoImageWithUpload(logoUrl);
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
  logoBlob: null
};

EditableLogo.propTypes = {
  mode: PropTypes.string.isRequired,
  logoBlob: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getLogoRequest: PropTypes.func.isRequired,
  putLogoRequest: PropTypes.func.isRequired,
  updateLogo: PropTypes.func.isRequired,
  isUploadingLogo: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  getWorkspaceByOrganisation: getWorkspace(state),
  isUploadingLogo: state.session.isUploadingLogo
});

const mapDispatchToProps = {
  getLogoRequest: getLogo,
  putLogoRequest: putLogo.request
};

EditableLogo = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditableLogo);

EditableLogo = compose(
  withState('logoBlob', 'setLogoBlob', null),
  withHandlers({
    updateLogo: ({ setLogoBlob }) => (logoBlob) => setLogoBlob(logoBlob)
  }),
  withRouter
)(EditableLogo);

EditableLogo = withRouter(EditableLogo);

export default EditableLogo;
