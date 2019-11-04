export const port: number = parseInt(process.env.PORT || '3050', 10)
const awsSecrets: any = JSON.parse(process.env.AWS_SECRETS || '{}')
export const psqlURL: string =
  awsSecrets.TYPEORM_URL ||
  process.env.TYPEORM_URL ||
  'postgres://postgres:postgres@localhost/polyflow'
export const JWT_SECRET: string =
  awsSecrets.JWT_SECRET || process.env.JWT_SECRET || 'gwrag3qgragrgqe'
