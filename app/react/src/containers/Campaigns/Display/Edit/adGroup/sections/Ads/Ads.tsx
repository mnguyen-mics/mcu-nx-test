import * as React from 'react';
import { InjectedFormProps, WrappedFieldArrayProps } from 'redux-form';
import { snakeCase, split } from 'lodash';
import { Spin, Col, Row } from 'antd';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router';

import { EmptyRecords, ButtonStyleless, McsIcons } from '../../../../../../../components';
import messages from '../../../messages';
import { AdFieldModel, isCreateCreativeResource, isAdResource } from './domain';
import { updateDisplayCreative } from '../../../../../../../formServices/CreativeServiceWrapper';
import CreativeService from '../../../../../../../services/CreativeService';
import { DrawableContentProps, DrawableContentOptions } from '../../../../../../../components/Drawer';
import { PropertyResourceShape } from '../../../../../../../models/plugin';
import { isFakeId } from '../../../../../../../utils/FakeIdHelper';
import { DisplayAdResource } from '../../../../../../../models/creative/CreativeResource';
import CreativeCard from '../../../../../../../containers/Campaigns/Common/CreativeCard';
import { computeDimensionsByRatio } from '../../../../../../../utils/ShapeHelper';
import { normalizeArrayOfObject } from '../../../../../../../utils/Normalizer';
import EditDisplayCreativeContent from '../../../../../../Creative/DisplayAds/Edit/EditPage/EditDisplayCreativeContent';
import AuditComponent from '../../../../../../Creative/DisplayAds/Edit/EditPage/AuditComponent';
import { Index } from '../../../../../../../utils/index';

export interface AdsProps {
  // adFields: AdFieldModel[];
  RxF: InjectedFormProps;
  handlers: {
    closeNextDrawer: () => void;
    openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
    updateTableFieldStatus: (obj: { index: number, tableName: string }) => () => void;
    updateTableFields: (obj: { newFields: any[], tableName: string }) => () => void;
    // updateDisplayAdTableFields: (obj: {newFields: AdFieldModel[], tableName: string }) => () => void;
  };
}

interface DisplayAdResourceWithFieldIndex {
  resource: DisplayAdResource;
  fieldKey: string;
  fieldIndex: number;
}

interface AdsState {
  displayCreativeCacheById: Index<DisplayAdResource>;
  loading: boolean;
}

type JoinedProps = AdsProps
  & RouteComponentProps<{ organisationId: string }>
  & WrappedFieldArrayProps<AdFieldModel>
  & InjectedIntlProps;

class Ads extends React.Component<JoinedProps, AdsState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      loading: false,
      displayCreativeCacheById: {},
    };
  }

  componentWillReceiveProps(nextProps: JoinedProps) {

    if (nextProps.fields.length > this.props.fields.length) {

      const loadedCreativeIds = Object.keys(this.state.displayCreativeCacheById);
      const creativeIdsToBeLoaded: string[] = [];
      nextProps.fields.getAll().forEach((field, index) => {
        if (!isCreateCreativeResource(field.resource) && !loadedCreativeIds.includes(field.resource.creative_id)) {
          creativeIdsToBeLoaded.push(field.resource.creative_id);
        }
      });
      Promise.all(
        creativeIdsToBeLoaded.map(id => CreativeService.getDisplayAd(id).then(res => res.data)),
      ).then(creatives => {
        this.setState(prevState => ({
          displayCreativeById: {
            ...prevState.displayCreativeCacheById,
            ...normalizeArrayOfObject(creatives, 'id'),
          },
        }));
      });
    }
  }

  updateCreative = (creative: any, properties: PropertyResourceShape[]) => {
    // const {
    //   match: {
    //     params: {
    //       organisationId,
    //     },
    //   },
    //   handlers,
    //   fields,
    // } = this.props;
    // const adFields = fields.getAll();
    // const formattedObject = Object.keys(creative).reduce((acc: any, key: any) => ({
    //   ...acc,
    //   [key.indexOf('Table') !== -1 ? key : snakeCase(key.replace('adGroup', ''))]: creative[key],
    // }), {});
    // const updatedValues = adFields.map((item) => {
    //   return item.id === formattedObject.id ? formattedObject : item;
    // });
    // updateDisplayCreative(organisationId, creative, properties)
    //   .then(() => {
    //     this.setState({ loading: true }, () => {
    //       // handlers.updateDisplayAdTableFields({ newFields: updatedValues, tableName: 'adTable' });
    //       this.setState({ loading: false });
    //       this.props.handlers.closeNextDrawer();
    //     });
    //   });
  }

  openCreativeEditionDrawer = (data: DisplayAdResourceWithFieldIndex) => () => {
    // const { handlers } = this.props;
    // const additionalProps = {
    //   openNextDrawer: handlers.openNextDrawer,
    //   closeNextDrawer: handlers.closeNextDrawer,
    //   onClose: handlers.closeNextDrawer,
    //   save: this.updateCreative,
    // };

    // const options = {
    //   additionalProps: additionalProps,
    //   isModal: true,
    //   creativeId: creativeId,
    // };
    // handlers.openNextDrawer(EditDisplayCreativeContent, options);
  }

  getCreativeCardFooter = (data: DisplayAdResourceWithFieldIndex) => {
    const { fields } = this.props;

    const format = split(data.resource.format, 'x');
    const dimensions = computeDimensionsByRatio(Number(format[0]), Number(format[1]));

    const shapeStyle = {
      backgroundColor: '#e8e8e8',
      border: 'solid 1px #c7c7c7',
      height: `${dimensions.width}em`,
      width: `${dimensions.height}em`,
    };

    const removeField = () => fields.remove(data.fieldIndex);

    return (
      <div>
        <Row className="footer">
          <Col className="inline formatWrapper" span={16}>
            <div style={shapeStyle} />
            <div className="dimensions">{data.resource.format}</div>
          </Col>
          <Col className="inline buttons" span={6}>

            <ButtonStyleless
              onClick={this.openCreativeEditionDrawer(data)}
            >
              <McsIcons
                className="button"
                type="pen"
              />
            </ButtonStyleless>

            <div className="button-separator" />

            <ButtonStyleless
              onClick={removeField}
            >
              <McsIcons
                className="button"
                type="delete"
              />
            </ButtonStyleless>
          </Col>
        </Row>
        <Row className="footer">
          <Col className="inline formatWrapper" span={22}>
            <AuditComponent
              key={data.resource.id}
              creative={data.resource}
              mode="creativeCard"
            />
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const {
      intl: {
        formatMessage,
      },
      fields,
      handlers,
    } = this.props;

    const { displayCreativeCacheById } = this.state;

    const allCreatives: DisplayAdResourceWithFieldIndex[] = [];
    if (fields.getAll()) {
      fields.getAll().forEach((field, index) => {
        if (isCreateCreativeResource(field.resource)) {
          allCreatives.push({
            resource: field.resource.creative,
            fieldIndex: index,
            fieldKey: field.id,
          });
        } else if (displayCreativeCacheById[field.resource.creative_id]) {
          allCreatives.push({
            resource: displayCreativeCacheById[field.resource.creative_id],
            fieldIndex: index,
            fieldKey: field.id,
          });
        }
      });
    }

    const cards = allCreatives
      .map(data => {
        const getFooter = () => this.getCreativeCardFooter(data);
        return (
          <Col key={data.fieldKey} span={6}>
            <div className="ad-group-card">
              <CreativeCard key={data.fieldKey} creative={data.resource} renderFooter={getFooter} />
            </div>
          </Col>
        );
      });

    // const cards = data
    //   .filter(card => !card.deleted)
    //   .map((card: AdFieldModel, index: number) => ({
    //     id: card.id,
    //     toBeRemoved: card.deleted,
    //     view: <CreativeCard key={card.resource.creativeResource.id} creative={card} {...cardContent(index)} />,
    //   }));

    return (
      <div id="ads">
        <Spin spinning={this.state.loading}>
          <div className="ad-group-ad-section">
            <div className={`mcs-table-card content`}>
              <Row gutter={20}>
                {cards}
              </Row>
            </div>

            {/* {!adFields.filter(adField => !adField.deleted).length
              && (
                <EmptyRecords
                  iconType="ads"
                  message={formatMessage(messages.contentSectionAdEmptyTitle)}
                />
              )
            } */}
          </div>
        </Spin>
      </div>
    );
  }
}

export default injectIntl(Ads);
