import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { getWorkspace } from '../../../state/Session/selectors';
import Monitoring from './Monitoring';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { DatamartSelector } from '../../Datamart';
import { Cookies } from '../../../models/timeline/timeline';

const messages = defineMessages({
  selectMonitoringDatamart: {
    id: 'audience.monitoring.select.datamart.breadcrumb.title',
    defaultMessage: 'Select Monitoring Datamart',
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
    const datamartId = queryString.parse(location.search).datamartId
      ? queryString.parse(location.search).datamartId
      : '';
    if (!identifierId && !identifierType) {
      if (cookies.mics_vid) {
        history.push(
          `/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${
            cookies.mics_vid
          }`,
        );
      } else {
        history.push(`/v2/o/${organisationId}/audience/timeline`);
      }
    } else {
      history.push(
        `/v2/o/${organisationId}/audience/timeline/${identifierType}/${identifierId}?datamartId=${
          datamartId ? datamartId : ''
        }`,
      );
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: {
        params: { organisationId, identifierId, identifierType },
      },
      history,
      cookies,
      location,
    } = this.props;
    const {
      match: {
        params: {
          identifierType: nextIdentifierType,
          identifierId: nextIdentifierId,
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;
    const datamartId = queryString.parse(location.search).datamartId
      ? queryString.parse(location.search).datamartId
      : '';
    if (
      nextIdentifierId &&
      nextIdentifierType &&
      nextIdentifierId !== identifierId &&
      nextIdentifierType !== identifierType
    ) {
      history.push(
        `/v2/o/${organisationId}/audience/timeline/${nextIdentifierType}/${nextIdentifierId}?datamartId=${datamartId}`,
      );
    } else if (cookies.mics_vid && nextOrganisationId !== organisationId) {
      history.push(
        `/v2/o/${nextOrganisationId}/audience/timeline/user_agent_id/vec:${
          cookies.mics_vid
        }?datamartId=${datamartId}`,
      );
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
      cookies
    } = this.props;

    let selectedDatamartId = '';

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    const datamarts = workspace(organisationId).datamarts;

    if (datamartIdQueryString) {
      const isRelated = datamarts.find(d => d.id === datamartIdQueryString);
      selectedDatamartId = isRelated ? datamartIdQueryString : undefined;
    }

    if (datamarts && datamarts.length === 1) {
      selectedDatamartId = datamarts[0].id;
    }

    return selectedDatamartId ? (
      <Monitoring datamartId={selectedDatamartId} cookies={cookies} />
    ) : (
      <DatamartSelector
        onSelectDatamart={this.onDatamartSelect}
        actionbarProps={{
          paths: [
            {
              name: intl.formatMessage(messages.selectMonitoringDatamart),
            },
          ],
        }}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  cookies: state.session.cookies,
  workspace: getWorkspace(state),
});

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    mapStateToProps,
    undefined,
  ),
)(TimelinePage);
