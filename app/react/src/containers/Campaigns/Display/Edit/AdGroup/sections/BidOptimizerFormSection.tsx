import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Input, Select } from 'antd';
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
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import {
  DataResponse,
  DataListResponse,
} from '../../../../../../services/ApiService';
import {
  makeCancelable,
  CancelablePromise,
} from '../../../../../../utils/ApiHelper';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';
import { BidOptimizationObjectiveType } from '../../../../../../models/campaign/constants';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IBidOptimizerService } from '../../../../../../services/Library/BidOptimizerService';

const InputGroup = Input.Group;

export interface BidOptimizerFormSectionProps extends ReduxFormChangeProps {
  disabled?: boolean;
  small?: boolean;
}

type Props = BidOptimizerFormSectionProps &
  WrappedFieldArrayProps<BidOptimizerFieldModel> &
  InjectedIntlProps &
  InjectedDrawerProps;

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

  @lazyInject(TYPES.IBidOptimizerService)
  private _bidOptimizerService: IBidOptimizerService;

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

  componentDidUpdate(previousProps: Props) {
    const bidOptimizerField = this.props.fields.getAll()[0];
    const previousBidOptimizerField = previousProps.fields.getAll()[0];

    const previousBidOptimizerId =
      previousBidOptimizerField && previousBidOptimizerField.model
        ? previousBidOptimizerField.model.bid_optimizer_id
        : undefined;

    if (
      bidOptimizerField &&
      bidOptimizerField.model &&
      bidOptimizerField.model.bid_optimizer_id !== previousBidOptimizerId
    )
      this.fetchBidOptimizer(bidOptimizerField.model.bid_optimizer_id);
  }

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  fetchBidOptimizer = (bidOptimizerId: string) => {
    this.cancelablePromise = makeCancelable(
      Promise.all([
        this._bidOptimizerService.getInstanceById(bidOptimizerId),
        this._bidOptimizerService.getInstanceProperties(bidOptimizerId),
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
        model: {
          bid_optimizer_id: bidOptmizers[0].id,
          bid_optimization_objective_type: 'CPC',
          bid_optimization_objective_value: '0',
        },
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

  renderActionsButtons = (record: BidOptimizerFieldModel) => {
    const { fields, formChange, disabled } = this.props;
    const onInputChange = (e: any) => {
      const newField: BidOptimizerFieldModel[] = [
        {
          key: record.key,
          model: {
            ...record.model,
            bid_optimization_objective_value: e.target.value,
          },
        },
      ];

      formChange((fields as any).name, newField);
    };

    const onSelectChange = (e: BidOptimizationObjectiveType) => {
      const newField: BidOptimizerFieldModel[] = [
        {
          key: record.key,
          model: {
            ...record.model,
            bid_optimization_objective_type: e,
          },
        },
      ];

      formChange((fields as any).name, newField);
    };

    return (
      <span>
        <InputGroup compact={true}>
          <Select
            disabled={disabled}
            defaultValue={record.model.bid_optimization_objective_type || 'CPC'}
            onChange={onSelectChange}
          >
            <Select.Option value="CPC">CPC</Select.Option>
            <Select.Option value="CPA">CPA</Select.Option>
            <Select.Option value="CTR">CTR</Select.Option>
            <Select.Option value="CPV">CPV</Select.Option>
          </Select>
          <Input
            disabled={disabled}
            style={{ width: 100 }}
            type="number"
            placeholder="value"
            defaultValue={record.model.bid_optimization_objective_value}
            onChange={onInputChange}
          />
        </InputGroup>
      </span>
    );
  };

  getBidOptimizerRecords = () => {
    const { fields, disabled } = this.props;
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
      const removeField = () => (disabled ? null : fields.remove(index));

      const field = fields.get(index);

      return (
        <RecordElement
          key={field.key}
          recordIconType="optimization"
          record={field}
          title={getName}
          additionalActionButtons={this.renderActionsButtons}
          onRemove={disabled ? undefined : removeField}
        />
      );
    });
  };

  render() {
    const {
      intl: { formatMessage },
      disabled,
    } = this.props;

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openBidOptimizerSelector,
              disabled: disabled,
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
