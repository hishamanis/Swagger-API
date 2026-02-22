const request = require('supertest');
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'items.json');
let server;

describe('CRUD /items API', function() {
  before(function(done) {
    // Clear items.json before tests
    fs.writeFileSync(DATA_FILE, '[]');
    server = require('./server');
    setTimeout(done, 500); // Give server time to start
  });

  after(function(done) {
    if (server && server.close) server.close();
    done();
  });

  let itemId;

  it('POST /items should create item', function(done) {
    request('http://localhost:3000')
      .post('/items')
      .send({ name: 'Test', description: 'desc' })
      .expect(201)
      .expect(res => {
        if (!res.body.id) throw new Error('Missing id');
        itemId = res.body.id;
      })
      .end(done);
  });

  it('GET /items should list items', function(done) {
    request('http://localhost:3000')
      .get('/items')
      .expect(200)
      .expect(res => {
        if (!Array.isArray(res.body)) throw new Error('Not array');
        if (!res.body.length) throw new Error('Empty');
      })
      .end(done);
  });

  it('GET /items/:id should get item', function(done) {
    request('http://localhost:3000')
      .get(`/items/${itemId}`)
      .expect(200)
      .expect(res => {
        if (res.body.id !== itemId) throw new Error('Wrong id');
      })
      .end(done);
  });

  it('PUT /items/:id should update item', function(done) {
    request('http://localhost:3000')
      .put(`/items/${itemId}`)
      .send({ name: 'Updated' })
      .expect(200)
      .expect(res => {
        if (res.body.name !== 'Updated') throw new Error('Not updated');
      })
      .end(done);
  });

  it('DELETE /items/:id should delete item', function(done) {
    request('http://localhost:3000')
      .delete(`/items/${itemId}`)
      .expect(200)
      .expect(res => {
        if (res.body.id !== itemId) throw new Error('Wrong id');
      })
      .end(done);
  });
});
