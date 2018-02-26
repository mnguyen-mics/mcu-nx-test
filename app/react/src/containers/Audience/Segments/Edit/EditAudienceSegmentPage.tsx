import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import moment from 'moment';
import {
  injectIntl,
  InjectedIntlProps
} from 'react-intl';
import {
  EditAudienceSegmentParam,
  AudienceSegmentFormData,
  DefaultLiftimeUnit,
  AudienceExternalFeedResource,
  AudienceTagFeedResource,
} from './domain'
import AudienceSegmentService from '../../../../services/AudienceSegmentService'
import QueryService from '../../../../services/QueryService'
import { INITIAL_AUDIENCE_SEGMENT_FORM_DATA } from '../Edit/domain'
import { AudienceSegmentShape, UserListSegment } from '../../../../models/audiencesegment'
import messages from './messages';

import EditAudienceSegmentForm from './EditAudienceSegmentForm'
import injectDatamart, { InjectedDatamartProps } from '../../../Datamart/injectDatamart';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { createFieldArrayModel, executeTasksInSequence } from '../../../../utils/FormHelper';
import { QueryLanguage, QueryResource } from '../../../../models/datamart/DatamartResource';
import { DataResponse } from '../../../../services/ApiService';
import { UserQuerySegment } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { PluginProperty } from '../../../../models/Plugins';
import { Loading } from '../../../../components';



interface State {
  audienceSegmentFormData: AudienceSegmentFormData;
  segmentType?: string;
  segmentCreation: boolean;
  queryLanguage: QueryLanguage;
  queryContainer?: any;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedDatamartProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;


class EditAudienceSegmentPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    const QueryContainer = (window as any).angular.element(document.body).injector().get('core/datamart/queries/QueryContainer')
    const defQuery = new QueryContainer(props.datamart.id)

    this.state = {
      audienceSegmentFormData: INITIAL_AUDIENCE_SEGMENT_FORM_DATA,
      segmentCreation: true,
      queryLanguage: props.datamart.storage_model_version === 'v201506' ? 'SELECTORQL' : 'OTQL' as QueryLanguage,
      queryContainer: defQuery,
      loading: true,
    };

  }

  countDefaultLifetime = (audienceSegment: AudienceSegmentShape): {
    defaultLiftime?: number,
    defaultLiftimeUnit?: DefaultLiftimeUnit,
  } => {
    let lifetime = moment.duration(audienceSegment.default_ttl, 'milliseconds').asMonths();
    if (Number.isInteger(lifetime) && lifetime > 0) {

      return {
        defaultLiftime: lifetime,
        defaultLiftimeUnit: 'months'
      }
    } else {
      lifetime = moment.duration(audienceSegment.default_ttl, 'milliseconds').asWeeks();
      if (Number.isInteger(lifetime) && lifetime > 0) {
        return {
          defaultLiftime: lifetime,
          defaultLiftimeUnit: 'weeks'
        }
      } else {
        lifetime = moment.duration(audienceSegment.default_ttl, 'milliseconds').asDays();
        return {
          defaultLiftime: lifetime,
          defaultLiftimeUnit: 'days'
        }
      }
    }
  }

  extractSegmentType = (audienceSegment: AudienceSegmentShape) => {

    if (audienceSegment.type === 'USER_LIST' && audienceSegment.feed_type === 'TAG') {
      return 'USER_PIXEL';
    }
    return audienceSegment.type;

  }

  initialLoading = (props: Props) => {
    const {
      match: { params: { segmentId } },
      datamart,
    } = props;

    if (segmentId) {

      const getSegment: Promise<DataResponse<AudienceSegmentShape>> = AudienceSegmentService
      .getSegment(segmentId)
      .then(res => {
        if (res.data.type === 'USER_QUERY' && res.data.query_id) {
          QueryService.getQuery(datamart.id, res.data.query_id)
            .then(r => r.data)
            .then(r => {
              const QueryContainer = (window as any).angular.element(document.body).injector().get('core/datamart/queries/QueryContainer')
              const defQuery = new QueryContainer(props.datamart.id, r.id)
              defQuery.load()
              this.setState({
                queryLanguage: r.query_language as QueryLanguage,
                queryContainer: defQuery,
                audienceSegmentFormData: {
                  ...this.state.audienceSegmentFormData,
                  query: r
                } 
              })
            })
        }
        return res;
      });


      const getExternalFeed: Promise<AudienceExternalFeedResource[]> = AudienceSegmentService
      .getAudienceExternalFeeds(segmentId)
      .then(res => res.data)
      .then(res => {
        return Promise.all(
          res.map(plugin => 
            AudienceSegmentService.getAudienceExternalFeedProperty(segmentId, plugin.id)
              .then(r => r.data)
              .then(r => {
                return {
                  ...plugin,
                  status: (plugin.status as any) === 'INITIAL' ? 'PAUSED' : plugin.status,
                  properties: r
                }
              })
            )
          )
      });
      const getTagFeed: Promise<AudienceTagFeedResource[]> = AudienceSegmentService
      .getAudienceTagFeeds(segmentId)
      .then(res => res.data)
      .then(res => {
        return Promise.all(
          res.map(plugin => 
            AudienceSegmentService.getAudienceTagFeedProperty(segmentId, plugin.id)
              .then(r => r.data)
              .then(r => {
                return {
                  ...plugin,
                  properties: r
                }
              })
            )
          )
      });

      Promise.all([getSegment, getExternalFeed, getTagFeed])
        .then(res =>
          this.setState((prevStat) => {
            const newStat = {
              ...prevStat,
              segmentType: this.extractSegmentType(res[0].data),
              segmentCreation: false,
              audienceSegmentFormData: {
                ...prevStat.audienceSegmentFormData,
                audienceSegment: res[0].data,
                ...this.countDefaultLifetime(res[0].data),
                audienceTagFeeds: res[2].map(atf => createFieldArrayModel(atf)),
                audienceExternalFeeds: res[1].map(aef => createFieldArrayModel(aef)),
              },
              loading: false,
            };
            return newStat;
          })
        ).catch(err => {
          props.notifyError(err);
          this.setState({ loading: false })
        });
    } else {
      this.setState({ loading: false })
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: { params: { segmentId } },
    } = this.props;
    const {
      match: { params: { segmentId: nextSegmentId } },
    } = nextProps;
    if (segmentId === undefined && nextSegmentId) {
      this.initialLoading(nextProps);
    }

  }

  componentDidMount() {
    this.initialLoading(this.props)
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  redirectToSegmentList = () => {
    const {
        history,
      match: { params: { organisationId } }
      } = this.props

    return history.push(`/v2/o/${organisationId}/audience/segments`);
  };

  generateCreatePromise = (audienceSegmentFormData: AudienceSegmentFormData): Promise<DataResponse<AudienceSegmentShape> | any> => {
    const {
      match: { params: { organisationId } },
    } = this.props;

    switch (audienceSegmentFormData.audienceSegment.type) {
      case 'USER_LIST':
        return AudienceSegmentService.saveSegment(
          organisationId,
          audienceSegmentFormData.audienceSegment,
        )
      case 'USER_QUERY':
        return this.createQuery(audienceSegmentFormData)
          .then((queryId) => 
            AudienceSegmentService
              .saveSegment(
                organisationId,
                { ...(audienceSegmentFormData.audienceSegment as UserQuerySegment), type: 'USER_QUERY', query_id: queryId }
              )
            )
      default:
        return Promise.resolve()
    }
  }

  updateFeedPropertiesValue = (segmentId: string,properties: PluginProperty[], organisationId: string, id: string) => {
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

  updateTagPropertiesValue = (segmentId: string,properties: PluginProperty[], organisationId: string, id: string) => {
    const propertiesPromises: Array<() => Promise<any>> = [];
    properties.forEach(item => {
      if (item.writable) {
        propertiesPromises.push(
          () => AudienceSegmentService.updateAudienceSegmentTagFeedProperty(
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

  generateSaveOrUpdateFeed = (segmentId: string, audienceSegmentFormData: AudienceSegmentFormData) => {

    const {
      match: {
        params: {
          organisationId
        }
      }
    } = this.props;

    const startId = this.state.audienceSegmentFormData.audienceExternalFeeds.map(erf => erf.model.id)
    const savedIds: string[] = [];

    const saveCreatePromise = audienceSegmentFormData.audienceExternalFeeds.map(erf => {
      if (!erf.model.id) {
        const newAudienceFeed = { ...erf.model }
        delete newAudienceFeed.properties;
        return () => AudienceSegmentService.createAudienceExternalFeeds(segmentId, newAudienceFeed)
          .then(res => this.updateFeedPropertiesValue(segmentId, erf.model.properties as any, organisationId, res.data.id))
      } else if (startId.includes(erf.model.id)) {
        const newAudienceFeed = { ...erf.model }
        delete newAudienceFeed.properties;
        savedIds.push(erf.model.id);
        return () => AudienceSegmentService.updateAudienceExternalFeeds(segmentId, erf.key, newAudienceFeed)
          .then(res => this.updateFeedPropertiesValue(segmentId, erf.model.properties as any, organisationId, res.data.id))
      }
      return () => Promise.resolve();
    });
    const deletePromise = startId.map(sid => sid && !savedIds.includes(sid) ? () => AudienceSegmentService.deleteAudienceExternalFeeds(segmentId, sid) : () => Promise.resolve())
    return [...saveCreatePromise, ...deletePromise];
  }

  generateSaveOrUpdateTag = (segmentId: string, audienceSegmentFormData: AudienceSegmentFormData) => {

    const {
      match: {
        params: {
          organisationId
        }
      }
    } = this.props;

    const startId = this.state.audienceSegmentFormData.audienceTagFeeds.map(erf => erf.model.id)
    const savedIds: string[] = [];

    const saveCreatePromise = audienceSegmentFormData.audienceTagFeeds.map(erf => {
      if (!erf.model.id) {
        const newAudienceFeed = { ...erf.model }
        delete newAudienceFeed.properties;
        return () => AudienceSegmentService.createAudienceTagFeeds(segmentId, newAudienceFeed)
          .then(res => this.updateTagPropertiesValue(segmentId, erf.model.properties as any, organisationId, res.data.id))
      } else if (startId.includes(erf.model.id)) {
        const newAudienceFeed = { ...erf.model }
        delete newAudienceFeed.properties;
        savedIds.push(erf.model.id);
        return () => AudienceSegmentService.updateAudienceTagFeeds(segmentId, erf.key, newAudienceFeed)
          .then(res => this.updateTagPropertiesValue(segmentId, erf.model.properties as any, organisationId, res.data.id))
      }
      return () => Promise.resolve();
    });
    const deletePromise = startId.map(sid => sid && !savedIds.includes(sid) ? () => AudienceSegmentService.deleteAudienceTagFeeds(segmentId, sid) : () => Promise.resolve())
    return [...saveCreatePromise, ...deletePromise];
  }
  

  saveOrUpdatePlugin = (segmentId: string, audienceSegmentFormData: AudienceSegmentFormData) => {
    const allPromises: Array<() => Promise<any>> = [...this.generateSaveOrUpdateFeed(segmentId, audienceSegmentFormData),
    ...this.generateSaveOrUpdateTag(segmentId, audienceSegmentFormData)];

    return executeTasksInSequence(allPromises);
  }

  updateQuery = (queryId: string, audienceSegmentFormData: AudienceSegmentFormData):Promise<string> => {

    const {
      datamart,
    } = this.props;

    const {
      queryLanguage,
      queryContainer,
    } = this.state

    return queryLanguage === 'OTQL' ? 
      QueryService.updateQuery(datamart.id, queryId, { query_language: queryLanguage, query_text: (audienceSegmentFormData.query as QueryResource).query_text, datamart_id: datamart.id })
      .then(res => res.data)
      .then(res => res.id) :
      queryContainer.saveOrUpdate().then(() => queryContainer.id)

  }

  createQuery = (audienceSegmentFormData: AudienceSegmentFormData):Promise<string> => {

    const {
      datamart,
    } = this.props;

    const {
      queryLanguage,
      queryContainer,
    } = this.state

    return queryLanguage === 'OTQL' ? 
      QueryService.createQuery(datamart.id, { query_language: 'OTQL', query_text: (audienceSegmentFormData.query as QueryResource).query_text, datamart_id: datamart.id })
      .then(res => res.data)
      .then(res => res.id) :
      queryContainer.saveOrUpdate().then(() => queryContainer.id)

  }

  generateUpdateRequest = (segmentId: string, audienceSegmentFormData: AudienceSegmentFormData): Promise<DataResponse<AudienceSegmentShape> | any> => {

    switch (audienceSegmentFormData.audienceSegment.type) {
      case 'USER_LIST':
        return AudienceSegmentService.updateAudienceSegment(
          segmentId,
          audienceSegmentFormData.audienceSegment,
        )
        .then(res => this.saveOrUpdatePlugin(res.data.id, audienceSegmentFormData))
      case 'USER_QUERY':
        return this.updateQuery((audienceSegmentFormData.audienceSegment as UserQuerySegment).query_id, audienceSegmentFormData)
          .then((queryId) => {
              return AudienceSegmentService.updateAudienceSegment(
                segmentId,
                { ...(audienceSegmentFormData.audienceSegment as UserQuerySegment), type: 'USER_QUERY', query_id: queryId }
              )
            })
            .then(res => this.saveOrUpdatePlugin(res.data.id, audienceSegmentFormData))
      default:
        return Promise.resolve()
    }
  }

  save = (audienceSegmentFormData: AudienceSegmentFormData) => {

    const {
      match: { params: { organisationId, type } },
      datamart,
      notifyError,
      history,
      intl,
   } = this.props;

    const countTTL = (formData: AudienceSegmentFormData) => {
      if (formData.defaultLiftimeUnit && formData.defaultLiftime) {
        return moment.duration(Number(formData.defaultLiftime), formData.defaultLiftimeUnit).asMilliseconds();
      }
      return undefined;

    };

    const fillTechnicalNameForUserPixel = (formData: AudienceSegmentFormData) => {
      const technicalName = formData.audienceSegment.technical_name;
      if(formData.audienceSegment.type === 'USER_LIST' && formData.audienceSegment.feed_type === 'TAG'){
        if (technicalName === undefined || technicalName === null || technicalName === '') {
          return `${formData.audienceSegment.name}-${moment().unix()}`;
        }
      }

      return technicalName
    }

    const datamartId = datamart.id;

    switch (type) {
      case 'USER_PIXEL':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...(audienceSegmentFormData.audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'TAG',
          }
        };
        break;
      case 'USER_LIST':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...(audienceSegmentFormData.audienceSegment as UserListSegment),
            type: 'USER_LIST',
            feed_type: 'FILE_IMPORT',
          }
        };
        break;
      case 'USER_QUERY':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...(audienceSegmentFormData.audienceSegment as UserQuerySegment),
            type: 'USER_QUERY',
          }
        };
    };

    const audienceSegment = {
      ...audienceSegmentFormData.audienceSegment,
      default_ttl: countTTL(audienceSegmentFormData),
      technical_name: fillTechnicalNameForUserPixel(audienceSegmentFormData),
      datamart_id: datamartId,
      organisation_id: organisationId,
    }
    audienceSegmentFormData = {
      ...audienceSegmentFormData,
      audienceSegment: audienceSegment
    };

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    const {
      segmentCreation
    } = this.state

    this.setState({ loading: true })
    if (segmentCreation) {
      return this.generateCreatePromise(audienceSegmentFormData)
        .then(response => {
          hideSaveInProgress();
          this.setState({ loading: false })
          const adGroupDashboardUrl =( audienceSegmentFormData.audienceSegment as UserListSegment).feed_type === 'TAG' ? `/v2/o/${organisationId}/audience/segments/${response.data.id}/edit` : `/v2/o/${organisationId}/audience/segments/${response.data.id}`;
          history.push(adGroupDashboardUrl);
        })
        .catch(err => {
          hideSaveInProgress();
          this.setState({ loading: false })
          notifyError(err);
        });
    } else {

      const {
        match: { params: { segmentId } },
      } = this.props
      return this.generateUpdateRequest(segmentId, audienceSegmentFormData)
        .then(response => {
          hideSaveInProgress();
          this.setState({ loading: false })
          const adGroupDashboardUrl = `/v2/o/${organisationId}/audience/segments/${segmentId}`;
          history.push(adGroupDashboardUrl);
        })
        .catch(err => {
          hideSaveInProgress();
          this.setState({ loading: false })
          notifyError(err);
        });

    }

  }

  render() {

    const {
      match: { params: { type } },
      datamart
    } = this.props;

    const {
      segmentCreation
    } = this.state;

    const {
      loading
    } = this.state;
  
    const segmentType = type || this.state.segmentType;


    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const getQueryLanguageToDisplay = (this.state.audienceSegmentFormData.query && this.state.audienceSegmentFormData.query.query_language) ? this.state.audienceSegmentFormData.query.query_language : this.state.queryLanguage;
    return (
      <EditAudienceSegmentForm
        initialValues={this.state.audienceSegmentFormData}
        close={this.redirectToSegmentList}
        onSubmit={this.save}
        audienceSegmentFormData={this.state.audienceSegmentFormData}
        datamart={datamart}
        segmentType={segmentType}
        segmentCreation={segmentCreation}
        queryContainer={this.state.queryContainer}
        queryLanguage={getQueryLanguageToDisplay}
      />
    );
  }

}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDatamart,
  injectNotifications,
)(EditAudienceSegmentPage);
