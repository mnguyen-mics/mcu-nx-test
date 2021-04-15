import * as React from 'react';
import Select, { LabeledValue } from "antd/lib/select";
import debounce from 'lodash/debounce';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Spin } from 'antd';
import injectNotifications, { InjectedNotificationProps } from '../../../../../containers/Notifications/injectNotifications';
import { compose } from 'recompose';

interface GetOptions {
  organisation_id: string,
  datamart_id: string,
  keywords: string,
}

interface SelectableResource {
  id: string,
}

interface ResourceFetcher<T extends SelectableResource> {
  getForKeyword(options: GetOptions): Promise<T[]>
}

interface ResourceByKeywordSelectorState {
  resourcesList: LabeledValue[];
  value?: LabeledValue | LabeledValue[];
  allOptionsSelected: boolean;
  fetching: boolean;
  fetchedResourcesList?: LabeledValue[];
  fetchedKeyword?: string;
}

interface ResourceByKeywordSelectorProps {
  value: string[],
  className?: string;
  anchorId: string;
  datamartId: string;
  organisationId: string;
  onchange: (value: LabeledValue | LabeledValue[]) => void;
  multiselect?: boolean;
  showId?: boolean;
  displaySelectAll?: boolean;
}

interface NoFilterClause {
  noFilterClause?: boolean
}
interface QueryFilter<AdditionalContext> {
  filter?: AdditionalContext & NoFilterClause
}


function ResourceByKeywordSelector<T extends SelectableResource, AdditionalContext>(NameDisplay: React.ComponentType<T>, resourceFetcher: ResourceFetcher<T>,
  placeholder: string) {
  type Props = ResourceByKeywordSelectorProps & QueryFilter<AdditionalContext>;
  class Wrapped extends React.Component<Props & InjectedNotificationProps, ResourceByKeywordSelectorState> {
    private _debounce = debounce;
    constructor(props: Props & InjectedNotificationProps) {
      super(props);
      const value = props.value.map(
        (key: string) => {
        return {
          key: key,
          value: key
        }
      })
      this.state = {
        value: value as LabeledValue[],
      resourcesList: [],
        fetching: false,
          allOptionsSelected: false
    };
      this.fetchListMethod = this._debounce(this.fetchListMethod.bind(this), 800, { trailing: true });
}

componentDidMount() {
  this.fetchListMethod('');
}

handleSearch = (keyword: string) => {
  if (keyword.length > 0) {
    const { fetchedKeyword, fetchedResourcesList } = this.state
    if (keyword.length > 2 && fetchedResourcesList && fetchedKeyword && keyword.toLowerCase().includes(fetchedKeyword.toLowerCase()))
      this.searchInPreviousFetch(keyword, fetchedResourcesList)
    else
      this.fetchListMethod(keyword)
  }
}

searchInPreviousFetch(keyword: string, fetchedResourcesList: LabeledValue[]) {
  this.setState({
    resourcesList: fetchedResourcesList.filter(labeledValue => labeledValue.key && labeledValue.key.toLowerCase().includes(keyword.toLowerCase()))
  });
}

fetchListMethod(keyword: string) {
  const { datamartId, organisationId, filter, notifyError, showId, value } = this.props;
  this.setState({ resourcesList: [], fetching: true });
  const options = {
    keywords: keyword,
    datamart_id: datamartId,
    organisation_id: organisationId,
    ...filter
  };
  const newValue = this.state.value as LabeledValue[];
  return resourceFetcher.getForKeyword(options)
    .then(res => {
      
      const result: LabeledValue[] = res.filter(re => re.id).map(r => ({ key: r.id, label: <NameDisplay {...r} showId={showId} />, value: r.id }));
      
      value.forEach((v) => {
        const valueExistInList = result.find(item => item.key === v);   
        if (!valueExistInList) {
          const unavailableValue = {
            name: v,
            id: v
          }; 
          const formatedValue: LabeledValue = { key: v, label: <NameDisplay {...unavailableValue as any} /> , value: v}
          result.push(formatedValue);
          newValue.push(formatedValue);
        }
      });
  
      this.setState({
        resourcesList: result,
        value: newValue,
        fetching: false,
        fetchedResourcesList: result,
        fetchedKeyword: keyword
      })
    }).catch(e => {
      notifyError(e);
      this.setState({
        fetching: false,
      });
    });
}

handleChange = (value: LabeledValue | LabeledValue[]) => {
  const { onchange } = this.props;
  const { resourcesList } = this.state;

  if (Array.isArray(value) && value.length === 0) {
    this.fetchListMethod('');
  }

  let isAllSelected;
  if (Array.isArray(value)) {
    isAllSelected = Array.isArray(value) && value.find(v => v.key === "Select all");
    if (isAllSelected) {
      value = resourcesList;
    }
    const isAllDeselected = value.find(v => v.key === "Deselect all");
    if (isAllDeselected) {
      value = [];
    }
  }

  this.setState({
    value,
    allOptionsSelected: !!isAllSelected
  });
  onchange(value)
};

render() {
  const { resourcesList, fetching, value, allOptionsSelected } = this.state;
  const selectAllOptionValue = allOptionsSelected ? "Deselect all" : "Select all";
  const { anchorId, className, multiselect, displaySelectAll, filter } = this.props;
  const getPopupContainer = () => document.getElementById(anchorId)!
  const alwaysTrue = () => true
  return (<Select
    mode={multiselect ? "tags" : undefined}
    tokenSeparators={[',', '	']}
    showSearch={!filter?.noFilterClause}
    labelInValue={true}
    autoFocus={true}
    value={value}
    className={className ? className : "mcs-resourceByNameSelector"}
    placeholder={placeholder}
    onSearch={this.handleSearch}
    onChange={this.handleChange}
    notFoundContent={fetching ? <Spin size="small" className="text-center" /> : null}
    suffixIcon={<McsIcon type="magnifier" />}
    getPopupContainer={getPopupContainer}
    filterOption={alwaysTrue}
  >
    {resourcesList.length > 1 && displaySelectAll && <Select.Option value={selectAllOptionValue} key={selectAllOptionValue}>{selectAllOptionValue}</Select.Option>}
    {resourcesList.map((item: LabeledValue, index: number) => <Select.Option value={item.key as React.ReactText} key={index.toString()}>{item.label}</Select.Option>)}
  </Select>);
}
  }
return compose<Props & InjectedNotificationProps, Props>(
  injectNotifications,
)(Wrapped)
}
export { ResourceByKeywordSelector, ResourceFetcher, GetOptions, ResourceByKeywordSelectorProps }