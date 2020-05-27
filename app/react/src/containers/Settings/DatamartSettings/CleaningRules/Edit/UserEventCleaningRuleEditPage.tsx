import * as React from 'react';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  injectDatamart,
  InjectedDatamartProps,
  DatamartSelector,
} from '../../../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import {
  UserEventCleaningRuleFormData,
  EditUserEventCleaningRuleRouteMatchParam,
  INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA,
} from './domain';
import { Loading } from '../../../../../components';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import messages from './messages';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { message } from 'antd';
import UserEventCleaningRuleEditForm, {
  FORM_ID,
} from './UserEventCleaningRuleEditForm';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartService } from '../../../../../services/DatamartService';
import {
  isUserEventCleaningRuleResource,
  UserEventCleaningRuleResource,
  UserEventContentFilterResource,
} from '../../../../../models/cleaningRules/CleaningRules';
import { IChannelService } from '../../../../../services/ChannelService';
import { ChannelResource } from '../../../../../models/settings/settings';
import { OptionProps } from 'antd/lib/select';
import moment from 'moment';
import { DataResponse } from '../../../../../services/ApiService';

interface RuleAndOptionalFilter {
  rule: UserEventCleaningRuleResource;
  filter?: UserEventContentFilterResource;
}

interface State {
  userEventCleaningRuleData: UserEventCleaningRuleFormData;
  loading: boolean;
  selectedDatamartId?: string;
  channelOptions: OptionProps[];
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditUserEventCleaningRuleRouteMatchParam> &
  MapStateToProps &
  InjectedDatamartProps;

class UserEventCleaningRuleEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      userEventCleaningRuleData: INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA,
      selectedDatamartId: props.match.params.datamartId,
      channelOptions: [],
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, cleaningRuleId },
      },
    } = this.props;

    if (datamartId && cleaningRuleId) {
      this.fetchRuleAndOptions(datamartId, cleaningRuleId);
    } else {
      this.setState({ loading: false });
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { datamartId, cleaningRuleId },
      },
    } = this.props;

    const {
      match: {
        params: {
          datamartId: previousDatamartId,
          cleaningRuleId: previousCleaningRuleId,
        },
      },
    } = previousProps;

    if (
      (datamartId !== previousDatamartId ||
        cleaningRuleId !== previousCleaningRuleId) &&
      datamartId &&
      cleaningRuleId
    ) {
      this.fetchRuleAndOptions(datamartId, cleaningRuleId);
    }
  }

  fetchRuleAndOptions = (datamartId: string, cleaningRuleId: string) => {
    const { notifyError } = this.props;

    this.setState({ loading: true }, () => {
      const rulesWithFilterP = this.fetchRuleWithFilter(
        datamartId,
        cleaningRuleId,
      );

      const channelOptionsP = this.fetchDatamartChannels(datamartId);

      Promise.all([rulesWithFilterP, channelOptionsP])
        .then(this.saveFetchedDataInState)
        .catch(err => {
          notifyError(err);
          this.setState({ loading: false });
        });
    });
  };

  fetchRuleWithFilter = (
    datamartId: string,
    cleaningRuleId: string,
  ): Promise<RuleAndOptionalFilter> => {
    const cleaningRuleP = this._datamartService
      .getCleaningRule(datamartId, cleaningRuleId, 'USER_EVENT_CLEANING_RULE')
      .then(resultCleaningRule => resultCleaningRule.data);
    const contentFilterP = this._datamartService
      .getContentFilter(datamartId, cleaningRuleId)
      .then(resultContentType => resultContentType.data)
      .catch(err => Promise.resolve(undefined));

    return Promise.all([cleaningRuleP, contentFilterP]).then(
      cleaningRuleAndContentFilter => {
        const cleaningRule = cleaningRuleAndContentFilter[0];
        const contentFilter = cleaningRuleAndContentFilter[1];

        if (cleaningRule && isUserEventCleaningRuleResource(cleaningRule)) {
          const ruleAndPartialFilter: RuleAndOptionalFilter = {
            rule: cleaningRule,
            filter: contentFilter || undefined,
          };

          return Promise.resolve(ruleAndPartialFilter);
        }
        return Promise.reject(undefined);
      },
    );
  };

  getPeriodNumberAndUnit = (lifeDuration: string) => {
    const period = moment.duration(lifeDuration);
    return {
      periodNumber: period.asDays(),
      periodUnit: 'D',
    };
  };

  saveFetchedDataInState = (
    ruleAndChannels: [RuleAndOptionalFilter, ChannelResource[]],
  ) => {
    const ruleAndPartialFilter = ruleAndChannels[0];
    const channels = ruleAndChannels[1];
    const { rule, filter } = ruleAndPartialFilter;

    const channelOptions = channels.map(channel => ({
      value: channel.id,
      title: `${channel.id} - ${channel.name}`,
    }));

    const period = rule.life_duration
      ? this.getPeriodNumberAndUnit(rule.life_duration)
      : {
          periodNumber: 1,
          periodUnit: 'D',
        };

    const actionAndPeriod = {
      selectedValue: rule.action,
      ...period,
    };

    const eventNameFilter =
      filter && filter.content_type === 'EVENT_NAME_FILTER'
        ? filter.filter
        : undefined;

    this.setState({
      userEventCleaningRuleData: {
        ...INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA,
        userEventCleaningRule: rule,
        userEventContentFilter: filter,
        eventNameFilter: eventNameFilter,
        channelFilter: rule.channel_filter,
        activityTypeFilter: rule.activity_type_filter,
        actionAndPeriod,
      },
      loading: false,
      channelOptions: channelOptions,
    });
  };

  fetchDatamartChannels = (
    datamartId: string,
  ): Promise<ChannelResource[]> => {
    const { organisationId } = this.props.match.params
    return this._channelService
      .getChannels(organisationId, datamartId, {
        datamart_id: datamartId,
        with_source_datamarts: false,
      })
      .then(resChannels => resChannels.data);
  };

  onSubmitFail = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    message.error(formatMessage(messages.errorFormMessage));
  };

  getDatamartId = () => {
    const {
      match: {
        params: { cleaningRuleId },
      },
    } = this.props;

    const { userEventCleaningRuleData, selectedDatamartId } = this.state;

    const datamartId: string | undefined =
      cleaningRuleId && userEventCleaningRuleData.userEventCleaningRule
        ? userEventCleaningRuleData.userEventCleaningRule.datamart_id
        : selectedDatamartId;

    return datamartId;
  };

  goToDatamartSelector = () => {
    const {
      match: {
        params: { cleaningRuleId },
      },
    } = this.props;

    if (!cleaningRuleId) {
      this.setState({
        selectedDatamartId: undefined,
      });
    }
  };

  getContentFilterPromise = (
    datamartId: string,
    cleaningRuleId: string,
    previousContentFilter: UserEventContentFilterResource | undefined,
    nextEventNameFilter: string | undefined,
  ): Promise<DataResponse<UserEventContentFilterResource | {}> | undefined> => {
    if (previousContentFilter) {
      if (!nextEventNameFilter || nextEventNameFilter === '') {
        return this._datamartService.deleteContentFilter(
          datamartId,
          cleaningRuleId,
        );
      } else {
        return this._datamartService.updateContentFilter(
          datamartId,
          cleaningRuleId,
          { content_type: 'EVENT_NAME_FILTER', filter: nextEventNameFilter },
        );
      }
    } else {
      if (!nextEventNameFilter || nextEventNameFilter === '') {
        return Promise.resolve(undefined);
      } else {
        return this._datamartService.createContentFilter(
          datamartId,
          cleaningRuleId,
          { content_type: 'EVENT_NAME_FILTER', filter: nextEventNameFilter },
        );
      }
    }
  };

  checkUserEventCleaningRuleAndSave = (
    userEventCleaningRuleData: UserEventCleaningRuleFormData,
  ) => {
    const {
      match: {
        params: { cleaningRuleId },
      },
      notifyError,
    } = this.props;

    const { selectedDatamartId } = this.state;

    this.setState({loading : true})

    if (cleaningRuleId && userEventCleaningRuleData.userEventCleaningRule) {
      // Update cleaning rule

      const datamartId =
        userEventCleaningRuleData.userEventCleaningRule.datamart_id;

      const userEventCleaningRule: UserEventCleaningRuleResource = {
        ...userEventCleaningRuleData.userEventCleaningRule,
        action: userEventCleaningRuleData.actionAndPeriod.selectedValue,
        channel_filter: userEventCleaningRuleData.channelFilter,
        activity_type_filter: userEventCleaningRuleData.activityTypeFilter,
        life_duration: `P${userEventCleaningRuleData.actionAndPeriod.periodNumber}${userEventCleaningRuleData.actionAndPeriod.periodUnit}`,
      };

      const updateCleaningRuleP = this._datamartService.updateCleaningRule(
        datamartId,
        cleaningRuleId,
        userEventCleaningRule,
      );

      const previousContentFilter =
        userEventCleaningRuleData.userEventContentFilter;

      const nextEventNameFilter = userEventCleaningRuleData.eventNameFilter;

      const contentFilterP = this.getContentFilterPromise(
        datamartId,
        cleaningRuleId,
        previousContentFilter,
        nextEventNameFilter,
      );

      Promise.all([updateCleaningRuleP, contentFilterP])
        .then(_ => {
          this.setState({loading : false})
          this.onClose();
        })
        .catch(err => {
          this.setState({loading : false})
          notifyError(err);
          this.onClose();
        });
    }
    if (!cleaningRuleId && selectedDatamartId) {
      // Create cleaning rule

      const userEventCleaningRule: Partial<UserEventCleaningRuleResource> = {
        type: 'USER_EVENT_CLEANING_RULE',
        datamart_id: selectedDatamartId,
        action: userEventCleaningRuleData.actionAndPeriod.selectedValue,
        status: 'DRAFT',
        archived: false,
        channel_filter: userEventCleaningRuleData.channelFilter,
        activity_type_filter: userEventCleaningRuleData.activityTypeFilter,
        life_duration: `P${userEventCleaningRuleData.actionAndPeriod.periodNumber}${userEventCleaningRuleData.actionAndPeriod.periodUnit}`,
      };

      this._datamartService
        .createCleaningRule(selectedDatamartId, userEventCleaningRule)
        .then(resCleaningRule => {
          const newCleaningRuleId = resCleaningRule.data.id;
          const eventNameFilter = userEventCleaningRuleData.eventNameFilter;

          const eventNameFilterP: Promise<
            DataResponse<UserEventContentFilterResource> | undefined
          > =
            eventNameFilter && eventNameFilter !== ''
              ? this._datamartService.createContentFilter(
                  selectedDatamartId,
                  newCleaningRuleId,
                  {
                    content_type: 'EVENT_NAME_FILTER',
                    filter: eventNameFilter,
                  },
                )
              : Promise.resolve(undefined);

          return eventNameFilterP.then(_ => {
            this.onClose();
            this.setState({loading : false})
          });
        })
        .catch(err => {
          this.setState({loading : false})
          notifyError(err);
          this.onClose();
        });
    }
    
  };

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { selectedDatamartId  }= this.state;

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/cleaning_rules?datamartId=${selectedDatamartId}`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    const { notifyError } = this.props;

    this.setState({ loading: true }, () => {
      this.fetchDatamartChannels(datamart.id)
        .then(datamartChannels => {
          const channelOptions = datamartChannels.map(channel => ({
            value: channel.id,
            title: `${channel.id} - ${channel.name}`,
          }));

          this.setState({
            loading: false,
            selectedDatamartId: datamart.id,
            userEventCleaningRuleData: {
              ...INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA,
            },
            channelOptions,
          });
        })
        .catch(err => {
          notifyError(err);

          this.setState({
            loading: false,
            selectedDatamartId: datamart.id,
            userEventCleaningRuleData: {
              ...INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA,
            },
            channelOptions: [],
          });
        });
    });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { loading, userEventCleaningRuleData, channelOptions } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle,
        path: `/v2/o/${organisationId}/settings/datamart/cleaning_rules`,
      },
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadcrumbPaths,
      onClose: this.onClose,
    };

    const datamartId = this.getDatamartId();

    return datamartId ? (
      <UserEventCleaningRuleEditForm
        initialValues={userEventCleaningRuleData}
        onSubmit={this.checkUserEventCleaningRuleAndSave}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
        goToDatamartSelector={this.goToDatamartSelector}
        datamartId={datamartId}
        channelOptions={channelOptions}
      />
    ) : (
      <DatamartSelector
        onSelect={this.onDatamartSelect}
        actionbarProps={actionBarProps}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(mapStateToProps),
  injectNotifications,
)(UserEventCleaningRuleEditPage);
