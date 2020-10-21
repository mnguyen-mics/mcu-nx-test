import * as React from 'react';
import Select, { LabeledValue } from "antd/lib/select";
import debounce from 'lodash/debounce';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Spin } from 'antd';

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
  value?: LabeledValue;
  fetching: boolean;
}

interface ResourceByKeywordSelectorProps {
  datamartId: string;
  organisationId: string;
  onchange: (value: LabeledValue) => void;
}

function ComponentPropsAdapter<T, S>(Display: React.ComponentType<S>, adapter: (t: T) => S): React.ComponentClass<T> {
  return class extends React.Component<T, {}, any> {
    render() {
      const props = this.props;
      const adapted = adapter(props)
      return <Display {...adapted}/>
    }
  }
}

function ResourceByKeywordSelector<T extends SelectableResource, AdditionalContext>(NameDisplay: React.ComponentType<T>, resourceFetcher: ResourceFetcher<T>, 
  className: string, 
  placeholder: string, 
  elementId: string) {
  return class extends React.Component<ResourceByKeywordSelectorProps & AdditionalContext, ResourceByKeywordSelectorState> {
    private _debounce = debounce;
    constructor(props: ResourceByKeywordSelectorProps & AdditionalContext) {
      super(props);
      this.state = {
        resourcesList: [],
        fetching: false,
      };
      this.fetchListMethod = this._debounce(this.fetchListMethod.bind(this), 800);
    }
  
    componentDidMount() {
      this.fetchListMethod('');
    }
  
    fetchListMethod( keyword: string) {
      const { datamartId, organisationId } = this.props;
      this.setState({ resourcesList: [], fetching: true });
      const options = {
        keywords: keyword,
        datamart_id: datamartId,
        organisation_id: organisationId,
        ...this.props
      }
      return resourceFetcher.getForKeyword(options)
        .then(res => {
          this.setState({
            resourcesList: res.map(r => ({ key: r.id, label: <NameDisplay {...r} /> })),
            fetching: false
          })
        });
    }
  
    handleChange = (value: LabeledValue) => {
      const { onchange } = this.props;
      this.setState({
        value
      });
      onchange(value)
    };
  
    render() {
      const { resourcesList, fetching, value } = this.state;
      const getPopupContainer = () => document.getElementById(elementId)!
      return (<Select
        showSearch={true}
        labelInValue={true}
        autoFocus={true}
        value={value}
        className={className}
        placeholder={placeholder}
        filterOption={false}
        onSearch={this.fetchListMethod}
        onChange={this.handleChange}
        notFoundContent={fetching ? <Spin size="small" className="text-center" />: null}
        suffixIcon={<McsIcon type="magnifier" />}
        getPopupContainer={getPopupContainer}
      >
        {resourcesList.map((item: LabeledValue, index: number) => <Select.Option value={item.key} key={index.toString()}>{item.label}</Select.Option>)}
      </Select>);
    }
  
  }
}
export {ResourceByKeywordSelector, ResourceFetcher, GetOptions, ComponentPropsAdapter}