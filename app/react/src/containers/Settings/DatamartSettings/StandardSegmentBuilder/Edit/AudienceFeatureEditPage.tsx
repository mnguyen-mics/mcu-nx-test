import * as React from 'react';
import { compose } from 'recompose';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import AudienceFeatureForm from './AudienceFeatureForm';
import { RouteComponentProps, withRouter } from 'react-router';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IAudienceFeatureService } from '../../../../../services/AudienceFeatureService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { messages } from '../messages';
import { AudienceFeatureFormData } from './domain';
import { IRuntimeSchemaService } from '../../../../../services/RuntimeSchemaService';
import {
  computeFinalSchemaItem,
  SchemaItem,
} from '../../../../Audience/AdvancedSegmentBuilder/domain';
import { message, Modal } from 'antd';
import { Loading } from '../../../../../components';
import { Link } from 'react-router-dom';
import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import { DataResponse } from '../../../../../services/ApiService';

type Props = InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{
    datamartId: string;
    organisationId: string;
    audienceFeatureId: string;
  }>;

interface State {
  isLoading: boolean;
  audienceFeature: AudienceFeatureFormData;
  schema?: SchemaItem;
}

class AudienceFeatureEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      audienceFeature: {},
    };
  }
  componentDidMount() {
    const {
      match: {
        params: { datamartId, audienceFeatureId },
      },
    } = this.props;
    if (audienceFeatureId) {
      this.fetchAudienceFeature()
    }
    this._runtimeSchemaService.getRuntimeSchemas(datamartId).then(schemaRes => {
      const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
      if (!liveSchema) return [];
      return this._runtimeSchemaService
        .getObjectTypeInfoResources(datamartId, liveSchema.id)
        .then(r => {
          this.setState({
            schema: computeFinalSchemaItem(r, 'UserPoint', false, false, false),
          });
          return r;
        });
    });
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { audienceFeatureId },
      },
    } = this.props;
    const {
      match: {
        params: { audienceFeatureId: prevAudienceFeatureId },
      },
    } = prevProps;
    if (audienceFeatureId !== prevAudienceFeatureId) {
      if (!audienceFeatureId) {
        this.setState({
          audienceFeature: {}
        })
      } else {
        this.fetchAudienceFeature()
      }
    }
  }

  fetchAudienceFeature = () => {
    const {
      match: {
        params: { datamartId, audienceFeatureId },
      },
      notifyError,
    } = this.props;
    this.setState({
      isLoading: true,
    });
    this._audienceFeatureService
      .getAudienceFeature(datamartId, audienceFeatureId)
      .then(res => {
        this.setState({
          audienceFeature: res.data,
          isLoading: false,
        });
      })

      .catch(e => {
        notifyError(e);
        this.setState({
          isLoading: false,
        });
      });
  }

  save = (formData: AudienceFeatureFormData) => {
    const {
      match: {
        params: { organisationId, audienceFeatureId, datamartId },
      },
      notifyError,
      history,
      intl,
    } = this.props;

    const {
      audienceFeature
    } = this.state;

    const newFormData = {
      ...formData,
      addressable_object: 'UserPoint',
    };

    let objectTreeExpression = formData.object_tree_expression;

    if (objectTreeExpression) {
      if (objectTreeExpression.includes('where')) {
        objectTreeExpression = objectTreeExpression.split('where')[1];
      } else if (objectTreeExpression.includes('WHERE')) {
        objectTreeExpression = objectTreeExpression.split('WHERE')[1];
      }
      newFormData.object_tree_expression = objectTreeExpression;
    }

    const saveProcess = (promise: Promise<DataResponse<AudienceFeatureResource>>) => {
      const hideSaveInProgress = message.loading(
        intl.formatMessage(messages.audienceFeatureSavingInProgress),
        0,
      );

      this.setState({
        isLoading: true,
      });
      promise
        .then(() => {
          hideSaveInProgress();
          history.push({
            pathname: `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
            state: { activeTab: 'audience_features' },
          });
        })
        .catch(err => {
          hideSaveInProgress();
          notifyError(err);
          this.setState({
            isLoading: false,
          });
        });
    }

    if (audienceFeatureId) {
      const getPromise = () => {
        return this._audienceFeatureService.updateAudienceFeature(
          datamartId,
          audienceFeatureId,
          newFormData,
        );
      }
      if (audienceFeature.object_tree_expression !== objectTreeExpression) {
        this._audienceFeatureService.getAudienceFeatureSegmentsMapping(datamartId, audienceFeatureId).then(res => {
          let segmentsIds = res.data.segments_ids;
          if (segmentsIds.length >= 1) {
            const redirect = () => {
              Modal.destroyAll();
              history.push({
                pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/audience_feature/create`,
                state: { from: `${location.pathname}${location.search}` },
              });
            }
            Modal.confirm({
              className: 'mcs-modal--confirmDialog',
              icon: <ExclamationCircleOutlined />,
              title: intl.formatMessage(messages.audienceFeatureSegmentsMappingModalTitle),
              content: (
                <React.Fragment>
                  <FormattedMessage
                    id="settings.datamart.audienceFeatures.edit.segmentsMappingModal.content"
                    defaultMessage="This Audience Feature is used in {segmentNumber} segments."
                    values={{
                      segmentNumber: segmentsIds.length
                    }}
                  />
                  <br />
                  {intl.formatMessage(messages.audienceFeatureSegmentsMappingModalContent)}
                  {segmentsIds.length <= 10 ? segmentsIds.map((id, i) => {
                    return i === segmentsIds.length - 1 ? `${id}.` : `${id}, `
                  }) : segmentsIds.slice(0, 11).map((id, i) => {
                    return i === 10 ? intl.formatMessage(messages.audienceFeatureSegmentsMappingContentModalOthers) : `${id}, `
                  })}
                  <br />
                  <FormattedMessage
                    id="settings.datamart.audienceFeatures.edit.segmentsMappingModal.newFeature"
                    defaultMessage="If you don't want to edit existing segments, you can create a {newFeatureButton}."
                    values={{
                      newFeatureButton: <a onClick={redirect}>{intl.formatMessage(messages.audienceFeatureNew)}</a>
                    }}
                  />
                </React.Fragment>
              ),

              okText: intl.formatMessage(messages.audienceFeatureDeleteListModalOk),
              cancelText: intl.formatMessage(messages.audienceFeatureDeleteListModalCancel),
              onOk: () => {
                console.log("A")
                saveProcess(getPromise())
              }
            });
          } else {
            console.log("B")
            saveProcess(getPromise());
          }
        }).catch(err => {
          notifyError(err);
          this.setState({
            isLoading: false
          })
        })
      } else {
        console.log("C")
        saveProcess(getPromise())
      }
    } else {
      const getPromise = () => { return this._audienceFeatureService.createAudienceFeature(datamartId, newFormData); }
      console.log("D")
      saveProcess(getPromise());
    }


  };

  onClose = () => {
    const {
      history,
      match: {
        params: { organisationId, datamartId },
      },
    } = this.props;
    return history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
      state: {
        activeTab: 'audience_features',
      },
    });
  };

  render() {
    const { audienceFeature, schema, isLoading } = this.state;
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, datamartId, audienceFeatureId },
      },
    } = this.props;

    const replicationName =
      audienceFeatureId && audienceFeature.name
        ? audienceFeature.name
        : formatMessage(messages.audienceFeatureNew);

    const breadcrumbPaths = [
      <Link
        key='1'
        to={{
          pathname: `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
          state: { activeTab: 'audience_features' },
        }}
      >
        {formatMessage(messages.audienceFeatures)}
      </Link>,
      replicationName,
    ];

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return (
      <AudienceFeatureForm
        initialValues={audienceFeature}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        schema={schema}
      />
    );
  }
}

export default compose(withRouter, injectIntl, injectNotifications)(AudienceFeatureEditPage);
