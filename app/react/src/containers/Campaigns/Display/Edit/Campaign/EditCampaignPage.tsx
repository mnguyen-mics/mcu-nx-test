import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import CampaignContent from './CampaignContent';
import withDrawer, { DrawableContentProps, DrawableContentOptions } from '../../../../../components/Drawer';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import log from '../../../../../utils/Logger';
import * as AdGroupWrapper from '../AdGroupServiceWrapper';
import messages from './messages';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';

interface EditCampaignPageProps {
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
  notifyError: any;
}

interface RouterMatchParams {
  organisationId: string;
  campaignId?: string;
}

interface EditCampaignPageState {
  initialValues: any;
  loading: boolean;
  editionMode: boolean;
}

type JoinedProps = EditCampaignPageProps & InjectedIntlProps & RouteComponentProps<RouterMatchParams>;

class EditCampaignPage extends React.Component<JoinedProps, EditCampaignPageState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      initialValues: {
        name: '',
      },
      loading: true,
      editionMode: ((props.location.state && props.location.state.campaignId) || !props.match.params.campaignId) ? false : true,
    };
  }

  componentDidMount() {
    const {
      campaignId,
      organisationId,
    } = this.props.match.params;

    const stateCampaignId = this.props.location.state && this.props.location.state.campaignId;

    if (campaignId) {
      this.fetchAll(campaignId, organisationId);
    } else if (stateCampaignId) {
      this.fetchAll(stateCampaignId, organisationId, true);
    } else {
      this.setState({
        initialValues: {
          model_version: 'V2017_09',
          max_budget_period: 'DAY',
          adGroupsTable: [],
          name: '',
        },
        loading: false,
      });
    }

  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      campaignId,
      organisationId,
    } = this.props.match.params;
    const { campaignId: nextCampaignId, organisationId: nextOrganisationId } = nextProps.match.params;

    const { campaignId: stateCampaignId } =  this.props.location.state;
    const { campaignId: nextStateCampaignId } =  nextProps.location.state;
    if (campaignId !== nextCampaignId || organisationId !== nextOrganisationId || stateCampaignId !== nextStateCampaignId) {
      const cId = nextCampaignId ? nextCampaignId : nextStateCampaignId;
      const duplication = nextCampaignId ? false : true;
      this.fetchAll(cId, nextOrganisationId, duplication);
    }
  }

  fetchAll = (campaignId: string, organisationId: string, duplication?: boolean) => {
    Promise.all([
      this.fetchCampaignInfo(campaignId),
      this.fetchGoalsSelection(campaignId),
      this.fetchAdGroups(campaignId, organisationId, duplication),
    ])
    .then((results) => {
      let campaignInfo: any = results[0];
      let goalTable = results[1];
      let adGroupTable = results[2];
      if (duplication) {

        campaignInfo = {
          model_version: campaignInfo.model_version,
          max_budget_period: campaignInfo.max_budget_period,
          name: campaignInfo.name,
          total_impression_capping: campaignInfo.total_impression_capping,
          per_day_impression_capping: campaignInfo.per_day_impression_capping,
          total_budget: campaignInfo.total_budget,
          max_budget_per_period: campaignInfo.max_budget_per_period,
        };

        goalTable = goalTable.map((goalSelection: any) => {
          return {
            id: goalSelection.goal_id,
            name: goalSelection.goal_name,
          };
        });

        adGroupTable = adGroupTable.map((adGroup: any) => {
          return {
            ...adGroup,
            id: generateFakeId(),
            toBeCreated: true,
            optimizerTable: adGroup.optimizerTable.map((item: any) => {
              return {
                ...item,
                modelId: generateFakeId(),
                toBeRemoved: false,
              };
            }),
          };
        });
      }
      this.setState({
        initialValues: { ...campaignInfo, goalsTable: goalTable, adGroupsTable: adGroupTable },
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

  fetchAdGroups = (campaignId: string, organisationId: string, duplication: boolean = false) => {
    return AdGroupWrapper.getAdGroups(organisationId, campaignId, duplication)
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
        name: initialValues.name ? initialValues.name : formatMessage(messages.createCampaingTitle),
      },
    ];

    return (
      <CampaignContent
        closeNextDrawer={closeNextDrawer}
        openNextDrawer={openNextDrawer}
        initialValues={this.state.initialValues}
        loading={this.state.loading}
        breadcrumbPaths={breadcrumbPaths}
        editionMode={this.state.editionMode}
      />
    );
  }
}

export default compose(
  withRouter,
  withDrawer,
  injectIntl,
  connect(
    undefined,
    { notifyError: NotificationActions.notifyError },
  ),
)(EditCampaignPage);
