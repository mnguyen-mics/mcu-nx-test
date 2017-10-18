import * as React from 'react';
import {  Row, Col, Checkbox, Input, Select, Tooltip, Spin } from 'antd';
import {  FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import { McsIcons } from '../../../../../../components';
import messages from '../../messages';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';
import { InputProps } from 'antd/lib/input/Input';
import { FormSection, SearchResultBox } from '../../../../../../components/Form';
import GeonameService from '../../../../../../services/GeonameService';

const InputGroup = Input.Group;
const Option = Select.Option;

interface LocationTargetingProps {
  formItemProps?: FormItemProps;
  label?: string;
  inputProps?: InputProps;
  fieldGridConfig: object;
  helpToolTipProps?: TooltipProps;
  style: React.CSSProperties;
  value: string | undefined;
  placeholder: string;
  notFoundContent: JSX.Element;
  filterOption: boolean;
  onSearch: () => void;
  onChange: () => void;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  handlers: {
    updateTableFields: (obj: {
      newFields: {},
      tableName: string;
    }) => void;
  };
}

interface LocationTargetingState {
  listOfCountriesToDisplay: Array<{
    id: number;
    name: string;
  }>;
  locationTargetingDisplayed: boolean;
  dataSource: Array<{
    data: {
      name: string;
    },
  }>;
  incOrExc: string;
  fetching?: boolean;
}

class LocationTargeting extends React.Component<LocationTargetingProps, LocationTargetingState> {

  state = {
    locationTargetingDisplayed: false,
    dataSource: [],
    listOfCountriesToDisplay: [],
    value: [],
    fetching: false,
    incOrExc: 'INC',
  };

  fetchCountries = (value: string = '') => {
    GeonameService.getGeonames().then(json => {
      this.setState({dataSource: json.data});
    }).then(() => {
      const listOfCountriesToDisplay = this.state.dataSource!.filter((country: {name: string}) => {
        return country.name.indexOf(value.charAt(0).toUpperCase() + value.slice(1)) >= 0 || country.name.indexOf(value) >= 0;
      });
      this.setState({ listOfCountriesToDisplay });
    });
  }

  componentDidMount() {
    this.fetchCountries();
  }

  handleIncOrExcChange = (value: string) => {
    this.setState({
      incOrExc: value,
    });
  }

  attachToDOM = (elementId: string) => (triggerNode: Element) => {
    return document.getElementById('selectContainer') as any;
  }

  handleChange = (idCountry: string) => {

    const selectedCountry = this.state.listOfCountriesToDisplay.find((filteredCountry: {id: string}) => {
      return filteredCountry.id === idCountry;
    });

    const { handlers } = this.props;

    const incOrExc: string = this.state.incOrExc;

    const selectedLocation = {
      ...selectedCountry,
      exclude: incOrExc === 'EXC',
    };

    handlers.updateTableFields({
      newFields: [selectedLocation],
      tableName: 'locationAndTargetingTable',
    });
  }

  displayLocationTargetingSection = () => {
    this.setState({
      locationTargetingDisplayed: !this.state.locationTargetingDisplayed,
    });
  }

  render() {

    const { fetching, listOfCountriesToDisplay } = this.state;
    const { handlers } = this.props;

    // If we have time, do an HOC for the select component in order to use generic id element
    return (
      <div id="locationTargeting" className="locationTargeting">
        <FormSection
          subtitle={messages.sectionSubtitle3bis}
          title={messages.sectionTitle3bis}
        />
        <Checkbox className="checkbox-location-section" onChange={this.displayLocationTargetingSection}>
          <FormattedMessage id="monid" defaultMessage="I want to target a specific location" />
        </Checkbox>
        <Row className={!this.state.locationTargetingDisplayed ? 'hide-section' : ''}>
          <Row align="middle" type="flex">
            <Col span={4} />
            <Col span={10} >
              <FieldArray
                component={SearchResultBox}
                name="locationAndTargetingTable"
                props={handlers}
              />
            </Col>
          </Row>
          <Row align="middle" type="flex">
            <Col span={4} className="label-col">
              <FormattedMessage id="label-location-targeting" defaultMessage="* Location :" />
            </Col>
            <Col span={10} >
              <InputGroup
                compact={true}
              >
                <Select
                  style={{ width: '25%' }}
                  defaultValue="INC"
                  onChange={this.handleIncOrExcChange}
                  getPopupContainer={this.attachToDOM('selectContainer')}
                >
                  <Option value="INC">
                    <McsIcons type="check" />
                    Include
                  </Option>
                  <Option value="EXC">
                  <McsIcons type="close-big" />
                    Exclude
                  </Option>
                </Select>
                <div id="selectContainer" style={{width: '75%'}}>
                  <Select
                    style={{ width: '100%' }}
                    value={undefined}
                    placeholder="Enter a location (country, region or department)"
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    filterOption={false}
                    onSearch={this.fetchCountries}
                    onChange={this.handleChange}
                    getPopupContainer={this.attachToDOM('selectContainer')}
                  >
                    {listOfCountriesToDisplay.map((country: {id: number; name: string}) =>
                      <Option key={country.id}> {country.name}</Option>,
                    )}
                  </Select>
                </div>
              </InputGroup>
            </Col>
            <Col span={2} className="field-tooltip">
              <Tooltip placement={'right'} title={'blabla'}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          </Row>
        </Row>
      </div>
    );
  }
}

export default LocationTargeting;
