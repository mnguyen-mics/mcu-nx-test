import * as React from 'react';
import {
  Actionbar,
  Button,
  McsTabs,
  ColoredButton,
  McsIcon,
  McsDateRangePicker,
} from '@mediarithmics-private/mcs-components-library';
import { LayoutablePlugin } from '../../../../models/Plugins';
import { compose } from 'recompose';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../../../../models/plugin';
import PluginSectionGenerator, { PluginExtraField } from '../../PluginSectionGenerator';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { Form } from '@ant-design/compatible';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import {
  ColorPalletteOption,
  getColorPalettes,
  rgbToHex,
  getPerceivedBrightness,
} from '../../../../utils/ColorHelpers';
import { generateFakeId } from '../../../../utils/FakeIdHelper';
import FeedChart from '../../../Audience/Segments/Dashboard/Feeds/Charts/FeedChart';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import { FeedStatsUnit } from '../../../../utils/FeedsStatsReportHelper';
import McsMoment from '../../../../utils/McsMoment';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { defineMessages, FormattedMessage } from 'react-intl';

const FORM_NAME = 'pluginForm';
const BRIGHTNESS_THRESHOLD = 160;

export type PluginCardModalTab = 'configuration' | 'stats';

export interface PluginCardModalContentProps<T> {
  plugin: T;
  onClose: () => void;
  organisationId: string;
  save: (
    pluginValue: any,
    propertiesValue: PropertyResourceShape[],
    name?: string,
    description?: string,
  ) => void;
  pluginProperties: PropertyResourceShape[];
  disableFields: boolean;
  pluginLayout?: PluginLayout;
  isLoading: boolean;
  pluginVersionId: string;
  initialValues?: any;
  editionMode: boolean;
  selectedTab: PluginCardModalTab;
  nameField?: PluginExtraField;
  descriptionField?: PluginExtraField;
  feedStatsUnit?: FeedStatsUnit;
}

type Props<T extends LayoutablePlugin> = PluginCardModalContentProps<T> &
  InjectedThemeColorsProps &
  InjectedNotificationProps &
  InjectedFormProps &
  InjectedFeaturesProps &
  ValidatorProps;

interface State {
  backgroundColor: string;
  color: string;
  loading: boolean;
  selectedTab: PluginCardModalTab;
  imageUrl?: string;
  dateRange: McsDateRangeValue;
}

class PluginCardModalContent<T extends LayoutablePlugin> extends React.Component<Props<T>, State> {
  node?: HTMLDivElement | null;

  constructor(props: Props<T>) {
    super(props);
    this.state = {
      loading: true,
      backgroundColor: '',
      color: '',
      selectedTab: props.selectedTab,
      dateRange: {
        from: new McsMoment('now-7d'),
        to: new McsMoment('now'),
      },
    };
  }

  componentDidMount() {
    const { pluginLayout } = this.props;

    if (pluginLayout && pluginLayout.metadata && pluginLayout.metadata.small_icon_asset_url) {
      this.getData(pluginLayout.metadata.small_icon_asset_url);
    }

    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentDidUpdate(previousProps: Props<T>) {
    const { pluginLayout } = this.props;

    const { pluginLayout: previousPluginLayout } = previousProps;

    if (pluginLayout && pluginLayout.metadata && pluginLayout.metadata.small_icon_asset_url) {
      if (
        (previousPluginLayout &&
          previousPluginLayout.metadata &&
          previousPluginLayout.metadata.small_icon_asset_url !==
            pluginLayout.metadata.small_icon_asset_url) ||
        (!previousPluginLayout && !!pluginLayout)
      ) {
        this.getData(pluginLayout.metadata.small_icon_asset_url);
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  // This function close the modal when clicking outside
  // We target the layer behind the modal to detect if the click was outside
  handleClick = (e: any) => {
    if (!e.target.className?.includes('mcs-form-card-modal')) {
      return;
    }
    this.props.onClose();
  };

  getData = (assetUrl: string) => {
    this.setState({ loading: true, imageUrl: assetUrl });
    this.getPallette(`${(window as any).MCS_CONSTANTS.ASSETS_URL}${assetUrl}`);
  };

  getPallette = (url: string) => {
    const options: ColorPalletteOption = {
      paletteCount: 3,
      paletteType: 'dominant',
    };
    return getColorPalettes(url, options)
      .then((palette: number[][]) => {
        this.setState({
          loading: false,
          backgroundColor: rgbToHex(palette[0]),
          color:
            getPerceivedBrightness(palette[0]![0], palette[0]![1], palette[0]![2]) >
            BRIGHTNESS_THRESHOLD
              ? 'black'
              : 'white',
        });
        return {};
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ loading: false });
      });
  };

  generateFormFromPluginLayout = (pluginLayout: PluginLayout) => {
    const {
      organisationId,
      plugin,
      pluginProperties,
      disableFields,
      nameField,
      descriptionField,
    } = this.props;

    return pluginLayout.sections.map((section, index) => {
      const indexCondition = index !== pluginLayout.sections.length - 1;
      const fieldsCondition = section.fields !== null && section.fields.length !== 0;
      const advancedFieldsCondition =
        section.advanced_fields !== null && section.advanced_fields.length !== 0;
      const hrBooleanCondition = indexCondition && (fieldsCondition || advancedFieldsCondition);
      return (
        <div key={section.title}>
          <PluginSectionGenerator
            pluginLayoutSection={section}
            organisationId={organisationId}
            pluginProperties={pluginProperties}
            pluginPresetProperties={
              plugin.plugin_preset ? plugin.plugin_preset.properties : undefined
            }
            disableFields={!!disableFields}
            pluginVersionId={plugin.current_version_id!}
            nameField={index === 0 && nameField ? nameField : undefined}
            descriptionField={index === 0 && descriptionField ? descriptionField : undefined}
            small={true}
          />
          {hrBooleanCondition ? <hr /> : null}
        </div>
      );
    });
  };

  onSubmit = (formValues: any) => {
    const { editionMode, save, nameField, descriptionField } = this.props;
    if (editionMode === false) {
      formValues.id = formValues.id ? formValues.id : generateFakeId();
    }

    const pluginData = {
      ...formValues.plugin,
    };

    const formattedProperties = this.props.pluginProperties
      .filter(item => {
        return item.writable === true;
      })
      .map(item => {
        return {
          ...item,
          value:
            formValues.properties && formValues.properties[item.technical_name]
              ? formValues.properties[item.technical_name].value
              : item.value,
        };
      });
    save(
      pluginData,
      formattedProperties,
      (formValues.plugin && formValues.plugin.name) || (nameField && nameField.value),
      formValues.description || (descriptionField && descriptionField.value),
    );
  };

  renderForm = (pluginLayout: PluginLayout) => {
    const { handleSubmit } = this.props;
    return (
      <Form
        className={this.state.loading ? 'hide-section' : 'edit-layout mcs-form-container'}
        layout='vertical'
        onSubmit={handleSubmit(this.onSubmit)}
      >
        {this.generateFormFromPluginLayout(pluginLayout)}
        <div style={{ height: 110, width: '100%' }} />
      </Form>
    );
  };

  renderStats = () => {
    const { plugin, organisationId, feedStatsUnit } = this.props;
    const { dateRange } = this.state;

    return (
      <div className='mcs-pluginModal_feedChart_container'>
        <div className='mcs-pluginModal_feedChart_container_header'>
          <img
            className='mcs-pluginModal_feedChart_container_header_image'
            src='/react/src/assets/images/beta-icon.png'
          />
          <div className='mcs-pluginModal_feedChart_container_header_description'>
            <FormattedMessage {...messages.stats_description1} />
            <FormattedMessage {...messages.stats_description2} />
          </div>
        </div>
        <FeedChart
          title={this.renderDatePicker()}
          organisationId={organisationId}
          feedId={plugin.id}
          feedStatsUnit={feedStatsUnit}
          dateRange={dateRange}
        />
      </div>
    );
  };

  renderDatePicker = () => {
    const onChange = (newValues: McsDateRangeValue) =>
      this.setState({
        dateRange: {
          from: newValues.from,
          to: newValues.to,
        },
      });

    return <McsDateRangePicker values={this.state.dateRange} onChange={onChange} />;
  };

  public render() {
    const { onClose, handleSubmit, isLoading, pluginLayout, editionMode, hasFeature } = this.props;
    const { backgroundColor, color, loading, selectedTab } = this.state;

    if (loading || !pluginLayout || isLoading)
      return (
        <div className='plugin-modal-loading'>
          <Spin size='large' />
        </div>
      );

    let items = [
      {
        title: 'Configuration',
        key: 'configuration',
        display: <div className='tab'>{this.renderForm(pluginLayout!)}</div>,
      },
    ];

    if (hasFeature('audience-feeds_stats') && editionMode) {
      items = [
        {
          title: 'Stats (BETA)',
          key: 'stats',
          display: <div className='tab'>{this.renderStats()}</div>,
        },
      ].concat(items);
    }

    const onActiveKeyChange = (activeKey: PluginCardModalTab) => {
      this.setState({ selectedTab: activeKey });
    };

    return (
      <div className='plugin-modal' ref={node => (this.node = node)}>
        <style>{`.ant-tabs-ink-bar { background-color: ${backgroundColor}; height: 3px; }`}</style>
        <Actionbar
          pathItems={[pluginLayout.metadata.display_name]}
          backgroundColor={backgroundColor}
          edition={true}
          inverted={color === 'black' ? true : false}
        >
          <Button onClick={onClose} style={{ marginRight: 0 }}>
            <McsIcon type='close' className='close-icon' style={{ cursor: 'pointer' }} />
          </Button>
        </Actionbar>
        <div className='body'>
          <div className='header'>
            <div className='logo'>
              {this.state.imageUrl && (
                <img src={`${(window as any).MCS_CONSTANTS.ASSETS_URL}${this.state.imageUrl}`} />
              )}
            </div>
            <div className='meta'>
              <div>{pluginLayout.version}</div>
            </div>
            <div className='information'>
              <div className='name'>{pluginLayout.metadata.display_name}</div>
              <div className='description'>{pluginLayout.metadata.description}</div>
            </div>
          </div>
          <div className='tabs'>
            <McsTabs items={items} defaultActiveKey={selectedTab} onChange={onActiveKeyChange} />
          </div>
          {selectedTab === 'configuration' ? (
            <div className='footer'>
              <Button className={' m-r-20'} onClick={onClose}>
                Close
              </Button>
              <ColoredButton
                className='mcs-primary'
                backgroundColor={backgroundColor}
                color={color}
                onClick={handleSubmit(this.onSubmit)}
              >
                {' '}
                {isLoading ? <LoadingOutlined /> : null} Save
              </ColoredButton>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default compose<Props<LayoutablePlugin>, PluginCardModalContentProps<LayoutablePlugin>>(
  injectThemeColors,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  injectNotifications,
  injectFeatures,
)(PluginCardModalContent);

const messages: {
  [metric: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  stats_description1: {
    id: 'audience.feeds.stats.description1',
    defaultMessage:
      'The chart below displays the segment loads sent to the external platform, \
    day by day: whenever a user is entering / leaving the segment, \
    this feed is keeping in sync the destination segment.',
  },
  stats_description2: {
    id: 'audience.feeds.stats.description2',
    defaultMessage:
      'When the feed is created, the platform is streaming all the users that \
    entered the segment prior to the feed creation to be sure that the full segment is \
    shared with the external platform. Hence, it is normal to see a spike in the user \
    additions load at the creation of the feed and afterwards a decrease in the segment loads size.',
  },
});
