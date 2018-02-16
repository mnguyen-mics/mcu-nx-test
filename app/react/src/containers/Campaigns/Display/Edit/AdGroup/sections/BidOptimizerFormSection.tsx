import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import cuid from 'cuid';
import { compose } from 'recompose';

import messages from '../../messages';
import { injectDrawer } from '../../../../../../components/Drawer/index';
import { BidOptimizerFieldModel } from '../domain';
import FormSection from '../../../../../../components/Form/FormSection';
import RelatedRecords from '../../../../../../components/RelatedRecord/RelatedRecords';
import RecordElement from '../../../../../../components/RelatedRecord/RecordElement';
import BidOptimizerSelector, {
  BidOptimizerSelectorProps,
} from '../../../../Common/BidOptimizerSelector';
import { BidOptimizer } from '../../../../../../models/Plugins';
import {
  PropertyResourceShape,
  StringPropertyResource,
} from '../../../../../../models/plugin/index';
import BidOptimizerService from '../../../../../../services/Library/BidOptimizerService';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import {
  DataResponse,
  DataListResponse,
} from '../../../../../../services/ApiService';
import {
  makeCancelable,
  CancelablePromise,
} from '../../../../../../utils/ApiHelper';
import { InjectDrawerProps } from '../../../../../../components/Drawer/injectDrawer';

export interface BidOptimizerFormSectionProps extends ReduxFormChangeProps {}

type Props = BidOptimizerFormSectionProps &
  WrappedFieldArrayProps<BidOptimizerFieldModel> &
  InjectedIntlProps &
  InjectDrawerProps;

interface State {
  bidOptimizerData: {
    bidOptimizer?: BidOptimizer;
    properties: PropertyResourceShape[];
  };
}

class BidOptimizerFormSection extends React.Component<Props, State> {
  cancelablePromise: CancelablePromise<
    [DataResponse<BidOptimizer>, DataListResponse<PropertyResourceShape>]
  >;

  constructor(props: Props) {
    super(props);
    this.state = {
      bidOptimizerData: {
        properties: [],
      },
    };
  }

  componentDidMount() {
    const bidOptimizerField = this.props.fields.getAll()[0];
    if (bidOptimizerField)
      this.fetchBidOptimizer(bidOptimizerField.model.bid_optimizer_id);
  }

  componentWillReceiveProps(nextProps: Props) {
    const bidOptimizerField = nextProps.fields.getAll()[0];
    if (bidOptimizerField)
      this.fetchBidOptimizer(bidOptimizerField.model.bid_optimizer_id);
  }

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  fetchBidOptimizer = (bidOptimizerId: string) => {
    this.cancelablePromise = makeCancelable(
      Promise.all([
        BidOptimizerService.getBidOptimizer(bidOptimizerId),
        BidOptimizerService.getBidOptimizerProperty(bidOptimizerId),
      ]),
    );

    this.cancelablePromise.promise.then(results => {
      this.setState({
        bidOptimizerData: {
          bidOptimizer: results[0].data,
          properties: results[1].data,
        },
      });
    });
  };

  updateBidOptimizer = (bidOptmizers: BidOptimizer[]) => {
    const { fields, formChange } = this.props;

    const newField: BidOptimizerFieldModel[] = [
      {
        key: cuid(),
        model: { bid_optimizer_id: bidOptmizers[0].id },
      },
    ];

    formChange((fields as any).name, newField);
    this.props.closeNextDrawer();
  };

  openBidOptimizerSelector = () => {
    const { fields } = this.props;

    const selectedBidOptimizerIds = fields
      .getAll()
      .map(p => p.model.bid_optimizer_id);

    const props: BidOptimizerSelectorProps = {
      selectedBidOptimizerIds,
      close: this.props.closeNextDrawer,
      save: this.updateBidOptimizer,
    };

    this.props.openNextDrawer<BidOptimizerSelectorProps>(BidOptimizerSelector, {
      additionalProps: props,
    });
  };

  getBidOptimizerRecords = () => {
    const { fields } = this.props;
    const { bidOptimizerData } = this.state;

    const getName = (field: BidOptimizerFieldModel) => {
      const name =
        bidOptimizerData.bidOptimizer && bidOptimizerData.bidOptimizer.name;
      const typeP = bidOptimizerData.properties.find(
        p => p.technical_name === 'name',
      );
      const providerP = bidOptimizerData.properties.find(
        p => p.technical_name === 'provider',
      );

      if (name && typeP && providerP) {
        return `${name} (${(typeP as StringPropertyResource).value.value} - ${
          (providerP as StringPropertyResource).value.value
        })`;
      }

      return field.model.bid_optimizer_id;
    };

    return fields.map((name, index) => {
      const removeField = () => fields.remove(index);

      const field = fields.get(index);

      return (
        <RecordElement
          key={field.key}
          recordIconType="optimization"
          record={field}
          title={getName}
          onRemove={removeField}
        />
      );
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openBidOptimizerSelector,
            },
          ]}
          subtitle={messages.sectionSubtitleOptimizer}
          title={messages.sectionTitleOptimizer}
        />

        <RelatedRecords
          emptyOption={{
            iconType: 'optimization',
            message: formatMessage(messages.contentSectionOptimizerEmptyTitle),
          }}
        >
          {this.getBidOptimizerRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<BidOptimizerFormSectionProps, Props>(
  injectIntl,
  injectDrawer,
)(BidOptimizerFormSection);
