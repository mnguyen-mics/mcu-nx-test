import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import moment from 'moment';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import {
  EditAudienceSegmentParam,
  AudienceSegmentFormData,
  DefaultLiftimeUnit,
} from './domain';
import { INITIAL_AUDIENCE_SEGMENT_FORM_DATA } from '../Edit/domain';
import {
  AudienceSegmentShape,
  UserListSegment,
} from '../../../../models/audiencesegment';
import messages from './messages';

import EditAudienceSegmentForm from './EditAudienceSegmentForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

import {
  QueryLanguage,
  DatamartResource,
} from '../../../../models/datamart/DatamartResource';
import {
  UserQuerySegment,
  AudienceSegmentType,
} from '../../../../models/audiencesegment/AudienceSegmentResource';
import { Loading } from '../../../../components';
import DatamartSelector from './../../Common/DatamartSelector';
import { EditContentLayout } from '../../../../components/Layout';
import SegmentTypeSelector from '../../Common/SegmentTypeSelector';
import { getWorkspace } from '../../../../state/Session/selectors';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import DatamartService from '../../../../services/DatamartService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAudienceSegmentFormService } from './AudienceSegmentFormService';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import { hasFeature } from '../../../../state/Features/selectors';

const messagesMap = defineMessages({
  breadcrumbEditAudienceSegment: {
    id: 'audience.segment.form.breadcrumb.edit',
    defaultMessage: 'Edit {name}',
  },
  breadcrumbAudienceSegmentList: {
    id: 'audience.segment.form.breadcrumb.list',
    defaultMessage: 'Segments',
  },
  noQueryText: {
    id: 'audience.segment.form.save.error.noQUeryText',
    defaultMessage: 'You must edit a query in order to save the segment.',
  },
});

interface State {
  audienceSegmentFormData: AudienceSegmentFormData;
  queryLanguage?: QueryLanguage;
  queryContainer?: any;
  loading: boolean;
  selectedDatamart?: DatamartResource;
  displayDatamartSelector: boolean;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  MapStateToProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class EditAudienceSegmentPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentFormService)
  private _audienceSegmentFormService: IAudienceSegmentFormService;
  constructor(props: Props) {
    super(props);

    this.state = {
      audienceSegmentFormData: INITIAL_AUDIENCE_SEGMENT_FORM_DATA,
      loading: true,
      displayDatamartSelector: true,
    };
  }

  countDefaultLifetime = (
    audienceSegment: AudienceSegmentShape,
  ): {
    defaultLiftime?: number;
    defaultLiftimeUnit?: DefaultLiftimeUnit;
  } => {
    let lifetime = moment
      .duration(audienceSegment.default_ttl, 'milliseconds')
      .asMonths();
    if (Number.isInteger(lifetime) && lifetime > 0) {
      return {
        defaultLiftime: lifetime,
        defaultLiftimeUnit: 'months',
      };
    } else {
      lifetime = moment
        .duration(audienceSegment.default_ttl, 'milliseconds')
        .asWeeks();
      if (Number.isInteger(lifetime) && lifetime > 0) {
        return {
          defaultLiftime: lifetime,
          defaultLiftimeUnit: 'weeks',
        };
      } else {
        lifetime = moment
          .duration(audienceSegment.default_ttl, 'milliseconds')
          .asDays();
        return {
          defaultLiftime: lifetime,
          defaultLiftimeUnit: 'days',
        };
      }
    }
  };

  initialLoading = (props: Props) => {
    const {
      match: {
        params: { organisationId, segmentId },
      },
      workspace,
    } = props;
    const QueryContainer = (window as any).angular
      .element(document.body)
      .injector()
      .get('core/datamart/queries/QueryContainer');
    if (segmentId) {
      this._audienceSegmentFormService
        .loadSegmentInitialValue(segmentId)
        .then(initialData => {
          DatamartService.getDatamart(initialData.audienceSegment.datamart_id!)
            .then(datamartData => datamartData.data)
            .then(datamartResource => {
              const newState: Partial<State> = {
                audienceSegmentFormData: initialData,
                selectedDatamart: datamartResource,
                loading: false,
              };
              if (initialData.query) {
                newState.queryLanguage = initialData.query.query_language;
                if (initialData.query.query_language === 'SELECTORQL') {
                  const defQuery = new QueryContainer(
                    initialData.audienceSegment.datamart_id,
                    initialData.query.id,
                  );
                  defQuery.load();
                  newState.queryContainer = defQuery;
                }
              }
              this.setState(newState as State);
            });
        })
        .catch(err => {
          props.notifyError(err);
          this.setState({ loading: false });
        });
    } else {
      const datamarts = workspace(organisationId).datamarts;
      const multipleDatamarts = datamarts.length > 1;
      const defQuery = new QueryContainer(datamarts[0].id);
      defQuery.load();
      this.setState({
        loading: false,
        displayDatamartSelector: multipleDatamarts,
        selectedDatamart: multipleDatamarts
          ? undefined
          : workspace(organisationId).datamarts[0],
        queryContainer: defQuery,
      });
    }
  };

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { segmentId },
      },
    } = this.props;
    const {
      match: {
        params: { segmentId: nextSegmentId },
      },
    } = nextProps;
    if (segmentId === undefined && nextSegmentId) {
      this.initialLoading(nextProps);
    }
  }

  componentDidMount() {
    this.initialLoading(this.props);
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  onClose = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
      location,
    } = this.props;
    const defaultRedirectUrl = `/v2/o/${organisationId}/audience/segments`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  save = (audienceSegmentFormData: AudienceSegmentFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
      history,
      intl,
    } = this.props;

    const { selectedDatamart, queryContainer, queryLanguage } = this.state;

    const countTTL = (formData: AudienceSegmentFormData) => {
      if (formData.defaultLiftimeUnit && formData.defaultLiftime) {
        return moment
          .duration(
            Number(formData.defaultLiftime),
            formData.defaultLiftimeUnit,
          )
          .asMilliseconds();
      }
      return undefined;
    };

    if (
      !audienceSegmentFormData.query &&
      audienceSegmentFormData.audienceSegment.type === 'USER_QUERY'
    ) {
      message.error(intl.formatMessage(messagesMap.noQueryText));
    } else {
      this.setState({ loading: true });

      const datamartId = selectedDatamart
        ? selectedDatamart.id
        : audienceSegmentFormData.audienceSegment.datamart_id;

      const audienceSegment = {
        ...audienceSegmentFormData.audienceSegment,
        default_ttl: countTTL(audienceSegmentFormData),
        datamart_id: datamartId,
        organisation_id: organisationId,
      };
      audienceSegmentFormData = {
        ...audienceSegmentFormData,
        audienceSegment: audienceSegment,
      };

      const hideSaveInProgress = message.loading(
        intl.formatMessage(messages.savingInProgress),
        0,
      );

      this._audienceSegmentFormService
        .saveOrCreateAudienceSegment(
          organisationId,
          audienceSegmentFormData,
          queryLanguage,
          queryContainer,
        )
        .then(response => {
          hideSaveInProgress();
          if (!!response) {
            let redirect = '';
            if (
              response.data.type === 'USER_LIST' &&
              !audienceSegmentFormData.audienceSegment.id &&
              (audienceSegmentFormData.audienceSegment as UserListSegment)
                .subtype === 'USER_PIXEL'
            ) {
              redirect = `/v2/o/${organisationId}/audience/segments/${response.data.id}/edit`;
            } else {
              redirect = `/v2/o/${organisationId}/audience/segments/${response.data.id}`;
            }

            history.push(redirect);
          }
        })
        .catch(err => {
          hideSaveInProgress();
          this.setState({ loading: false });
          notifyError(err);
        });
    }
  };

  redirectToSegmentList = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    return history.push(`/v2/o/${organisationId}/audience/segments`);
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    const QueryContainer = (window as any).angular
      .element(document.body)
      .injector()
      .get('core/datamart/queries/QueryContainer');
    const defQuery = new QueryContainer(datamart.id);
    this.setState({
      selectedDatamart: datamart,
      queryContainer: defQuery,
      queryLanguage:
        datamart.storage_model_version === 'v201506'
          ? 'SELECTORQL'
          : ('OTQL' as QueryLanguage),
      displayDatamartSelector: false,
    });
  };

  onSegmentTypeSelect = (
    segmentType: AudienceSegmentType,
    queryLang: QueryLanguage = 'OTQL',
  ) => {
    const queryLanguage: QueryLanguage =
      this.state.selectedDatamart &&
      this.state.selectedDatamart.storage_model_version === 'v201506'
        ? 'SELECTORQL'
        : queryLang;
    if (segmentType === 'USER_PIXEL') {
      this.setState({
        audienceSegmentFormData: {
          ...this.state.audienceSegmentFormData,
          audienceSegment: {
            ...(this.state.audienceSegmentFormData
              .audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'TAG',
            subtype: 'USER_PIXEL',
          },
        },
      });
    } else if (segmentType === 'USER_LIST') {
      this.setState({
        audienceSegmentFormData: {
          ...this.state.audienceSegmentFormData,
          audienceSegment: {
            ...(this.state.audienceSegmentFormData
              .audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'FILE_IMPORT',
            subtype: 'STANDARD',
          },
        },
      });
    } else if (segmentType === 'USER_QUERY') {
      this.setState({
        queryLanguage: queryLanguage,
        audienceSegmentFormData: {
          ...this.state.audienceSegmentFormData,
          audienceSegment: {
            ...(this.state.audienceSegmentFormData
              .audienceSegment as UserQuerySegment),
            type: 'USER_QUERY',
          },
        },
      });
    } else if (segmentType === 'USER_CLIENT') {
      this.setState({
        queryLanguage: 'JSON_OTQL',
        audienceSegmentFormData: {
          ...this.state.audienceSegmentFormData,
          audienceSegment: {
            ...(this.state.audienceSegmentFormData
              .audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'TAG',
            subtype: 'USER_CLIENT',
          },
        },
      });
    }
  };

  getSegmentTypesToDisplay = () => {
    const { selectedDatamart } = this.state;
    const segmentTypesToDisplay: Array<{
      title: string;
      value: AudienceSegmentType;
    }> = [];
    if (
      selectedDatamart &&
      selectedDatamart.storage_model_version === 'v201709'
    ) {
      segmentTypesToDisplay.push(
        {
          title: 'User Pixel',
          value: 'USER_PIXEL',
        },
        {
          title: 'User Expert Query',
          value: 'USER_QUERY',
        },
      );
    }
    if (hasFeature('audience.user_client_segment')) {
      segmentTypesToDisplay.push({
        title: 'Edge',
        value: 'USER_CLIENT',
      });
    }
    return segmentTypesToDisplay;
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, segmentId },
      },
    } = this.props;

    const {
      audienceSegmentFormData,
      selectedDatamart,
      loading,
      displayDatamartSelector,
      queryLanguage,
    } = this.state;

    const audienceSegmentName =
      audienceSegmentFormData.audienceSegment &&
      audienceSegmentFormData.audienceSegment.name
        ? formatMessage(messagesMap.breadcrumbEditAudienceSegment, {
            name: audienceSegmentFormData.audienceSegment.name,
          })
        : formatMessage(messages.audienceSegmentBreadCrumb);

    const breadcrumbPaths = [
      {
        name: messagesMap.breadcrumbAudienceSegmentList,
        path: `/v2/o/${organisationId}/audience/segments`,
      },
      {
        name: audienceSegmentName,
      },
    ];

    let resetFormData;
    if (!segmentId) {
      resetFormData = () => {
        this.setState({
          audienceSegmentFormData: {
            audienceSegment: {},
          },
        });
      };
    }

    const actionbarProps = {
      onClose: this.redirectToSegmentList,
      formId: 'audienceSegmentForm',
    };

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    let selectedSegmentType: AudienceSegmentType | undefined;
    if (audienceSegmentFormData.audienceSegment) {
      selectedSegmentType =
        audienceSegmentFormData.audienceSegment.type === 'USER_LIST' &&
        audienceSegmentFormData.audienceSegment.feed_type === 'TAG'
          ? queryLanguage === 'JSON_OTQL'
            ? 'USER_LIST'
            : 'USER_PIXEL'
          : audienceSegmentFormData.audienceSegment.type;
    }

    const getQueryLanguageToDisplay =
      this.state.audienceSegmentFormData.query &&
      this.state.audienceSegmentFormData.query.query_language
        ? this.state.audienceSegmentFormData.query.query_language
        : this.state.queryLanguage;
    return segmentId || (selectedSegmentType && selectedDatamart) ? (
      <EditAudienceSegmentForm
        initialValues={this.state.audienceSegmentFormData}
        close={this.onClose}
        onSubmit={this.save}
        breadCrumbPaths={breadcrumbPaths}
        audienceSegmentFormData={this.state.audienceSegmentFormData}
        datamart={selectedDatamart}
        segmentCreation={!segmentId}
        queryContainer={this.state.queryContainer}
        queryLanguage={getQueryLanguageToDisplay}
        segmentType={selectedSegmentType}
        goToSegmentTypeSelection={resetFormData}
      />
    ) : (
      <EditContentLayout paths={breadcrumbPaths} {...actionbarProps}>
        {displayDatamartSelector ? (
          <DatamartSelector onSelect={this.onDatamartSelect} />
        ) : (
          <SegmentTypeSelector
            onSelect={this.onSegmentTypeSelect}
            segmentTypesToDisplay={this.getSegmentTypesToDisplay()}
          />
        )}
      </EditContentLayout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectFeatures,
  connect(mapStateToProps),
)(EditAudienceSegmentPage);
