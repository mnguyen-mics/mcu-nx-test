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
    standardSegmentBuilderId: string;
  }>;

interface State {
  isLoading: boolean;
  builderFormData: StandardSegmentBuilderFormData;
}

class StandardSegmentBuilderEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IStandardSegmentBuilderService)
  private _standardSegmentBuilderService: IStandardSegmentBuilderService;

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
        params: { datamartId, standardSegmentBuilderId },
      },
      notifyError,
    } = this.props;

    if (standardSegmentBuilderId) {
      this.setState({
        isLoading: true,
      });
      this._standardSegmentBuilderService
        .loadStandardSegmentBuilder(datamartId, standardSegmentBuilderId)
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
        params: { organisationId, standardSegmentBuilderId, datamartId },
      },
      notifyError,
      history,
      intl,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.standardSegmentBuilderSavingInProgress),
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

    const promise = standardSegmentBuilderId
      ? this._standardSegmentBuilderService.updateStandardSegmentBuilder(
          datamartId,
          standardSegmentBuilderId,
          newFormData,
        )
      : this._standardSegmentBuilderService.createStandardSegmentBuilder(datamartId, newFormData);
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
        params: { organisationId, datamartId, standardSegmentBuilderId },
      },
    } = this.props;

    const existingBuilderName = builderFormData.standardSegmentBuilder.name;

    const builderName =
      standardSegmentBuilderId && existingBuilderName
        ? existingBuilderName
        : formatMessage(messages.standardSegmentBuilderNew);

    const breadcrumbPaths = [
      <Link
        key='1'
        to={{
          pathname: `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`,
          state: { activeTab: 'segment_builder' },
        }}
      >
        {formatMessage(messages.standardSegmentBuilders)}
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
