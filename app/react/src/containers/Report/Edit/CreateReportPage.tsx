import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter } from 'react-router-dom';

import ReportCreationEditor from './ReportCreationEditor';
import * as NotificationActions from '../../../state/Notifications/actions';
import { RouteComponentProps } from 'react-router';

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = InjectedIntlProps & MapStateProps & RouteComponentProps<{organisationId: string}>;

class CreateReportPage extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
    this.state = {
      formats: [],
      rendererProperties: [],
      creative: {},
      isLoading: false,
    };
  }

  render() {
    const organisationId = this.props.match.params.organisationId;

    return (<ReportCreationEditor organisationId={organisationId} />);
  }
}

export default compose(
  withRouter,
  injectIntl,
  connect(
    undefined,
    { notifyError: NotificationActions.notifyError },
  ),
)(CreateReportPage);
