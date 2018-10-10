import * as React from 'react';
import * as moment from 'moment';
import queryString from 'query-string';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { DatamartSelector } from '../../Datamart';
import SelectorQLBuilderContainer from '../../QueryTool/SelectorQL/SelectorQLBuilderContainer';
import OTQLConsoleContainer from '../../QueryTool/OTQL/OTQLConsoleContainer';
import SaveQueryAsActionBar from '../../QueryTool/SaveAs/SaveQueryAsActionBar';
import { QueryContainer } from '../../QueryTool/SelectorQL/AngularQueryToolWidget';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import AudienceSegmentService from '../../../services/AudienceSegmentService';
import { NewExportSimpleFormData } from '../../QueryTool/SaveAs/NewExportSimpleForm';
import ExportService from '../../../services/Library/ExportService';

export interface QueryToolPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: any;
}

type Props = RouteComponentProps<QueryToolPageRouteParams> &
  MapStateToProps &
  InjectedIntlProps;

const messages = defineMessages({
  queryBuilder: {
    id: 'query-builder-page-actionbar-title',
    defaultMessage: 'Query Tool',
  },
})

class QueryToolPage extends React.Component<Props> {

  getSelectedDatamart = () => {
    const { connectedUser, location } = this.props;
    let selectedDatamart: DatamartResource | undefined;

    const orgWp = connectedUser.workspaces.find(
      (w: any) => w.organisation_id === this.props.match.params.organisationId,
    );

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    if (orgWp.datamarts && orgWp.datamarts.length === 1) {
      selectedDatamart = orgWp.datamarts[0];
    }

    if (datamartIdQueryString) {
      selectedDatamart = orgWp.datamarts.find(
        (d: DatamartResource) => d.id === datamartIdQueryString,
      );
    }
    return selectedDatamart;
  }

  render() {
    const { intl, location, history, match } = this.props;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      history.push({
        pathname: location.pathname,
        search: queryString.stringify({ datamartId: selection.id }),
      });
    };

    const selectedDatamart = this.getSelectedDatamart();

    const selectorQLActionbar = (
      query: QueryContainer | null,
      datamartId: string,
    ) => {
      const saveAsUserQuery = (segmentFormData: NewUserQuerySimpleFormData) => {
        if (!query) return Promise.reject(new Error("angular query container isn't loaded correctly"));
        return query.saveOrUpdate().then(queryResource => {
          const { name, technical_name, persisted } = segmentFormData;
          const userQuerySegment: Partial<UserQuerySegment> = {
            datamart_id: datamartId,
            type: 'USER_QUERY',
            name,
            technical_name,
            persisted,
            default_ttl: calculateDefaultTtl(segmentFormData),
            query_id: queryResource.id,
          };
          return AudienceSegmentService.saveSegment(
            match.params.organisationId,
            userQuerySegment,
          ).then(res => {
            history.push(
              `/v2/o/${match.params.organisationId}/audience/segments/${
              res.data.id
              }`,
            );
          });
        });
      };
      const saveAsExport = (exportFormData: NewExportSimpleFormData) => {
        if (!query) return Promise.reject(new Error("angular query container isn't loaded correctly"));
        return query.saveOrUpdate().then(queryResource => {
          return ExportService.createExport(match.params.organisationId, {
            name: exportFormData.name,
            output_format: exportFormData.outputFormat,
            query_id: queryResource.id,
            type: 'QUERY',
          }).then(res => {
            history.push(
              `/v2/o/${match.params.organisationId}/datastudio/exports/${
              res.data.id
              }`,
            );
          });
        });
      };
      return (
        <SaveQueryAsActionBar
          saveAsUserQuery={saveAsUserQuery}
          saveAsExort={saveAsExport}
          breadcrumb={[
            {
              name: intl.formatMessage(messages.queryBuilder),
            },
          ]}
        />
      );
    };

    return (
      <div style={{ height: '100%', display: 'flex' }}>
        {!selectedDatamart && (
          <DatamartSelector
            onSelectDatamart={handleOnSelectDatamart}
            actionbarProps={{
              paths: [
                {
                  name: intl.formatMessage(messages.queryBuilder),
                },
              ],
            }}
          />
        )}
        {selectedDatamart &&
          selectedDatamart.storage_model_version === 'v201709' && (
            <OTQLConsoleContainer
              datamartId={selectedDatamart.id}
            />
          )}
        {selectedDatamart &&
          selectedDatamart.storage_model_version === 'v201506' && (
            <SelectorQLBuilderContainer
              datamartId={selectedDatamart.id}
              renderActionBar={selectorQLActionbar}
              title={intl.formatMessage(messages.queryBuilder)}
            />
          )}
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  connect((state: any) => ({
    connectedUser: state.session.connectedUser,
  })),
)(QueryToolPage);

function calculateDefaultTtl(formData: NewUserQuerySimpleFormData) {
  if (formData.defaultLifetime && formData.defaultLifetimeUnit) {
    return moment
      .duration(Number(formData.defaultLifetime), formData.defaultLifetimeUnit)
      .asMilliseconds();
  }
  return undefined;
}