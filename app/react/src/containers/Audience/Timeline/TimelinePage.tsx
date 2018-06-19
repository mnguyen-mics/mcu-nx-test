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

    let selectedDatamartId = '';

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    const datamarts = workspace(organisationId).datamarts;

    if (datamarts && datamarts.length === 1) {
      selectedDatamartId = datamarts[0].id;
    }

    if (datamartIdQueryString) {
      selectedDatamartId = datamartIdQueryString;
    }

    return selectedDatamartId ? (
      <Monitoring
        datamartId={selectedDatamartId}
      />
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
