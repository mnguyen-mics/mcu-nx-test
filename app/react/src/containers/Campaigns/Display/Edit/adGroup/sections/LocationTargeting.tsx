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
import GeonameService, { Geoname } from '../../../../../../services/GeonameService';

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
  formValues: any;
}

interface LocationTargetingState {
  listOfCountriesToDisplay: Geoname[];
  locationTargetingDisplayed: boolean;
  incOrExc: string;
  fetching?: boolean;
  visible: boolean;
}

class LocationTargeting extends React.Component<LocationTargetingProps, LocationTargetingState> {

  state = {
    locationTargetingDisplayed: false,
    listOfCountriesToDisplay: [],
    value: [],
    fetching: false,
    incOrExc: 'INC',
    visible: false,
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = (e: Event) => {
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e: Event) => {
    this.setState({
      visible: false,
    });
  }

  fetchCountries = (value: string = '') => {
    GeonameService.getGeonames().then(geonames => {
      const listOfCountriesToDisplay = geonames.filter((country: {name: string}) => {
        return country.name.indexOf(value.charAt(0).toUpperCase() + value.slice(1)) >= 0 || country.name.indexOf(value) >= 0;
      });
      this.setState({ listOfCountriesToDisplay });
    });
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
      return filteredCountry.id === idCountry[0];
    });

    const { handlers } = this.props;

    const incOrExc: string = this.state.incOrExc;

    const selectedLocation = {
      ...selectedCountry,
      exclude: incOrExc === 'EXC',
    };

    handlers.updateTableFields({
      newFields: [selectedLocation],
      tableName: 'locationTargetingTable',
    });

    this.setState({
      listOfCountriesToDisplay: [],
    });
  }

  displayLocationTargetingSection = () => {
    this.setState({
      locationTargetingDisplayed: !this.state.locationTargetingDisplayed,
    });
  }

  render() {

    const {
      formValues,
    } = this.props;

    const { fetching, listOfCountriesToDisplay, value } = this.state;

    // If we have time, do an HOC for the select component in order to use generic id element
    return (
      <div id="locationTargeting" className="locationTargeting">
        <FormSection
          subtitle={messages.sectionSubtitleLocation}
          title={messages.sectionTitleLocationTargeting}
        />
        <Checkbox
          checked={(formValues && formValues.length > 0) || this.state.locationTargetingDisplayed ? true : false}
          className="checkbox-location-section"
          onChange={this.displayLocationTargetingSection}
        >
          <FormattedMessage id="monid" defaultMessage="I want to target a specific location" />
        </Checkbox>
        <Row className={!this.state.locationTargetingDisplayed && (!formValues || formValues.length === 0) ? 'hide-section' : ''}>
          <Row align="middle" type="flex">
            <Col span={4} />
            <Col span={10} >
              <FieldArray
                component={SearchResultBox}
                name="locationTargetingTable"
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
                    mode="multiple"
                    style={{ width: '100%' }}
                    value={value}
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
