import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import TableSelector, {
  TableSelectorProps,
} from '../../../../components/ElementSelector/TableSelector';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IOrganisationService } from '../../../../services/OrganisationService';
import { SearchFilter } from '../../../../components/ElementSelector';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { OrganisationResource } from '../../../../models/organisation/organisation';
import {
  DataResponse,
  DataListResponse,
} from '../../../../services/ApiService';
import { ProcessingResource } from '../../../../models/processing';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const ProcessingActivitiesTableSelector: React.ComponentClass<
  TableSelectorProps<ProcessingResource>
> = TableSelector;

export interface ProcessingActivitiesSelectorProps {
  selectedProcessingActivityIds: string[];
  save: (processingAcvitivies: ProcessingResource[]) => void;
  close: () => void;
}

type Props = ProcessingActivitiesSelectorProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  communityId?: string;
}

class ProcessingActivitiesSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  saveProcessingActivities = (
    selectedProcessingActivityIds: string[],
    processingActivities: ProcessingResource[],
  ) => {
    const { save } = this.props;

    save(processingActivities);
  };

  fetchCommunityId = (organisationId: string): Promise<string | null> => {
    const { notifyError } = this.props;
    const communityId = this._organisationService
      .getOrganisation(organisationId)
      .then((res: DataResponse<OrganisationResource>) => {
        const comId = res.data.community_id;
        this.setState({
          communityId: comId,
        });
        return comId;
      })
      .catch((err) => {
        notifyError(err);
        return null;
      });
    return communityId;
  };

  returnEmptyDataListResponse = (): DataListResponse<ProcessingResource> => {
    const emptyDataListResponse: DataListResponse<ProcessingResource> = {
      data: [],
      count: 0,
      status: 'error',
    };
    return emptyDataListResponse;
  };

  fetchProcessingActivities = (
    filter: SearchFilter,
  ): Promise<DataListResponse<ProcessingResource>> => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;

    const { communityId } = this.state;

    const options: any = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }

    const communityF: Promise<string | null> = communityId
      ? Promise.resolve(communityId)
      : this.fetchCommunityId(organisationId);

    return communityF.then((comId) => {
      if (comId !== null) {
        return this._organisationService
          .getProcessings(comId, options)
          .catch((err) => {
            notifyError(err);
            return this.returnEmptyDataListResponse();
          });
      }
      return this.returnEmptyDataListResponse();
    });
  };

  render() {
    const {
      intl: { formatMessage },
      selectedProcessingActivityIds,
      close,
    } = this.props;

    const columnsDefinition: Array<DataColumnDefinition<ProcessingResource>> = [
      {
        title: formatMessage(messages.processingActivitiesSelectorColumnName),
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
      {
        title: formatMessage(
          messages.processingActivitiesSelectorColumnLegalBasis,
        ),
        key: 'legal_basis',
        render: (text, record) => <span>{record.legal_basis}</span>,
      },
    ];

    const fetchProcessingActivity = (id: string) =>
      this._organisationService.getProcessing(id);

    return (
      <ProcessingActivitiesTableSelector
        actionBarTitle={formatMessage(
          messages.processingActivitiesSelectorTitle,
        )}
        displayFiltering={true}
        searchPlaceholder={formatMessage(
          messages.processingActivitiesSelectorSearchPlaceholder,
        )}
        selectedIds={selectedProcessingActivityIds}
        fetchDataList={this.fetchProcessingActivities}
        fetchData={fetchProcessingActivity}
        singleSelection={false}
        columnsDefinitions={columnsDefinition}
        save={this.saveProcessingActivities}
        close={close}
      />
    );
  }
}

export default compose<Props, ProcessingActivitiesSelectorProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(ProcessingActivitiesSelector);
