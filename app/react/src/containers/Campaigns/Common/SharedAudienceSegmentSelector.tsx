import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import TableSelector, {
  TableSelectorProps,
} from '../../../components/ElementSelector/TableSelector';
import { SearchFilter } from '../../../components/ElementSelector';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import {
  GetServiceOptions,
  ICatalogService,
} from '../../../services/CatalogService';
import { AudienceSegmentServiceItemPublicResource } from '../../../models/servicemanagement/PublicServiceItemResource';
import { DataResponse } from '../../../services/ApiService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const SegmentTableSelector: React.ComponentClass<
  TableSelectorProps<AudienceSegmentServiceItemPublicResource>
> = TableSelector;

const messages = defineMessages({
  segmentSelectorTitle: {
    id: 'shared-segment-selector-title',
    defaultMessage: 'Add an audience',
  },
  segmentSelectorSearchPlaceholder: {
    id: 'shared-segment-selector-search-placeholder',
    defaultMessage: 'Search audience',
  },
  segmentSelectorColumnName: {
    id: 'shared-segment-selector-column-name',
    defaultMessage: 'Name',
  },
  segmentSelectorColumnUserPoints: {
    id: 'shared-segment-selector-column-userPoints',
    defaultMessage: 'User Points',
  },
  segmentSelectorColumnCookieIds: {
    id: 'shared-segment-selector.column-cookieIds',
    defaultMessage: 'Desktop Cookie Ids',
  },
});

export interface SharedAudienceSegmentSelectorProps {
  selectedSegmentIds: string[];
  save: (segments: AudienceSegmentServiceItemPublicResource[]) => void;
  close: () => void;
}

interface MapStateProps {
  defaultDatamart: (organisationId: string) => { id: string };
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = SharedAudienceSegmentSelectorProps &
  InjectedIntlProps &
  MapStateProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }>;

class SharedAudienceSegmentSelector extends React.Component<Props> {
  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  saveSegments = (
    segmentIds: string[],
    segments: AudienceSegmentServiceItemPublicResource[],
  ) => {
    this.props.save(segments);
  };

  fetchSegments = (filter: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: GetServiceOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }

    return this._catalogService.getAudienceSegmentServices(
      organisationId,
      options,
    );
  };

  fetchSegment = (segmentId: string) => {
    return this._catalogService.getService(segmentId) as Promise<
      DataResponse<AudienceSegmentServiceItemPublicResource>
    >;
  };

  render() {
    const {
      selectedSegmentIds,
      close,
      intl: { formatMessage },
    } = this.props;

    const columns: Array<
      DataColumnDefinition<AudienceSegmentServiceItemPublicResource>
    > = [
      {
        title: formatMessage(messages.segmentSelectorColumnName),
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
    ];

    return (
      <SegmentTableSelector
        actionBarTitle={formatMessage(messages.segmentSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(
          messages.segmentSelectorSearchPlaceholder,
        )}
        selectedIds={selectedSegmentIds}
        defaultSelectedKey={'segment_id'}
        fetchDataList={this.fetchSegments}
        fetchData={this.fetchSegment}
        columnsDefinitions={columns}
        save={this.saveSegments}
        close={close}
        displayDatamartSelector={false}
      />
    );
  }
}

export default compose<Props, SharedAudienceSegmentSelectorProps>(
  withRouter,
  injectIntl,
  injectDatamart,
)(SharedAudienceSegmentSelector);
