import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { compose, withState, withHandlers } from 'recompose';
import { Upload, Icon } from 'antd'
const Dragger = Upload.Dragger;

import { Logo } from './Logo';
import { getWorkspace } from '../../state/Session/selectors';
import { getLogo } from '../../state/Session/actions';

import mediarithmicsLogo from '../../assets/images/logo-mediarithmics.png';

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
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
    </div>);
  }

  buildLogoImageWithUpload() {
    return (<Modal visible={false} footer={null}>
      <img alt="logo" src={logoUrl} />
    </Modal>);
  }

  wrapInDraggerComponent(component) {
    return ( <Dragger {...this.props}>
      { component }
    </Dragger>);
  }

  render() {
    const {
      mode,
      logoBlob
    } = this.props;

    const logoUrl = logoBlob ? URL.createObjectURL(logoBlob) : null;  // eslint-disable-line no-undef
    const insideComponent = (!logoBlob) ? this.buildDragLabel() : <img alt="logo" src={logoUrl} />;
    const uploadLogoComponent =  this.wrapInDraggerComponent(insideComponent);

    return (
      <div className="mcs-logo-placeholder">
        { mode === 'inline' &&
          <div className="mcs-logo" >
            { uploadLogoComponent }
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
  updateLogo: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  getWorkspaceByOrganisation: getWorkspace(state)
});

const mapDispatchToProps = {
  getLogoRequest: getLogo
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
