import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  InjectedDatamartProps,
  injectDatamart,
  DatamartSelector,
} from '../../../../Datamart';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { OptionProps } from 'antd/lib/select';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Loading } from '../../../../../components';
import messages from './messages';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import {
  EditCleaningRuleRouteMatchParam,
  CleaningRuleFormData,
  INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA,
  INITIAL_USER_PROFILE_CLEANING_RULE_FORM_DATA,
  isUserEventCleaningRuleFormData,
  UserEventCleaningRuleFormData,
  UserProfileCleaningRuleFormData,
  UserEventCleaningRuleAndOptionalFilter,
} from './domain';
import {
  CleaningRuleType,
  UserEventCleaningRuleResource,
  UserEventContentFilterResource,
  UserProfileCleaningRuleResource,
  isUserEventCleaningRuleResource,
  isUserProfileCleaningRuleResource,
  ExtendedCleaningRuleResource,
} from '../../../../../models/cleaningRules/CleaningRules';
import {
  DatamartResource,
  UserAccountCompartmentDatamartSelectionResource,
} from '../../../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IChannelService } from '../../../../../services/ChannelService';
import { IDatamartService } from '../../../../../services/DatamartService';
import {
  DataListResponse,
  DataResponse,
} from '../../../../../services/ApiService';
import { ChannelResource } from '../../../../../models/settings/settings';
import { message } from 'antd';
import moment from 'moment';
import CleaningRuleEditForm, { FORM_ID } from './CleaningRuleEditForm';

interface State {
  cleaningRuleFormData: CleaningRuleFormData;
  loading: boolean;
  selectedDatamartId?: string;
  channelOptions?: OptionProps[];
  compartmentOptions?: OptionProps[];
  cleaningRuleType: CleaningRuleType;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditCleaningRuleRouteMatchParam> &
  MapStateToProps &
  InjectedDatamartProps;

class CleaningRuleEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  constructor(props: Props) {
    super(props);

    const {
      location: { pathname },
    } = props;

    const cleaningRuleType = pathname.includes('user_event')
      ? 'USER_EVENT_CLEANING_RULE'
      : 'USER_PROFILE_CLEANING_RULE';

    const cleaningRuleData =
      cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
        ? INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA
        : INITIAL_USER_PROFILE_CLEANING_RULE_FORM_DATA;

    this.state = {
      loading: true,
      cleaningRuleFormData: cleaningRuleData,
      selectedDatamartId: props.match.params.datamartId,
      cleaningRuleType: cleaningRuleType,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, cleaningRuleId },
      },
    } = this.props;

    const { cleaningRuleType } = this.state;

    if (datamartId && cleaningRuleId) {
      this.fetchCleaningRuleData(datamartId, cleaningRuleId, cleaningRuleType);
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
      const { cleaningRuleType } = this.state;

      this.fetchCleaningRuleData(datamartId, cleaningRuleId, cleaningRuleType);
    }
  }

  fetchCleaningRuleData = (
    datamartId: string,
    cleaningRuleId: string,
    cleaningRuleType: CleaningRuleType,
  ) => {
    const { notifyError } = this.props;

    this.setState({ loading: true }, () => {
      const ruleWithFilterOptP = this.fetchRuleWithFilterOpt(
        datamartId,
        cleaningRuleId,
        cleaningRuleType,
      );

      const optionsP = this.fetchOptions(datamartId, cleaningRuleType);

      Promise.all([ruleWithFilterOptP, optionsP])
        .then(this.saveFetchedDataInState(cleaningRuleType))
        .catch(err => {
          notifyError(err);
          this.setState({ loading: false });
        });
    });
  };

  fetchRuleWithFilterOpt = (
    datamartId: string,
    cleaningRuleId: string,
    cleaningRuleType: CleaningRuleType,
  ): Promise<
    UserEventCleaningRuleAndOptionalFilter | UserProfileCleaningRuleResource
  > => {
    const cleaningRuleP: Promise<ExtendedCleaningRuleResource> = this._datamartService
      .getCleaningRule(datamartId, cleaningRuleId, cleaningRuleType)
      .then(resultCleaningRule => resultCleaningRule.data);
    const contentFilterP: Promise<UserEventContentFilterResource | undefined> =
      cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
        ? this._datamartService
            .getContentFilter(datamartId, cleaningRuleId)
            .then(resultContentFilter => resultContentFilter.data)
            .catch(err => Promise.resolve(undefined))
        : Promise.resolve(undefined);

    return Promise.all([cleaningRuleP, contentFilterP]).then(
      cleaningRuleAndContentFilter => {
        const cleaningRule = cleaningRuleAndContentFilter[0];
        const contentFilter = cleaningRuleAndContentFilter[1];

        if (cleaningRule) {
          if (isUserEventCleaningRuleResource(cleaningRule)) {
            const ruleAndPartialFilter: UserEventCleaningRuleAndOptionalFilter = {
              rule: cleaningRule,
              filter: contentFilter || undefined,
            };

            return Promise.resolve<
              | UserEventCleaningRuleAndOptionalFilter
              | UserProfileCleaningRuleResource
            >(ruleAndPartialFilter);
          } else {
            // User Profile cleaning rule
            return Promise.resolve<
              | UserEventCleaningRuleAndOptionalFilter
              | UserProfileCleaningRuleResource
            >(cleaningRule);
          }
        }
        return Promise.reject(undefined);
      },
    );
  };

  fetchOptions = (
    datamartId: string,
    cleaningRuleType: CleaningRuleType,
  ): Promise<OptionProps[]> => {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const isUserAccountCompartmentDatamartSelectionResource = (
      optionData:
        | ChannelResource
        | UserAccountCompartmentDatamartSelectionResource,
    ): optionData is UserAccountCompartmentDatamartSelectionResource => {
      return (
        (optionData as UserAccountCompartmentDatamartSelectionResource)
          .compartment_id !== undefined
      );
    };

    const optionsResponseP: Promise<DataListResponse<
      ChannelResource | UserAccountCompartmentDatamartSelectionResource
    >> =
      cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
        ? this._channelService.getChannels(organisationId, datamartId, {
            datamart_id: datamartId,
            with_source_datamarts: false,
          })
        : this._datamartService.getUserAccountCompartmentDatamartSelectionResources(
            datamartId,
          );

    return optionsResponseP
      .then(optionsResponse => optionsResponse.data)
      .then(optionsData => {
        const NoFilterOptionList: OptionProps[] = [
          { value: '', title: formatMessage(messages.noFilter) },
        ];

        return NoFilterOptionList.concat(
          optionsData.map(optionData => {
            const usedId = isUserAccountCompartmentDatamartSelectionResource(
              optionData,
            )
              ? optionData.compartment_id
              : optionData.id;

            const option: OptionProps = {
              value: usedId,
              title: `${usedId} - ${optionData.name}`,
            };

            return option;
          }),
        );
      })
      .catch(err => {
        notifyError(err);
        return [];
      });
  };

  getPeriodNumberAndUnit = (lifeDuration: string) => {
    const period = moment.duration(lifeDuration);
    return {
      periodNumber: period.asDays(),
      periodUnit: 'D',
    };
  };

  saveFetchedDataInState = (cleaningRuleType: CleaningRuleType) => {
    return (
      ruleAndOptions: [
        (
          | UserEventCleaningRuleAndOptionalFilter
          | UserProfileCleaningRuleResource
        ),
        OptionProps[]
      ],
    ) => {
      const isUserEventCleaningRuleAndOptionalFilter = (
        ruleAndOptionalFilter:
          | UserEventCleaningRuleAndOptionalFilter
          | UserProfileCleaningRuleResource,
      ): ruleAndOptionalFilter is UserEventCleaningRuleAndOptionalFilter => {
        return (
          (ruleAndOptionalFilter as UserEventCleaningRuleAndOptionalFilter)
            .rule !== undefined
        );
      };

      const ruleAndFilterOpt = ruleAndOptions[0];
      const options = ruleAndOptions[1];

      const cleaningRule:
        | UserEventCleaningRuleResource
        | UserProfileCleaningRuleResource = isUserEventCleaningRuleAndOptionalFilter(
        ruleAndFilterOpt,
      )
        ? ruleAndFilterOpt.rule
        : ruleAndFilterOpt;

      const period = cleaningRule.life_duration
        ? this.getPeriodNumberAndUnit(cleaningRule.life_duration)
        : {
            periodNumber: 1,
            periodUnit: 'D',
          };

      const actionAndPeriod = {
        selectedValue: cleaningRule.action,
        ...period,
      };

      if (
        isUserEventCleaningRuleResource(cleaningRule) &&
        cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
      ) {
        const filter = isUserEventCleaningRuleAndOptionalFilter(
          ruleAndFilterOpt,
        )
          ? ruleAndFilterOpt.filter
          : undefined;

        const eventNameFilter =
          filter && filter.content_type === 'EVENT_NAME_FILTER'
            ? filter.filter
            : undefined;

        this.setState({
          cleaningRuleFormData: {
            ...INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA,
            userEventCleaningRule: cleaningRule,
            userEventContentFilter: filter,
            eventNameFilter: eventNameFilter,
            channelFilter: cleaningRule.channel_filter,
            activityTypeFilter: cleaningRule.activity_type_filter,
            actionAndPeriod,
          },
          loading: false,
          channelOptions: options,
        });
      }

      if (
        isUserProfileCleaningRuleResource(cleaningRule) &&
        cleaningRuleType === 'USER_PROFILE_CLEANING_RULE'
      ) {
        this.setState({
          cleaningRuleFormData: {
            ...INITIAL_USER_PROFILE_CLEANING_RULE_FORM_DATA,
            userProfileCleaningRule: cleaningRule,
            actionAndPeriod,
          },
          loading: false,
          compartmentOptions: options,
        });
      }
    };
  };

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { selectedDatamartId, cleaningRuleType } = this.state;

    const datamartIdUrl = selectedDatamartId
      ? `&datamartId=${selectedDatamartId}`
      : '';

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/cleaning_rules?type=${cleaningRuleType}${datamartIdUrl}`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    const { notifyError } = this.props;

    const { cleaningRuleType } = this.state;

    const cleaningRuleData =
      cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
        ? INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA
        : INITIAL_USER_PROFILE_CLEANING_RULE_FORM_DATA;

    this.setState({ loading: true }, () => {
      this.fetchOptions(datamart.id, cleaningRuleType)
        .then(options => {
          this.setState({
            loading: false,
            selectedDatamartId: datamart.id,
            cleaningRuleFormData: cleaningRuleData,
            channelOptions:
              cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
                ? options
                : undefined,
            compartmentOptions:
              cleaningRuleType === 'USER_PROFILE_CLEANING_RULE'
                ? options
                : undefined,
          });
        })
        .catch(err => {
          notifyError(err);

          this.setState({
            loading: false,
            selectedDatamartId: datamart.id,
            cleaningRuleFormData: cleaningRuleData,
            channelOptions:
              cleaningRuleType === 'USER_EVENT_CLEANING_RULE' ? [] : undefined,
            compartmentOptions:
              cleaningRuleType === 'USER_PROFILE_CLEANING_RULE'
                ? []
                : undefined,
          });
        });
    });
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

    const { cleaningRuleFormData, selectedDatamartId } = this.state;

    const datamartId: string | undefined = isUserEventCleaningRuleFormData(
      cleaningRuleFormData,
    )
      ? cleaningRuleId && cleaningRuleFormData.userEventCleaningRule
        ? cleaningRuleFormData.userEventCleaningRule.datamart_id
        : selectedDatamartId
      : cleaningRuleId && cleaningRuleFormData.userProfileCleaningRule
      ? cleaningRuleFormData.userProfileCleaningRule.datamart_id
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

  checkCleaningRuleAndSave = (cleaningRuleFormData: CleaningRuleFormData) => {
    const { cleaningRuleType } = this.state;

    if (isUserEventCleaningRuleFormData(cleaningRuleFormData)) {
      if (cleaningRuleType === 'USER_EVENT_CLEANING_RULE') {
        this.checkUserEventCleaningRuleAndSave(cleaningRuleFormData);
      }
    } else {
      if (cleaningRuleType === 'USER_PROFILE_CLEANING_RULE') {
        this.checkUserProfileCleaningRuleAndSave(cleaningRuleFormData);
      }
    }
  };

  checkUserProfileCleaningRuleAndSave = (
    userProfileCleaningRuleFormData: UserProfileCleaningRuleFormData,
  ) => {
    const {
      match: {
        params: { cleaningRuleId },
      },
      notifyError,
    } = this.props;

    const { selectedDatamartId } = this.state;

    this.setState({ loading: true });

    if (
      cleaningRuleId &&
      userProfileCleaningRuleFormData.userProfileCleaningRule
    ) {
      // Update user profile cleaning rule

      const datamartId =
        userProfileCleaningRuleFormData.userProfileCleaningRule.datamart_id;

      const compartmentFilter =
        userProfileCleaningRuleFormData.userProfileCleaningRule
          .compartment_filter !== undefined
          ? userProfileCleaningRuleFormData.userProfileCleaningRule
              .compartment_filter !== ''
            ? userProfileCleaningRuleFormData.userProfileCleaningRule
                .compartment_filter
            : null
          : undefined;

      const userProfileCleaningRule: UserProfileCleaningRuleResource = {
        ...userProfileCleaningRuleFormData.userProfileCleaningRule,
        compartment_filter: compartmentFilter,
        action: userProfileCleaningRuleFormData.actionAndPeriod.selectedValue,
        life_duration: `P${userProfileCleaningRuleFormData.actionAndPeriod.periodNumber}${userProfileCleaningRuleFormData.actionAndPeriod.periodUnit}`,
      };

      this._datamartService
        .updateCleaningRule(datamartId, cleaningRuleId, userProfileCleaningRule)
        .then(_ => {
          this.setState({ loading: false });
          this.onClose();
        })
        .catch(err => {
          this.setState({ loading: false });
          notifyError(err);
          this.onClose();
        });
    }
    if (!cleaningRuleId && selectedDatamartId) {
      // Create user profile cleaning rule

      const compartmentFilter = userProfileCleaningRuleFormData.userProfileCleaningRule
        ? userProfileCleaningRuleFormData.userProfileCleaningRule
            .compartment_filter !== ''
          ? userProfileCleaningRuleFormData.userProfileCleaningRule
              .compartment_filter
          : undefined
        : undefined;

      const userProfileCleaningRule: Partial<UserProfileCleaningRuleResource> = {
        type: 'USER_PROFILE_CLEANING_RULE',
        datamart_id: selectedDatamartId,
        action: userProfileCleaningRuleFormData.actionAndPeriod.selectedValue,
        status: 'DRAFT',
        archived: false,
        compartment_filter: compartmentFilter,
        life_duration: `P${userProfileCleaningRuleFormData.actionAndPeriod.periodNumber}${userProfileCleaningRuleFormData.actionAndPeriod.periodUnit}`,
      };

      this._datamartService
        .createCleaningRule(selectedDatamartId, userProfileCleaningRule)
        .then(_ => {
          this.setState({ loading: false });
          this.onClose();
        })
        .catch(err => {
          this.setState({ loading: false });
          notifyError(err);
          this.onClose();
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
    userEventCleaningRuleFormData: UserEventCleaningRuleFormData,
  ) => {
    const {
      match: {
        params: { cleaningRuleId },
      },
      notifyError,
    } = this.props;

    const { selectedDatamartId } = this.state;

    this.setState({ loading: true });

    if (cleaningRuleId && userEventCleaningRuleFormData.userEventCleaningRule) {
      // Update user event cleaning rule

      const datamartId =
        userEventCleaningRuleFormData.userEventCleaningRule.datamart_id;

      const channelFilter =
        userEventCleaningRuleFormData.channelFilter !== undefined
          ? userEventCleaningRuleFormData.channelFilter !== ''
            ? userEventCleaningRuleFormData.channelFilter
            : null
          : undefined;

      const activityTypeFilter =
        userEventCleaningRuleFormData.activityTypeFilter !== undefined
          ? userEventCleaningRuleFormData.activityTypeFilter !== ''
            ? userEventCleaningRuleFormData.activityTypeFilter
            : null
          : undefined;

      const userEventCleaningRule: UserEventCleaningRuleResource = {
        ...userEventCleaningRuleFormData.userEventCleaningRule,
        action: userEventCleaningRuleFormData.actionAndPeriod.selectedValue,
        channel_filter: channelFilter,
        activity_type_filter: activityTypeFilter,
        life_duration: `P${userEventCleaningRuleFormData.actionAndPeriod.periodNumber}${userEventCleaningRuleFormData.actionAndPeriod.periodUnit}`,
      };

      this._datamartService.updateCleaningRule(datamartId, cleaningRuleId, userEventCleaningRule)
      .then(_ => {
        const previousContentFilter = userEventCleaningRuleFormData.userEventContentFilter;
        const nextEventNameFilter = userEventCleaningRuleFormData.eventNameFilter;

        this.getContentFilterPromise(
          datamartId,
          cleaningRuleId,
          previousContentFilter,
          nextEventNameFilter
        ).then(resContentFilter => {
          this.setState({loading: false});
          this.onClose();
        })
      })
      .catch(err => {
        this.setState({loading: false});
        notifyError(err);
        this.onClose();
      });
    }
    if (!cleaningRuleId && selectedDatamartId) {
      // Create cleaning rule

      const activityTypeFilter =
        userEventCleaningRuleFormData.activityTypeFilter !== undefined
          ? userEventCleaningRuleFormData.activityTypeFilter !== ''
            ? userEventCleaningRuleFormData.activityTypeFilter
            : undefined
          : undefined;

      const channelFilter =
        userEventCleaningRuleFormData.channelFilter !== undefined
          ? userEventCleaningRuleFormData.channelFilter !== ''
            ? userEventCleaningRuleFormData.channelFilter
            : undefined
          : undefined;

      const userEventCleaningRule: Partial<UserEventCleaningRuleResource> = {
        type: 'USER_EVENT_CLEANING_RULE',
        datamart_id: selectedDatamartId,
        action: userEventCleaningRuleFormData.actionAndPeriod.selectedValue,
        status: 'DRAFT',
        archived: false,
        channel_filter: channelFilter,
        activity_type_filter: activityTypeFilter,
        life_duration: `P${userEventCleaningRuleFormData.actionAndPeriod.periodNumber}${userEventCleaningRuleFormData.actionAndPeriod.periodUnit}`,
      };

      this._datamartService
        .createCleaningRule(selectedDatamartId, userEventCleaningRule)
        .then(resCleaningRule => {
          const newCleaningRuleId = resCleaningRule.data.id;
          const eventNameFilter = userEventCleaningRuleFormData.eventNameFilter;

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
            this.setState({ loading: false });
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          notifyError(err);
          this.onClose();
        });
    }
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      loading,
      cleaningRuleFormData,
      channelOptions,
      compartmentOptions,
      cleaningRuleType,
    } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const breadcrumbPaths =
      cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
        ? [
            {
              name: messages.userEventBreadcrumbTitle,
              path: `/v2/o/${organisationId}/settings/datamart/cleaning_rules`,
            },
          ]
        : [
            {
              name: messages.userProfileBreadcrumbTitle,
              path: `/v2/o/${organisationId}/settings/datamart/cleaning_rules?type=USER_PROFILE_CLEANING_RULE`,
            },
          ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadcrumbPaths,
      onClose: this.onClose,
    };

    const options =
      cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
        ? channelOptions
        : compartmentOptions;

    const datamartId = this.getDatamartId();

    return datamartId ? (
      <CleaningRuleEditForm
        initialValues={cleaningRuleFormData}
        onSubmit={this.checkCleaningRuleAndSave}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
        goToDatamartSelector={this.goToDatamartSelector}
        datamartId={datamartId}
        options={options || []}
        cleaningRuleType={cleaningRuleType}
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
)(CleaningRuleEditPage);
