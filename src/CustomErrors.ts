class MediationError extends Error {
  mediationInfo: Object | Array<Object>;

  constructor(message: string, mediationInfo: Object | Array<Object>) {
    super(message);
    this.mediationInfo = mediationInfo;
    Error.captureStackTrace(this, MediationError);
  }
}

export { MediationError };
