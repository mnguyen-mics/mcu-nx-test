import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { getWorkspace } from '../../../redux/Session/selectors';
import Monitoring from './Monitoring';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { DatamartSelector } from '../../Datamart';
import { Cookies } from '../../../models/timeline/timeline';
import { ErrorBoundary } from '@mediarithmics-private/mcs-components-library';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { notifyError } from '../../../redux/Notifications/actions';

const messages = defineMessages({
  selectMonitoringDatamart: {
    id: 'audience.monitoring.select.datamart.breadcrumb.title',
    defaultMessage: 'Select Monitoring Datamart',
  },
  errorBoundaryMessage: {
    id: 'audience.monitoring.errorBoundary.hasError',
    defaultMessage: 'Something went wrong',
  },
});

export interface TimelinePageParams {
  organisationId: string;
  identifierType: string;
  identifierId: string;
}

interface MapStateToProps {
  cookies: Cookies;
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type JoinedProps = MapStateToProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<TimelinePageParams>;

class TimelinePage extends React.Component<JoinedProps> {
  constructor(props: JoinedProps) {
    super(props);
  }

  componentDidMount() {
    const {
      history,
      cookies,
      match: {
        params: { organisationId, identifierId, identifierType },
      },
    } = this.props;
    if (!identifierId && !identifierType) {
      if (cookies.mics_vid) {
        history.push(
          `/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${cookies.mics_vid}`,
        );
      } else {
        history.push(`/v2/o/${organisationId}/audience/timeline`);
      }
    }
  }

  componentDidUpdate() {
    const {
      history,
      cookies,
      match: {
        params: { organisationId, identifierId, identifierType },
      },
      location,
    } = this.props;
    const datamarId = queryString.parse(location.search).datamarId;
    if (!identifierId && !identifierType && cookies.mics_vid) {
      const url = `/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${
        cookies.mics_vid
      }?datamartId=${datamarId ? datamarId : ''}`;
      history.push(url);
    }
  }

  onDatamartSelect = (datamart: DatamartResource) => {
    const { history, location } = this.props;
    history.push({
      pathname: location.pathname,
      search: queryString.stringify({ datamartId: datamart.id }),
    });
  };

  render() {
    const {
      intl,
      workspace,
      match: {
        params: { organisationId },
      },
      location,
    } = this.props;

    let selectedDatamart: DatamartResource | undefined;

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    const datamarts = workspace(organisationId).datamarts;

    if (datamartIdQueryString) {
      selectedDatamart = datamarts.find(d => d.id === datamartIdQueryString);
    }

    if (datamarts && datamarts.length === 1) {
      selectedDatamart = datamarts[0];
    }

    return selectedDatamart ? (
      <ErrorBoundary
        errorMessage={intl.formatMessage(messages.errorBoundaryMessage)}
        onError={notifyError}
      >
        <Monitoring selectedDatamart={selectedDatamart} />
      </ErrorBoundary>
    ) : (
      <DatamartSelector
        onSelect={this.onDatamartSelect}
        actionbarProps={{
          pathItems: [intl.formatMessage(messages.selectMonitoringDatamart)],
        }}
        isMainlayout={true}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  cookies: state.session.cookies,
  workspace: getWorkspace(state),
});

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(mapStateToProps, undefined),
)(TimelinePage);
