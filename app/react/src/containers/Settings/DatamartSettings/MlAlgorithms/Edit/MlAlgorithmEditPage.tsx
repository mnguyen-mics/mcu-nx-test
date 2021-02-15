import * as React from 'react';
import { RouteComponentProps, StaticContext, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IMlAlgorithmService } from '../../../../../services/MlAlgorithmService';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { message } from 'antd';
import messages from '../messages';
import { MlAlgorithmFormData, INITIAL_ML_ALGORITHM_FORM_DATA } from '../domain';
import { Loading } from '../../../../../components';
import MlAlgorithmForm from './MlAlgorithmForm';
import { IMlAlgorithmVariableService } from '../../../../../services/MlAlgorithmVariableService';
import MlAlgorithmVariableResource from '../../../../../models/mlAlgorithmVariable/MlAlgorithmVariableResource';
import { FormLinkedTextInputModel } from '../../../../../components/Form/FormProperties';

interface MlAlgorithmCreateEditState {
  loading: boolean;
  mlAlgorithmFormData: MlAlgorithmFormData;
}

type Props = InjectedDrawerProps &
  RouteComponentProps<{
    organisationId: string;
    mlAlgorithmId: string;
  }, StaticContext, { from?: string }> &
  InjectedIntlProps;

class MlAlgorithmEditPage extends React.Component<
  Props,
  MlAlgorithmCreateEditState
> {
  @lazyInject(TYPES.IMlAlgorithmService)
  private _mlAlgorithmService: IMlAlgorithmService;

  @lazyInject(TYPES.IMlAlgorithmVariableService)
  private _mlAlgorithmVariableService: IMlAlgorithmVariableService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      mlAlgorithmFormData: INITIAL_ML_ALGORITHM_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, mlAlgorithmId },
      },
    } = this.props;

    if (mlAlgorithmId) {
      this.loadInitialValues(organisationId, mlAlgorithmId);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId, mlAlgorithmId },
      },
    } = this.props;

    const {
      match: {
        params: {
          organisationId: previousOrganisationId,
          mlAlgorithmId: previousMlAlgorithmId,
        },
      },
    } = previousProps;

    if (
      mlAlgorithmId !== previousMlAlgorithmId ||
      organisationId !== previousOrganisationId
    ) {
      this.setState({
        loading: true,
      });
      this.loadInitialValues(organisationId, mlAlgorithmId);
    }
  }

  variablesToKeyValues = (
    variables: MlAlgorithmVariableResource[],
  ): FormLinkedTextInputModel[] => {
    return variables.map(variable => {
      return {
        leftValue: variable.key,
        rightValue: variable.value,
      };
    });
  };

  loadInitialValues(organisationId: string, mlAlgorithmId: string) {
    const { intl } = this.props;
    if (mlAlgorithmId) {
      this._mlAlgorithmService
        .getMlAlgorithm(mlAlgorithmId)
        .then(mlAlgorithmData => mlAlgorithmData.data)
        .then(mlAlgorithm => {
          this.setState({
            loading: true,
            mlAlgorithmFormData: {
              mlAlgorithm: mlAlgorithm,
              mlAlgorithmVariables: [],
              mlAlgorithmVariablesKeyValues: [],
            },
          });
        })
        .then(() => {
          return this._mlAlgorithmVariableService.getMlAlgorithmVariables(
            organisationId,
            mlAlgorithmId,
          );
        })
        .then(mlAlgorithmVariablesData => mlAlgorithmVariablesData.data)
        .then(mlAlgorithmVariables => {
          const newMlAlgorithmFormData: MlAlgorithmFormData = {
            mlAlgorithm: this.state.mlAlgorithmFormData.mlAlgorithm,
            mlAlgorithmVariables: mlAlgorithmVariables,
            mlAlgorithmVariablesKeyValues: this.variablesToKeyValues(
              mlAlgorithmVariables,
            ),
          };
          this.setState({
            mlAlgorithmFormData: newMlAlgorithmFormData,
            loading: false,
          });
        })
        .catch(err => {
          message.error(intl.formatMessage(messages.loadingError));
        });
    } else {
      this.setState({ loading: false });
    }
  }

  save = (formData: MlAlgorithmFormData) => {
    const redirectAndNotify = (id?: string) => {
      if (id) {
        hideSaveInProgress();
        message.success(intl.formatMessage(messages.updateSuccess));
        return history.push(
          `/v2/o/${organisationId}/settings/datamart/ml_algorithms`,
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

    const { mlAlgorithmFormData } = this.state;

    const keyToIds: { [key: string]: string } = {};
    const previousIds: string[] = [];
    const previousKeys: string[] = [];
    mlAlgorithmFormData.mlAlgorithmVariables.forEach(variable => {
      if (variable.key && variable.id) {
        keyToIds[variable.key] = variable.id;
        previousIds.push(variable.id);
        previousKeys.push(variable.key);
      }
    });

    const newMlAlgorithmVariables: Array<Partial<
      MlAlgorithmVariableResource
    >> = formData.mlAlgorithmVariablesKeyValues
      .filter(entry => entry.leftValue !== '')
      .map(entry => {
        return {
          key: entry.leftValue,
          value: entry.rightValue,
          ml_algorithm_id: formData.mlAlgorithm.id || undefined,
          id: previousKeys.includes(entry.leftValue)
            ? keyToIds[entry.leftValue]
            : undefined,
        };
      });

    this.setState({ loading: true });

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    const newFormDataMlAlgorithm = {
      ...formData.mlAlgorithm,
      organisation_id: organisationId,
    };

    if (mlAlgorithmId) {
      this._mlAlgorithmService
        .updateMlAlgorithm(mlAlgorithmId, newFormDataMlAlgorithm)
        .then(res => res.data)
        .then(mlAlgorithmUpdated => {
          return Promise.all(
            newMlAlgorithmVariables.map(variable => {
              if (variable.id) {
                return this._mlAlgorithmVariableService.updateMlAlgorithmVariable(
                  mlAlgorithmId,
                  variable.id,
                  variable,
                );
              } else {
                return this._mlAlgorithmVariableService.createMlAlgorithmVariable(
                  mlAlgorithmId,
                  variable,
                );
              }
            }),
          );
        })
        .then(mlAlgorithmVariablesData => {
          return mlAlgorithmVariablesData.map(res => res.data.id);
        })
        .then(mlAlgorithmVariableIds => {
          return (previousIds as string[]).filter(
            id => !mlAlgorithmVariableIds.includes(id),
          );
        })
        .then(toDeleteIds => {
          Promise.all(
            (toDeleteIds as string[]).map(remainingId =>
              this._mlAlgorithmVariableService.deleteMlAlgorithmVariable(
                mlAlgorithmId,
                remainingId,
              ),
            ),
          );
        })
        .then(() => redirectAndNotify(mlAlgorithmId))
        .catch(err => {
          redirectAndNotify();
        });
    } else {
      this._mlAlgorithmService
        .createMlAlgorithm(newFormDataMlAlgorithm)
        .then(res => res.data)
        .then(mlAlgorithmCreated => {
          return mlAlgorithmCreated.id;
        })
        .then(createdMlAlgorithmId => {
          Promise.all(
            newMlAlgorithmVariables.map(variable =>
              this._mlAlgorithmVariableService.createMlAlgorithmVariable(
                createdMlAlgorithmId,
                variable,
              ),
            ),
          );
          return createdMlAlgorithmId;
        })
        .then(id => redirectAndNotify(id))
        .catch(err => {
          redirectAndNotify();
        });
    }
  };

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
        : `/v2/o/${organisationId}/settings/datamart/ml_algorithms`;

    return history.push(url);
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, mlAlgorithmId },
      },
    } = this.props;

    const { loading, mlAlgorithmFormData } = this.state;

    const name = mlAlgorithmId
      ? formatMessage(messages.editMlAlgorithm, {
          name: mlAlgorithmFormData.mlAlgorithm.name
            ? mlAlgorithmFormData.mlAlgorithm.name
            : formatMessage(messages.mlAlgorithms),
        })
      : formatMessage(messages.newMlAlgorithm);

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.mlAlgorithms),
        path: `/v2/o/${organisationId}/settings/datamart/ml_algorithms`,
      },
      { name },
    ];

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    return (
      <MlAlgorithmForm
        initialValues={this.state.mlAlgorithmFormData}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose(withRouter, injectIntl)(MlAlgorithmEditPage);
