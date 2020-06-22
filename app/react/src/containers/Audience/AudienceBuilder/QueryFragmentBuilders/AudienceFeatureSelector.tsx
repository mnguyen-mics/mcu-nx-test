import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { getFormValues } from 'redux-form';
import { RouteComponentProps } from 'react-router';
import { messages } from '../constants';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IParametricPredicateService } from '../../../../services/ParametricPredicateService';
import { connect } from 'react-redux';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { AudienceBuilderFormData } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { ParametricPredicateResource } from '../../../../models/parametricPredicate';
import TableSelector, {
  TableSelectorProps,
} from '../../../../components/ElementSelector/TableSelector';
import { DataColumnDefinition } from '../../../../components/TableView/TableView';

const AudienceFeatureTableSelector: React.ComponentClass<TableSelectorProps<
  ParametricPredicateResource
>> = TableSelector;

interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

export interface AudienceFeatureSelectorProps {
  datamartId: string;
  save: (audienceFeatures: ParametricPredicateResource[]) => void;
  close: () => void;
}

interface State {
  isLoading: boolean;
  parametricPredicates: ParametricPredicateResource[];
}

type Props = MapStateToProps &
  AudienceFeatureSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceFeatureSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IParametricPredicateService)
  private _parametricPredicateService: IParametricPredicateService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      parametricPredicates: [],
    };
  }

  fetchAudienceFeatures = () => {
    const { datamartId } = this.props;
    return this._parametricPredicateService.getParametricPredicates(datamartId);
  };

  saveAudienceFeatures = (
    audienceFeatureIds: string[],
    audienceFeatures: ParametricPredicateResource[],
  ) => {
    this.props.save(audienceFeatures);
  };

  render() {
    const {
      close,
      intl: { formatMessage },
    } = this.props;
    const columns: Array<DataColumnDefinition<ParametricPredicateResource>> = [
      {
        intlMessage: messages.audienceFeatureId,
        key: 'id',
        render: (text, record) => <span>{record.id}</span>,
      },
      {
        intlMessage: messages.audienceFeatureName,
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
      {
        intlMessage: messages.audienceFeatureAdressableObject,
        key: 'addressable_object',
        render: (text, record) => <span>{record.addressable_object}</span>,
      },
      {
        intlMessage: messages.audienceFeatureObjectTreeExpression,
        key: 'object_tree_expression',
        render: (text, record) => <span>{record.object_tree_expression}</span>,
      },
    ];

    const fetchAudienceFeature = (id: string) => {
      const { datamartId } = this.props;
      return this._parametricPredicateService.getParametricPredicate(
        id,
        datamartId,
      );
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

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues('segmentBuilderFormData')(state),
});

export default compose<Props, AudienceFeatureSelectorProps>(
  injectIntl,
  connect(mapStateToProps),
)(AudienceFeatureSelector);
