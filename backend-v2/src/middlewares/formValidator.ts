import { Request, Response, NextFunction } from "express";
import AppError from "../utils/classes/AppError";

export type FieldType = "string" | "number" | "object" | "array" | "boolean" | "email";

export type FieldSchema = {
  field: string; 
  type: FieldType;
  required?: boolean;
  
  minLength?: number; 
  maxLength?: number;
  pattern?: RegExp;

  min?: number;
  max?: number;
  
  minItems?: number;
  maxItems?: number;
  
  // Custom validation & default values
  defaultValue?: any;
  custom?: (value: any, req: Request) => boolean | string; // Return string for custom error message
};

type ValidationError = {
  field: string;
  message: string;
};

/**
  Retrieves nested properties using dot notation (e.g., "user.profile.name")
 */
function getNestedValue(obj: Record<string, any> | undefined, path: string): any {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

/**
  Helper function to validate Email syntax
 */
function isValidEmail(value: string) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(value)
}

/**
 * Validates a single value against a schema field rule
 */
function validateField(rule: FieldSchema, rawValue: any, req: Request): string | null {
  let value = rawValue

  // Required Check
  const isEmpty = value === undefined || value === null || value === ""
  if (rule.required && isEmpty) {
    return `Field '${rule.field}' is required.`
  }

  // Skip further validation if optional and empty
  if (isEmpty) {
    return null;
  }

  // Type Validation & Normalization
  switch (rule.type) {
    case "string":
    case "email": {
      if (typeof value !== "string") {
        return `Field '${rule.field}' must be a string.`;
      }

      // Email format check
      if (rule.type === "email" && !isValidEmail(value)) {
        return `Field '${rule.field}' must be a valid email address.`;
      }

      // String constraints apply to email as well
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return `Field '${rule.field}' must be at least ${rule.minLength} characters long.`;
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return `Field '${rule.field}' cannot exceed ${rule.maxLength} characters.`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return `Field '${rule.field}' format is invalid.`;
      }
      break;
    }

    case "number": {
      const num = typeof value === "number" ? value : Number(value);
      if (isNaN(num) || value === "") return `Field '${rule.field}' must be a valid number.`
      if (rule.min !== undefined && num < rule.min) {
        return `Field '${rule.field}' must be at least ${rule.min}.`
      }
      if (rule.max !== undefined && num > rule.max) {
        return `Field '${rule.field}' cannot exceed ${rule.max}.`
      }
      break
    }

    case "boolean": {
      const isBool = typeof value === "boolean" || value === "true" || value === "false"
      if (!isBool) return `Field '${rule.field}' must be a boolean.`
      break
    }

    case "array":
      if (!Array.isArray(value)) return `Field '${rule.field}' must be an array.`
      if (rule.minItems !== undefined && value.length < rule.minItems) {
        return `Field '${rule.field}' must contain at least ${rule.minItems} items.`
      }
      if (rule.maxItems !== undefined && value.length > rule.maxItems) {
        return `Field '${rule.field}' cannot contain more than ${rule.maxItems} items.`
      }
      break

    case "object":
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return `Field '${rule.field}' must be an object.`;
      }
      break

    case "email":
      if (typeof value !== "string") return `Field '${rule.field}' must be a string.`
      
      if (!isValidEmail(value)) {
        return `Field '${rule.field}' must be a valid email address.`
      }
      break
  }

  if (rule.custom) {
    const customResult = rule.custom(value, req);
    if (typeof customResult === "string") return customResult;
    if (!customResult) return `Field '${rule.field}' failed custom validation.`;
  }

  return null;
}


function formValidator(schemas: FieldSchema[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    for (const schema of schemas) {
      let value =
        getNestedValue(req.body, schema.field) ??
        getNestedValue(req.query as Record<string, any>, schema.field) ??
        getNestedValue(req.params, schema.field);

      // Apply default value if value is missing
      if ((value === undefined || value === null) && schema.defaultValue !== undefined) {
        value = schema.defaultValue;
        if (req.body) req.body[schema.field] = value;
      }

      const error = validateField(schema, value, req);
      if (error) {
        errors.push({ field: schema.field, message: error });
      }
    }

    if (errors.length > 0) {
      return next(new AppError(400, "Invalid data.", errors));
    }

    next();
  };
}

export default formValidator