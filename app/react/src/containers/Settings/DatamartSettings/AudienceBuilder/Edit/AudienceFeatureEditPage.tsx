import * as React from 'react';
import { compose } from 'recompose';
import AudienceFeatureForm from './AudienceFeatureForm';
import { RouteComponentProps, withRouter } from 'react-router';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IAudienceFeatureService } from '../../../../../services/AudienceFeatureService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import { AudienceFeatureFormData } from './domain';
import { IRuntimeSchemaService } from '../../../../../services/RuntimeSchemaService';
import { computeFinalSchemaItem, SchemaItem } from '../../../../QueryTool/JSONOTQL/domain';
import { message } from 'antd';
import { Loading } from '../../../../../components';
import { Link } from 'react-router-dom';

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
      notifyError,
    } = this.props;
    if (audienceFeatureId) {
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

  save = (formData: AudienceFeatureFormData) => {
    const {
      match: {
        params: { organisationId, audienceFeatureId, datamartId },
      },
      notifyError,
      history,
      intl,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.audienceFeatureSavingInProgress),
      0,
    );

    this.setState({
      isLoading: true,
    });

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
      newFormData.object_tree_expression = objectTreeExpression.toLowerCase();
    }

    const promise = audienceFeatureId
      ? this._audienceFeatureService.updateAudienceFeature(
          datamartId,
          audienceFeatureId,
          newFormData,
        )
      : this._audienceFeatureService.createAudienceFeature(datamartId, newFormData);
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
