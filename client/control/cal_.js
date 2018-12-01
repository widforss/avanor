import {ControlUtils} from "./utils/utils_.js";
import {Utils} from "../utils/utils_.js";

/**
 * @constructor
 */
function ControlCal(notify, SETTINGS) {
  var utils = new Utils();
  var controlUtils = new ControlUtils();
  var cookie       = utils.getCookie('date');
  var today        = new Date();
  var firstDate    = new Date(Date.UTC(SETTINGS.START_YEAR, 0));
  var selectDate   =
      new Date(cookie ? parseInt(cookie, 10) : SETTINGS.DEFAULT_DATE);
  
  if (SETTINGS.SEASON_MONTHS.indexOf(selectDate.getUTCMonth()) == -1) {
    throw new Error(SETTINGS.SEASON_MONTH_ERR);
  }
  
  if (today - firstDate < 0) {
    throw new Error(SETTINGS.NEGATIVE_YEAR);
  }
  
  var yearSelect  = new controlUtils.Select(yearsLst_(), notify_);
  var monthSelect = new controlUtils.Select(monthsLst_(), notify_);
  var daySelect   = new controlUtils.Select(daysLst_(), notify_);
  var left        = new controlUtils.Button('＜', decDate_);
  var right       = new controlUtils.Button('＞', incDate_);
  setSelects_();
 
  var dateDiv = document.createElement("div");
  dateDiv.appendChild(left.getDiv());
  dateDiv.appendChild(yearSelect.getDiv());
  dateDiv.appendChild(monthSelect.getDiv());
  dateDiv.appendChild(daySelect.getDiv());
  dateDiv.appendChild(right.getDiv());
  
  /**
   * @return {Date} Selected date.
   */
  function getDate() {
    return new Date(selectDate.getTime());
  }
  this.getDate = getDate;
  
  /**
   * @return {Element} Div controlling date.
   */
  function getDiv() {
    return dateDiv;
  }
  this.getDiv = getDiv;
  
  /**
   * Shim updating internal values before notifiyng observer.
   * @param {string}    value The value selected to fire notification.
   */
  function notify_(value) {
    today.setTime(Date.now());
    
    var day = parseInt(daySelect.getValue(), 10);
    selectDate
        .setUTCFullYear(parseInt(yearSelect.getValue(), 10),
                        parseMonth_(monthSelect.getValue()), 1);
    
    var monthLength = monthLn_(selectDate);
    if (day > monthLength) {
      selectDate.setUTCDate(monthLength);
    } else {
      selectDate.setUTCDate(day);
    }
    
    if (today < selectDate) {
      selectDate.setTime(today.getTime());
      selectDate.setUTCHours(0, 0, 0, 0);
      while (SETTINGS.SEASON_MONTHS.indexOf(selectDate.getUTCMonth()) == -1) {
        selectDate.setUTCDate(0);
      }
    }
    
    setSelects_();
    notify();
  }
  
  /**
   * Parses the month selector.
   * @return {number} 0-indexed number representation of selected month.
   */
  function parseMonth_(monthStr) {
    var month;
    for (var i = 0; i < SETTINGS.MONTHS.length; i++) {
      if (SETTINGS.MONTHS[i] == monthStr) {
        month = i;
        break;
      }
    }
    if (month === undefined) {
      throw new Error(SETTINGS.PARSE_MONTH_ERR);
    }
    if (SETTINGS.SEASON_MONTHS.indexOf(month) == -1) {
      throw new Error(SETTINGS.SEASON_MONTH_ERR);
    }
    return month;
  }
  
  /**
   * @return {Array<number>} List of selectable years.
   */
  function yearsLst_() {
    return Array.from(new Array(today.getUTCFullYear()
                          - SETTINGS.START_YEAR + 1),
                      function(_,i) {
                        return (i + SETTINGS.START_YEAR).toString()
                      });
  }
  
  /**
   * @return {Array<string>} List of selectable months.
   */
  function monthsLst_() {
    return SETTINGS.SEASON_MONTHS.map(function(monthIdx) {
      var season  = monthIdx;
      if (today.getUTCFullYear() === selectDate.getUTCFullYear() &&
          monthIdx > today.getUTCMonth()) {
            return null;
          }
      return SETTINGS.MONTHS[season];
    }).filter(function( element ) {
      return element !== null;
    });
  }
  
  /**
   * @return {Array<number>} List of selectable days.
   */
  function daysLst_() {
    var monthLength = monthLn_(selectDate);
    var dayRange    = Array.from(new Array(monthLength), function(v, i) {
          return (i + 1).toString();
    });
    
    if (today.getUTCFullYear() == selectDate.getUTCFullYear() &&
        today.getUTCMonth() == selectDate.getUTCMonth()) {
          dayRange = dayRange.slice(0, today.getUTCDate());
        }
    return dayRange;
  }
  
  /**
   * @param {Date}    date Month to investigate.
   * @return {number} Length of month.
   */
  function monthLn_(date) {
    var monthLength = new Date(date.getTime());
    monthLength.setUTCMonth(monthLength.getUTCMonth() + 1, 0);
    return monthLength.getDate();
  }
  
  /**
   * Set date selects to selectDate
   */
  function setSelects_() {
    yearSelect.setOptions(yearsLst_());
    yearSelect.setValue(selectDate.getUTCFullYear() - SETTINGS.START_YEAR);
    
    var month = SETTINGS.MONTHS[selectDate.getUTCMonth()];
    monthSelect.setOptions(monthsLst_());
    monthSelect.setValue(monthsLst_().indexOf(month));
    
    daySelect.setOptions(daysLst_());
    daySelect.setValue(selectDate.getUTCDate() - 1);

    utils.setCookie('date', selectDate.getTime());
  }

  /**
   * Decrement selectDate and update panel.
   */
  function decDate_() {
    selectDate.setUTCDate(selectDate.getUTCDate() - 1);
    if (selectDate - firstDate < 0) {
      selectDate.setTime(firstDate.getTime());
    }
    while (SETTINGS.SEASON_MONTHS.indexOf(selectDate.getUTCMonth()) == -1) {
      selectDate.setUTCDate(0);
    }
    setSelects_();
    notify();
  }
  
  /**
   * Increment selectDate and update panel.
   */
  function incDate_() {
    today.setTime(Date.now());
    
    selectDate.setUTCDate(selectDate.getUTCDate() + 1);
    while (SETTINGS.SEASON_MONTHS.indexOf(selectDate.getUTCMonth()) == -1) {
      selectDate.setUTCMonth(selectDate.getUTCMonth() + 1, 1);
    }
    if (today - selectDate < 0) {
      selectDate.setTime(today.getTime());
      while (SETTINGS.SEASON_MONTHS.indexOf(selectDate.getUTCMonth()) == -1) {
        selectDate.setUTCDate(0);
      }
    }
    setSelects_();
    notify();
  }
}

export {ControlCal};
