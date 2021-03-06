var Telegraf = require('telegraf')
var should = require('should')
var session = require('../lib/session')

describe('Telegraf Session', function () {
  it('should be defined', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      function * () {
        should.exist(this.session)
        this.session.foo = 42
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
  })

  it('should handle existing session', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      function * () {
        should.exist(this.session)
        this.session.should.have.property('foo')
        this.session.foo.should.be.equal(42)
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
  })

  it('should handle not existing session', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      function * () {
        should.exist(this.session)
        this.session.should.not.have.property('foo')
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 999}, text: 'hey'}})
  })

  it('should handle session reset', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      function * () {
        this.session = null
        should.exist(this.session)
        this.session.should.not.have.property('foo')
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
  })

  it('ttl', function (done) {
    this.timeout(5000)
    var app = new Telegraf()
    app.on('photo',
      session({ttl: 1}),
      function * () {
        this.session.photo = 'sample.png'
        this.session.photo.should.be.equal('sample.png')
        setTimeout(function () {
           app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
        }, 2000)
      })
    app.on('text',
      session(),
      function * () {
        this.session.should.not.have.property('photo')
        done()
      })
    setTimeout(function () {
      app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, photo: {}}})
    }, 500)
  })
})
