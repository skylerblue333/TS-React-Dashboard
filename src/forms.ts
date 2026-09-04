import { z } from 'zod';

const Id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/);

const TextFieldSchema = z.object({
  id: Id,
  type: z.literal('text'),
  required: z.boolean(),
  maxLength: z.number().int().min(1).max(4000),
}).strict();

const NumberFieldSchema = z.object({
  id: Id,
  type: z.literal('number'),
  required: z.boolean(),
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
}).strict();

const ChoiceFieldSchema = z.object({
  id: Id,
  type: z.literal('choice'),
  required: z.boolean(),
  options: z.array(z.string().min(1).max(200)).min(1).max(100),
}).strict();

export const FormFieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  NumberFieldSchema,
  ChoiceFieldSchema,
]).superRefine((field, ctx) => {
  if (
    field.type === 'number'
    && field.min !== undefined
    && field.max !== undefined
    && field.min > field.max
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'min must not exceed max',
      path: ['min'],
    });
  }
});

export const FormDefinitionSchema = z.object({
  formId: Id,
  version: z.number().int().min(1).max(1_000_000),
  title: z.string().trim().min(1).max(200),
  fields: z.array(FormFieldSchema).min(1).max(100),
}).strict();

export type FormDefinition = z.infer<typeof FormDefinitionSchema>;

export interface FormValidationResult {
  readonly schema: 'sky.forms.validation-result.v1';
  readonly formId: string;
  readonly version: number;
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly values: Readonly<Record<string, unknown>>;
}

export function validateSubmission(definitionInput: unknown, valuesInput: unknown): FormValidationResult {
  const definition = FormDefinitionSchema.parse(definitionInput);
  const duplicate = definition.fields.find((field, index) => definition.fields.findIndex((item) => item.id === field.id) !== index);
  if (duplicate) throw new Error(`duplicate field id: ${duplicate.id}`);
  const values = z.record(z.unknown()).parse(valuesInput);
  const allowed = new Set(definition.fields.map((field) => field.id));
  const errors: string[] = [];
  for (const key of Object.keys(values)) if (!allowed.has(key)) errors.push(`${key}: unknown field`);

  for (const field of definition.fields) {
    const present = Object.prototype.hasOwnProperty.call(values, field.id);
    const value = present ? values[field.id] : undefined;
    if (!present || value === undefined || value === null || value === '') {
      if (field.required) errors.push(`${field.id}: required`);
      continue;
    }
    if (field.type === 'text') {
      if (typeof value !== 'string') errors.push(`${field.id}: must be text`);
      else if (value.length > field.maxLength) errors.push(`${field.id}: too long`);
    } else if (field.type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) errors.push(`${field.id}: must be a finite number`);
      else {
        if (field.min !== undefined && value < field.min) errors.push(`${field.id}: below minimum`);
        if (field.max !== undefined && value > field.max) errors.push(`${field.id}: above maximum`);
      }
    } else if (typeof value !== 'string' || !field.options.includes(value)) {
      errors.push(`${field.id}: invalid choice`);
    }
  }

  return Object.freeze({
    schema: 'sky.forms.validation-result.v1',
    formId: definition.formId,
    version: definition.version,
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    values: Object.freeze({ ...values }),
  });
}
