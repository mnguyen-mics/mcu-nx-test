import * as React from 'react';
import { split } from 'lodash';
import { Col, Row } from 'antd';

import CreativeCard from '../../../../../../../containers/Campaigns/Common/CreativeCard';
import { ButtonStyleless, McsIcons } from '../../../../../../../components';
import { computeDimensionsByRatio } from '../../../../../../../utils/ShapeHelper';
import EditDisplayCreativeContent from '../../../../../../Creative/DisplayAds/Edit/EditPage/EditDisplayCreativeContent';
import AuditComponent from '../../../../../../Creative/DisplayAds/Edit/EditPage/AuditComponent';
import { DrawableContentOptions, DrawableContentProps } from '../../../../../../../components/Drawer';
import { DisplayAdResource } from '../../../../../../../models/creative/CreativeResource';
import { PropertyResourceShape } from '../../../../../../../models/plugin';

interface AdGroupCardListProps {
  className: string;
  data: TempDisplayAdResource[];
  updateTableFieldStatus: (obj: { index: number, tableName: string }) => () => void;
  handlers: {
    closeNextDrawer: () => void;
    openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
  };
  updateCreative: (
    creativeData: Partial<DisplayAdResource>,
    formattedProperties: PropertyResourceShape[],
    // rendererData: RendererDataProps,
  ) => void;
  creative: DisplayAdResource;
}

interface TempProp {
  toBeRemoved: boolean;
}

type TempDisplayAdResource = DisplayAdResource & TempProp;

class AdGroupCardList extends React.Component<AdGroupCardListProps> {

  static defaultProps: Partial<AdGroupCardListProps> = {
    className: '',
    data: [],
  };

  openCreativeEditionDrawer = (creativeId: string) => () => {
    const { handlers } = this.props;
    const additionalProps = {
      openNextDrawer: handlers.openNextDrawer,
      closeNextDrawer: handlers.closeNextDrawer,
      onClose: handlers.closeNextDrawer,
      save: this.props.updateCreative,
    };

    const options = {
      additionalProps: additionalProps,
      isModal: true,
      creativeId: creativeId,
    };
    handlers.openNextDrawer(EditDisplayCreativeContent, options);
  }

  render() {

    const {
      className,
      data,
      updateTableFieldStatus,
    } = this.props;

    const cardContent = (index: number) => ({
      renderFooter: (creative: DisplayAdResource) => {
        const format = split(creative.format, 'x');
        const dimensions = computeDimensionsByRatio(Number(format[0]), Number(format[1]));

        const shapeStyle = {
          backgroundColor: '#e8e8e8',
          border: 'solid 1px #c7c7c7',
          height: `${dimensions.width}em`,
          width: `${dimensions.height}em`,
        };

        return (
          <div>
            <Row className="footer">
              <Col className="inline formatWrapper" span={16}>
                <div style={shapeStyle} />
                <div className="dimensions">{creative.format}</div>
              </Col>
              <Col className="inline buttons" span={6}>

                <ButtonStyleless
                  onClick={this.openCreativeEditionDrawer(creative.id)}
                >
                  <McsIcons
                    className="button"
                    type="pen"
                  />
                </ButtonStyleless>

                <div className="button-separator" />

                <ButtonStyleless
                  onClick={updateTableFieldStatus({ index, tableName: 'adTable' })}
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
                  creative={creative}
                  mode="creativeCard"
                />
              </Col>
            </Row>
          </div>
        );
      },
    });

    const cards = data
      .filter(card => !card.toBeRemoved)
      .map((card: TempDisplayAdResource, index: number) => ({
        id: card.id,
        toBeRemoved: card.toBeRemoved,
        view: <CreativeCard key={card.id} creative={card} {...cardContent(index)} />,
      }));

    return (
      <div className={`mcs-table-card ${className} content`}>
        <Row gutter={20}>
          {cards.map(card => (
            <Col key={card.id} span={6}>
              <div className="ad-group-card">{card.view}</div>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

export default AdGroupCardList;
