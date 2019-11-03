export const port: number = parseInt(process.env.PORT || '3050', 10)
const awsSecrets: any = process.env.AWS_SECRETS
console.log(awsSecrets, awsSecrets.TYPEORM_URL)
export const psqlURL: string =
  (JSON.parse(awsSecrets) || {}).TYPEORM_URL ||
  process.env.TYPEORM_URL ||
  'postgres://postgres:postgres@localhost/polyflow'
export const JWT_SECRET: string = process.env.JWT_SECRET || 'gwrag3qgragrgqe'
