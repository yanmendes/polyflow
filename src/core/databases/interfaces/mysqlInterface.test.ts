import { parseMysqlUrl } from './mysqlInterface'

describe('test parsing MYSQL URL', () => {
  it('should capture user, password, host, port and database', () => {
    expect(parseMysqlUrl('mysql://foo:bar@baz:8531/database')).toMatchObject({
      user: 'foo',
      password: 'bar',
      host: 'baz',
      port: '8531',
      database: 'database'
    })
  })

  it('should capture user, password, host and database', () => {
    expect(parseMysqlUrl('mysql://foo:bar@baz/database')).toMatchObject({
      user: 'foo',
      password: 'bar',
      host: 'baz',
      database: 'database'
    })
  })

  it('should capture user, host and database', () => {
    expect(parseMysqlUrl('mysql://foo:bar@baz/database')).toMatchObject({
      user: 'foo',
      host: 'baz',
      database: 'database'
    })
  })

  it('should throw an error', () => {
    expect(() => parseMysqlUrl('invalid URL')).toThrow()
  })
})
