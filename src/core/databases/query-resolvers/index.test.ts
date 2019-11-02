import { getUsedMediators } from '.'

describe('contextualize subQueries', () => {
  it('should get the context correctly for SQL statements', () => {
    const queries = [
      'select * from mediator[foo]',
      'select * from mediator[foo_BAR_1341] INNER JOIN mediator[foo_2])'
    ]

    queries.forEach(q =>
      getUsedMediators(q).forEach(e => expect(e).toContain('mediator'))
    )
  })

  it('should get the context correctly for BigDAWG statements', () => {
    const queries = [
      'bdcast(bdrel(select * from mediator[foo]))',
      'bdrel(select * from mediator[foo])'
    ]

    queries.forEach(q =>
      getUsedMediators(q).forEach(e => expect(e).toContain('mediator'))
    )
  })
})
