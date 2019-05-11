export const port: number = parseInt(process.env.PORT || "3000", 10);
export const psqlURL: string = process.env.TYPEORM_URL || "postgres://postgres:postgres@localhost/polyflow";
