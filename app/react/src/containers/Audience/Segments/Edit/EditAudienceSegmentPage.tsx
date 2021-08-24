import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, StaticContext } from 'react-router';
import { message } from 'antd';
import moment from 'moment';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import {
  EditAudienceSegmentParam,
  AudienceSegmentFormData,
  DefaultLiftimeUnit,
  checkProcessingsAndSave,
  generateProcessingSelectionsTasks,
} from './domain';
import { INITIAL_AUDIENCE_SEGMENT_FORM_DATA } from '../Edit/domain';
import { UserListSegment } from '../../../../models/audiencesegment';
import messages from './messages';
import EditAudienceSegmentForm from './EditAudienceSegmentForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

import { QueryLanguage, DatamartResource } from '../../../../models/datamart/DatamartResource';
import {
  UserQuerySegment,
  AudienceSegmentType,
} from '../../../../models/audiencesegment/AudienceSegmentResource';
import { Loading } from '../../../../components';
import DatamartSelector from './../../../Datamart/DatamartSelector';
import { EditContentLayout } from '../../../../components/Layout';
import SegmentTypeSelector from '../../Common/SegmentTypeSelector';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { IDatamartService } from '../../../../services/DatamartService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAudienceSegmentFormService } from './AudienceSegmentFormService';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { IStandardSegmentBuilderService } from '../../../../services/StandardSegmentBuilderService';
import { StandardSegmentBuilderResource } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { Link } from 'react-router-dom';

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
  editionNotAllowed: {
    id: 'audience.segments.edit.editionNotAllowed',
    defaultMessage: 'Edition is not allowed on USER_ACTIVATION segment.',
  },
});

interface State {
  audienceSegmentFormData: AudienceSegmentFormData;
  queryLanguage?: QueryLanguage;
  loading: boolean;
  selectedDatamart?: DatamartResource;
  displayDatamartSelector: boolean;
  standardSegmentBuilder?: StandardSegmentBuilderResource;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  MapStateToProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam, StaticContext, { from?: string }>;

class EditAudienceSegmentPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentFormService)
  private _audienceSegmentFormService: IAudienceSegmentFormService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.IStandardSegmentBuilderService)
  private _standardSegmentBuilderService: IStandardSegmentBuilderService;

  constructor(props: Props) {
    super(props);

    this.state = {
      audienceSegmentFormData: INITIAL_AUDIENCE_SEGMENT_FORM_DATA,
      loading: true,
      displayDatamartSelector: true,
    };
  }

  countDefaultLifetime = (
    audienceSegmentFormData: AudienceSegmentFormData,
  ): {
    defaultLiftime?: number;
    defaultLiftimeUnit?: DefaultLiftimeUnit;
  } => {
    if (!audienceSegmentFormData.audienceSegment.default_ttl) return { defaultLiftimeUnit: 'days' };

    let lifetime = moment
      .duration(audienceSegmentFormData.audienceSegment.default_ttl, 'milliseconds')
      .asMonths();
    if (Number.isInteger(lifetime) && lifetime > 0) {
      return {
        defaultLiftime: lifetime,
        defaultLiftimeUnit: 'months',
      };
    } else {
      lifetime = moment
        .duration(audienceSegmentFormData.audienceSegment.default_ttl, 'milliseconds')
        .asWeeks();
      if (Number.isInteger(lifetime) && lifetime > 0) {
        return {
          defaultLiftime: lifetime,
          defaultLiftimeUnit: 'weeks',
        };
      } else {
        lifetime = moment
          .duration(audienceSegmentFormData.audienceSegment.default_ttl, 'milliseconds')
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
    if (segmentId) {
      this._audienceSegmentFormService
        .loadSegmentInitialValue(segmentId)
        .then(initialData => {
          this._datamartService
            .getDatamart(initialData.audienceSegment.datamart_id!)
            .then(datamartData => datamartData.data)
            .then(datamartResource => {
              const newState: Partial<State> = {
                audienceSegmentFormData: {
                  ...initialData,
                  defaultLifetime: this.countDefaultLifetime(initialData).defaultLiftime,
                  defaultLifetimeUnit: this.countDefaultLifetime(initialData).defaultLiftimeUnit,
                },
                selectedDatamart: datamartResource,
                loading: false,
              };

              if (initialData.query) {
                newState.queryLanguage = initialData.query.query_language;
                const audienceSegment = initialData.audienceSegment as UserQuerySegment;
                if (audienceSegment.audience_builder_id) {
                  this._standardSegmentBuilderService
                    .getStandardSegmentBuilder(
                      audienceSegment.datamart_id,
                      audienceSegment.audience_builder_id,
                    )
                    .then(res => {
                      newState.standardSegmentBuilder = res.data;
                      this.setState(newState as State);
                    });
                } else {
                  this.setState(newState as State);
                }
              } else {
                this.setState(newState as State);
              }
            });
        })
        .catch(err => {
          props.notifyError(err);
          this.setState({ loading: false });
        });
    } else {
      const datamarts = workspace(organisationId).datamarts;
      const multipleDatamarts = datamarts.length > 1;
      this.setState({
        loading: false,
        displayDatamartSelector: multipleDatamarts,
        selectedDatamart: multipleDatamarts ? undefined : workspace(organisationId).datamarts[0],
      });
    }
  };

  componentDidMount() {
    this.initialLoading(this.props);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { segmentId },
      },
    } = this.props;
    const {
      match: {
        params: { segmentId: previousSegmentId },
      },
    } = previousProps;
    if (segmentId !== previousSegmentId) {
      this.initialLoading(this.props);
    }
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

  onSubmit = (audienceSegmentFormData: AudienceSegmentFormData) => {
    const { intl } = this.props;
    checkProcessingsAndSave(audienceSegmentFormData, this.save, intl);
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

    const { selectedDatamart, queryLanguage } = this.state;

    const countTTL = (formData: AudienceSegmentFormData) => {
      if (formData.defaultLifetimeUnit && formData.defaultLifetime) {
        return moment
          .duration(Number(formData.defaultLifetime), formData.defaultLifetimeUnit)
          .asMilliseconds();
      }
      return undefined;
    };
    if (
      (audienceSegmentFormData.audienceSegment.type === 'USER_QUERY' &&
        !audienceSegmentFormData.query) ||
      (audienceSegmentFormData.audienceSegment.type === 'USER_LIST' &&
        audienceSegmentFormData.audienceSegment.subtype === 'USER_CLIENT' &&
        !audienceSegmentFormData.query) ||
      (audienceSegmentFormData.audienceSegment.type === 'USER_LIST' &&
        audienceSegmentFormData.audienceSegment.subtype === 'EDGE' &&
        !audienceSegmentFormData.query)
    ) {
      message.error(intl.formatMessage(messagesMap.noQueryText));
    } else if (audienceSegmentFormData.audienceSegment.type === 'USER_ACTIVATION') {
      message.error(intl.formatMessage(messagesMap.editionNotAllowed));
    } else {
      this.setState({ loading: true });

      const datamartId = selectedDatamart
        ? selectedDatamart.id
        : audienceSegmentFormData.audienceSegment.datamart_id;

      const audienceSegment = {
        ...audienceSegmentFormData.audienceSegment,
        default_ttl: audienceSegmentFormData.defaultLifetime
          ? countTTL(audienceSegmentFormData)
          : null,
        datamart_id: datamartId,
        organisation_id: organisationId,
      };
      audienceSegmentFormData = {
        ...audienceSegmentFormData,
        audienceSegment: audienceSegment,
      };

      const hideSaveInProgress = message.loading(intl.formatMessage(messages.savingInProgress), 0);

      this._audienceSegmentFormService
        .saveOrCreateAudienceSegment(organisationId, audienceSegmentFormData, queryLanguage)
        .then(response => {
          if (!!response) {
            Promise.all([
              ...generateProcessingSelectionsTasks(
                response.data.id,
                audienceSegmentFormData,
                this._audienceSegmentFormService,
              ),
            ]);
          }
          return response;
        })
        .then(response => {
          hideSaveInProgress();
          if (!!response) {
            let redirect = '';
            if (
              response.data.type === 'USER_LIST' &&
              !audienceSegmentFormData.audienceSegment.id &&
              (audienceSegmentFormData.audienceSegment as UserListSegment).subtype === 'USER_PIXEL'
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
    this.setState({
      selectedDatamart: datamart,
      queryLanguage: 'OTQL',
      displayDatamartSelector: false,
    });
  };

  onSegmentTypeSelect = (segmentType: AudienceSegmentType, queryLang: QueryLanguage = 'OTQL') => {
    const queryLanguage: QueryLanguage = queryLang;
    if (segmentType === 'USER_PIXEL') {
      this.setState({
        audienceSegmentFormData: {
          ...this.state.audienceSegmentFormData,
          audienceSegment: {
            ...(this.state.audienceSegmentFormData.audienceSegment as UserListSegment),
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
            ...(this.state.audienceSegmentFormData.audienceSegment as UserListSegment),
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
            ...(this.state.audienceSegmentFormData.audienceSegment as UserQuerySegment),
            type: 'USER_QUERY',
          },
        },
      });
    } else if (segmentType === 'EDGE') {
      this.setState({
        queryLanguage: 'JSON_OTQL',
        audienceSegmentFormData: {
          ...this.state.audienceSegmentFormData,
          audienceSegment: {
            ...(this.state.audienceSegmentFormData.audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'TAG',
            subtype: 'EDGE',
          },
        },
      });
    }
  };

  getSegmentTypesToDisplay = () => {
    const { selectedDatamart } = this.state;
    const { hasFeature } = this.props;
    const segmentTypesToDisplay: Array<{
      title: string;
      value: AudienceSegmentType;
    }> = [];
    if (selectedDatamart && selectedDatamart.storage_model_version === 'v201709') {
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
    if (hasFeature('audience-user_client_segment')) {
      segmentTypesToDisplay.push({
        title: 'Edge',
        value: 'EDGE',
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
      standardSegmentBuilder,
    } = this.state;

    const audienceSegmentName =
      audienceSegmentFormData.audienceSegment && audienceSegmentFormData.audienceSegment.name
        ? formatMessage(messagesMap.breadcrumbEditAudienceSegment, {
            name: audienceSegmentFormData.audienceSegment.name,
          })
        : formatMessage(messages.audienceSegmentBreadCrumb);

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/audience/segments`}>
        {formatMessage(messagesMap.breadcrumbAudienceSegmentList)}
      </Link>,
      audienceSegmentName,
    ];

    let resetFormData;
    if (!segmentId) {
      resetFormData = () => {
        this.setState({
          audienceSegmentFormData: {
            audienceSegment: {},
            initialProcessingSelectionResources: [],
            processingActivities: [],
          },
        });
      };
    }

    const actionbarProps = {
      onClose: this.redirectToSegmentList,
      formId: 'audienceSegmentForm',
    };

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const initialProcessingSelectionsForWarning = audienceSegmentFormData.audienceSegment.id
      ? audienceSegmentFormData.initialProcessingSelectionResources
      : undefined;

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
        onSubmit={this.onSubmit}
        breadCrumbPaths={breadcrumbPaths}
        audienceSegmentFormData={this.state.audienceSegmentFormData}
        datamart={selectedDatamart}
        segmentCreation={!segmentId}
        queryLanguage={getQueryLanguageToDisplay}
        segmentType={selectedSegmentType}
        goToSegmentTypeSelection={resetFormData}
        initialProcessingSelectionsForWarning={initialProcessingSelectionsForWarning}
        standardSegmentBuilder={standardSegmentBuilder}
      />
    ) : displayDatamartSelector ? (
      <DatamartSelector
        onSelect={this.onDatamartSelect}
        actionbarProps={{ pathItems: breadcrumbPaths, onClose: this.onClose }}
      />
    ) : (
      <EditContentLayout pathItems={breadcrumbPaths} {...actionbarProps}>
        <SegmentTypeSelector
          onSelect={this.onSegmentTypeSelect}
          segmentTypesToDisplay={this.getSegmentTypesToDisplay()}
        />
      </EditContentLayout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectFeatures,
  connect(mapStateToProps),
)(EditAudienceSegmentPage);
