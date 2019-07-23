import * as Highcharts from "highcharts";

export const GRAY_COLOR = "#8ca0b3";
export const LINE_COLOR = (Highcharts as any).Color(GRAY_COLOR).setOpacity(0.4).get('rgba');
export const CROSSHAIR_COLOR = (Highcharts as any).Color(GRAY_COLOR).setOpacity(0.6).get('rgba');
export const AREA_OPACITY = 0.15;
export const BASE_CHART_HEIGHT = 400;

// LINEAR CHART
export const generateXAxisGridLine = (): Partial<Highcharts.XAxisOptions> => {
  return {
    gridLineWidth: 1,
    gridLineColor: LINE_COLOR,
    gridLineDashStyle: 'ShortDash',
    crosshair: {
      color: CROSSHAIR_COLOR,
      width: 1,
      dashStyle: 'ShortDash',
    },
  }
}

export const generateYAxisGridLine = (): Partial<Highcharts.YAxisOptions> => {
  return {
    gridLineWidth: 1,
    gridLineColor: LINE_COLOR,
    gridLineDashStyle: 'ShortDash',
  }
}

// PIE CHARTS


// COMMON
export const generateLegend = (): Partial<Highcharts.LegendOptions> => {
  return {

  }
}

export const generateTooltip = (showTooltip: boolean = true): Partial<Highcharts.TooltipOptions> => {
  return showTooltip ? {
    crosshairs: true,
    useHTML: true,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    padding: 15,
    outside: false,
    shadow: false,
    hideDelay: 0,
    headerFormat: `<span style="font-size: 12px; font-weight: bold; margin-bottom: 13px;">{point.key}</span><br/><br/>`,
    pointFormat: `<span style="color:{point.color}; font-size: 20px; margin-right: 20px;">\u25CF</span> {series.name}: <b>{point.y}</b><br/>`
  } : { enabled: false }
}