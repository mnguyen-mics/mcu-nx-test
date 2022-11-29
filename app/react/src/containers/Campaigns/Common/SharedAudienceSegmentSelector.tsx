import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, WrappedComponentProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { GetServiceOptions, ICatalogService } from '../../../services/CatalogService';
import { AudienceSegmentServiceItemPublicResource } from '../../../models/servicemanagement/PublicServiceItemResource';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import { TableSelector } from '@mediarithmics-private/mcs-components-library';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { getWorkspace } from '../../../redux/Session/selectors';
import { TableSelectorProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-selector';
import { SearchFilter } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

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
  audienceSegment: {
    id: 'segment-selector.table.audience-segment',
    defaultMessage: 'Audience Segment',
  },
  userAccountCompartment: {
    id: 'shared-segment-selector.table.user-account-compartment',
    defaultMessage: 'User Account Compartment',
  },
  serviceType: {
    id: 'shared-segment-selector.table.service-type',
    defaultMessage: 'Service Type',
  },
  addElementText: {
    id: 'shared-segment-selector.table.add-element-text',
    defaultMessage: 'Add',
  },
});

export interface SharedAudienceSegmentSelectorProps {
  selectedSegmentIds: string[];
  save: (segments: AudienceSegmentServiceItemPublicResource[]) => void;
  close: () => void;
}

interface MapStateProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = SharedAudienceSegmentSelectorProps &
  WrappedComponentProps &
  MapStateProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }>;

class SharedAudienceSegmentSelector extends React.Component<Props> {
  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  saveSegments = (segmentIds: string[], segments: AudienceSegmentServiceItemPublicResource[]) => {
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

    return this._catalogService.getAudienceSegmentServices(organisationId, options);
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
      workspace,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const datamarts = workspace(organisationId).datamarts;

    const columns: Array<DataColumnDefinition<AudienceSegmentServiceItemPublicResource>> = [
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
        searchPlaceholder={formatMessage(messages.segmentSelectorSearchPlaceholder)}
        selectedIds={selectedSegmentIds}
        defaultSelectedKey={'segment_id'}
        fetchDataList={this.fetchSegments}
        fetchData={this.fetchSegment}
        columnsDefinitions={columns}
        save={this.saveSegments}
        close={close}
        displayDatamartSelector={false}
        datamarts={datamarts}
        messages={{
          audienceSegment: formatMessage(messages.audienceSegment),
          userAccountCompartment: formatMessage(messages.userAccountCompartment),
          serviceType: formatMessage(messages.serviceType),
          addElementText: formatMessage(messages.addElementText),
        }}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, SharedAudienceSegmentSelectorProps>(
  connect(mapStateToProps, undefined),
  withRouter,
  injectIntl,
  injectDatamart,
)(SharedAudienceSegmentSelector);
