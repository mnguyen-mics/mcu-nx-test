import * as React from 'react';
import {  Row, Col, Checkbox, Input, Select, Tooltip, Spin } from 'antd';
import {  FieldArray } from 'redux-form';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';

import { McsIcons } from '../../../../../../components';
import messages from '../../messages';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';
import { InputProps } from 'antd/lib/input/Input';
import { FormSection, SearchResultBox } from '../../../../../../components/Form';
import GeonameService, { Geoname } from '../../../../../../services/GeonameService';
import { generateFakeId } from '../../../../../../utils/FakeIdHelper';

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
  intl: InjectedIntlProps; // change to ts
  formValues: Array<{}>;
  formatMessage: (arg: any) => string;
}

interface LocationTargetingState {
  listOfCountriesToDisplay: Geoname[];
  locationTargetingDisplayed: boolean;
  incOrExc: string;
  fetching?: boolean;
  visible: boolean;
}

const randomId: string = generateFakeId();

class LocationTargeting extends React.Component<LocationTargetingProps & InjectedIntlProps, LocationTargetingState> {

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
    return document.getElementById(elementId) as any;
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
      intl: {
        formatMessage,
      },
    } = this.props;

    const { fetching, listOfCountriesToDisplay, value } = this.state;

    return (
      <div id="locationTargeting" className="locationTargeting">
        <FormSection
          subtitle={messages.sectionSubtitleLocation}
          title={messages.sectionTitleLocationTargeting}
        />
        <Checkbox
          checked={(formValues && formValues.length > 0) || this.state.locationTargetingDisplayed ? true : false}
          className="field-label checkbox-location-section"
          onChange={this.displayLocationTargetingSection}
        >
          <FormattedMessage id="location-checkbox-message" defaultMessage="I want to target a specific location" />
        </Checkbox>
        <div className={!this.state.locationTargetingDisplayed && (!formValues || formValues.length === 0) ? 'hide-section' : ''}>
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
            <Col span={4} className="label-col field-label">
              <FormattedMessage id="label-location-targeting" defaultMessage="Location : " />
            </Col>
            <Col span={10} >
              <InputGroup
                compact={true}
              >
                <Select
                  defaultValue="INC"
                  onChange={this.handleIncOrExcChange}
                  getPopupContainer={this.attachToDOM(randomId)}
                  className="small-select"
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
                <div id={randomId} className="wrapped-select">
                  <Select
                    mode="multiple"
                    value={value}
                    placeholder={formatMessage(messages.contentSectionLocationInputPlaceholder)}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    filterOption={false}
                    onSearch={this.fetchCountries}
                    onChange={this.handleChange}
                    getPopupContainer={this.attachToDOM(randomId)}
                    className="big-select"
                  >
                    {listOfCountriesToDisplay.map((country: {id: number; name: string}) =>
                      <Option key={country.id}> {country.name}</Option>,
                    )}
                  </Select>
                </div>
              </InputGroup>
            </Col>
            <Col span={2} className="field-tooltip">
              <Tooltip placement="right" title={<FormattedMessage id="tooltip-location-message" defaultMessage="Lorem ipsum" />}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default injectIntl(LocationTargeting);
