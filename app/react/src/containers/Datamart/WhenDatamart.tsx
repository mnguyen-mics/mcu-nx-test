import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import * as SessionHelper from '../../redux/Session/selectors';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface WhenDatamartProps {
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = WhenDatamartProps & RouteComponentProps<{ organisationId: string }>;

class WhenDatamart extends React.Component<Props> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      hasDatamarts,
      children,
    } = this.props;
    return <div>{hasDatamarts(organisationId) && children}</div>;
  }
}

const mapStateToProps = (state: MicsReduxState) => {
  return {
    hasDatamarts: SessionHelper.hasDatamarts(state),
  };
};

export default compose(withRouter, connect(mapStateToProps))(WhenDatamart);
