import { validateSubmission } from '../src/forms';

describe('SkyForms', () => {
  const form = {
    formId: 'support-intake', version: 1, title: 'Support intake',
    fields: [
      { id: 'subject', type: 'text' as const, required: true, maxLength: 40 },
      { id: 'priority', type: 'choice' as const, required: true, options: ['low', 'high'] },
      { id: 'age', type: 'number' as const, required: false, min: 0, max: 130 },
    ],
  };

  test('returns versioned valid contract for accepted input', () => {
    expect(validateSubmission(form, { subject: 'Help', priority: 'high', age: 26 })).toMatchObject({
      schema: 'sky.forms.validation-result.v1', formId: 'support-intake', version: 1, valid: true, errors: []
    });
  });

  test('reports deterministic field errors and unknown fields', () => {
    const result = validateSubmission(form, { priority: 'urgent', extra: true, age: 999 });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['extra: unknown field', 'subject: required', 'priority: invalid choice', 'age: above maximum']);
  });

  test('rejects malformed definitions including duplicate ids', () => {
    expect(() => validateSubmission({ ...form, formId: 'bad id' }, {})).toThrow();
    expect(() => validateSubmission({ ...form, fields: [form.fields[0], form.fields[0]] }, {})).toThrow('duplicate field id');
  });

  test('rejects unknown field properties and inverted numeric ranges', () => {
    const misspelledConstraint = {
      ...form,
      fields: [{ id: 'age', type: 'number' as const, required: false, minimum: 10 }],
    };
    expect(() => validateSubmission(misspelledConstraint, { age: 5 })).toThrow();

    const invertedRange = {
      ...form,
      fields: [{ id: 'age', type: 'number' as const, required: true, min: 10, max: 5 }],
    };
    expect(() => validateSubmission(invertedRange, { age: 7 })).toThrow('min must not exceed max');
  });

  test('treats inherited names as absent unless submitted as own properties', () => {
    const inheritedNameForm = {
      ...form,
      fields: [{ id: 'toString', type: 'text' as const, required: true, maxLength: 40 }],
    };
    expect(validateSubmission(inheritedNameForm, {}).errors).toEqual(['toString: required']);
    expect(validateSubmission(inheritedNameForm, { toString: 'ok' }).valid).toBe(true);
  });
});
