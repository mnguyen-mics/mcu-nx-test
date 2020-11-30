import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Loading } from '../../../../../components';
import { Layout } from 'antd';
import { FormLayoutActionbar } from '../../../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import messages from '../messages';
import { ProcessingFormData } from '../domain';
import ProcessingEditForm, { FORM_ID } from './ProcessingEditForm';
import LegalBasisSelector from './LegalBasisSelector';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { LegalBasis, ProcessingResource } from '../../../../../models/processing';

export interface EditProcessingRouteMatchParams {
  organisationId: string;
  processingId: string;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditProcessingRouteMatchParams>;

interface State {
  loading: boolean;
  processingFormData: ProcessingFormData;
  showLegalBasisSelector: boolean;
}

class ProcessingEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      processingFormData: {},
      showLegalBasisSelector: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { processingId },
      },
      notifyError
    } = this.props;

    if (processingId) {
      this.setState({ loading: true }, () => {
        this._organisationService.getProcessing(processingId).then(resp => {
          const processingData = resp.data;
          this.setState({
            loading: false,
            processingFormData: processingData,
            showLegalBasisSelector: false,
          });
        })
        .catch(err => {
          this.setState({
            loading: false,
            processingFormData: {},
            showLegalBasisSelector: false,
          });
          notifyError(err);
        });
      });
    }
  }

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/organisation/processings`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onLegalBasisSelect = (legalBasis: LegalBasis) => {
    this.setState({
      showLegalBasisSelector: false,
      processingFormData: { legal_basis: legalBasis },
    });
  };

  save = (formData: ProcessingResource) => {
    const {
      match: {
        params: { processingId, organisationId },
      },
      notifyError
    } = this.props;

    if (processingId) {
      this.setState({ loading: true }, () => {
        this._organisationService
          .updateProcessing(processingId, formData)
          .then(_ => {
            this.setState({ loading: false });
            this.onClose();
          })
          .catch(err => {
            this.setState({ loading: false });
            notifyError(err);
          });
      });
    } else {
      this.setState({ loading: true }, () => {
        this._organisationService.getOrganisation(organisationId).then(res => {
          const communityId = res.data.community_id;
          this._organisationService
            .createProcessing(communityId, formData)
            .then(_ => {
              this.setState({ loading: false });
              this.onClose();
            })
            .catch(err => {
              this.setState({ loading: false });
              notifyError(err);
            });
        });
      });
    }
  };

  close = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/settings/organisation/processings`;

    return history.push(url);
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, processingId },
      },
    } = this.props;
    const { processingFormData, loading, showLegalBasisSelector } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const newOrEditProcessing = processingFormData.id
      ? formatMessage(messages.editProcessing)
      : formatMessage(messages.newProcessing);

    const breadCrumbPaths = [
      {
        name: formatMessage(messages.processingActivities),
        path: `/v2/o/${organisationId}/settings/organisation/processings`,
      },
      {
        name: newOrEditProcessing,
      },
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      onClose: this.onClose,
    };

    const goToLegalBasisSelector =
      processingId === undefined
        ? () => {
            this.setState({ showLegalBasisSelector: true });
          }
        : undefined;

    return !showLegalBasisSelector ? (
      <ProcessingEditForm
        initialValues={processingFormData}
        onSubmit={this.save}
        close={this.close}
        breadCrumbPaths={breadCrumbPaths}
        goToLegalBasisSelector={goToLegalBasisSelector}
      />
    ) : (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <LegalBasisSelector onSelect={this.onLegalBasisSelect} />
      </Layout>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
)(ProcessingEditPage);
