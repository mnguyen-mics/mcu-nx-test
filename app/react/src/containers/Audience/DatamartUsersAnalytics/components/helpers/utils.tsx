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
  value?: LabeledValue;
  fetching: boolean;
}

interface ResourceByKeywordSelectorProps {
  className?: string;
  anchorId: string;
  datamartId: string;
  organisationId: string;
  onchange: (value: LabeledValue) => void;
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
      this.fetchListMethod = this._debounce(this.fetchListMethod.bind(this), 800);
    }

    componentDidMount() {
      this.fetchListMethod('');
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
          this.setState({
            resourcesList: res.map(r => ({ key: r.id, label: <NameDisplay {...r} showId={showId} /> })),
            fetching: false
          })
        }).catch(e => {
          notifyError(e);
          this.setState({
            fetching: false,
          });
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
      const { anchorId, className, multiselect } = this.props;
      const getPopupContainer = () => document.getElementById(anchorId)!
      return (<Select
        mode={multiselect ? "tags" : "default"}
        tokenSeparators={[',']}
        showSearch={true}
        labelInValue={true}
        autoFocus={true}
        value={value}
        className={className ? className : "mcs-resourceByNameSelector"}
        placeholder={placeholder}
        filterOption={false}
        onSearch={this.fetchListMethod}
        onChange={this.handleChange}
        notFoundContent={fetching ? <Spin size="small" className="text-center" /> : null}
        suffixIcon={<McsIcon type="magnifier" />}
        getPopupContainer={getPopupContainer}
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