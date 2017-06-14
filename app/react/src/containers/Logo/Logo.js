import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { compose, withState, withHandlers } from 'recompose';

import { getWorkspace } from '../../state/Session/selectors';
import { getLogo } from '../../state/Session/actions';

import mediarithmicsLogo from '../../assets/images/logo-mediarithmics.png';

class Logo extends Component {

  componentDidMount() {
    const {
      match: {
        params: { organisationId }
      },
      updateLogo
    } = this.props;

    this.props.getLogoRequest({ organisationId, updateLogo });
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: { organisationId }
      },
      updateLogo
    } = this.props;

    const {
      match: {
        params: { organisationId: nextOrganisationId }
      },
    } = nextProps;

    if (organisationId !== nextOrganisationId) {
      this.props.getLogoRequest({ organisationId: nextOrganisationId, updateLogo });
    }

  }

  render() {
    const {
      mode,
      logoBlob
    } = this.props;

    const logoUrl = logoBlob ? URL.createObjectURL(logoBlob) : null;  // eslint-disable-line no-undef

    return (
      <div className="mcs-logo-placeholder">
        { mode === 'inline' &&
          <div className="mcs-logo" >
            <Link to="/" id="logo">
              {!!logoBlob && <img alt="logo" src={logoUrl} />}
              {!logoBlob && <img alt="logo" src={mediarithmicsLogo} />}
            </Link>
          </div>
        }
      </div>
    );
  }
}

Logo.defaultProps = {
  logoBlob: null
};

Logo.propTypes = {
  mode: PropTypes.string.isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  logoBlob: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  getWorkspaceByOrganisation: PropTypes.func.isRequired,
  getLogoRequest: PropTypes.func.isRequired,
  updateLogo: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  getWorkspaceByOrganisation: getWorkspace(state)
});

const mapDispatchToProps = {
  getLogoRequest: getLogo
};

Logo = connect(
  mapStateToProps,
  mapDispatchToProps
)(Logo);

Logo = compose(
  withState('logoBlob', 'setLogoBlob', null),
  withHandlers({
    updateLogo: ({ setLogoBlob }) => (logoBlob) => setLogoBlob(logoBlob)
  }),
  withRouter
)(Logo);

Logo = withRouter(Logo);

export default Logo;
