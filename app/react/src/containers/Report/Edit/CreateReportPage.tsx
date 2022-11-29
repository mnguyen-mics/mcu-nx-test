import * as React from 'react';
import { compose } from 'recompose';
import { WrappedComponentProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ReportCreationEditor from './ReportCreationEditor';

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = WrappedComponentProps &
  MapStateProps &
  RouteComponentProps<{ organisationId: string }>;

class CreateReportPage extends React.Component<Props> {
  render() {
    const organisationId = this.props.match.params.organisationId;

    return <ReportCreationEditor organisationId={organisationId} />;
  }
}

export default compose(withRouter)(CreateReportPage);
