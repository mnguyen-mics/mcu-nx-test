import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { AttributionModelFormData } from './domain';

import messages from './messages';
import AttributionModelFormService from './AttributionModelFormService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import AttributionModelForm from './AttributionModelForm';

interface AttributionModelRouteParam {
  organisationId: string;
  attributionModelId?: string;
}

interface State {
  isLoading: boolean;
}

type Props = RouteComponentProps<AttributionModelRouteParam> &
  InjectedNotificationProps &
  InjectedIntlProps;

class EditAttributionModelPage extends React.Component<Props, State> {
  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/library/attribution_models`;
    history.push(attributionModelUrl);
  };

  saveOrCreatePluginInstance = (formData: AttributionModelFormData) => {
    const {
      match: { params: { organisationId } },
      history,
      notifyError,
    } = this.props;

    this.setState({ isLoading: true });
    AttributionModelFormService.saveOrCreatePluginInstance(
      organisationId,
      formData,
    )
      .then(res => {
        this.setState({ isLoading: false });
        history.push(`/v2/o/${organisationId}/library/attribution_models`);
      })
      .catch(err => {
        notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  render() {
    const {
      intl: { formatMessage },
      match: { params: { attributionModelId } },
    } = this.props;

    const { isLoading } = this.state;

    const breadcrumbPaths = [
      { name: formatMessage(messages.attributionModelBreadcrumb) },
    ];

    return (
      <AttributionModelForm
        save={this.saveOrCreatePluginInstance}
        close={this.redirect}
        attributionId={attributionModelId}
        breadcrumbPaths={breadcrumbPaths}
        isLoading={isLoading}
      />
    );
  }
}

export default compose(withRouter, injectNotifications, injectIntl)(
  EditAttributionModelPage,
);
