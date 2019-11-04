import { Request, Response } from 'express'

interface CurrentUser {
  jwt: string
}

export default interface Context {
  req: Request
  res: Response
  currentUser: CurrentUser
}
