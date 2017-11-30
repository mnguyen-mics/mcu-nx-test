import * as React from 'react';
import cuid from 'cuid';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Select, Input, Spin } from 'antd';
import McsIcons from '../../../../../../../components/McsIcons';
import { generateFakeId } from '../../../../../../../utils/FakeIdHelper';
import messages from '../../../messages';
import GeonameService, { Geoname } from '../../../../../../../services/GeonameService';
import { LocationFieldModel } from './domain';

const InputGroup = Input.Group;
const Option = Select.Option;

interface Props {
  onGeonameSelect?: (locationField: LocationFieldModel) => void;
  excludedGeonamesIds: string[];
}

interface State {
  fetchingGeonames: boolean;
  incOrExc: string;
  listOfCountriesToDisplay: Geoname[];
}

type JoinedProps = Props & InjectedIntlProps;

class SelectGeoname extends React.Component<JoinedProps, State> {

  randomId = cuid();

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      fetchingGeonames: false,
      listOfCountriesToDisplay: [],
      incOrExc: 'INC',
    };
  }

  handleIncOrExcChange = (value: string) => {
    this.setState({
      incOrExc: value,
    });
  }

  attachToDOM = (elementId: string) => (triggerNode: Element) => {
    return document.getElementById(elementId) as any;
  }

  fetchCountries = (value: string = '') => {
    const { excludedGeonamesIds } = this.props;
    this.setState({ fetchingGeonames: true });
    GeonameService.getGeonames(value).then(geonames => {
      const listOfCountriesToDisplay = geonames.filter(country => {
        return (
          country.name.indexOf(value.charAt(0).toUpperCase() + value.slice(1)) >= 0 ||
          country.name.indexOf(value) >= 0
        ) && !excludedGeonamesIds.includes(country.id);
      });
      this.setState({
        fetchingGeonames: false,
        listOfCountriesToDisplay,
      });
    });
  }

  handleChange = (idCountry: string) => {
    const { onGeonameSelect } = this.props;

    const selectedCountry = this.state.listOfCountriesToDisplay.find(filteredCountry => {
      return filteredCountry.id === idCountry[0];
    });

    if (selectedCountry && onGeonameSelect) {
      const locationField = {
        id: generateFakeId(),
        resource: {
          geoname_id: selectedCountry.id,
          exclude: this.state.incOrExc === 'EXC',
        },
        deleted: false,
      };
      onGeonameSelect(locationField);
    }

    this.setState({
      listOfCountriesToDisplay: [],
    });
  }

  render() {

    const {
      fetchingGeonames,
      listOfCountriesToDisplay,
    } = this.state;

    const {
      intl: {
        formatMessage,
      },
    } = this.props;

    return (
      <InputGroup
        compact={true}
      >
        <Select
          defaultValue="INC"
          onChange={this.handleIncOrExcChange}
          getPopupContainer={this.attachToDOM(this.randomId)}
          className="small-select"
        >
          <Option value="INC" title={formatMessage(messages.contentSectionLocationOption1)}>
            <McsIcons type="check" />
            <FormattedMessage id="geoname.include" defaultMessage="Include" />
          </Option>
          <Option value="EXC" title={formatMessage(messages.contentSectionLocationOption2)}>
            <McsIcons type="close-big" />
            <FormattedMessage id="geoname.exclude" defaultMessage="Exclude" />
          </Option>
        </Select>
        <div id={this.randomId} className="wrapped-select">
          <Select
            mode="multiple"
            value={[]}
            placeholder={formatMessage(messages.contentSectionLocationInputPlaceholder)}
            notFoundContent={fetchingGeonames ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={this.fetchCountries}
            onChange={this.handleChange}
            getPopupContainer={this.attachToDOM(this.randomId)}
            className="big-select"
          >
            {listOfCountriesToDisplay.map(country =>
              <Option key={country.id}>
                {country.name}
              </Option>,
            )}
          </Select>
        </div>
      </InputGroup>
    );
  }
}

export default injectIntl(SelectGeoname);
