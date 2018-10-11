import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import OfferTypeSelector from './OfferTypeSelector';
import CreateOfferForm from './CreateOfferForm';
import messages from '../../messages';
import { OfferFormData, INITIAL_SERVICE_OFFER_FORM_DATA } from '../domain';
import ServiceOfferPageService from '../ServiceOfferPageService';
import { Loading } from '../../../../components';

export enum OfferType {
  Automatic,
  Manual
}

interface State {
  loading: boolean;
  offerType?: OfferType;
  offerFormData: OfferFormData;
}

interface CreateOfferPageProps {
}

type Props = RouteComponentProps<{ organisationId: string; offerId?: string }> &
  CreateOfferPageProps &
  InjectedNotificationProps &
  InjectedIntlProps;

class CreateOfferPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      offerType: undefined,
      offerFormData: INITIAL_SERVICE_OFFER_FORM_DATA,
    };
  }

  componentDidMount() {
    const { match: { params: { organisationId, offerId } } } = this.props;

    if (offerId) {
      ServiceOfferPageService.loadOffer(organisationId, offerId)
        .then(formData => {
          this.setState({
            loading: false,
            offerType: (formData.offer.automatic_on === null) ? OfferType.Manual : OfferType.Automatic,
            offerFormData: formData,
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        })
    } else {
      this.setState({ loading: false });
    }
  }



  chooseOfferType = (offerType: OfferType) => {
    this.setState({ offerType: offerType });
  }

  redirect = () => {
    const {
      history,
      location: { state },
      match: {
        params: { organisationId, offerId },
      },
    } = this.props;

    const defaultRedirectUrl = offerId ?
      `/v2/o/${organisationId}/settings/services/my_offers/${offerId}/service_item_conditions` :
      `/v2/o/${organisationId}/settings/services/my_offers`;

    const url =
      state && state.from ?
        state.from :
        defaultRedirectUrl;

    history.push(url);
  }

  save = (offerFormData: OfferFormData) => {

    const {
      match: {
        params: {
          organisationId,
        }
      },
      notifyError,
      history,
    } = this.props;

    const { offerFormData: initialOfferFormData } = this.state;

    this.setState({
      loading: true,
    });

    ServiceOfferPageService.createOrUpdateServiceOffer(
      organisationId,
      offerFormData,
      initialOfferFormData,
    ).then(
      returnedOfferId => {
        const displayOfferUrl = `/v2/o/${organisationId}/settings/services/my_offers/${returnedOfferId}/service_item_conditions`;
        this.setState({
          loading: false,
        });
        history.push(displayOfferUrl);
      }
    )
      .catch(err => {
        notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const {
      match: { params: { organisationId, offerId} },
    } = this.props;

    const {
      offerType,
      offerFormData,
      loading,
    } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const resetOfferType = (offerId === undefined) ?
    () => {
      this.setState({ offerType: undefined});
    } :
    undefined;

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle,
        path: `/v2/o/${organisationId}/settings/services/my_offers`,
      },
      {
        name: messages.newOffer,
      },
    ];

    if (offerType === undefined) {
      return <OfferTypeSelector
        onSelect={this.chooseOfferType}
        close={this.redirect}
        breadCrumbPaths={breadcrumbPaths}
      />
    }
    else {

      return <CreateOfferForm
        initialValues={offerFormData}
        offerType={offerType}
        onSubmit={this.save}
        close={this.redirect}
        breadCrumbPaths={breadcrumbPaths}
        goToOfferTypeSelection={resetOfferType}
      />
    }
  }

}

export default compose<Props, CreateOfferPageProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(CreateOfferPage);