class MediationError extends Error {
  constructor (message, mediationInfo) {
    super(message)
    this.mediationInfo = mediationInfo
    Error.captureStackTrace(this, MediationError)
  }
}

export { MediationError }
