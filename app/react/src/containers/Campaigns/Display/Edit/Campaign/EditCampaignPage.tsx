import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import CampaignContent from './CampaignContent';
import withDrawer, { DrawableContentProps, DrawableContentOptions } from '../../../../../components/Drawer';
import { withMcsRouter } from '../../../../Helpers';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import log from '../../../../../utils/Logger';
import * as AdGroupWrapper from '../../../../../formServices/AdGroupServiceWrapper';
import messages from './messages';

interface EditCampaignPageProps {
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
  notifyError: any;
}

interface RouterMatchParams {
  organisationId: string;
  campaignId: string;
}

interface EditCampaignPageState {
  initialValues: object;
  loading: boolean;
}

type JoinedProps = EditCampaignPageProps & InjectedIntlProps & RouteComponentProps<RouterMatchParams>;

class EditCampaignPage extends React.Component<JoinedProps, EditCampaignPageState> {

  state = {
    initialValues: {
      name: '',
    },
    loading: true,
  };

  componentDidMount() {
    const {
      campaignId,
      organisationId,
    } = this.props.match.params;
    this.fetchAll(campaignId, organisationId);
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      campaignId,
      organisationId,
    } = this.props.match.params;
    const { campaignId: nextCampaignId, organisationId: nextOrganisationId } = nextProps.match.params;
    if (campaignId !== nextCampaignId || organisationId !== nextOrganisationId) {
      this.fetchAll(nextCampaignId, nextOrganisationId);
    }
  }

  fetchAll = (campaignId: string, organisationId: string) => {
    Promise.all([
      this.fetchCampaignInfo(campaignId),
      this.fetchGoalsSelection(campaignId),
      this.fetchAdGroups(campaignId, organisationId),
    ])
    .then((results) => {
      this.setState({
        initialValues: { ...results[0], goalsTable: results[1], adGroupsTable: results[2] },
        loading: false,
      });
    })
    .catch(err => {
      log.error(err);
      this.setState({ loading: false });
      this.props.notifyError(err);
    });
  }

  fetchCampaignInfo = (campaignId: string) => {
    return DisplayCampaignService.getCampaignDisplay(campaignId).then(data => data.data);
  }

  fetchGoalsSelection = (campaignId: string) => {
    return DisplayCampaignService.getGoal(campaignId)
      .then(resp => resp.data.map(item => {
        const newItem: any = item;
        newItem.main_id = item.goal_id;
        return newItem;
      }));
  }

  fetchAdGroups = (campaignId: string, organisationId: string) => {
    return AdGroupWrapper.getAdGroups(organisationId, campaignId)
    .then((data: any) => data.map((item: any) => {
      const newItem = item;
      newItem.main_id = item.id;
      return newItem;
    }));
  }

  render() {
    const {
      closeNextDrawer,
      openNextDrawer,
      intl: { formatMessage },
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
    } = this.props;

    const {
      initialValues,
    } = this.state;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1),
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
      {
        name: initialValues.name,
        url: `/v2/o/${organisationId}/campaigns/display/${campaignId}/edit`,
      },
    ];

    return (
      <CampaignContent
        closeNextDrawer={closeNextDrawer}
        openNextDrawer={openNextDrawer}
        initialValues={this.state.initialValues}
        loading={this.state.loading}
        breadcrumbPaths={breadcrumbPaths}
        editionMode={true}
      />
    );
  }
}

export default compose(
  withMcsRouter,
  withDrawer,
  injectIntl,
  connect(
    undefined,
    { notifyError: NotificationActions.notifyError },
  ),
)(EditCampaignPage);
