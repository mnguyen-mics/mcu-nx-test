import React from 'react';
import Plottable from 'plottable';
import moment from 'moment';
import { areDatesSameDay } from '../../utils/DateHelper';

class ChartUtils {

  static formatXAxis(xScale, dataset, hasHoursOfDay) {
    const xAxis = new Plottable.Axes.Numeric(xScale, 'bottom');
    xAxis.formatter(d => {
      const d1 = new Date(d);
      const lastDate = new Date(dataset[dataset.length - 1].day);
      const firstDate = new Date(dataset[0].day);
      if (hasHoursOfDay && areDatesSameDay(lastDate, firstDate)) {
        return moment(d1).format('HH:00');
      } else if (hasHoursOfDay) {
        return moment(d1).format('YYYY-MM-DD HH:00');
      }
      return moment(d1).format('YYYY-MM-DD');
    });
    return xAxis;
  }

  static attachEventListeners(table) {
    global.window.addEventListener('resize', () => {
      table.redraw();
    });

    global.window.addEventListener('redraw', () => {
      setTimeout(() => {
        table.redraw();
      }, 500);
    });
  }

  static renderFeDropShadow() {
    return <feDropShadow dx="0" dy="0.5" opacity="0.5" stdDeviation="0.5" />;
  }
}
export default ChartUtils;
