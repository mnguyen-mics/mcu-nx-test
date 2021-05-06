import * as React from 'react';
import { compose } from 'recompose';
import AudienceBuilderForm from './AudienceBuilderForm';
import { RouteComponentProps, withRouter } from 'react-router';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IAudienceBuilderService } from '../../../../../services/AudienceBuilderService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import { AudienceBuilderFormData, INITIAL_AUDIENCE_BUILDER_FORM_DATA } from './domain';
import { message } from 'antd';
import { Loading } from '../../../../../components';
import { Link } from 'react-router-dom';

type Props = InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{
    datamartId: string;
    organisationId: string;
    audienceBuilderId: string;
  }>;

interface State {
  isLoading: boolean;
  builderFormData: AudienceBuilderFormData;
}

class AudienceBuilderEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      builderFormData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, audienceBuilderId },
      },
      notifyError,
    } = this.props;

    if (audienceBuilderId) {
      this.setState({
        isLoading: true,
      });
      this._audienceBuilderService
        .loadAudienceBuilder(datamartId, audienceBuilderId)
        .then((formData: AudienceBuilderFormData) => {
          this.setState({
            builderFormData: formData,
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
  }

  save = (formData: AudienceBuilderFormData) => {
    const {
      match: {
        params: { organisationId, audienceBuilderId, datamartId },
      },
      notifyError,
      history,
      intl,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.audienceBuilderSavingInProgress),
      0,
    );

    this.setState({
      isLoading: true,
    });

    const newFormData = {
      ...formData.audienceBuilder,
    };

    const demographics = formData.audienceFeatureDemographics;

    if (demographics) {
      newFormData.demographics_features_ids = demographics.map(d => d.model.id);
    }

    const promise = audienceBuilderId
      ? this._audienceBuilderService.updateAudienceBuilder(
          datamartId,
          audienceBuilderId,
          newFormData,
        )
      : this._audienceBuilderService.createAudienceBuilder(datamartId, newFormData);
    promise
      .then(() => {
        hideSaveInProgress();
        history.push({
          pathname: `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
          state: {
            activeTab: 'segment_builder',
          },
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
        activeTab: 'segment_builder',
      },
    });
  };

  render() {
    const { builderFormData, isLoading } = this.state;
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, datamartId, audienceBuilderId },
      },
    } = this.props;

    const existingBuilderName = builderFormData.audienceBuilder.name;

    const builderName =
      audienceBuilderId && existingBuilderName
        ? existingBuilderName
        : formatMessage(messages.audienceBuilderNew);

    const breadcrumbPaths = [
      <Link
        key='1'
        to={{
          pathname: `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
          state: { activeTab: 'segment_builder' },
        }}
      >
        {formatMessage(messages.audienceBuilders)}
      </Link>,
      builderName,
    ];

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return (
      <AudienceBuilderForm
        initialValues={builderFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose(withRouter, injectIntl, injectNotifications)(AudienceBuilderEditPage);
