const request = require('supertest');
const app = require('../app');


describe("GET AUTH_URL", () => {
    
    it ('should return JWT Token.', async(done) => {
        
        // Request
        const res = await request(app)
        .get(process.env.AUTH_URL)
        .set('user-agent', process.env.ALLOWED_AGENT);
        
        // Verify
        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.text).token).not.toBeNull();
        done();
    });
    
    
    it ('shouldn\'t return JWT Token.', async (done) => {
        const res = await request(app)
        .get(process.env.AUTH_URL);
        
        expect(res.statusCode).toEqual(403);
        
        done();
    });
});
