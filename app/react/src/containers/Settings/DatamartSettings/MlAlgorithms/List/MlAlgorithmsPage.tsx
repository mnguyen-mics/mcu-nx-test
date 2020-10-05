import * as React from 'react';
import { Layout, Button, message, Modal, Spin, Input, Form } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';

import { compose } from 'redux';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import MlAlgorithmResource from '../../../../../models/mlAlgorithm/MlAlgorithmResource';
import { IMlAlgorithmService } from '../../../../../services/MlAlgorithmService';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import messages from '../messages';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import moment from 'moment';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { McsIconType } from '../../../../../components/McsIcon';
import { Link } from 'react-router-dom';
import MlAlgorithmVariableResource from '../../../../../models/mlAlgorithmVariable/MlAlgorithmVariableResource';
import { IMlAlgorithmModelService } from '../../../../../services/MlAlgorithmModelService';
import { IMlAlgorithmVariableService } from '../../../../../services/MlAlgorithmVariableService';
import MlAlgorithmModelResource from '../../../../../models/mlAlgorithmModel/MlAlgorithmModelResource';
import { FormFieldWrapper } from '../../../../../components/Form';

const { Content } = Layout;

const initialMlAlgorithmForkModalData = {
  modalLoading: false,
  isModalOpen: false,
  mlAlgorithmVariables: [],
  newMlAlgorithmVariables: {},
};

const initialState = {
  loading: false,
  data: [],
  total: 0,
  mlAlgorithmForkModalData: initialMlAlgorithmForkModalData,
};

interface MlAlgorithmForkModalData {
  mlAlgorithm?: MlAlgorithmResource;
  mlAlgorithmVariables: MlAlgorithmVariableResource[];
  mlAlgorithmModel?: MlAlgorithmModelResource;
  newMlAlgorithmVariables: { [key: string]: string };
  modalLoading: boolean;
  isModalOpen: boolean;
}

interface MlAlgorithmListState {
  loading: boolean;
  data: MlAlgorithmResource[];
  total: number;
  mlAlgorithmForkModalData: MlAlgorithmForkModalData;
}

interface RouterProps {
  organisationId: string;
}

type JoinedProps = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps;

class MlAlgorithmList extends React.Component<
  JoinedProps,
  MlAlgorithmListState
> {
  @lazyInject(TYPES.IMlAlgorithmService)
  private _mlAlgorithmService: IMlAlgorithmService;

  @lazyInject(TYPES.IMlAlgorithmModelService)
  private _mlAlgorithmModelService: IMlAlgorithmModelService;

  @lazyInject(TYPES.IMlAlgorithmVariableService)
  private _mlAlgorithmVariableService: IMlAlgorithmVariableService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = initialState;
  }

  fetchMlAlgorithms = (organisationId: string, filter: Filters) => {
    const { intl } = this.props;
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._mlAlgorithmService
        .getMlAlgorithms(organisationId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        })
        .catch(err => {
          message.error(intl.formatMessage(messages.loadingError));
        });
    });
  };

  handleEditMlAlgorithm = (mlAlgorithm: MlAlgorithmResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
    } = this.props;
    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/ml_algorithms/${mlAlgorithm.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  handleArchiveMlAlgorithm = (mlAlgorithm: MlAlgorithmResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      intl,
    } = this.props;

    mlAlgorithm.archived = true;

    this._mlAlgorithmService
      .updateMlAlgorithm(mlAlgorithm.id, mlAlgorithm)
      .then(res => res.data)
      .then(mlAlgorithmArchived => {
        const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
        this.fetchMlAlgorithms(organisationId, filter);
        message.success(intl.formatMessage(messages.updateSuccess));
      })
      .catch(err => {
        message.error(intl.formatMessage(messages.updateError));
      });
  };

  forkMlAlgorithm = (mlAlgorithm: MlAlgorithmResource) => {
    this.setState({
      mlAlgorithmForkModalData: {
        ...this.state.mlAlgorithmForkModalData,
        mlAlgorithm,
        modalLoading: true,
        isModalOpen: true,
      },
    });

    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    Promise.all([
      this._mlAlgorithmModelService.getMlAlgorithmModels(
        organisationId,
        mlAlgorithm.id,
        { status: 'LIVE' },
      ),
      this._mlAlgorithmVariableService.getMlAlgorithmVariables(
        organisationId,
        mlAlgorithm.id,
      ),
    ])
      .then(res => {
        const models = res[0];
        const variables = res[1];
        if (models.total === 1) {
          this.setState({
            mlAlgorithmForkModalData: {
              ...this.state.mlAlgorithmForkModalData,
              mlAlgorithmModel: models.data[0],
            },
          });
        }

        this.setState({
          mlAlgorithmForkModalData: {
            ...this.state.mlAlgorithmForkModalData,
            modalLoading: false,
            mlAlgorithmVariables: variables.data,
            newMlAlgorithmVariables: variables.data.reduce<{
              [key: string]: string;
            }>((m, variable) => {
              m[variable.key] = variable.value;
              return m;
            }, {}),
          },
        });
      })
      .catch(error => {
        this.props.notifyError(error);
        this.setState({
          mlAlgorithmForkModalData: {
            ...this.state.mlAlgorithmForkModalData,
            modalLoading: false,
            isModalOpen: false,
          },
        });
      });
  };

  updateLocationSearch = (params: Filters) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, PAGINATION_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    const dataColumns = [
      {
        intlMessage: messages.id,
        key: 'id',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: MlAlgorithmResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${record.organisation_id}/settings/datamart/ml_algorithms/${record.id}/models`}
          >
            {record.name}
          </Link>
        ),
      },
      {
        intlMessage: messages.description,
        key: 'description',
        isHideable: false,
        render: (text: string, record: MlAlgorithmResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${record.organisation_id}/settings/datamart/ml_algorithms/${record.id}/models`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.lastUpdatedDate,
        key: 'last updated date',
        isHideable: false,
        render: (text: string, record: MlAlgorithmResource) =>
          record.last_updated_date
            ? moment(record.last_updated_date).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.lastUpdatedDate),
      },
      {
        intlMessage: messages.archived,
        key: 'archived',
        isHideable: false,
        render: (text: string, record: MlAlgorithmResource) =>
          record.archived
            ? formatMessage(messages.isArchived)
            : formatMessage(messages.notArchived),
      },
    ];

    return {
      dataColumnsDefinition: dataColumns,
    };
  };

  renderModal = () => {
    const { intl, history } = this.props;

    const redirectAndNotify = (id?: string) => {
      if (id) {
        message.success(intl.formatMessage(messages.forkSuccess));
        return history.push(
          `/v2/o/${organisationId}/settings/datamart/ml_algorithms`,
        );
      } else {
        this.setState({
          loading: false,
          mlAlgorithmForkModalData: {
            ...this.state.mlAlgorithmForkModalData,
            isModalOpen: false,
            modalLoading: false,
          },
        });
        message.error(intl.formatMessage(messages.forkError));
      }
    };

    const {
      mlAlgorithmForkModalData: {
        isModalOpen,
        mlAlgorithmVariables,
        modalLoading,
      },
    } = this.state;

    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const variableFormSection = mlAlgorithmVariables.map((variable, index) => {
      const onChange = (e: any) => {
        const v = this.state.mlAlgorithmForkModalData.newMlAlgorithmVariables;
        v[variable.key] = e.target.value;
        this.setState({
          mlAlgorithmForkModalData: {
            ...this.state.mlAlgorithmForkModalData,
            newMlAlgorithmVariables: v,
          },
        });
      };
      return (
        <FormFieldWrapper key={index} label={variable.key} small={true}>
          <Input
            key={index}
            defaultValue={variable.value}
            onChange={onChange}
            placeholder={variable.key}
          />
        </FormFieldWrapper>
      );
    });

    const onCancel = () => {
      this.setState({
        mlAlgorithmForkModalData: initialMlAlgorithmForkModalData,
      });
    };

    const onOk = () => {
      const {
        mlAlgorithmForkModalData: {
          newMlAlgorithmVariables,
          mlAlgorithm,
          mlAlgorithmModel,
        },
      } = this.state;

      this._mlAlgorithmService
        .createMlAlgorithm({
          archived: false,
          name: (mlAlgorithm as MlAlgorithmResource).name + ' (Copy)',
          description: (mlAlgorithm as MlAlgorithmResource).description,
          organisation_id: organisationId,
        })
        .then(res => res.data)
        .then(createdMlAlgorithm => {
          Promise.all(
            Object.entries(newMlAlgorithmVariables).map(([key, value], idx) => {
              this._mlAlgorithmVariableService.createMlAlgorithmVariable(
                createdMlAlgorithm.id,
                {
                  key,
                  value,
                },
              );
            }),
          );
          return createdMlAlgorithm.id;
        })
        .then(createdMlAlgorithmId => {
          return this._mlAlgorithmModelService.createMlAlgorithmModel(
            createdMlAlgorithmId,
            {
              id: undefined,
              ...mlAlgorithmModel,
            },
          );
        })
        .then(createMlAlgorithmModel => {
          this.setState({
            mlAlgorithmForkModalData: initialMlAlgorithmForkModalData,
          });
          redirectAndNotify(createMlAlgorithmModel.data.id);
        })
        .catch(err => redirectAndNotify());
    };

    return (
      <Modal
        title={intl.formatMessage(messages.forkMlAlgorithmModalTitle)}
        visible={isModalOpen}
        confirmLoading={modalLoading}
        onCancel={onCancel}
        onOk={onOk}
      >
        <Spin spinning={modalLoading}>
          <div>{intl.formatMessage(messages.forkMlAlgorithmModalSubtitle)}</div>
          <br />
          <Form layout={'vertical'}>{variableFormSection}</Form>
        </Spin>
      </Modal>
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.empty)
    };

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<
      MlAlgorithmResource
    >> = [
      {
        key: 'action',
        actions: (mlAlgorithm: MlAlgorithmResource) => [
          {
            intlMessage: messages.editMlAlgorithmRaw,
            callback: this.handleEditMlAlgorithm,
            disabled: mlAlgorithm.archived,
          },
          {
            intlMessage: messages.archive,
            callback: this.handleArchiveMlAlgorithm,
            disabled: mlAlgorithm.archived,
          },
          {
            intlMessage: messages.fork,
            callback: this.forkMlAlgorithm,
            disabled: mlAlgorithm.archived,
          },
        ],
      },
    ];

    const onClick = () => {
      history.push(
        `/v2/o/${organisationId}/settings/datamart/ml_algorithms/create`,
      );
    };

    const buttons = [
      <Button key="create" type="primary" onClick={onClick}>
        <FormattedMessage {...messages.newMlAlgorithm} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.mlAlgorithms} />
          </span>
          <span className="mcs-card-button">{buttons}</span>
        </div>
        <hr className="mcs-separator" />
      </div>
    );

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          {this.renderModal()}
          <ItemList
            fetchList={this.fetchMlAlgorithms}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={this.buildColumnDefinition().dataColumnsDefinition}
            actionsColumnsDefinition={actionsColumnsDefinition}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
          />
        </Content>
      </div>
    );
  }
}

export default compose(withRouter, injectIntl)(MlAlgorithmList);
