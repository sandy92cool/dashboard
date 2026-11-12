import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const safeStringRegex = /^[a-zA-Z0-9_\-+@. ]+$/;

export const statsQuerySchema = z.object({
  start_date: z.string().regex(dateRegex, 'start_date must be YYYY-MM-DD').optional(),
  end_date: z.string().regex(dateRegex, 'end_date must be YYYY-MM-DD').optional()
});

export const customerLookupSchema = z.object({
  customer_query: z
    .string()
    .min(1, 'Query must not be empty')
    .max(64, 'Query exceeds max length')
    .regex(safeStringRegex, 'Query contains invalid characters'),
  search_type: z.enum(['application_number', 'mobile_number', 'auto']).optional()
});

export const aiAskSchema = z.object({
  query: z
    .string()
    .min(1, 'Query must not be empty')
    .max(500, 'Query exceeds max length'),
  start_date: z.string().regex(dateRegex, 'start_date must be YYYY-MM-DD').optional(),
  end_date: z.string().regex(dateRegex, 'end_date must be YYYY-MM-DD').optional()
});

export function validate(schema, source = 'query') {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'params'
        ? { ...req.params, ...req.query }
        : req[source];
      const parsed = schema.parse(dataToValidate);
      req.validated = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.issues || err.errors || [];
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input parameters provided',
            details: issues.map(e => ({ field: (e.path || []).join('.'), message: e.message }))
          }
        });
      }
      next(err);
    }
  };
}
