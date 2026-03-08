import type { Field } from 'payload';

function localeFieldName(name: string, locale: string) {
  return `${name}${locale.toUpperCase()}`;
}

export function localizedText(name: string, label: string, required = true): Field {
  return {
    name,
    label,
    type: 'group',
    fields: [
      { name: localeFieldName(name, 'de'), label: 'Deutsch', type: 'text', required },
      { name: localeFieldName(name, 'en'), label: 'English', type: 'text', required },
      { name: localeFieldName(name, 'es'), label: 'Español', type: 'text', required },
    ],
  };
}

export function localizedTextarea(name: string, label: string, required = true): Field {
  return {
    name,
    label,
    type: 'group',
    fields: [
      { name: localeFieldName(name, 'de'), label: 'Deutsch', type: 'textarea', required },
      { name: localeFieldName(name, 'en'), label: 'English', type: 'textarea', required },
      { name: localeFieldName(name, 'es'), label: 'Español', type: 'textarea', required },
    ],
  };
}
