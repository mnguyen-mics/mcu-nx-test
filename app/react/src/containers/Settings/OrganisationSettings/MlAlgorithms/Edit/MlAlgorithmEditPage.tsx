import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IMlAlgorithmService } from '../../../../../services/MlAlgorithmService';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import MlAlgorithmResource from '../../../../../models/mlAlgorithm/MlAlgorithmResource';
import { message } from 'antd';
import messages from '../messages';
import { INITIAL_ML_ALGORITHM_FORM_DATA } from '../domain';
import { Loading } from '../../../../../components';
import MlAlgorithmForm from './MlAlgorithmForm';


interface MlAlgorithmCreateEditState {
    loading: boolean;
    mlAlgorithmFormData: Partial<MlAlgorithmResource>;
}

type Props = InjectedDrawerProps &
  RouteComponentProps<{
    organisationId: string;
    mlAlgorithmId: string;
  }> &
  InjectedIntlProps;

class MlAlgorithmEditPage extends React.Component<Props, MlAlgorithmCreateEditState> {
    @lazyInject(TYPES.IMlAlgorithmService)
    private _mlAlgorithmService: IMlAlgorithmService;
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
            mlAlgorithmFormData: INITIAL_ML_ALGORITHM_FORM_DATA
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
        const {
            intl,
        } = this.props;
        if (mlAlgorithmId) {
            this._mlAlgorithmService
                .getMlAlgorithm(organisationId, mlAlgorithmId)
                .then(mlAlgorithmData => mlAlgorithmData.data)
                .then(mlAlgorithm => {
                    this.setState({ mlAlgorithmFormData: mlAlgorithm, loading: false })
                })
                .catch((err) => {
                    message.error(intl.formatMessage(messages.loadingError));
                });
        } else {
            this.setState({ loading: false });
        }
    }

    save = (formData: Partial<MlAlgorithmResource>) => {
        const redirectAndNotify = (id?: string) => {
            if (id) {
              hideSaveInProgress();
              message.success(intl.formatMessage(messages.updateSuccess));
              return history.push(
                `/v2/o/${organisationId}/settings/organisation/ml_algorithms`,
              );
            } else {
              hideSaveInProgress();
              this.setState({
                loading: false,
              });
              message.error(intl.formatMessage(messages.updateError));
            }
          };

        const {
            history,
            match: {
              params: { mlAlgorithmId, organisationId },
            },
            intl,
        } = this.props;

        this.setState({ loading: true });

        const hideSaveInProgress = message.loading(
            intl.formatMessage(messages.savingInProgress),
            0,
        );

        

        if (mlAlgorithmId) {
            this._mlAlgorithmService
                .updateMlAlgorithm(organisationId, mlAlgorithmId, formData)
                .then((res) => res.data)
                .then(mlAlgorithmUdpated => {
                    redirectAndNotify(mlAlgorithmId)
                })
                .catch(err => {
                    redirectAndNotify();
                });
        } else {
            this._mlAlgorithmService
                .createMlAlgorithm(organisationId, formData)
                .then((res) => res.data)
                .then(mlAlgorithmCreated => {
                    redirectAndNotify(mlAlgorithmCreated.id)
                })
                .catch(err => {
                    redirectAndNotify();
                });
        }

    }

    close = () => {
        const {
          history,
          location,
          match: {
            params: { organisationId },
          },
        } = this.props;
    
        const url =
          location.state && location.state.from
            ? location.state.from
            : `/v2/o/${organisationId}/settings/organisation/ml_algorithms`;
    
        return history.push(url);
      };

    render() {
        const {
            intl: { formatMessage },
            match: {
                params: { organisationId, mlAlgorithmId }
            }
        } = this.props;

        const { loading, mlAlgorithmFormData } = this.state;

        const name = mlAlgorithmId
            ? formatMessage(messages.editMlAlgorithm, {
                name: mlAlgorithmFormData.name ? mlAlgorithmFormData.name : formatMessage(messages.mlAlgorithms)
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
            <MlAlgorithmForm
                initialValues={this.state.mlAlgorithmFormData}
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
)(MlAlgorithmEditPage)