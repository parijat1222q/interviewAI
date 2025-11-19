const WebSocket = require('ws');

const API_URL = 'http://localhost:5000/api';
const WS_URL = 'ws://localhost:5000/voice-signal';

async function runTests() {
    console.log('🚀 Starting Backend Service Tests...\n');

    let token = '';
    let userId = '';
    const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        role: 'backend'
    };

    try {
        // Helper for JSON requests
        const post = async (url, body, authToken = null) => {
            const headers = { 'Content-Type': 'application/json' };
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            return data;
        };

        // 1. Register
        console.log('1️⃣  Testing Registration...');
        const regRes = await post(`${API_URL}/auth/register`, testUser);
        console.log('   ✅ Registered:', regRes.message);

        // 2. Login
        console.log('\n2️⃣  Testing Login...');
        const loginRes = await post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        token = loginRes.token;
        userId = loginRes.userId;
        console.log('   ✅ Logged in. Token received.');

        // 3. Start Interview (Get Question)
        console.log('\n3️⃣  Testing Interview Start (Get Question)...');
        const qRes = await post(`${API_URL}/interview/question`, {}, token);
        console.log('   ✅ Question received:', qRes.question.substring(0, 50) + '...');

        // 4. Submit Answer
        console.log('\n4️⃣  Testing Answer Submission...');
        const ansRes = await post(`${API_URL}/interview/answer`, {
            answer: "I would use a distributed lock manager like Redis Redlock to ensure consistency."
        }, token);
        console.log('   ✅ Answer submitted. Feedback received.');
        console.log('   📊 Accuracy:', ansRes.feedback.accuracy);

        // 5. End Session
        console.log('\n5️⃣  Testing End Session...');
        const endRes = await post(`${API_URL}/interview/end`, {}, token);
        console.log('   ✅ Session ended. Summary received.');
        console.log('   📈 Overall Accuracy:', endRes.overallScore.accuracy);

        // 6. Test WebSocket Connection
        console.log('\n6️⃣  Testing Voice WebSocket...');
        await new Promise((resolve, reject) => {
            const ws = new WebSocket(`${WS_URL}?token=${token}`);

            ws.on('open', () => {
                console.log('   ✅ WebSocket connected.');

                // Send a join message
                ws.send(JSON.stringify({
                    type: 'join',
                    sessionId: 'test-session-123'
                }));
            });

            ws.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.type === 'joined') {
                    console.log('   ✅ Joined session via WebSocket.');
                    ws.close();
                    resolve();
                }
            });

            ws.on('error', (err) => {
                console.error('   ❌ WebSocket Error:', err.message);
                reject(err);
            });
        });

        console.log('\n🎉 All Tests Passed Successfully!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        process.exit(1);
    }
}

runTests();
