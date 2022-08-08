import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class FunnelPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickDataStudioFunnel();
  }

  @logGetter()
  get dimensionCategory() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions');
  }

  @logGetter()
  get funnelEmpty() {
    return cy.get('.mcs-funnel_empty');
  }

  @logGetter()
  get channelIdDimension() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID');
  }

  @logGetter()
  get productIdDimension() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions--PRODUCT_ID');
  }

  @logGetter()
  get brandDimension() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions--BRAND');
  }

  @logGetter()
  get category1Dimension() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY1');
  }

  @logGetter()
  get category2Dimension() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY2');
  }

  @logGetter()
  get category3Dimension() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY3');
  }

  @logGetter()
  get category4Dimension() {
    return cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY4');
  }

  @logGetter()
  get fieldDimension() {
    return cy.get('#mcs-funnel_expression_select_anchor');
  }

  @logGetter()
  get stepBuilder() {
    return cy.get('.mcs-timelineStepBuilder_step');
  }

  @logGetter()
  get stepDimension() {
    return cy.get('.mcs-funnelQueryBuilder_step_dimensions');
  }

  @logGetter()
  get deltaInfo() {
    return cy.get('.mcs-funnel_deltaInfo');
  }

  @logGetter()
  get stepInfo() {
    return cy.get('.mcs-funnel_stepInfo');
  }

  @logGetter()
  get stepInfoDesc() {
    return cy.get('.mcs-funnel_stepInfo_desc');
  }

  @logGetter()
  get timeStart() {
    return cy.get('.mcs-timelineStepBuilder_step_timelineStart');
  }

  @logGetter()
  get timeEnd() {
    return cy.get('.mcs-timelineStepBuilder_step_timelineEnd');
  }

  @logGetter()
  get time() {
    return cy.get('.mcs-funnelQueryBuilder_timeline_date');
  }

  @logGetter()
  get stepHover() {
    return cy.get('.mcs-funnelStepHover');
  }

  @logGetter()
  get dropDownDimensionValue() {
    return cy.get('.mcs-resourceByNameSelector_dropdown');
  }

  @logGetter()
  get funnelChart() {
    return cy.get('.mcs-funnel_chart');
  }

  @logGetter()
  get conversions() {
    return cy.get('.mcs-funnel_conversions');
  }

  @logGetter()
  get conversioInfo() {
    return cy.get('.mcs-funnel_conversionInfo');
  }

  @logGetter()
  get funnelAnalyticsPage() {
    return cy.get('.mcs-funnelQueryBuilder');
  }

  @logFunction()
  clickDimensionCategoryField() {
    cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
  }

  @logFunction()
  clickChannelIdDimension() {
    this.channelIdDimension.click();
  }

  @logFunction()
  clickProductIdDimension() {
    this.productIdDimension.click();
  }

  @logFunction()
  clickBrandDimension() {
    this.brandDimension.click();
  }

  @logFunction()
  clickCategory1Dimension() {
    this.category1Dimension.click();
  }

  @logFunction()
  clickCategory2Dimension() {
    this.category2Dimension.click();
  }

  @logFunction()
  clickCategory3Dimension() {
    this.category3Dimension.click();
  }

  @logFunction()
  clickCategory4Dimension() {
    this.category4Dimension.click();
  }

  @logFunction()
  clickHasConversion() {
    cy.get('.mcs-funnelQueryBuilder_select--dimensions--HAS_CONVERSION').click();
  }

  @logFunction()
  selectChannelIdDimension() {
    cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click({ force: true });
  }

  @logFunction()
  typeDimensionCategory(dimensionCategory: string) {
    this.dimensionCategory.click();
    this.dimensionCategory.click().type(dimensionCategory);
  }

  @logFunction()
  clickDimensionValueField(pos: number) {
    cy.get('.mcs-funnelQueryBuilder_dimensionValue').eq(pos).click();
  }

  @logFunction()
  typeDimensionValue(pos: number, dimensionValue: string) {
    cy.get('.mcs-funnelQueryBuilder_dimensionValue')
      .eq(pos)
      .type(dimensionValue + '{enter}');
  }

  @logFunction()
  clickBtnExecuteQuery() {
    cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
  }

  @logFunction()
  clickBtnAddStep() {
    cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
  }

  @logFunction()
  clickBtnSort(pos: number) {
    cy.get('.mcs-timelineStepBuilder_sortBtn').eq(pos).click();
  }

  @logFunction()
  clickBtnRemoveFilter() {
    cy.get('.mcs-funnelQueryBuilder_removeFilterBtn').first().click();
  }

  @logFunction()
  clickBtnAddDimension() {
    cy.get('.mcs-funnelQueryBuilder_addDimensionBtn').first().click();
  }

  @logFunction()
  clickDateRange() {
    cy.get('.mcs-dateRangePicker').click();
  }

  @logFunction()
  typePeriod(period: string) {
    cy.contains(period).click({ force: true });
  }

  @logFunction()
  typeDate(pos: number, date: string) {
    cy.get('.ant-picker-input')
      .eq(pos)
      .find('input')
      .clear({ force: true })
      .type(date, { force: true });
  }

  @logFunction()
  clickSplitBy() {
    cy.get('.mcs-funnel_splitBy_select').click();
  }

  clickSplitByOption() {
    cy.get('.mcs-funnelSplitBy_option').first().click();
  }

  @logFunction()
  clickFunnelForOthers() {
    cy.get('.mcs-funnel_complementaryButton').eq(1).find('button').click();
  }
}

export default FunnelPage;
