import * as React from 'react';
import { compose } from 'recompose';
import StandardSegmentBuilderForm from './StandardSegmentBuilderForm';
import { RouteComponentProps, withRouter } from 'react-router';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IStandardSegmentBuilderService } from '../../../../../services/StandardSegmentBuilderService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import { StandardSegmentBuilderFormData, INITIAL_STANDARD_SEGMENT_BUILDER_FORM_DATA } from './domain';
import { message } from 'antd';
import { Loading } from '../../../../../components';
import { Link } from 'react-router-dom';

type Props = InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{
    datamartId: string;
    organisationId: string;
    StandardSegmentBuilderId: string;
  }>;

interface State {
  isLoading: boolean;
  builderFormData: StandardSegmentBuilderFormData;
}

class StandardSegmentBuilderEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IStandardSegmentBuilderService)
  private _audienceBuilderService: IStandardSegmentBuilderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      builderFormData: INITIAL_STANDARD_SEGMENT_BUILDER_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, StandardSegmentBuilderId },
      },
      notifyError,
    } = this.props;

    if (StandardSegmentBuilderId) {
      this.setState({
        isLoading: true,
      });
      this._audienceBuilderService
        .loadStandardSegmentBuilder(datamartId, StandardSegmentBuilderId)
        .then((formData: StandardSegmentBuilderFormData) => {
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

  save = (formData: StandardSegmentBuilderFormData) => {
    const {
      match: {
        params: { organisationId, StandardSegmentBuilderId, datamartId },
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
      ...formData.standardSegmentBuilder,
    };

    const demographics = formData.initialAudienceFeatures;

    if (demographics) {
      newFormData.demographics_features_ids = demographics.map(d => d.model.id);
    }

    const promise = StandardSegmentBuilderId
      ? this._audienceBuilderService.updateStandardSegmentBuilder(
          datamartId,
          StandardSegmentBuilderId,
          newFormData,
        )
      : this._audienceBuilderService.createStandardSegmentBuilder(datamartId, newFormData);
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
        params: { organisationId, datamartId, StandardSegmentBuilderId },
      },
    } = this.props;

    const existingBuilderName = builderFormData.standardSegmentBuilder.name;

    const builderName =
      StandardSegmentBuilderId && existingBuilderName
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
      <StandardSegmentBuilderForm
        initialValues={builderFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose(withRouter, injectIntl, injectNotifications)(StandardSegmentBuilderEditPage);
