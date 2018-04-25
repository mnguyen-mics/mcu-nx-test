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
  AudienceExternalFeedResource,
  AudienceTagFeedResource,
  SegmentType,
} from './domain';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import QueryService from '../../../../services/QueryService';
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
  createFieldArrayModel,
  executeTasksInSequence,
} from '../../../../utils/FormHelper';
import {
  QueryLanguage,
  QueryResource,
} from '../../../../models/datamart/DatamartResource';
import { DataResponse } from '../../../../services/ApiService';
import { UserQuerySegment } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { PluginProperty } from '../../../../models/Plugins';
import { Loading } from '../../../../components';
import DatamartSelector from './../../Common/DatamartSelector';
import { Datamart } from '../../../../models/organisation/organisation';
import { EditContentLayout } from '../../../../components/Layout';
import SegmentTypeSelector from '../../Common/SegmentTypeSelector';
import { getWorkspace } from '../../../../state/Session/selectors';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import DatamartService from '../../../../services/DatamartService';

const messagesMap = defineMessages({
  breadcrumbEditAudienceSegment: {
    id: 'audience.segment.form.breadcrumb.edit',
    defaultMessage: 'Edit {name}',
  },
  breadcrumbAudienceSegmentList: {
    id: 'audience.segment.form.breadcrumb.list',
    defaultMessage: 'Segments',
  },
});

interface State {
  audienceSegmentFormData: AudienceSegmentFormData;
  segmentCreation: boolean;
  queryLanguage?: QueryLanguage;
  queryContainer?: any;
  loading: boolean;
  selectedDatamart?: Datamart;
  selectedSegmentType?: SegmentType;
  displayDatamartSelector: boolean;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class EditAudienceSegmentPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      audienceSegmentFormData: INITIAL_AUDIENCE_SEGMENT_FORM_DATA,
      segmentCreation: true,
      queryLanguage:
        props.datamart.storage_model_version === 'v201506'
          ? 'SELECTORQL'
          : 'OTQL',
      queryContainer: defQuery,
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

  extractSegmentType = (audienceSegment: AudienceSegmentShape) => {
    if (
      audienceSegment.type === 'USER_LIST' &&
      audienceSegment.feed_type === 'TAG'
    ) {
      return 'USER_PIXEL';
    }
    return audienceSegment.type as SegmentType;
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
      const getSegment: Promise<
        DataResponse<AudienceSegmentShape>
        > = AudienceSegmentService.getSegment(segmentId).then(res => {
          if (res.data.type === 'USER_QUERY' && res.data.query_id) {
            QueryService.getQuery(res.data.datamart_id, res.data.query_id)
              .then(r => r.data)
              .then(r => {

                DatamartService.getDatamart(r.datamart_id)
                  .then(resp => resp.data)
                  .then(datamartResource => {

                    const newState: Partial<State> = {
                      queryLanguage: r.query_language,
                      audienceSegmentFormData: {
                        ...this.state.audienceSegmentFormData,
                        query: r,
                      },
                      selectedDatamart: datamartResource,
                    }

                    if (r.query_language === 'SELECTORQL') {
                      const QueryContainer = (window as any).angular
                        .element(document.body)
                        .injector()
                        .get('core/datamart/queries/QueryContainer');
                      const defQuery = new QueryContainer(res.data.datamart_id, r.id);
                      defQuery.load();
                      newState.queryContainer = defQuery;
                    }

                    this.setState(newState as State);

                  });


              });
          }
          return res;
        });

      const getExternalFeed: Promise<
        AudienceExternalFeedResource[]
        > = AudienceSegmentService.getAudienceExternalFeeds(segmentId)
          .then(res => res.data)
          .then(res => {
            return Promise.all(
              res.map(plugin =>
                AudienceSegmentService.getAudienceExternalFeedProperty(
                  segmentId,
                  plugin.id,
                )
                  .then(r => r.data)
                  .then(r => {
                    return {
                      ...plugin,
                      status:
                        (plugin.status as any) === 'INITIAL'
                          ? 'PAUSED'
                          : plugin.status,
                      properties: r,
                    };
                  }),
              ),
            );
          });
      const getTagFeed: Promise<
        AudienceTagFeedResource[]
        > = AudienceSegmentService.getAudienceTagFeeds(segmentId)
          .then(res => res.data)
          .then(res => {
            return Promise.all(
              res.map(plugin =>
                AudienceSegmentService.getAudienceTagFeedProperty(
                  segmentId,
                  plugin.id,
                )
                  .then(r => r.data)
                  .then(r => {
                    return {
                      ...plugin,
                      properties: r,
                    };
                  }),
              ),
            );
          });

      Promise.all([getSegment, getExternalFeed, getTagFeed])
        .then(res =>
          this.setState(prevStat => {
            const newStat = {
              ...prevStat,
              segmentType: this.extractSegmentType(res[0].data),
              segmentCreation: false,
              audienceSegmentFormData: {
                ...prevStat.audienceSegmentFormData,
                audienceSegment: res[0].data,
                ...this.countDefaultLifetime(res[0].data),
                audienceTagFeeds: res[2].map(atf => createFieldArrayModel(atf)),
                audienceExternalFeeds: res[1].map(aef =>
                  createFieldArrayModel(aef),
                ),
              },
              loading: false,
            };
            return newStat;
          }),
      )
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

  generateCreatePromise = (
    audienceSegmentFormData: AudienceSegmentFormData,
  ): Promise<DataResponse<AudienceSegmentShape> | any> => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    switch (audienceSegmentFormData.audienceSegment.type) {
      case 'USER_LIST':
        return AudienceSegmentService.saveSegment(
          organisationId,
          audienceSegmentFormData.audienceSegment,
        );
      case 'USER_QUERY':
        return this.createQuery(audienceSegmentFormData).then(queryId =>
          AudienceSegmentService.saveSegment(organisationId, {
            ...(audienceSegmentFormData.audienceSegment as UserQuerySegment),
            type: 'USER_QUERY',
            query_id: queryId,
          }),
        );
      default:
        return Promise.resolve();
    }
  };

  updateFeedPropertiesValue = (
    segmentId: string,
    properties: PluginProperty[],
    organisationId: string,
    id: string,
  ) => {
    const propertiesPromises: Array<Promise<any>> = [];
    properties.forEach(item => {
      if (item.writable) {
        propertiesPromises.push(
          AudienceSegmentService.updateAudienceSegmentExternalFeedProperty(
            organisationId,
            segmentId,
            id,
            item.technical_name,
            item,
          ),
        );
      }
    });
    return Promise.all(propertiesPromises);
  };

  updateTagPropertiesValue = (
    segmentId: string,
    properties: PluginProperty[],
    organisationId: string,
    id: string,
  ) => {
    const propertiesPromises: Array<() => Promise<any>> = [];
    properties.forEach(item => {
      if (item.writable) {
        propertiesPromises.push(() =>
          AudienceSegmentService.updateAudienceSegmentTagFeedProperty(
            organisationId,
            segmentId,
            id,
            item.technical_name,
            item,
          ),
        );
      }
    });
    return executeTasksInSequence(propertiesPromises);
  };

  generateSaveOrUpdateFeed = (
    segmentId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
  ) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const startId = this.state.audienceSegmentFormData.audienceExternalFeeds.map(
      erf => erf.model.id,
    );
    const savedIds: string[] = [];

    const saveCreatePromise = audienceSegmentFormData.audienceExternalFeeds.map(
      erf => {
        if (!erf.model.id) {
          const newAudienceFeed =
            erf.model.status === 'ACTIVE'
              ? { ...erf.model, status: 'INITIAL' as any }
              : { ...erf.model };
          delete newAudienceFeed.properties;
          return () =>
            AudienceSegmentService.createAudienceExternalFeeds(
              segmentId,
              newAudienceFeed,
            ).then(res =>
              this.updateFeedPropertiesValue(
                segmentId,
                erf.model.properties as any,
                organisationId,
                res.data.id,
              ),
            );
        } else if (startId.includes(erf.model.id)) {
          const newAudienceFeed = { ...erf.model };
          delete newAudienceFeed.properties;
          savedIds.push(erf.model.id);
          return () =>
            this.updateFeedPropertiesValue(
              segmentId,
              erf.model.properties as any,
              organisationId,
              newAudienceFeed.id,
            ).then(res =>
              AudienceSegmentService.updateAudienceExternalFeeds(
                segmentId,
                erf.key,
                newAudienceFeed,
              ),
            );
        }
        return () => Promise.resolve();
      },
    );
    const deletePromise = startId.map(
      sid =>
        sid && !savedIds.includes(sid)
          ? () =>
            AudienceSegmentService.deleteAudienceExternalFeeds(segmentId, sid)
          : () => Promise.resolve(),
    );
    return [...saveCreatePromise, ...deletePromise];
  };

  generateSaveOrUpdateTag = (
    segmentId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
  ) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const startId = this.state.audienceSegmentFormData.audienceTagFeeds.map(
      erf => erf.model.id,
    );
    const savedIds: string[] = [];

    const saveCreatePromise = audienceSegmentFormData.audienceTagFeeds.map(
      erf => {
        if (!erf.model.id) {
          const newAudienceFeed = { ...erf.model };
          delete newAudienceFeed.properties;
          return () =>
            AudienceSegmentService.createAudienceTagFeeds(
              segmentId,
              newAudienceFeed,
            ).then(res =>
              this.updateTagPropertiesValue(
                segmentId,
                erf.model.properties as any,
                organisationId,
                res.data.id,
              ),
            );
        } else if (startId.includes(erf.model.id)) {
          const newAudienceFeed = { ...erf.model };
          delete newAudienceFeed.properties;
          savedIds.push(erf.model.id);
          return () =>
            this.updateTagPropertiesValue(
              segmentId,
              erf.model.properties as any,
              organisationId,
              newAudienceFeed.id,
            ).then(res =>
              AudienceSegmentService.updateAudienceTagFeeds(
                segmentId,
                erf.key,
                newAudienceFeed,
              ),
            );
        }
        return () => Promise.resolve();
      },
    );
    const deletePromise = startId.map(
      sid =>
        sid && !savedIds.includes(sid)
          ? () => AudienceSegmentService.deleteAudienceTagFeeds(segmentId, sid)
          : () => Promise.resolve(),
    );
    return [...saveCreatePromise, ...deletePromise];
  };

  saveOrUpdatePlugin = (
    segmentId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
  ) => {
    const allPromises: Array<() => Promise<any>> = [
      ...this.generateSaveOrUpdateFeed(segmentId, audienceSegmentFormData),
      ...this.generateSaveOrUpdateTag(segmentId, audienceSegmentFormData),
    ];

    return executeTasksInSequence(allPromises);
  };

  updateQuery = (
    queryId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
  ): Promise<string> => {
    const datamartId = audienceSegmentFormData.audienceSegment
      .datamart_id as string;

    const { queryLanguage, queryContainer } = this.state;

    return queryLanguage === 'OTQL' || queryLanguage === 'JSON_OTQL'
      ? QueryService.updateQuery(datamart.id, queryId, {
        query_language: queryLanguage,
        query_text: (audienceSegmentFormData.query as QueryResource)
          .query_text,
        datamart_id: datamartId,
      })
        .then((res: any) => res.data)
        .then((res: any) => res.id)
      : queryContainer.saveOrUpdate().then(() => queryContainer.id);
  };

  createQuery = (
    audienceSegmentFormData: AudienceSegmentFormData,
  ): Promise<string> => {
    const datamartId = audienceSegmentFormData.audienceSegment
      .datamart_id as string;

    const { queryLanguage, queryContainer } = this.state;

    return queryLanguage === 'OTQL'
      ? QueryService.createQuery(datamartId, {
        query_language: 'OTQL',
        query_text: (audienceSegmentFormData.query as QueryResource)
          .query_text,
        datamart_id: datamartId,
      })
        .then(res => res.data)
        .then(res => res.id)
      : queryContainer.saveOrUpdate().then(() => queryContainer.id);
  };

  generateUpdateRequest = (
    segmentId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
  ): Promise<DataResponse<AudienceSegmentShape> | any> => {
    switch (audienceSegmentFormData.audienceSegment.type) {
      case 'USER_LIST':
        return AudienceSegmentService.updateAudienceSegment(
          segmentId,
          audienceSegmentFormData.audienceSegment,
        )
          .then(res =>
            this.saveOrUpdatePlugin(res.data.id, audienceSegmentFormData),
        )
          .then(rest => {
            if (audienceSegmentFormData.userListFiles !== undefined) {
              Promise.all(
                audienceSegmentFormData.userListFiles.map(item => {
                  const formData = new FormData();
                  formData.append('file', item as any, item.name);
                  return AudienceSegmentService.importUserListForOneSegment(
                    audienceSegmentFormData.audienceSegment
                      .datamart_id as string,
                    audienceSegmentFormData.audienceSegment.id as string,
                    formData,
                  );
                }),
              );
            } else {
              {
                Promise.resolve();
              }
            }
          });
      case 'USER_QUERY':
        return this.updateQuery(
          (audienceSegmentFormData.audienceSegment as UserQuerySegment)
            .query_id!,
          audienceSegmentFormData,
        )
          .then(queryId => {
            return AudienceSegmentService.updateAudienceSegment(segmentId, {
              ...(audienceSegmentFormData.audienceSegment as UserQuerySegment),
              type: 'USER_QUERY',
              query_id: queryId,
            });
          })
          .then((res: any) =>
            this.saveOrUpdatePlugin(res.data.id, audienceSegmentFormData),
        );
      default:
        return Promise.resolve();
    }
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

    const { selectedDatamart, selectedSegmentType } = this.state;

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

    const fillTechnicalNameForUserPixel = (
      formData: AudienceSegmentFormData,
    ) => {
      const technicalName = formData.audienceSegment.technical_name;
      if (
        formData.audienceSegment.type === 'USER_LIST' &&
        formData.audienceSegment.feed_type === 'TAG'
      ) {
        if (
          technicalName === undefined ||
          technicalName === null ||
          technicalName === ''
        ) {
          return `${formData.audienceSegment.name}-${moment().unix()}`;
        }
      }

      return technicalName;
    };

    const datamartId = selectedDatamart
      ? selectedDatamart.id
      : audienceSegmentFormData.audienceSegment.datamart_id;

    switch (selectedSegmentType) {
      case 'USER_PIXEL':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...(audienceSegmentFormData.audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'TAG',
          },
        };
        break;
      case 'USER_LIST':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...(audienceSegmentFormData.audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'FILE_IMPORT',
          },
        };
        break;
      case 'USER_QUERY':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...(audienceSegmentFormData.audienceSegment as UserQuerySegment),
            type: 'USER_QUERY',
          },
        };
    }

    const audienceSegment = {
      ...audienceSegmentFormData.audienceSegment,
      default_ttl: countTTL(audienceSegmentFormData),
      technical_name: fillTechnicalNameForUserPixel(audienceSegmentFormData),
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

    const { segmentCreation } = this.state;

    this.setState({ loading: true });
    if (segmentCreation) {
      return this.generateCreatePromise(audienceSegmentFormData)
        .then(response => {
          hideSaveInProgress();
          this.setState({ loading: false });
          const adGroupDashboardUrl = `/v2/o/${organisationId}/audience/segments/${
            response.data.id
            }/edit`;
          history.push(adGroupDashboardUrl);
        })
        .catch(err => {
          hideSaveInProgress();
          this.setState({ loading: false });
          notifyError(err);
        });
    } else {
      const {
        match: {
          params: { segmentId },
        },
      } = this.props;
      return this.generateUpdateRequest(segmentId, audienceSegmentFormData)
        .then(response => {
          hideSaveInProgress();
          this.setState({ loading: false });
          const adGroupDashboardUrl = `/v2/o/${organisationId}/audience/segments/${segmentId}`;
          history.push(adGroupDashboardUrl);
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

  onDatamartSelect = (datamart: Datamart) => {
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

  onSegmentTypeSelect = (segmentType: SegmentType) => {
    this.setState({
      selectedSegmentType: segmentType,
    });
  };

  getSegmentTypesToDisplay = () => {
    const { selectedDatamart } = this.state;
    const segmentTypesToDisplay: Array<{
      title: string;
      value: SegmentType;
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
      segmentCreation,
      audienceSegmentFormData,
      selectedDatamart,
      loading,
      selectedSegmentType,
      displayDatamartSelector,
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

    const actionbarProps = {
      onClose: this.redirectToSegmentList,
      formId: 'audienceSegmentForm',
    };

    if (loading) {
      return <Loading className="loading-full-screen" />;
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
        segmentCreation={segmentCreation}
        queryContainer={this.state.queryContainer}
        queryLanguage={getQueryLanguageToDisplay}
        segmentType={selectedSegmentType}
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
  connect(mapStateToProps),
)(EditAudienceSegmentPage);
