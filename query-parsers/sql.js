const KeplerMediator = require('../mediators/Kepler')
const { Parser } = require('flora-sql-parser');
const toSQL = require('flora-sql-parser').util.astToSQL;
const _ = require('lodash')

function avengersAssemble(tableName) {
    //This means this is a 1-1
    if (!KeplerMediator[tableName].entity1 || !KeplerMediator[tableName].entity2) {
        return tableName
        //This means this is a 1-N
    } else {
        let { entity1, entity2, type, columns, params } = KeplerMediator[tableName]

        let cols = Object.values(columns)
        let aliases = Object.keys(columns)

        cols.forEach((v, k) => {
            cols[k] = v + ` as ${aliases[k]}`
        })

        if (type === 'join') {
            return `(SELECT ${_.join(cols, ', ')} FROM ${entity1.name} AS ${entity1.alias}, ${entity2.name} AS ${entity2.alias} WHERE ${params[0]} = ${params[1]})`
        } else if (type === 'union') {
            throw new Error("Can't handle this yet")
        }
    }
}

module.exports = async function (query) {
    const parser = new Parser()
    let ast = parser.parse(query)
    let { columns, from } = ast

    let i = 0
    let fromTable

    _.forEach(from, table => {
        if (!i) {
            fromTable = table.table
            table.as = table.as ? table.as : ('table_' + i)
        } else {
            //This means there is a join
            throw new Error("Can't handle that yet")
        }
        ++i
    })

    let mediatedEntity = avengersAssemble(fromTable)

    let sql = toSQL(ast)
    let re = new RegExp(`"${fromTable}"`, "gmi")
    sql = sql.replace(re, mediatedEntity)
    return sql.replace(/\s+as\s+"(\w+)"/gmi, " as $1")
}
