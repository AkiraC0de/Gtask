import { FieldSchema } from "../middlewares/formValidator"

export const registerSchema: FieldSchema[] = [
  {
    field: "email",
    type: "email",
    required: true,
  },
  {
    field: "password",
    type: "string",
    minLength: 8,
    maxLength: 50,
    required: true
  }
]