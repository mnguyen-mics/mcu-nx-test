import Page from '../../Page';
import faker from 'faker';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class Charts extends Page {
  public name: string;
  public type: string;
  public multisteps: number;

  constructor() {
    super();
    this.name = faker.random.words(2);
    this.type = 'table';
    this.multisteps = 0;
  }

  get myself() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs');
  }

  @logGetter()
  get content() {
    switch (this.type) {
      case 'area':
        return cy.get('.mcs-chart_content_container');
      case 'bar':
        //return cy.get('.mcs-otqlChart_content_bar');
        // return cy.get('.mcs-chart_content_container');
        return cy.get('.ant-tabs-content-holder');
      case 'chart':
        //return cy.get('.mcs-chart_content_container');
        return cy.get('.ant-tabs-content-holder');
      case 'pie':
        return cy.get('.mcs-otqlChart_content_pie');
      case 'radar':
        return cy.get('.mcs-otqlChart_content_radar');
      default:
        return cy.get('.mcs-otqlChart_content_bar');
    }
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-otqlInputEditor_save_button');
  }

  @logFunction()
  clickSave() {
    this.btnSave.click();
  }

  @logFunction()
  typeName(arg_name: string = this.name) {
    this.name = arg_name;
    cy.get('.mcs-aggregationRenderer_chart_name').type(this.name);
  }

  @logFunction()
  clickSubmit() {
    cy.get('.mcs-aggregationRenderer_charts_submit').click();
    cy.wait(1000);
  }

  @logFunction()
  clickBarIcon() {
    cy.get('.mcs-otqlChart_icons_bar').click();
    cy.wait(1000);
    this.type = 'bar';
  }

  @logFunction()
  clickRadarIcon() {
    cy.get('.mcs-otqlChart_icons_radar').click();
    cy.wait(1000);
    this.type = 'radar';
  }

  @logFunction()
  clickPieIcon() {
    cy.get('.mcs-otqlChart_icons_pie').click();
    cy.wait(1000);
    this.type = 'pie';
  }

  @logFunction()
  clickAreaIcon() {
    cy.get('.mcs-otqlChart_icons_area').click();
    cy.wait(1000);
    this.type = 'area';
  }

  @logFunction()
  clickPercentageOption() {
    cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
    cy.get('.mcs-chartOptions_percentage').click();
    cy.wait(1000);
  }

  @logFunction()
  clickIndexOption() {
    cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
    cy.get('.mcs-chartOptions_index').click();
  }

  @logFunction()
  shouldContain(data: string, pos: number = 0) {
    if (this.type == 'radar' || this.type == 'area' || this.multisteps != 0) {
      this.content.get('svg text').should('contain', data);
    } else {
      this.content.eq(pos).trigger('mouseover');
      this.content.eq(pos).should('contain', data);
    }
  }
}

export default Charts;
