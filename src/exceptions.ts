import { UserInputError } from "apollo-server-core";

class MediationError extends Error {
  mediationInfo: Object | Array<Object>;

  constructor(message: string, mediationInfo: Object | Array<Object>) {
    super(message);
    this.mediationInfo = mediationInfo;
    Error.captureStackTrace(this, MediationError);
  }
}

const ifErrorContains = (pattern: RegExp, callback: Function) => (err: Error) =>
  Promise.reject(pattern.test(err.message) ? callback(err) : err);

const handlePossibleUniqueEntryException = msg => e =>
  ifErrorContains(/duplicate key value/, _ => {
    throw new UserInputError(msg);
  })(e);

export { MediationError, handlePossibleUniqueEntryException };
