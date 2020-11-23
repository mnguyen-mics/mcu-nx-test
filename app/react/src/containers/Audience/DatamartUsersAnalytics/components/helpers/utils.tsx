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
  fetching: boolean;
  fetchedResourcesList?: LabeledValue[];
  fetchedKeyword?: string;
}

interface ResourceByKeywordSelectorProps {
  className?: string;
  anchorId: string;
  datamartId: string;
  organisationId: string;
  onchange: (value: LabeledValue | LabeledValue[]) => void;
  multiselect?: boolean;
  showId?: boolean;
}

interface QueryFilter<AdditionalContext> {
  filter?: AdditionalContext
}


function ResourceByKeywordSelector<T extends SelectableResource, AdditionalContext>(NameDisplay: React.ComponentType<T>, resourceFetcher: ResourceFetcher<T>,
  placeholder: string) {
  type Props = ResourceByKeywordSelectorProps & QueryFilter<AdditionalContext>;
  class Wrapped extends React.Component<Props & InjectedNotificationProps, ResourceByKeywordSelectorState> {
    private _debounce = debounce;
    constructor(props: Props & InjectedNotificationProps) {
      super(props);
      this.state = {
        resourcesList: [],
        fetching: false,
      };
      this.fetchListMethod = this._debounce(this.fetchListMethod.bind(this), 800, { trailing: true });
    }

    handleSearch = (keyword: string) => {
      if(keyword.length > 0) {
        const { fetchedKeyword, fetchedResourcesList } = this.state
        if(keyword.length > 2 && fetchedResourcesList && fetchedKeyword && keyword.toLowerCase().includes(fetchedKeyword.toLowerCase()))
          this.searchInPreviousFetch(keyword, fetchedResourcesList)
        else
          this.fetchListMethod(keyword)
      }
    }

    searchInPreviousFetch(keyword: string, fetchedResourcesList: LabeledValue[]) {
      this.setState({
        resourcesList: fetchedResourcesList.filter(labeledValue => labeledValue.key.toLowerCase().includes(keyword.toLowerCase()))
      });
    }

    fetchListMethod(keyword: string) {
      const { datamartId, organisationId, filter, notifyError, showId } = this.props;
      this.setState({ resourcesList: [], fetching: true });
      const options = {
        keywords: keyword,
        datamart_id: datamartId,
        organisation_id: organisationId,
        ...filter
      }
      return resourceFetcher.getForKeyword(options)
        .then(res => {
          const result = res.map(r => ({ key: r.id, label: <NameDisplay {...r} showId={showId} /> }))
          this.setState({
            resourcesList: result,
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
      this.setState({
        value
      });
      onchange(value)
    };

    render() {
      const { resourcesList, fetching, value } = this.state;
      const { anchorId, className, multiselect } = this.props;
      const getPopupContainer = () => document.getElementById(anchorId)!
      const alwaysTrue = () => true
      return (<Select
        mode={multiselect ? "tags" : "default"}
        tokenSeparators={[',']}
        showSearch={true}
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
        {resourcesList.map((item: LabeledValue, index: number) => <Select.Option value={item.key} key={index.toString()}>{item.label}</Select.Option>)}
      </Select>);
    }
  }
  return compose<Props & InjectedNotificationProps, Props>(
    injectNotifications,
  )(Wrapped)
}
export { ResourceByKeywordSelector, ResourceFetcher, GetOptions, ResourceByKeywordSelectorProps }