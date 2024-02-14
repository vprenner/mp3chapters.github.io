'use strict';

function toDate(argument) {
    const argStr = Object.prototype.toString.call(argument);

    // Clone the date
    if (
        argument instanceof Date ||
        (typeof argument === "object" && argStr === "[object Date]")
    ) {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new argument.constructor(+argument);
    } else if (
        typeof argument === "number" ||
        argStr === "[object Number]" ||
        typeof argument === "string" ||
        argStr === "[object String]"
    ) {
        // TODO: Can we get rid of as?
        return new Date(argument);
    } else {
        // TODO: Can we get rid of as?
        return new Date(NaN);
    }
}


function constructFrom(date, value) {
    if (date instanceof Date) {
        return new date.constructor(value);
    } else {
        return new Date(value);
    }
}


function addDays(date, amount) {
    const _date = toDate(date);
    if (isNaN(amount)) return constructFrom(date, NaN);
    if (!amount) {
        // If 0 days, no-op to avoid changing times in the hour before end of DST
        return _date;
    }
    _date.setDate(_date.getDate() + amount);
    return _date;
}


const millisecondsInWeek = 604800000;

const millisecondsInDay = 86400000;

let defaultOptions = {};

function getDefaultOptions() {
    return defaultOptions;
}


function startOfWeek(date, options) {
    const defaultOptions = getDefaultOptions();
    const weekStartsOn =
        options?.weekStartsOn ??
        options?.locale?.options?.weekStartsOn ??
        defaultOptions.weekStartsOn ??
        defaultOptions.locale?.options?.weekStartsOn ??
        0;

    const _date = toDate(date);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

    _date.setDate(_date.getDate() - diff);
    _date.setHours(0, 0, 0, 0);
    return _date;
}


function startOfISOWeek(date) {
    return startOfWeek(date, { weekStartsOn: 1 });
}


function getISOWeekYear(date) {
    const _date = toDate(date);
    const year = _date.getFullYear();

    const fourthOfJanuaryOfNextYear = constructFrom(date, 0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);

    const fourthOfJanuaryOfThisYear = constructFrom(date, 0);
    fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);

    if (_date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
        return year;
    } else {
        return year - 1;
    }
}


function startOfDay(date) {
    const _date = toDate(date);
    _date.setHours(0, 0, 0, 0);
    return _date;
}

function getTimezoneOffsetInMilliseconds(date) {
    const _date = toDate(date);
    const utcDate = new Date(
        Date.UTC(
            _date.getFullYear(),
            _date.getMonth(),
            _date.getDate(),
            _date.getHours(),
            _date.getMinutes(),
            _date.getSeconds(),
            _date.getMilliseconds(),
        ),
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
}

function differenceInCalendarDays(dateLeft, dateRight) {
    const startOfDayLeft = startOfDay(dateLeft);
    const startOfDayRight = startOfDay(dateRight);

    const timestampLeft =
        +startOfDayLeft - getTimezoneOffsetInMilliseconds(startOfDayLeft);
    const timestampRight =
        +startOfDayRight - getTimezoneOffsetInMilliseconds(startOfDayRight);

    // Round the number of days to the nearest integer because the number of
    // milliseconds in a day is not constant (e.g. it's different in the week of
    // the daylight saving time clock shift).
    return Math.round((timestampLeft - timestampRight) / millisecondsInDay);
}

function startOfISOWeekYear(date) {
    const year = getISOWeekYear(date);
    const fourthOfJanuary = constructFrom(date, 0);
    fourthOfJanuary.setFullYear(year, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    return startOfISOWeek(fourthOfJanuary);
}

function isDate(value) {
    return (
        value instanceof Date ||
        (typeof value === "object" &&
            Object.prototype.toString.call(value) === "[object Date]")
    );
}

function isValid(date) {
    if (!isDate(date) && typeof date !== "number") {
        return false;
    }
    const _date = toDate(date);
    return !isNaN(Number(_date));
}

function startOfYear(date) {
    const cleanDate = toDate(date);
    const _date = constructFrom(date, 0);
    _date.setFullYear(cleanDate.getFullYear(), 0, 1);
    _date.setHours(0, 0, 0, 0);
    return _date;
}

const formatDistanceLocale = {
    lessThanXSeconds: {
        one: "less than a second",
        other: "less than {{count}} seconds",
    },

    xSeconds: {
        one: "1 second",
        other: "{{count}} seconds",
    },

    halfAMinute: "half a minute",

    lessThanXMinutes: {
        one: "less than a minute",
        other: "less than {{count}} minutes",
    },

    xMinutes: {
        one: "1 minute",
        other: "{{count}} minutes",
    },

    aboutXHours: {
        one: "about 1 hour",
        other: "about {{count}} hours",
    },

    xHours: {
        one: "1 hour",
        other: "{{count}} hours",
    },

    xDays: {
        one: "1 day",
        other: "{{count}} days",
    },

    aboutXWeeks: {
        one: "about 1 week",
        other: "about {{count}} weeks",
    },

    xWeeks: {
        one: "1 week",
        other: "{{count}} weeks",
    },

    aboutXMonths: {
        one: "about 1 month",
        other: "about {{count}} months",
    },

    xMonths: {
        one: "1 month",
        other: "{{count}} months",
    },

    aboutXYears: {
        one: "about 1 year",
        other: "about {{count}} years",
    },

    xYears: {
        one: "1 year",
        other: "{{count}} years",
    },

    overXYears: {
        one: "over 1 year",
        other: "over {{count}} years",
    },

    almostXYears: {
        one: "almost 1 year",
        other: "almost {{count}} years",
    },
};

const formatDistance = (token, count, options) => {
    let result;

    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
        result = tokenValue;
    } else if (count === 1) {
        result = tokenValue.one;
    } else {
        result = tokenValue.other.replace("{{count}}", count.toString());
    }

    if (options?.addSuffix) {
        if (options.comparison && options.comparison > 0) {
            return "in " + result;
        } else {
            return result + " ago";
        }
    }

    return result;
};

function buildFormatLongFn(args) {
    return (options = {}) => {
        // TODO: Remove String()
        const width = options.width ? String(options.width) : args.defaultWidth;
        const format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
    };
}

const dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy",
};

const timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a",
};

const dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}",
};

const formatLong = {
    date: buildFormatLongFn({
        formats: dateFormats,
        defaultWidth: "full",
    }),

    time: buildFormatLongFn({
        formats: timeFormats,
        defaultWidth: "full",
    }),

    dateTime: buildFormatLongFn({
        formats: dateTimeFormats,
        defaultWidth: "full",
    }),
};

const formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P",
};

const formatRelative = (token, _date, _baseDate, _options) =>
    formatRelativeLocale[token];










function buildLocalizeFn(args) {
    return (value, options) => {
        const context = options?.context ? String(options.context) : "standalone";

        let valuesArray;
        if (context === "formatting" && args.formattingValues) {
            const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
            const width = options?.width ? String(options.width) : defaultWidth;

            valuesArray =
                args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
            const defaultWidth = args.defaultWidth;
            const width = options?.width ? String(options.width) : args.defaultWidth;

            valuesArray = args.values[width] || args.values[defaultWidth];
        }
        const index = args.argumentCallback ? args.argumentCallback(value) : value;

        // @ts-expect-error - For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!
        return valuesArray[index];
    };
}

const eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"],
};

const quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
};

// Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.
const monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ],

    wide: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
};

const dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ],
};

const dayPeriodValues = {
    narrow: {
        am: "a",
        pm: "p",
        midnight: "mi",
        noon: "n",
        morning: "morning",
        afternoon: "afternoon",
        evening: "evening",
        night: "night",
    },
    abbreviated: {
        am: "AM",
        pm: "PM",
        midnight: "midnight",
        noon: "noon",
        morning: "morning",
        afternoon: "afternoon",
        evening: "evening",
        night: "night",
    },
    wide: {
        am: "a.m.",
        pm: "p.m.",
        midnight: "midnight",
        noon: "noon",
        morning: "morning",
        afternoon: "afternoon",
        evening: "evening",
        night: "night",
    },
};

const formattingDayPeriodValues = {
    narrow: {
        am: "a",
        pm: "p",
        midnight: "mi",
        noon: "n",
        morning: "in the morning",
        afternoon: "in the afternoon",
        evening: "in the evening",
        night: "at night",
    },
    abbreviated: {
        am: "AM",
        pm: "PM",
        midnight: "midnight",
        noon: "noon",
        morning: "in the morning",
        afternoon: "in the afternoon",
        evening: "in the evening",
        night: "at night",
    },
    wide: {
        am: "a.m.",
        pm: "p.m.",
        midnight: "midnight",
        noon: "noon",
        morning: "in the morning",
        afternoon: "in the afternoon",
        evening: "in the evening",
        night: "at night",
    },
};

const ordinalNumber = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);

    // If ordinal numbers depend on context, for example,
    // if they are different for different grammatical genders,
    // use `options.unit`.
    //
    // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
    // 'day', 'hour', 'minute', 'second'.

    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
            case 1:
                return number + "st";
            case 2:
                return number + "nd";
            case 3:
                return number + "rd";
        }
    }
    return number + "th";
};

const localize = {
    ordinalNumber,

    era: buildLocalizeFn({
        values: eraValues,
        defaultWidth: "wide",
    }),

    quarter: buildLocalizeFn({
        values: quarterValues,
        defaultWidth: "wide",
        argumentCallback: (quarter) => quarter - 1,
    }),

    month: buildLocalizeFn({
        values: monthValues,
        defaultWidth: "wide",
    }),

    day: buildLocalizeFn({
        values: dayValues,
        defaultWidth: "wide",
    }),

    dayPeriod: buildLocalizeFn({
        values: dayPeriodValues,
        defaultWidth: "wide",
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: "wide",
    }),
};

function buildMatchFn(args) {
    return (string, options = {}) => {
        const width = options.width;

        const matchPattern =
            (width && args.matchPatterns[width]) ||
            args.matchPatterns[args.defaultMatchWidth];
        const matchResult = string.match(matchPattern);

        if (!matchResult) {
            return null;
        }
        const matchedString = matchResult[0];

        const parsePatterns =
            (width && args.parsePatterns[width]) ||
            args.parsePatterns[args.defaultParseWidth];

        const key = Array.isArray(parsePatterns)
            ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString))
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
            findKey(parsePatterns, (pattern) => pattern.test(matchedString));

        let value;

        value = args.valueCallback ? args.valueCallback(key) : key;
        value = options.valueCallback
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
            options.valueCallback(value)
            : value;

        const rest = string.slice(matchedString.length);

        return { value, rest };
    };
}

function findKey(object, predicate) {
    for (const key in object) {
        if (
            Object.prototype.hasOwnProperty.call(object, key) &&
            predicate(object[key])
        ) {
            return key;
        }
    }
    return undefined;
}

function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
            return key;
        }
    }
    return undefined;
}

function buildMatchPatternFn(args) {
    return (string, options = {}) => {
        const matchResult = string.match(args.matchPattern);
        if (!matchResult) return null;
        const matchedString = matchResult[0];

        const parseResult = string.match(args.parsePattern);
        if (!parseResult) return null;
        let value = args.valueCallback
            ? args.valueCallback(parseResult[0])
            : parseResult[0];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
        value = options.valueCallback ? options.valueCallback(value) : value;

        const rest = string.slice(matchedString.length);

        return { value, rest };
    };
}

const matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
const parseOrdinalNumberPattern = /\d+/i;

const matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i,
};
const parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i],
};

const matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i,
};
const parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i],
};

const matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
};
const parseMonthPatterns = {
    narrow: [
        /^j/i,
        /^f/i,
        /^m/i,
        /^a/i,
        /^m/i,
        /^j/i,
        /^j/i,
        /^a/i,
        /^s/i,
        /^o/i,
        /^n/i,
        /^d/i,
    ],

    any: [
        /^ja/i,
        /^f/i,
        /^mar/i,
        /^ap/i,
        /^may/i,
        /^jun/i,
        /^jul/i,
        /^au/i,
        /^s/i,
        /^o/i,
        /^n/i,
        /^d/i,
    ],
};

const matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
};
const parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i],
};

const matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i,
};
const parseDayPeriodPatterns = {
    any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i,
    },
};

const match = {
    ordinalNumber: buildMatchPatternFn({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: (value) => parseInt(value, 10),
    }),

    era: buildMatchFn({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: "wide",
        parsePatterns: parseEraPatterns,
        defaultParseWidth: "any",
    }),

    quarter: buildMatchFn({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: "wide",
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: "any",
        valueCallback: (index) => index + 1,
    }),

    month: buildMatchFn({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: "wide",
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: "any",
    }),

    day: buildMatchFn({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: "wide",
        parsePatterns: parseDayPatterns,
        defaultParseWidth: "any",
    }),

    dayPeriod: buildMatchFn({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: "any",
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: "any",
    }),
};

const enUS = {
    code: "en-US",
    formatDistance: formatDistance,
    formatLong: formatLong,
    formatRelative: formatRelative,
    localize: localize,
    match: match,
    options: {
        weekStartsOn: 0 /* Sunday */,
        firstWeekContainsDate: 1,
    },
};

function getDayOfYear(date) {
    const _date = toDate(date);
    const diff = differenceInCalendarDays(_date, startOfYear(_date));
    const dayOfYear = diff + 1;
    return dayOfYear;
}

function getISOWeek(date) {
    const _date = toDate(date);
    const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);

    // Round the number of weeks to the nearest integer because the number of
    // milliseconds in a week is not constant (e.g. it's different in the week of
    // the daylight saving time clock shift).
    return Math.round(diff / millisecondsInWeek) + 1;
}


function getWeekYear(date, options) {
    const _date = toDate(date);
    const year = _date.getFullYear();

    const defaultOptions = getDefaultOptions();
    const firstWeekContainsDate =
        options?.firstWeekContainsDate ??
        options?.locale?.options?.firstWeekContainsDate ??
        defaultOptions.firstWeekContainsDate ??
        defaultOptions.locale?.options?.firstWeekContainsDate ??
        1;

    const firstWeekOfNextYear = constructFrom(date, 0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);

    const firstWeekOfThisYear = constructFrom(date, 0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);

    if (_date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
        return year;
    } else {
        return year - 1;
    }
}


function startOfWeekYear(date, options) {
    const defaultOptions = getDefaultOptions();
    const firstWeekContainsDate =
        options?.firstWeekContainsDate ??
        options?.locale?.options?.firstWeekContainsDate ??
        defaultOptions.firstWeekContainsDate ??
        defaultOptions.locale?.options?.firstWeekContainsDate ??
        1;

    const year = getWeekYear(date, options);
    const firstWeek = constructFrom(date, 0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    const _date = startOfWeek(firstWeek, options);
    return _date;
}



function getWeek(date, options) {
    const _date = toDate(date);
    const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);

    // Round the number of weeks to the nearest integer because the number of
    // milliseconds in a week is not constant (e.g. it's different in the week of
    // the daylight saving time clock shift).
    return Math.round(diff / millisecondsInWeek) + 1;
}

function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? "-" : "";
    const output = Math.abs(number).toString().padStart(targetLength, "0");
    return sign + output;
}


const lightFormatters = {
    // Year
    y(date, token) {
        // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

        const signedYear = date.getFullYear();
        // Returns 1 for 1 BC (which is year 0 in JavaScript)
        const year = signedYear > 0 ? signedYear : 1 - signedYear;
        return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },

    // Month
    M(date, token) {
        const month = date.getMonth();
        return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },

    // Day of the month
    d(date, token) {
        return addLeadingZeros(date.getDate(), token.length);
    },

    // AM or PM
    a(date, token) {
        const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";

        switch (token) {
            case "a":
            case "aa":
                return dayPeriodEnumValue.toUpperCase();
            case "aaa":
                return dayPeriodEnumValue;
            case "aaaaa":
                return dayPeriodEnumValue[0];
            case "aaaa":
            default:
                return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
        }
    },

    // Hour [1-12]
    h(date, token) {
        return addLeadingZeros(date.getHours() % 12 || 12, token.length);
    },

    // Hour [0-23]
    H(date, token) {
        return addLeadingZeros(date.getHours(), token.length);
    },

    // Minute
    m(date, token) {
        return addLeadingZeros(date.getMinutes(), token.length);
    },

    // Second
    s(date, token) {
        return addLeadingZeros(date.getSeconds(), token.length);
    },

    // Fraction of second
    S(date, token) {
        const numberOfDigits = token.length;
        const milliseconds = date.getMilliseconds();
        const fractionalSeconds = Math.trunc(
            milliseconds * Math.pow(10, numberOfDigits - 3),
        );
        return addLeadingZeros(fractionalSeconds, token.length);
    },
};

const dayPeriodEnum = {
    am: "am",
    pm: "pm",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
};


const formatters = {
    // Era
    G: function (date, token, localize) {
        const era = date.getFullYear() > 0 ? 1 : 0;
        switch (token) {
            // AD, BC
            case "G":
            case "GG":
            case "GGG":
                return localize.era(era, { width: "abbreviated" });
            // A, B
            case "GGGGG":
                return localize.era(era, { width: "narrow" });
            // Anno Domini, Before Christ
            case "GGGG":
            default:
                return localize.era(era, { width: "wide" });
        }
    },

    // Year
    y: function (date, token, localize) {
        // Ordinal number
        if (token === "yo") {
            const signedYear = date.getFullYear();
            // Returns 1 for 1 BC (which is year 0 in JavaScript)
            const year = signedYear > 0 ? signedYear : 1 - signedYear;
            return localize.ordinalNumber(year, { unit: "year" });
        }

        return lightFormatters.y(date, token);
    },

    // Local week-numbering year
    Y: function (date, token, localize, options) {
        const signedWeekYear = getWeekYear(date, options);
        // Returns 1 for 1 BC (which is year 0 in JavaScript)
        const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;

        // Two digit year
        if (token === "YY") {
            const twoDigitYear = weekYear % 100;
            return addLeadingZeros(twoDigitYear, 2);
        }

        // Ordinal number
        if (token === "Yo") {
            return localize.ordinalNumber(weekYear, { unit: "year" });
        }

        // Padding
        return addLeadingZeros(weekYear, token.length);
    },

    // ISO week-numbering year
    R: function (date, token) {
        const isoWeekYear = getISOWeekYear(date);

        // Padding
        return addLeadingZeros(isoWeekYear, token.length);
    },

    // Extended year. This is a single number designating the year of this calendar system.
    // The main difference between `y` and `u` localizers are B.C. years:
    // | Year | `y` | `u` |
    // |------|-----|-----|
    // | AC 1 |   1 |   1 |
    // | BC 1 |   1 |   0 |
    // | BC 2 |   2 |  -1 |
    // Also `yy` always returns the last two digits of a year,
    // while `uu` pads single digit years to 2 characters and returns other years unchanged.
    u: function (date, token) {
        const year = date.getFullYear();
        return addLeadingZeros(year, token.length);
    },

    // Quarter
    Q: function (date, token, localize) {
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        switch (token) {
            // 1, 2, 3, 4
            case "Q":
                return String(quarter);
            // 01, 02, 03, 04
            case "QQ":
                return addLeadingZeros(quarter, 2);
            // 1st, 2nd, 3rd, 4th
            case "Qo":
                return localize.ordinalNumber(quarter, { unit: "quarter" });
            // Q1, Q2, Q3, Q4
            case "QQQ":
                return localize.quarter(quarter, {
                    width: "abbreviated",
                    context: "formatting",
                });
            // 1, 2, 3, 4 (narrow quarter; could be not numerical)
            case "QQQQQ":
                return localize.quarter(quarter, {
                    width: "narrow",
                    context: "formatting",
                });
            // 1st quarter, 2nd quarter, ...
            case "QQQQ":
            default:
                return localize.quarter(quarter, {
                    width: "wide",
                    context: "formatting",
                });
        }
    },

    // Stand-alone quarter
    q: function (date, token, localize) {
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        switch (token) {
            // 1, 2, 3, 4
            case "q":
                return String(quarter);
            // 01, 02, 03, 04
            case "qq":
                return addLeadingZeros(quarter, 2);
            // 1st, 2nd, 3rd, 4th
            case "qo":
                return localize.ordinalNumber(quarter, { unit: "quarter" });
            // Q1, Q2, Q3, Q4
            case "qqq":
                return localize.quarter(quarter, {
                    width: "abbreviated",
                    context: "standalone",
                });
            // 1, 2, 3, 4 (narrow quarter; could be not numerical)
            case "qqqqq":
                return localize.quarter(quarter, {
                    width: "narrow",
                    context: "standalone",
                });
            // 1st quarter, 2nd quarter, ...
            case "qqqq":
            default:
                return localize.quarter(quarter, {
                    width: "wide",
                    context: "standalone",
                });
        }
    },

    // Month
    M: function (date, token, localize) {
        const month = date.getMonth();
        switch (token) {
            case "M":
            case "MM":
                return lightFormatters.M(date, token);
            // 1st, 2nd, ..., 12th
            case "Mo":
                return localize.ordinalNumber(month + 1, { unit: "month" });
            // Jan, Feb, ..., Dec
            case "MMM":
                return localize.month(month, {
                    width: "abbreviated",
                    context: "formatting",
                });
            // J, F, ..., D
            case "MMMMM":
                return localize.month(month, {
                    width: "narrow",
                    context: "formatting",
                });
            // January, February, ..., December
            case "MMMM":
            default:
                return localize.month(month, { width: "wide", context: "formatting" });
        }
    },

    // Stand-alone month
    L: function (date, token, localize) {
        const month = date.getMonth();
        switch (token) {
            // 1, 2, ..., 12
            case "L":
                return String(month + 1);
            // 01, 02, ..., 12
            case "LL":
                return addLeadingZeros(month + 1, 2);
            // 1st, 2nd, ..., 12th
            case "Lo":
                return localize.ordinalNumber(month + 1, { unit: "month" });
            // Jan, Feb, ..., Dec
            case "LLL":
                return localize.month(month, {
                    width: "abbreviated",
                    context: "standalone",
                });
            // J, F, ..., D
            case "LLLLL":
                return localize.month(month, {
                    width: "narrow",
                    context: "standalone",
                });
            // January, February, ..., December
            case "LLLL":
            default:
                return localize.month(month, { width: "wide", context: "standalone" });
        }
    },

    // Local week of year
    w: function (date, token, localize, options) {
        const week = getWeek(date, options);

        if (token === "wo") {
            return localize.ordinalNumber(week, { unit: "week" });
        }

        return addLeadingZeros(week, token.length);
    },

    // ISO week of year
    I: function (date, token, localize) {
        const isoWeek = getISOWeek(date);

        if (token === "Io") {
            return localize.ordinalNumber(isoWeek, { unit: "week" });
        }

        return addLeadingZeros(isoWeek, token.length);
    },

    // Day of the month
    d: function (date, token, localize) {
        if (token === "do") {
            return localize.ordinalNumber(date.getDate(), { unit: "date" });
        }

        return lightFormatters.d(date, token);
    },

    // Day of year
    D: function (date, token, localize) {
        const dayOfYear = getDayOfYear(date);

        if (token === "Do") {
            return localize.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
        }

        return addLeadingZeros(dayOfYear, token.length);
    },

    // Day of week
    E: function (date, token, localize) {
        const dayOfWeek = date.getDay();
        switch (token) {
            // Tue
            case "E":
            case "EE":
            case "EEE":
                return localize.day(dayOfWeek, {
                    width: "abbreviated",
                    context: "formatting",
                });
            // T
            case "EEEEE":
                return localize.day(dayOfWeek, {
                    width: "narrow",
                    context: "formatting",
                });
            // Tu
            case "EEEEEE":
                return localize.day(dayOfWeek, {
                    width: "short",
                    context: "formatting",
                });
            // Tuesday
            case "EEEE":
            default:
                return localize.day(dayOfWeek, {
                    width: "wide",
                    context: "formatting",
                });
        }
    },

    // Local day of week
    e: function (date, token, localize, options) {
        const dayOfWeek = date.getDay();
        const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
        switch (token) {
            // Numerical value (Nth day of week with current locale or weekStartsOn)
            case "e":
                return String(localDayOfWeek);
            // Padded numerical value
            case "ee":
                return addLeadingZeros(localDayOfWeek, 2);
            // 1st, 2nd, ..., 7th
            case "eo":
                return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
            case "eee":
                return localize.day(dayOfWeek, {
                    width: "abbreviated",
                    context: "formatting",
                });
            // T
            case "eeeee":
                return localize.day(dayOfWeek, {
                    width: "narrow",
                    context: "formatting",
                });
            // Tu
            case "eeeeee":
                return localize.day(dayOfWeek, {
                    width: "short",
                    context: "formatting",
                });
            // Tuesday
            case "eeee":
            default:
                return localize.day(dayOfWeek, {
                    width: "wide",
                    context: "formatting",
                });
        }
    },

    // Stand-alone local day of week
    c: function (date, token, localize, options) {
        const dayOfWeek = date.getDay();
        const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
        switch (token) {
            // Numerical value (same as in `e`)
            case "c":
                return String(localDayOfWeek);
            // Padded numerical value
            case "cc":
                return addLeadingZeros(localDayOfWeek, token.length);
            // 1st, 2nd, ..., 7th
            case "co":
                return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
            case "ccc":
                return localize.day(dayOfWeek, {
                    width: "abbreviated",
                    context: "standalone",
                });
            // T
            case "ccccc":
                return localize.day(dayOfWeek, {
                    width: "narrow",
                    context: "standalone",
                });
            // Tu
            case "cccccc":
                return localize.day(dayOfWeek, {
                    width: "short",
                    context: "standalone",
                });
            // Tuesday
            case "cccc":
            default:
                return localize.day(dayOfWeek, {
                    width: "wide",
                    context: "standalone",
                });
        }
    },

    // ISO day of week
    i: function (date, token, localize) {
        const dayOfWeek = date.getDay();
        const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
        switch (token) {
            // 2
            case "i":
                return String(isoDayOfWeek);
            // 02
            case "ii":
                return addLeadingZeros(isoDayOfWeek, token.length);
            // 2nd
            case "io":
                return localize.ordinalNumber(isoDayOfWeek, { unit: "day" });
            // Tue
            case "iii":
                return localize.day(dayOfWeek, {
                    width: "abbreviated",
                    context: "formatting",
                });
            // T
            case "iiiii":
                return localize.day(dayOfWeek, {
                    width: "narrow",
                    context: "formatting",
                });
            // Tu
            case "iiiiii":
                return localize.day(dayOfWeek, {
                    width: "short",
                    context: "formatting",
                });
            // Tuesday
            case "iiii":
            default:
                return localize.day(dayOfWeek, {
                    width: "wide",
                    context: "formatting",
                });
        }
    },

    // AM or PM
    a: function (date, token, localize) {
        const hours = date.getHours();
        const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";

        switch (token) {
            case "a":
            case "aa":
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "abbreviated",
                    context: "formatting",
                });
            case "aaa":
                return localize
                    .dayPeriod(dayPeriodEnumValue, {
                        width: "abbreviated",
                        context: "formatting",
                    })
                    .toLowerCase();
            case "aaaaa":
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "narrow",
                    context: "formatting",
                });
            case "aaaa":
            default:
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "wide",
                    context: "formatting",
                });
        }
    },

    // AM, PM, midnight, noon
    b: function (date, token, localize) {
        const hours = date.getHours();
        let dayPeriodEnumValue;
        if (hours === 12) {
            dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
            dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
            dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
        }

        switch (token) {
            case "b":
            case "bb":
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "abbreviated",
                    context: "formatting",
                });
            case "bbb":
                return localize
                    .dayPeriod(dayPeriodEnumValue, {
                        width: "abbreviated",
                        context: "formatting",
                    })
                    .toLowerCase();
            case "bbbbb":
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "narrow",
                    context: "formatting",
                });
            case "bbbb":
            default:
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "wide",
                    context: "formatting",
                });
        }
    },

    // in the morning, in the afternoon, in the evening, at night
    B: function (date, token, localize) {
        const hours = date.getHours();
        let dayPeriodEnumValue;
        if (hours >= 17) {
            dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
            dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
            dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
            dayPeriodEnumValue = dayPeriodEnum.night;
        }

        switch (token) {
            case "B":
            case "BB":
            case "BBB":
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "abbreviated",
                    context: "formatting",
                });
            case "BBBBB":
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "narrow",
                    context: "formatting",
                });
            case "BBBB":
            default:
                return localize.dayPeriod(dayPeriodEnumValue, {
                    width: "wide",
                    context: "formatting",
                });
        }
    },

    // Hour [1-12]
    h: function (date, token, localize) {
        if (token === "ho") {
            let hours = date.getHours() % 12;
            if (hours === 0) hours = 12;
            return localize.ordinalNumber(hours, { unit: "hour" });
        }

        return lightFormatters.h(date, token);
    },

    // Hour [0-23]
    H: function (date, token, localize) {
        if (token === "Ho") {
            return localize.ordinalNumber(date.getHours(), { unit: "hour" });
        }

        return lightFormatters.H(date, token);
    },

    // Hour [0-11]
    K: function (date, token, localize) {
        const hours = date.getHours() % 12;

        if (token === "Ko") {
            return localize.ordinalNumber(hours, { unit: "hour" });
        }

        return addLeadingZeros(hours, token.length);
    },

    // Hour [1-24]
    k: function (date, token, localize) {
        let hours = date.getHours();
        if (hours === 0) hours = 24;

        if (token === "ko") {
            return localize.ordinalNumber(hours, { unit: "hour" });
        }

        return addLeadingZeros(hours, token.length);
    },

    // Minute
    m: function (date, token, localize) {
        if (token === "mo") {
            return localize.ordinalNumber(date.getMinutes(), { unit: "minute" });
        }

        return lightFormatters.m(date, token);
    },

    // Second
    s: function (date, token, localize) {
        if (token === "so") {
            return localize.ordinalNumber(date.getSeconds(), { unit: "second" });
        }

        return lightFormatters.s(date, token);
    },

    // Fraction of second
    S: function (date, token) {
        return lightFormatters.S(date, token);
    },

    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function (date, token, _localize) {
        const timezoneOffset = date.getTimezoneOffset();

        if (timezoneOffset === 0) {
            return "Z";
        }

        switch (token) {
            // Hours and optional minutes
            case "X":
                return formatTimezoneWithOptionalMinutes(timezoneOffset);

            // Hours, minutes and optional seconds without `:` delimiter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `XX`
            case "XXXX":
            case "XX": // Hours and minutes without `:` delimiter
                return formatTimezone(timezoneOffset);

            // Hours, minutes and optional seconds with `:` delimiter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `XXX`
            case "XXXXX":
            case "XXX": // Hours and minutes with `:` delimiter
            default:
                return formatTimezone(timezoneOffset, ":");
        }
    },

    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function (date, token, _localize) {
        const timezoneOffset = date.getTimezoneOffset();

        switch (token) {
            // Hours and optional minutes
            case "x":
                return formatTimezoneWithOptionalMinutes(timezoneOffset);

            // Hours, minutes and optional seconds without `:` delimiter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `xx`
            case "xxxx":
            case "xx": // Hours and minutes without `:` delimiter
                return formatTimezone(timezoneOffset);

            // Hours, minutes and optional seconds with `:` delimiter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `xxx`
            case "xxxxx":
            case "xxx": // Hours and minutes with `:` delimiter
            default:
                return formatTimezone(timezoneOffset, ":");
        }
    },

    // Timezone (GMT)
    O: function (date, token, _localize) {
        const timezoneOffset = date.getTimezoneOffset();

        switch (token) {
            // Short
            case "O":
            case "OO":
            case "OOO":
                return "GMT" + formatTimezoneShort(timezoneOffset, ":");
            // Long
            case "OOOO":
            default:
                return "GMT" + formatTimezone(timezoneOffset, ":");
        }
    },

    // Timezone (specific non-location)
    z: function (date, token, _localize) {
        const timezoneOffset = date.getTimezoneOffset();

        switch (token) {
            // Short
            case "z":
            case "zz":
            case "zzz":
                return "GMT" + formatTimezoneShort(timezoneOffset, ":");
            // Long
            case "zzzz":
            default:
                return "GMT" + formatTimezone(timezoneOffset, ":");
        }
    },

    // Seconds timestamp
    t: function (date, token, _localize) {
        const timestamp = Math.trunc(date.getTime() / 1000);
        return addLeadingZeros(timestamp, token.length);
    },

    // Milliseconds timestamp
    T: function (date, token, _localize) {
        const timestamp = date.getTime();
        return addLeadingZeros(timestamp, token.length);
    },
};

function formatTimezoneShort(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = Math.trunc(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
        return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}

function formatTimezoneWithOptionalMinutes(offset, delimiter) {
    if (offset % 60 === 0) {
        const sign = offset > 0 ? "-" : "+";
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, delimiter);
}

function formatTimezone(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
    const minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
}

const dateLongFormatter = (pattern, formatLong) => {
    switch (pattern) {
        case "P":
            return formatLong.date({ width: "short" });
        case "PP":
            return formatLong.date({ width: "medium" });
        case "PPP":
            return formatLong.date({ width: "long" });
        case "PPPP":
        default:
            return formatLong.date({ width: "full" });
    }
};

const timeLongFormatter = (pattern, formatLong) => {
    switch (pattern) {
        case "p":
            return formatLong.time({ width: "short" });
        case "pp":
            return formatLong.time({ width: "medium" });
        case "ppp":
            return formatLong.time({ width: "long" });
        case "pppp":
        default:
            return formatLong.time({ width: "full" });
    }
};

const dateTimeLongFormatter = (pattern, formatLong) => {
    const matchResult = pattern.match(/(P+)(p+)?/) || [];
    const datePattern = matchResult[1];
    const timePattern = matchResult[2];

    if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
    }

    let dateTimeFormat;

    switch (datePattern) {
        case "P":
            dateTimeFormat = formatLong.dateTime({ width: "short" });
            break;
        case "PP":
            dateTimeFormat = formatLong.dateTime({ width: "medium" });
            break;
        case "PPP":
            dateTimeFormat = formatLong.dateTime({ width: "long" });
            break;
        case "PPPP":
        default:
            dateTimeFormat = formatLong.dateTime({ width: "full" });
            break;
    }

    return dateTimeFormat
        .replace("{{date}}", dateLongFormatter(datePattern, formatLong))
        .replace("{{time}}", timeLongFormatter(timePattern, formatLong));
};

const longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter,
};

const dayOfYearTokenRE = /^D+$/;
const weekYearTokenRE = /^Y+$/;

const throwTokens = ["D", "DD", "YY", "YYYY"];

function isProtectedDayOfYearToken(token) {
    return dayOfYearTokenRE.test(token);
}

function isProtectedWeekYearToken(token) {
    return weekYearTokenRE.test(token);
}

function warnOrThrowProtectedError(token, format, input) {
    const _message = message(token, format, input);
    console.warn(_message);
    if (throwTokens.includes(token)) throw new RangeError(_message);
}

function message(token, format, input) {
    const subject = token[0] === "Y" ? "years" : "days of the month";
    return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

// This RegExp consists of three parts separated by `|`:
// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps
const formattingTokensRegExp =
    /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
const longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

const escapedStringRegExp = /^'([^]*?)'?$/;
const doubleQuoteRegExp = /''/g;
const unescapedLatinCharacterRegExp = /[a-zA-Z]/;


function format(date, formatStr, options) {
    const defaultOptions = getDefaultOptions();
    const locale = options?.locale ?? defaultOptions.locale ?? enUS;

    const firstWeekContainsDate =
        options?.firstWeekContainsDate ??
        options?.locale?.options?.firstWeekContainsDate ??
        defaultOptions.firstWeekContainsDate ??
        defaultOptions.locale?.options?.firstWeekContainsDate ??
        1;

    const weekStartsOn =
        options?.weekStartsOn ??
        options?.locale?.options?.weekStartsOn ??
        defaultOptions.weekStartsOn ??
        defaultOptions.locale?.options?.weekStartsOn ??
        0;

    const originalDate = toDate(date);

    if (!isValid(originalDate)) {
        throw new RangeError("Invalid time value");
    }

    let parts = formatStr
        .match(longFormattingTokensRegExp)
        .map((substring) => {
            const firstCharacter = substring[0];
            if (firstCharacter === "p" || firstCharacter === "P") {
                const longFormatter = longFormatters[firstCharacter];
                return longFormatter(substring, locale.formatLong);
            }
            return substring;
        })
        .join("")
        .match(formattingTokensRegExp)
        .map((substring) => {
            // Replace two single quote characters with one single quote character
            if (substring === "''") {
                return { isToken: false, value: "'" };
            }

            const firstCharacter = substring[0];
            if (firstCharacter === "'") {
                return { isToken: false, value: cleanEscapedString(substring) };
            }

            if (formatters[firstCharacter]) {
                return { isToken: true, value: substring };
            }

            if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
                throw new RangeError(
                    "Format string contains an unescaped latin alphabet character `" +
                    firstCharacter +
                    "`",
                );
            }

            return { isToken: false, value: substring };
        });

    // invoke localize preprocessor (only for french locales at the moment)
    if (locale.localize.preprocessor) {
        parts = locale.localize.preprocessor(originalDate, parts);
    }

    const formatterOptions = {
        firstWeekContainsDate,
        weekStartsOn,
        locale,
    };

    return parts
        .map((part) => {
            if (!part.isToken) return part.value;

            const token = part.value;

            if (
                (!options?.useAdditionalWeekYearTokens &&
                    isProtectedWeekYearToken(token)) ||
                (!options?.useAdditionalDayOfYearTokens &&
                    isProtectedDayOfYearToken(token))
            ) {
                warnOrThrowProtectedError(token, formatStr, String(date));
            }

            const formatter = formatters[token[0]];
            return formatter(originalDate, token, locale.localize, formatterOptions);
        })
        .join("");
}

function cleanEscapedString(input) {
    const matched = input.match(escapedStringRegExp);

    if (!matched) {
        return input;
    }

    return matched[1].replace(doubleQuoteRegExp, "'");
}

function getDay(date) {
    const _date = toDate(date);
    const day = _date.getDay();
    return day;
}

function subDays(date, amount) {
    return addDays(date, -amount);
}

function nextDay(date, day) {
    let delta = day - getDay(date);
    if (delta <= 0) delta += 7;

    return addDays(date, delta);
}

function nextMonday(date) {
    return nextDay(date, 1);
}

function nextWednesday(date) {
    return nextDay(date, 3);
}

function previousDay(date, day) {
    let delta = getDay(date) - day;
    if (delta <= 0) delta += 7;

    return subDays(date, delta);
}

function previousMonday(date) {
    return previousDay(date, 1);
}

function getDates() {
    const now = new Date();
    const pm = previousMonday(now);
    const nm = nextMonday(now);
    let tm = pm;
    if (Math.abs(pm.getTime() - now.getTime()) > Math.abs(nm.getTime() - now.getTime())) {
        tm = nm;
    }
    const tw = nextWednesday(tm);
    return {monday: format(tm, 'yyyy-MM-dd'), wednesday: format(tw, 'yyyy-MM-dd'), year: format(tw, 'yyyy')};

};
