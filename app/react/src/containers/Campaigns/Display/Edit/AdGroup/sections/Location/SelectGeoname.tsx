import * as React from 'react';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import cuid from 'cuid';
import * as Antd from 'antd';
import McsIcon from '../../../../../../../components/McsIcon';
import messages from '../../../messages';
import GeonameService, {
  Geoname,
} from '../../../../../../../services/GeonameService';
import { LocationFieldModel } from '../../domain';
import { Select } from '../../../../../../../components/PopupContainers';

const InputGroup = Antd.Input.Group;
const Option = Antd.Select.Option;
const Spin = Antd.Spin;

interface Props {
  onGeonameSelect?: (locationField: LocationFieldModel) => void;
  hiddenGeonameIds: string[];
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
  };

  fetchCountries = (value: string = '') => {
    const { hiddenGeonameIds } = this.props;
    this.setState({ fetchingGeonames: true });
    GeonameService.getGeonames(value)
      .then(res => res.data)
      .then(geonames => {
        const listOfCountriesToDisplay = geonames.filter(country => {
          return (
            (country.name.indexOf(
              value.charAt(0).toUpperCase() + value.slice(1),
            ) >= 0 ||
              country.name.indexOf(value) >= 0) &&
            !hiddenGeonameIds.includes(country.id)
          );
        });
        this.setState({
          fetchingGeonames: false,
          listOfCountriesToDisplay,
        });
      });
  };

  handleChange = (idCountry: string) => {
    const { onGeonameSelect } = this.props;

    const selectedCountry = this.state.listOfCountriesToDisplay.find(
      filteredCountry => {
        return filteredCountry.id === idCountry[0];
      },
    );

    if (selectedCountry && onGeonameSelect) {
      const locationField = {
        key: cuid(),
        model: {
          geoname_id: selectedCountry.id,
          country: selectedCountry.country_iso,
          admin1: selectedCountry.admin1,
          admin2: selectedCountry.admin2,
          exclude: this.state.incOrExc === 'EXC',
        },
      };
      onGeonameSelect(locationField);
    }

    this.setState({
      listOfCountriesToDisplay: [],
    });
  };

  render() {
    const { fetchingGeonames, listOfCountriesToDisplay } = this.state;

    const { intl: { formatMessage } } = this.props;

    return (
      <InputGroup compact={true}>
        <div className="small-select">
          <Select defaultValue="INC" onChange={this.handleIncOrExcChange}>
            <Option
              value="INC"
              title={formatMessage(messages.contentSectionLocationOption1)}
            >
              <McsIcon type="check" />
              <FormattedMessage id="geoname.include" defaultMessage="Include" />
            </Option>
            <Option
              value="EXC"
              title={formatMessage(messages.contentSectionLocationOption2)}
            >
              <McsIcon type="close-big" />
              <FormattedMessage id="geoname.exclude" defaultMessage="Exclude" />
            </Option>
          </Select>
        </div>
        <div className="big-select">
          <Select
            mode="multiple"
            value={[]}
            placeholder={formatMessage(
              messages.contentSectionLocationInputPlaceholder,
            )}
            notFoundContent={fetchingGeonames ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={this.fetchCountries}
            onChange={this.handleChange}
          >
            {listOfCountriesToDisplay.map(country => (
              <Option key={country.id}>{country.name}</Option>
            ))}
          </Select>
        </div>
      </InputGroup>
    );
  }
}

export default injectIntl(SelectGeoname);
