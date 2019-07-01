import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IMlAlgorithmService } from '../../../../../services/MlAlgorithmService';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import MlAlgorithmResource from '../../../../../models/mlAlgorithm/MlAlgorithmResource';
import messages from '../messages';
import { INITIAL_ML_ALGORITHM_FORM_DATA } from '../domain';
import { Loading } from '../../../../../components';
import MlAlgorithmEditForm from './MlAlgorithmEditForm';


interface MlAlgorithmCreateEditState {
    loading: boolean;
    mlAlgorithm: Partial<MlAlgorithmResource>;
}

type Props = InjectedDrawerProps &
  RouteComponentProps<{
    organisationId: string;
    mlAlgorithmId: string;
  }> &
  InjectedIntlProps;

class CreateEditMlAlgorithm extends React.Component<Props, MlAlgorithmCreateEditState> {
    @lazyInject(TYPES.IMlAlgorithmService)
    private _mlAlgorithmService: IMlAlgorithmService;
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
            mlAlgorithm: INITIAL_ML_ALGORITHM_FORM_DATA
        }
    }

    componentDidMount() {
        const {
            match: {
                params: { organisationId, mlAlgorithmId }
            }
        } = this.props;

        if (mlAlgorithmId) {
            this.loadInitialValues(organisationId, mlAlgorithmId);
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const {
            match: {
                params: { organisationId, mlAlgorithmId }
            }
        } = this.props;
        const {
            match: {
                params: { organisationId: nextOrganisationId, mlAlgorithmId: nextMlAlgorithmId }
            }
        } = nextProps


        if (mlAlgorithmId !== nextMlAlgorithmId || organisationId !== nextOrganisationId) {
            this.setState({
                loading: true,
              });
            this.loadInitialValues(nextOrganisationId, nextMlAlgorithmId)
        }
    }

    loadInitialValues(organisationId: string, mlAlgorithmId: string) {
        if (mlAlgorithmId) {
            this._mlAlgorithmService
                .getMlAlgorithm(organisationId, mlAlgorithmId)
                .then(mlAlgorithmData => mlAlgorithmData.data)
                .then(mlAlgorithm => {
                    this.setState({ mlAlgorithm, loading: false })
                });
        } else {
            this.setState({ loading: false });
        }
    }

    save() {
        return;
    }

    close() {
        return;
    }

    render() {
        const {
            intl: { formatMessage },
            match: {
                params: { organisationId, mlAlgorithmId }
            }
        } = this.props;

        const { loading, mlAlgorithm } = this.state;

        const name = mlAlgorithmId
            ? formatMessage(messages.editMlAlgorithm, {
                name: mlAlgorithm.name ? mlAlgorithm.name : formatMessage(messages.mlAlgorithms)
            }) 
            : formatMessage(messages.newMlAlgorithm)

        const breadcrumbPaths = [
            {
                name: formatMessage(messages.mlAlgorithms),
                path: `/v2/o/${organisationId}/settings/organisation/ml_algorithms`
            },
            { name }
        ]

        if (loading) {
            return <Loading className="loading-full-screen" />;
        }

    
        return (
            <MlAlgorithmEditForm
                initialValues={this.state.mlAlgorithm}
                onSave={this.save}
                onClose={this.close}
                breadCrumbPaths={breadcrumbPaths}
            />
        )
    }
}

export default compose(
    withRouter,
    injectIntl,
)(CreateEditMlAlgorithm)