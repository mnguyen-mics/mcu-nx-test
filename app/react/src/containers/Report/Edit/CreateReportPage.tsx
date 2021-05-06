import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';
import { withRouter } from 'react-router-dom';

import ReportCreationEditor from './ReportCreationEditor';
import { RouteComponentProps } from 'react-router';

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = InjectedIntlProps & MapStateProps & RouteComponentProps<{ organisationId: string }>;

class CreateReportPage extends React.Component<Props> {
  render() {
    const organisationId = this.props.match.params.organisationId;

    return <ReportCreationEditor organisationId={organisationId} />;
  }
}

export default compose(withRouter)(CreateReportPage);
