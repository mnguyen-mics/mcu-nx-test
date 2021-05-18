import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { messages } from '../constants';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  IAudienceFeatureService,
  AudienceFeatureOptions,
} from '../../../../services/AudienceFeatureService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { AudienceBuilderFormData } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import TableSelector, {
  TableSelectorProps,
} from '../../../../components/ElementSelector/TableSelector';
import { SearchFilter } from '../../../../components/ElementSelector';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const AudienceFeatureTableSelector: React.ComponentClass<
  TableSelectorProps<AudienceFeatureResource>
> = TableSelector;

interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

export interface AudienceFeatureSelectorProps {
  datamartId: string;
  save: (audienceFeatures: AudienceFeatureResource[]) => void;
  close: () => void;
}

interface State {
  isLoading: boolean;
  parametricPredicates: AudienceFeatureResource[];
}

type Props = MapStateToProps &
  AudienceFeatureSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceFeatureSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      parametricPredicates: [],
    };
  }

  fetchAudienceFeatures = (filter: SearchFilter) => {
    const { datamartId } = this.props;

    const options: AudienceFeatureOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = [filter.keywords];
    }

    return this._audienceFeatureService.getAudienceFeatures(datamartId, options);
  };

  saveAudienceFeatures = (
    audienceFeatureIds: string[],
    audienceFeatures: AudienceFeatureResource[],
  ) => {
    this.props.save(audienceFeatures);
  };

  render() {
    const {
      close,
      intl: { formatMessage },
    } = this.props;
    const columns: Array<DataColumnDefinition<AudienceFeatureResource>> = [
      {
        title: formatMessage(messages.audienceFeatureName),
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
      {
        title: formatMessage(messages.audienceFeatureDescription),
        key: 'description',
        render: (text, record) => <i>{record.description}</i>,
      },
    ];

    const fetchAudienceFeature = (id: string) => {
      const { datamartId } = this.props;
      return this._audienceFeatureService.getAudienceFeature(id, datamartId);
    };

    return (
      <AudienceFeatureTableSelector
        actionBarTitle={formatMessage(messages.addAudienceFeature)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(messages.searchAudienceFeature)}
        fetchDataList={this.fetchAudienceFeatures}
        fetchData={fetchAudienceFeature}
        singleSelection={true}
        columnsDefinitions={columns}
        save={this.saveAudienceFeatures}
        close={close}
      />
    );
  }
}

export default compose<Props, AudienceFeatureSelectorProps>(injectIntl)(AudienceFeatureSelector);
