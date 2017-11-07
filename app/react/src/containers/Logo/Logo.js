import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withMcsRouter } from '../Helpers';
import { getLogo } from '../../state/Session/actions';

class Logo extends Component {

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.props.getLogoRequest({ organisationId });
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    if (organisationId !== nextOrganisationId) {
      this.props.getLogoRequest({ organisationId: nextOrganisationId });
    }

  }

  render() {
    const {
      mode,
      logoUrl,
      organisationId,
    } = this.props;

    return (
      <div className="mcs-logo-placeholder">
        { mode === 'inline' &&
          <div className="mcs-logo" >
            <Link to={`/v2/o/${organisationId}/campaigns/display`} id="logo">
              <img alt="logo" src={logoUrl} />
            </Link>
          </div>
        }
      </div>
    );
  }
}

Logo.defaultProps = {
  logoUrl: '',
};

Logo.propTypes = {
  mode: PropTypes.string.isRequired,
  match: PropTypes.shape().isRequired,
  logoUrl: PropTypes.string,
  getLogoRequest: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  logoUrl: state.session.logoUrl,
});

const mapDispatchToProps = {
  getLogoRequest: getLogo.request,
};

Logo = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withMcsRouter,
)(Logo);

export default Logo;
