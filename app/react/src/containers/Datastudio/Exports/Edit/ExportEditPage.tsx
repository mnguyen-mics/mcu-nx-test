import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { message } from 'antd';

import {
  INITIAL_EXPORTS_FORM_DATA,
  ExportFormData,
} from './domain';

import ExportsService from '../../../../services/Library/ExportsService';
import QueryService from '../../../../services/QueryService';

import ExportEditForm from './ExportEditForm';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart/index';
import { injectDrawer } from '../../../../components/Drawer/index';
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { notifyError } from '../../../../state/Notifications/actions';
import { Loading } from '../../../../components/index';
import { QueryResource } from '../../../../models/datamart/DatamartResource';

const messages = defineMessages({
  newExports: {
    id: 'form.new.export',
    defaultMessage: 'New Export',
  },
  exports: {
    id: 'edit.exports.title',
    defaultMessage: 'Exports',
  },
  editExports: {
    id: 'edit.exports',
    defaultMessage: 'Edit {name}',
  },
  updateSuccess: {
    id: 'edit.exports.success.message',
    defaultMessage: 'Exports successfully saved ',
  },
  updateError: {
    id: 'edit.exports.list.error.message',
    defaultMessage: 'Exports update failed ',
  },
  savingInProgress: {
    id: 'form.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },
});

interface ExportEditPageState {
  export: ExportFormData;
  loading: boolean;
}

type Props = InjectDrawerProps &
  RouteComponentProps<{ organisationId: string; exportId: string }> &
  InjectedIntlProps &
  InjectedDatamartProps;

class ExportEditPage extends React.Component<Props, ExportEditPageState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      export: INITIAL_EXPORTS_FORM_DATA,
      loading: false,
    };
  }

  componentDidMount() {
    const { match: { params: { exportId } }, datamart } = this.props;
    const isSelectorQL = this.props.datamart.storage_model_version === 'v201506'
    if (exportId) {
      ExportsService.getExport(exportId)
        .then(exportData => exportData.data)
        .then(res => {
          return QueryService.getQuery(datamart.id, res.query_id)
            .then(q => q.data)
            .then(q => {
              this.setState({
                export: {
                  export: res,
                  query: isSelectorQL ? this.generateV1Query(q.id) : q,
                },
                loading: false,
              })
            })
        });
    } else {
      this.setState({ export: { ...this.state.export, query: isSelectorQL ? this.generateV1Query() : null } })
    }
  }

  generateV1Query = (queryId?: string) => {

    const QueryContainer = (window as any).angular.element(document.body).injector().get('core/datamart/queries/QueryContainer')
    const MyQueryContainer = queryId ? new QueryContainer(this.props.datamart.id, queryId) : new QueryContainer(this.props.datamart.id)
    if (queryId) MyQueryContainer.load()
    return MyQueryContainer
  }

  close = () => {
    const { history, match: { params: { organisationId } } } = this.props;

    const url = `/v2/o/${organisationId}/datastudio/exports`;

    return history.push(url);
  };

  save = (formData: ExportFormData) => {
    const {
      match: { params: { exportId, organisationId } },
      datamart,
      intl,
    } = this.props;

    this.setState({
      loading: true,
    });
    const redirectAndNotify = (success: boolean = false) => {
      if (success)
        this.close();

      this.setState({
        loading: false,
      });
      hideSaveInProgress();
      success
        ? message.success(intl.formatMessage(messages.updateSuccess))
        : message.error(intl.formatMessage(messages.updateError));
    };

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    const generatesSaveMethod = () => {
      if (exportId) {
        const generateQuerySaveMethod = () => {
          return datamart.storage_model_version === 'v201506' ?
            this.state.export.query.saveOrUpdate() :
            QueryService.updateQuery(datamart.id, this.state.export.query.id, formData.query).then(res => res.data)
        }

        return generateQuerySaveMethod()
          .then((res: QueryResource) => {
            return ExportsService.updateExport(exportId, formData.export)
          })
      } else {
        const generateQuerySaveMethod = () => {
          return datamart.storage_model_version === 'v201506' ?
            this.state.export.query.saveOrUpdate() :
            QueryService.createQuery(datamart.id, {
              ...formData.query,
              datamart_id: datamart.id,
              query_language: 'OTQL',
            }).then(res => res.data)
        }
        return generateQuerySaveMethod()
          .then((res: QueryResource) => {
            return ExportsService.createExport(organisationId, { ...formData.export, query_id: res.id })
          })
      }
    }


    generatesSaveMethod()
      .then(() => {
        redirectAndNotify(true);
      })
      .catch((err: any) => {
        redirectAndNotify();
        notifyError(err);
      });
  };

  render() {
    const {
      intl: { formatMessage },
      match: { params: { organisationId, exportId } },
    } = this.props;
    const { loading } = this.state;

    const exportName = exportId
      ? formatMessage(messages.editExports, {
        name: this.state.export.export.name
          ? this.state.export.export.name
          : formatMessage(messages.exports),
      })
      : formatMessage(messages.newExports);
    const breadcrumbPaths = [
      {
        name: formatMessage(messages.exports),
        url: `/v2/o/${organisationId}/datastudio/exports`,
      },
      {
        name: exportName,
      },
    ];

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
      <ExportEditForm
        initialValues={this.state.export}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectDatamart,
)(ExportEditPage);
