const request = require('supertest');
const regionList = require("../config/lists").regionList;
const app = require('../app');

describe("GET /user/checkRegion", () => {
    
    it ('should NOT return JSON with 403', async (done) => {
        
        // Request
        const res = await request(app)
        .get('/user/checkRegion')
        .set(process.env.HEADER_KEY, "fakeToken");
        
        expect(res.statusCode).toEqual(403);
        
        done();
    });
    
    it ('should NOT return JSON with 401', async (done) => {
        
        // Request
        const res = await request(app)
        .get('/user/checkRegion');
        
        expect(res.statusCode).toEqual(401);
        
        done();
    });
    
});

describe("GET /user/getBizList", () => {
    
    it ('should NOT return JSON', async(done) => {
        
        // Request
        const token = await getToken();
        
        const res = await request(app)
        .get('/user/getBizList')
        .query({
            region : "ANYWHERE",
            filter : "distance",
            since : 0,
            step : 10,
            lat:37.250606,
            lng:127.077528 
        })
        .set(process.env.HEADER_KEY, token);
        
        
        // Verify
        const rtn = JSON.parse(res.text).item;
        expect(rtn).toBeUndefined();
        
        done();
    });
    
});

describe("GET /user/getBizDetail", () => {
    
    it ('should NOT return JSON', async(done) => {
        
        // Request
        const token = await getToken();
        
        const res = await request(app)
        .get('/user/getBizList')
        .query({
            region : "dongdaemoon",
            bizName : "NOWHERE"
        })
        .set(process.env.HEADER_KEY, token);
        
        
        // Verify
        const rtn = JSON.parse(res.text).item;
        expect(rtn).toBeUndefined();
        
        done();
    });
    
});

async function getToken(){
    // Request
    const tokenRes = await request(app)
    .get(process.env.AUTH_URL)
    .set('user-agent', process.env.ALLOWED_AGENT);
        
    return JSON.parse(tokenRes.text).token;
    
}
