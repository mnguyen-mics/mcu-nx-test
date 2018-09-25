import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import OfferTypeSelector from './OfferTypeSelector';
import CreateOfferForm from './CreateOfferForm';
import messages from '../../messages';
import { OfferFormData } from '../domain';
import CatalogService from '../../../../services/CatalogService';
//import OrganisationService from '../../../../services/OrganisationService';

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

type Props = RouteComponentProps<{ organisationId: string; }> &
    CreateOfferPageProps &
    InjectedNotificationProps &
    InjectedIntlProps;

class CreateOfferPage extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
            offerType: undefined,
            offerFormData: {
                name: '',
                custom: false,
                credited_account_id: this.props.match.params.organisationId,
            },
        };
    }

    chooseOfferType = (offerType: OfferType) => {
        this.setState({ offerType: offerType });
    }

    redirect = () => {
        const {
            history,
            location: { state },
            match: {
                params: { organisationId },
            },
        } = this.props;

        const url =
            state && state.from ?
                state.from :
                `/v2/o/${organisationId}/settings/services/my_offers`;

        history.push(url);
    }

    save = (offerFormData: OfferFormData) => {
        const {
            match: {
                params: { organisationId }
            },
            notifyError,
            history,
        } = this.props;
        
        this.setState({
            loading: true,
        });

        return CatalogService.createServiceOffer(
            organisationId,
            offerFormData,
        )
        .then(offer => {
            const offerId = offer.data.id;
            const displayOfferUrl = `/v2/o/${organisationId}/settings/services/my_offers/${offerId}/service_item_conditions`;
            history.push(displayOfferUrl);
        })
        .catch(err => {
            notifyError(err);
            this.setState({
                loading: false,
            });
        });
    };

    render() {
        const {
            match: { params: { organisationId } },
        } = this.props;

        const {
            offerType,
            offerFormData,
        } = this.state;

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
            />
        }
    }

}

export default compose<Props, CreateOfferPageProps>(
    injectIntl,
    withRouter,
    injectNotifications,
)(CreateOfferPage);