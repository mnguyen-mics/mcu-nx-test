import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { getLogo } from '../../state/Session/actions';
import { MenuMode } from 'antd/lib/menu';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface LogoProps {
  mode: MenuMode;
  
}

interface LogoStoreProps {
  logoUrl: string;
  getLogoRequest: (a: { organisationId: string }) => void;
}

type Props = LogoProps & RouteComponentProps<{organisationId: string}> & LogoStoreProps

class Logo extends React.Component<Props> {

  static defaultProps = {
    logoUrl: ''
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.props.getLogoRequest({ organisationId });
  }

  componentWillReceiveProps(nextProps: Props) {
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
      match: {
        params: { organisationId },
      },
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

const mapStateToProps = (state: MicsReduxState) => ({
  logoUrl: state.session.logoUrl,
});

const mapDispatchToProps = {
  getLogoRequest: getLogo.request,
};

export default compose<Props, LogoProps>(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Logo);
