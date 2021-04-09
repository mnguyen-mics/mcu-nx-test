import { Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { FunnelTemplate } from './Constants';

interface FunnelTemplateSelectorProps {
  selectedValue?: FunnelTemplate
}

type Props = FunnelTemplateSelectorProps & RouteComponentProps<{ organisationId: string }>;
class FunnelTemplateSelector extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      selectedValue 
    } = this.props;

    if ((selectedValue !== prevProps.selectedValue) && selectedValue) {
      this.handleTemplateSelect(selectedValue);
    }
  }

  handleTemplateSelect = (value: FunnelTemplate) => {
    const { history,
      match: {
        params: { organisationId }
      }
    } = this.props;
    let templateUrl;
    switch (value) {
      case 'RETURN_ON_AD_SPEND':
        templateUrl = `/v2/o/${organisationId}/datastudio/funnel?filter=%5B%7B%22name%22%3A%22Step%201%22%2C%22filter_clause%22%3A%7B%22operator%22%3A%22OR%22%2C%22filters%22%3A%5B%7B%22dimension_name%22%3A%22TYPE%22%2C%22not%22%3Afalse%2C%22operator%22%3A%22EXACT%22%2C%22expressions%22%3A%5B%22DISPLAY_AD%22%5D%2C%22case_sensitive%22%3Afalse%7D%5D%7D%7D%2C%7B%22name%22%3A%22Step%202%22%2C%22filter_clause%22%3A%7B%22operator%22%3A%22AND%22%2C%22filters%22%3A%5B%7B%22dimension_name%22%3A%22EVENT_TYPE%22%2C%22not%22%3Afalse%2C%22operator%22%3A%22EXACT%22%2C%22expressions%22%3A%5B%22%24transaction_confirmed%22%5D%2C%22case_sensitive%22%3Afalse%7D%5D%7D%7D%5D&from=now-7d&to=now&template=RETURN_ON_AD_SPEND`;
        break;
      case 'BRAND_HALO':
        templateUrl = `/v2/o/${organisationId}/datastudio/funnel?filter=%5B%7B%22name%22%3A%22Step%201%22%2C%22filter_clause%22%3A%7B%22operator%22%3A%22AND%22%2C%22filters%22%3A%5B%7B%22dimension_name%22%3A%22TYPE%22%2C%22not%22%3Afalse%2C%22operator%22%3A%22EXACT%22%2C%22expressions%22%3A%5B%22DISPLAY_AD%22%5D%2C%22case_sensitive%22%3Afalse%7D%2C%7B%22dimension_name%22%3A%22SEGMENT_ID%22%2C%22not%22%3Afalse%2C%22operator%22%3A%22EXACT%22%2C%22expressions%22%3A%5B%5D%2C%22case_sensitive%22%3Afalse%7D%5D%7D%7D%2C%7B%22name%22%3A%22Step%202%22%2C%22filter_clause%22%3A%7B%22operator%22%3A%22AND%22%2C%22filters%22%3A%5B%7B%22dimension_name%22%3A%22EVENT_TYPE%22%2C%22not%22%3Afalse%2C%22operator%22%3A%22EXACT%22%2C%22expressions%22%3A%5B%22%24transaction_confirmed%22%5D%2C%22case_sensitive%22%3Afalse%7D%2C%7B%22dimension_name%22%3A%22BRAND%22%2C%22not%22%3Afalse%2C%22operator%22%3A%22EXACT%22%2C%22expressions%22%3A%5B%5D%2C%22case_sensitive%22%3Afalse%7D%5D%7D%7D%5D&from=now-7d&to=now&template=BRAND_HALO`;
        break;
      default:
        templateUrl = `/v2/o/${organisationId}/datastudio/funnel?from=now-7d&to=now`
    }

    history.push(templateUrl);
  }
  render() {
    const { selectedValue } = this.props;
    return (<Select className={"mcs-funnelTemplateSelector"} defaultValue={'Select a template'} onChange={this.handleTemplateSelect} value={selectedValue}>
      <Option value="RETURN_ON_AD_SPEND">Post Campaign Revenue</Option>
      <Option value="BRAND_HALO">Brand Halo</Option>
    </Select>)
  }
}

export default compose<FunnelTemplateSelectorProps, FunnelTemplateSelectorProps>(
  withRouter
)(FunnelTemplateSelector);
