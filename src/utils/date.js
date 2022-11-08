const DATE_MED = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const DATETIME_MED = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

const DATETIME_LONG = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

export function formatDate(arg, locale) {
  return getFormatted(arg, locale, DATE_MED);
}

export function formatDateTime(arg, locale) {
  return getFormatted(arg, locale, DATETIME_MED);
}

export function formatDateTimePrecise(arg, locale) {
  return getFormatted(arg, locale, DATETIME_LONG);
}

// in miliseconds
const units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatDateTimeRelative(arg, locale) {
  const date = typeof arg === 'string' ? new Date(arg) : arg;
  const elapsed = date - new Date();

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u in units) {
    if (Math.abs(elapsed) > units[u] || u == 'second') {
      return rtf.format(Math.round(elapsed / units[u]), u);
    }
  }
}

function getFormatted(arg, locale, options) {
  const date = typeof arg === 'string' ? new Date(arg) : arg;
  return new Intl.DateTimeFormat(locale, options).format(date);
}
