import McsMoment from '@mediarithmics-private/mcs-components-library/lib/utils/McsMoment';
import { Select } from 'antd';
import { LabeledValue, OptionProps } from 'antd/lib/select';
import cuid from 'cuid';
import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { AdGroupByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/AdGroupByNameSelector';
import { CampaignByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/CampaignByNameSelector';
import { ChannelByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/ChannelByNameSelector';
import { CreativeByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/CreativeByNameSelector';
import { BrandByNameSelector, Category1ByNameSelector, Category2ByNameSelector, Category3ByNameSelector, Category4ByNameSelector, DeviceBrandByNameSelector, DeviceCarrierByNameSelector, DeviceModelByNameSelector, ProductIdByNameSelector, TypeByNameSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/DimensionValueByNameSelector';
import { GoalByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/GoalByNameSelector';
import { ResourceByKeywordSelectorProps } from '../../containers/Audience/DatamartUsersAnalytics/components/helpers/utils';
import SegmentByNameSelector from '../../containers/Audience/DatamartUsersAnalytics/components/SegmentByNameSelector';
import { enumValuesByName, DimensionEnum } from './Constants';

interface FunnelExpressionProps {
  from: McsMoment
  to: McsMoment
  dimensionName: string
  dimensionIndex: number
  datamartId: string
  stepId?: string,
  initialValue: string[],
  handleDimensionExpressionForSelectorChange: (value: string[]) => void
}

interface State {
  value: string[],
  allOptionsSelected: boolean;
}
type Props = FunnelExpressionProps & RouteComponentProps<{ organisationId: string }>

interface CommonEnumProps {
  mode: string
  showSearch: boolean
  showArrow: boolean
  placeholder: string
  className: string
  filterOption: boolean | ((inputValue: string, option: React.ReactElement<OptionProps>) => boolean)
  value: string[]
}

class FunnelExpressionInput extends React.Component<Props, State> {
  private _cuid = cuid;

  private _compose<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
    return x => g(f(x))
  }

  private _map<A, B>(f: (a: A) => B): (as: A[]) => B[] {
    return x => x.map(el => f(el))
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.initialValue,
      allOptionsSelected: false
    };
  }

  getInputField(dimensionName: string,
    from: McsMoment,
    to: McsMoment,
  ) {
    const { datamartId,
      match: {
        params: { organisationId },
      },
      handleDimensionExpressionForSelectorChange,
    } = this.props;

    const { value, allOptionsSelected } = this.state;
    const selectAllOptionValue = allOptionsSelected ? "Deselect all" : "Select all";
    const Option = Select.Option;
    const anchorId = "mcs-funnel_expression_select_anchor"

    const commonProps: ResourceByKeywordSelectorProps = {
      value: value,
      anchorId: anchorId,
      datamartId: datamartId,
      organisationId: organisationId,
      className: "mcs-funnelQueryBuilder_dimensionValue",
      onchange: this._compose(this._map((label: LabeledValue) => label.key), handleDimensionExpressionForSelectorChange),
      showId: true,
      multiselect: true,
      displaySelectAll:true
    }
    const additionalDimensionFilter = {
      from: from,
      to: to
    }

    const commonEnumProps: CommonEnumProps = {
      mode: "tags",
      showSearch: true,
      showArrow: false,
      placeholder: "Dimension value",
      className: "mcs-funnelQueryBuilder_dimensionValue",
      filterOption: (inputValue: string, option: React.ReactElement<OptionProps>) => {
        const contains = option.props.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase())
        return (contains !== undefined && contains > -1)
      },
      value: value
    }

    switch (dimensionName) {
      
      case 'HAS_CONVERSION':
      case 'HAS_BOUNCED':
        const handleBooleanEnum = (selectValue: string[]) => {
          this.setState({
            value: selectValue
          });
          handleDimensionExpressionForSelectorChange(selectValue)
        };
        return <Select {...commonEnumProps} onChange={handleBooleanEnum}>
          <Option key={this._cuid()} value={"0"}>
            {"false"}
          </Option>
          <Option key={this._cuid()} value={"1"}>
            {"true"}
          </Option>
        </Select>
      case 'EVENT_TYPE':
      case 'DEVICE_OS_FAMILY':
      case 'DEVICE_FORM_FACTOR':
      case 'DEVICE_BROWSER_FAMILY':
        const dimensionEnums: DimensionEnum[] = enumValuesByName[dimensionName];
        const handleEnumChange = (selectValue: string[]) => {
          const selectAllChecked = selectValue.includes("Select all");
           if (selectAllChecked) {
            selectValue = dimensionEnums.map(e => e.toString());
           }

           if (selectValue.includes("Deselect all")) {
             selectValue = [];
           }

           this.setState({
             value: selectValue,
             allOptionsSelected: selectAllChecked
           });
           handleDimensionExpressionForSelectorChange(selectValue)
         };

        return <Select {...commonEnumProps} onChange={handleEnumChange} >
           <Option key={this._cuid()} value={selectAllOptionValue}>
              {selectAllOptionValue}
            </Option>
          {dimensionEnums.map((et: DimensionEnum) => {
            return (
              <Option key={this._cuid()} value={et.toString()}>
                {et.toString()}
              </Option>)
          })}
        </Select>
      case 'SEGMENT_ID':
        return (<div id={anchorId}>
          <SegmentByNameSelector
            {...commonProps}
          />
        </div>)
      case 'ORIGIN_SUB_CAMPAIGN_ID':
        return (<div id={anchorId}>
          <AdGroupByKeywordSelector
            {...commonProps}
          />
        </div>)
      case 'ORIGIN_CAMPAIGN_ID':
        return (<div id={anchorId}>
          <CampaignByKeywordSelector
            {...commonProps}
          />
        </div>)
      case 'GOAL_ID':
        return (<div id={anchorId}>
          <GoalByKeywordSelector
            {...commonProps}
          />
        </div>)
      case 'CHANNEL_ID':
        return (<div id={anchorId}>
          <ChannelByKeywordSelector
            {...commonProps}
          />
        </div>)
      case 'ORIGIN_CREATIVE_ID':
        return (<div id={anchorId}>
          <CreativeByKeywordSelector
            {...commonProps}
          />
        </div>)
      case 'PRODUCT_ID':
        return (<div id={anchorId}>
          <ProductIdByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'CATEGORY1':
        return (<div id={anchorId}>
          <Category1ByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'CATEGORY2':
        return (<div id={anchorId}>
          <Category2ByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'CATEGORY3':
        return (<div id={anchorId}>
          <Category3ByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'CATEGORY4':
        return (<div id={anchorId}>
          <Category4ByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'BRAND':
        return (<div id={anchorId}>
          <BrandByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'DEVICE_BRAND':
        return (<div id={anchorId}>
          <DeviceBrandByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'TYPE':
        return (<div id={anchorId}>
          <TypeByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'DEVICE_CARRIER':
        return (<div id={anchorId}>
          <DeviceCarrierByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      case 'DEVICE_MODEL':
        return (<div id={anchorId}>
          <DeviceModelByNameSelector
            filter={additionalDimensionFilter}
            {...commonProps}
          />
        </div>)
      default:
        return <Select
          placeholder="Dimension value"
          mode="tags"
          tokenSeparators={[',','	']}
          showSearch={true}
          labelInValue={true}
          autoFocus={true}
          className="mcs-funnelQueryBuilder_dimensionValue"
          onChange={this._compose(this._map((label: LabeledValue) => label.key), handleDimensionExpressionForSelectorChange)}
          {...value}
        />
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { dimensionName } = this.props
    if (prevProps.dimensionName !== dimensionName) {
      this.setState({
        value: [],
        allOptionsSelected: false
      })
    }
  }

  render() {
    const { from, to, dimensionName } = this.props
    return this.getInputField(dimensionName, from, to)
  }
}
export default compose<FunnelExpressionProps, FunnelExpressionProps>(
  withRouter
)(FunnelExpressionInput);
