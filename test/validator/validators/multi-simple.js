'use strict'

const test = require('tap').test
const {Prop} = require('../../../')
const { compileValidator } = require('../../common')

const DATE = new Date().toISOString()

test('validator - multi, simple, required', (t) => {
  const input = {
    name: 'biscuits'
  , multi: true
  , type: 'test'
  , props: [
      Prop.boolean().path('bool')
    , Prop.email().path('email').allowNull()
    , Prop.string().path('string').min(1).max(10)
    , Prop.enum(['a', 'b']).path('enuma')
    , Prop.uuid().path('uuid')
    , Prop.number().path('number')
    , Prop.regex(/^\d+$/).path('r')
    , Prop.date().path('date')
    , Prop.array().path('a')
    ]
  }

  const fn = compileValidator(input)

  const errorTests = [
    { input: [{}]
    , output: 'invalid param: "a". Expected array'
    , name: 'missing array'
    }
  , { input: [{ a: 'biscuits' }]
    , output: 'invalid param: "a". Expected array'
    , name: 'invalid array'
    }
  , { input: [{ a: [] }]
    , output: 'invalid param: "bool". Expected boolean, got undefined'
    , name: 'missing bool'
    }
  , { input: [{ a: [], bool: 'test' }]
    , output: 'invalid param: "bool". Expected boolean, got string'
    , name: 'invalid bool'
    }
  , { input: [{ a: [], bool: false }]
    , output: 'invalid param: "date". Expected date'
    , name: 'missing date'
    }
  , { input: [{ a: [], bool: false, date: 'fadf' }]
    , output: 'invalid param: "date". Expected date'
    , name: 'invalid date'
    }
  , { input: [{ a: [], bool: false, date: DATE }]
    , output: 'invalid param: "email". Expected email'
    , name: 'missing email'
    }
  , { input: [{ a: [], bool: false, date: DATE, email: 'el@me' }]
    , output: 'invalid param: "email". Expected email'
    , name: 'invalid email'
    }
  , { input: [{ a: [], bool: false, date: DATE, email: null }]
    , output: 'invalid param: "enuma". Must be one of ["a", "b"]'
    , name: 'missing enuma'
    }
  , { input: [{ a: [], bool: false, date: DATE, email: 'el@me.com' }]
    , output: 'invalid param: "enuma". Must be one of ["a", "b"]'
    , name: 'missing enuma'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'c'
        }
      ]
    , output: 'invalid param: "enuma". Must be one of ["a", "b"]'
    , name: 'invalid enuma'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        }
      ]
    , output: 'invalid param: "number". Expected number, got undefined'
    , name: 'missing number'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 'test'
        }
      ]
    , output: 'invalid param: "number". Expected number, got string'
    , name: 'invalid number'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        }
      ]
    , output: 'invalid param: "r". Must match /^\\d+$/'
    , name: 'missing regex'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , r: 'fasdsaf'
        }
      ]
    , output: 'invalid param: "r". Must match /^\\d+$/'
    , name: 'invalid regex'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , r: 1
        }
      ]
    , output: 'invalid param: "string". Expected string, got undefined'
    , name: 'missing string'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , r: 1
        , string: 1
        }
      ]
    , output: 'invalid param: "string". Expected string, got number'
    , name: 'invalid string'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , r: 1
        , string: '1'
        }
      ]
    , output: 'invalid param: "uuid". Expected uuid'
    , name: 'missing uuid'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , r: 1
        , string: ''
        }
      ]
    , output: 'invalid param: "string". Length must be >= 1, got 0'
    , name: 'string < min'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , r: 1
        , string: 'fasdfasdfasdfasdfasdfasdfdsfa'
        }
      ]
    , output: 'invalid param: "string". Length must be <= 10, got 29'
    , name: 'string > max'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , r: 1
        , string: '1'
        , uuid: 'test'
        }
      ]
    , output: 'invalid param: "uuid". Expected uuid'
    , name: 'invalid uuid'
    }
  ]

  t.plan(errorTests.length)

  for (const item of errorTests) {
    t.test(item.name, (tt) => {
      tt.plan(4)
      const valid = fn(item.input, (err) => {
        tt.type(err, Error)
        tt.match(err.message, item.output)
        tt.equal(err.code, 'EINVAL', 'err.code === \'EINVAL\'')
        tt.equal(valid, false, 'returns false')
      })
    })
  }
})

test('validator - multi, simple, optionals', (t) => {
  const input = {
    name: 'biscuits'
  , multi: true
  , type: 'test'
  , props: [
      Prop.boolean().path('bool').optional()
    , Prop.email().path('email').optional()
    , Prop.string().path('string').optional()
    , Prop.enum(['a', 'b']).path('enuma').optional()
    , Prop.uuid().path('uuid').optional()
    , Prop.number().path('number').optional()
    , Prop.regex(/^\d+$/).path('r').optional()
    , Prop.date().path('date').optional()
    , Prop.array().path('a').optional()
    ]
  }

  const fn = compileValidator(input)

  const errorTests = [
    { input: [{ a: 'biscuits' }]
    , output: 'invalid param: "a". Expected array'
    , name: 'invalid array'
    }
  , { input: [{ a: [], bool: 'test' }]
    , output: 'invalid param: "bool". Expected boolean, got string'
    , name: 'invalid bool'
    }
  , { input: [{ a: [], bool: false, date: 'fadf' }]
    , output: 'invalid param: "date". Expected date'
    , name: 'invalid date'
    }
  , { input: [{ a: [], bool: false, date: DATE, email: 'el@me' }]
    , output: 'invalid param: "email". Expected email'
    , name: 'invalid email'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'c'
        }
      ]
    , output: 'invalid param: "enuma". Must be one of ["a", "b"]'
    , name: 'invalid enuma'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 'test'
        }
      ]
    , output: 'invalid param: "number". Expected number, got string'
    , name: 'invalid number'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , string: 1
        }
      ]
    , output: 'invalid param: "string". Expected string, got number'
    , name: 'invalid string'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , string: '1'
        , uuid: 'test'
        }
      ]
    , output: 'invalid param: "uuid". Expected uuid'
    , name: 'invalid uuid'
    }
  , {
      input: [
        { a: []
        , bool: false
        , date: DATE
        , email: 'el@me.com'
        , enuma: 'a'
        , number: 1
        , string: '1'
        , uuid: 'test'
        , r: 'biscuits'
        }
      ]
    , output: 'invalid param: "r". Must match /^\\d+$/'
    , name: 'invalid regex'
    }
  ]

  t.plan(errorTests.length)

  for (const item of errorTests) {
    t.test(item.name, (tt) => {
      tt.plan(4)
      const valid = fn(item.input, (err) => {
        tt.type(err, Error)
        tt.match(err.message, item.output)
        tt.equal(err.code, 'EINVAL', 'err.code === \'EINVAL\'')
        tt.equal(valid, false, 'returns false')
      })
    })
  }
})
