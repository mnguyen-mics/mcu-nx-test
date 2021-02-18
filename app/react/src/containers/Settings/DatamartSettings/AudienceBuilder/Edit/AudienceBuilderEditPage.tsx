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
import { AudienceBuilderFormData } from './domain';
import { message } from 'antd';
import { Loading } from '../../../../../components';

type Props = InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{
    datamartId: string;
    organisationId: string;
    audienceBuilderId: string;
  }>;

interface State {
  isLoading: boolean;
  audienceBuilder: AudienceBuilderFormData;
}

class AudienceBuilderEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      audienceBuilder: {},
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
        .getAudienceBuilder(datamartId, audienceBuilderId)
        .then(res => {
          this.setState({
            audienceBuilder: res.data,
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
      ...formData,
    };

    const promise = audienceBuilderId
      ? this._audienceBuilderService.updateAudienceBuilder(
          datamartId,
          audienceBuilderId,
          newFormData,
        )
      : this._audienceBuilderService.createAudienceBuilder(
          datamartId,
          newFormData,
        );
    promise
      .then(() => {
        hideSaveInProgress();
        history.push(
          `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
        );
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
        activeTab: 'Replications',
      },
    });
  };

  render() {
    const { audienceBuilder, isLoading } = this.state;
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, datamartId, audienceBuilderId },
      },
    } = this.props;

    const replicationName =
      audienceBuilderId && audienceBuilder.name
        ? audienceBuilder.name
        : formatMessage(messages.audienceBuilderNew);

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.audienceBuilders),
        path: `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
        state: { activeTab: 'Audience Builder' },
      },
      {
        name: replicationName,
      },
    ];

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return (
      <AudienceBuilderForm
        initialValues={audienceBuilder}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
)(AudienceBuilderEditPage);
