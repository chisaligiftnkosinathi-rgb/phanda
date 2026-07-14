import * as http from 'http';

function request(method: string, path: string, body?: any, token?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 4000,
      path: `/api/v1/auth${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res: http.IncomingMessage) => {
      let responseBody = '';
      res.on('data', (chunk: any) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function verifyTrace(data: any, step: string) {
  if (!data.traceId) throw new Error(`${step} missing traceId`);
  console.log(`  [Trace] ${data.traceId}`);
}

async function runTests() {
  console.log("==========================================");
  console.log("   iPhande Auth Validation (Phase 2.1)    ");
  console.log("==========================================\n");

  const testEmail = `user_${Date.now()}@test.com`;

  // 1. Register
  console.log("1. Testing Registration...");
  const regRes = await request('POST', '/register', {
    email: testEmail, password: 'SecurePassword123', name: 'Test User'
  });
  console.log("Status:", regRes.status, "Data:", regRes.data);
  verifyTrace(regRes.data, "Registration");
  if (regRes.status !== 201) throw new Error("Registration failed");

  // 1b. Duplicate Register
  console.log("\n1b. Testing Duplicate Registration...");
  const dupRes = await request('POST', '/register', {
    email: testEmail, password: 'SecurePassword123', name: 'Test User'
  });
  console.log("Status:", dupRes.status, "Data:", dupRes.data);
  verifyTrace(dupRes.data, "Duplicate Reg");
  if (dupRes.status !== 409) throw new Error("Duplicate email check failed");

  // 2. Login
  console.log("\n2. Testing Login...");
  const loginRes = await request('POST', '/login', {
    email: testEmail, password: 'SecurePassword123'
  });
  console.log("Status:", loginRes.status, "Tokens received:", !!loginRes.data.accessToken);
  verifyTrace(loginRes.data, "Login");
  if (loginRes.status !== 200) throw new Error("Login failed");

  const { accessToken, refreshToken } = loginRes.data;

  // 2b. Invalid Password
  console.log("\n2b. Testing Invalid Password...");
  const badLogin = await request('POST', '/login', {
    email: testEmail, password: 'WrongPassword'
  });
  console.log("Status:", badLogin.status, "Data:", badLogin.data);
  verifyTrace(badLogin.data, "Invalid Password");
  if (badLogin.status !== 401) throw new Error("Invalid password check failed");

  // 3. JWT Verification
  console.log("\n3. Testing JWT Verification...");
  const verifyRes = await request('GET', '/verify-token', null, accessToken);
  console.log("Status:", verifyRes.status, "Data:", verifyRes.data);
  verifyTrace(verifyRes.data, "JWT Verification");
  if (verifyRes.status !== 200) throw new Error("JWT Verification failed");

  // 4. Invalid JWT
  console.log("\n4. Testing Invalid JWT...");
  const badJwt = await request('GET', '/verify-token', null, 'invalid.token.here');
  console.log("Status:", badJwt.status, "Data:", badJwt.data);
  verifyTrace(badJwt.data, "Invalid JWT");
  if (badJwt.status !== 401) throw new Error("Invalid JWT check failed");

  // 5. Refresh Token
  console.log("\n5. Testing Refresh Token...");
  const refreshRes = await request('POST', '/refresh', { token: refreshToken });
  console.log("Status:", refreshRes.status, "New Access Token received:", !!refreshRes.data.accessToken);
  verifyTrace(refreshRes.data, "Refresh Token");
  if (refreshRes.status !== 200) throw new Error("Refresh failed");

  // 6. Logout
  console.log("\n6. Testing Logout...");
  const logoutRes = await request('POST', '/logout', { token: refreshToken });
  console.log("Status:", logoutRes.status, "Data:", logoutRes.data);
  verifyTrace(logoutRes.data, "Logout");
  if (logoutRes.status !== 200) throw new Error("Logout failed");

  // 6b. Try Refresh After Logout
  console.log("\n6b. Testing Refresh After Logout...");
  const badRefresh = await request('POST', '/refresh', { token: refreshToken });
  console.log("Status:", badRefresh.status, "Data:", badRefresh.data);
  verifyTrace(badRefresh.data, "Refresh After Logout");
  if (badRefresh.status !== 403) throw new Error("Logout token invalidation failed");

  // 7. Password Reset
  console.log("\n7. Testing Password Reset...");
  const resetRes = await request('POST', '/reset-password', {
    email: testEmail, newPassword: 'NewSecurePassword456'
  });
  console.log("Status:", resetRes.status, "Data:", resetRes.data);
  verifyTrace(resetRes.data, "Password Reset");
  if (resetRes.status !== 200) throw new Error("Password reset failed");

  // 8. Login with new password
  console.log("\n8. Testing Login with new password...");
  const loginRes2 = await request('POST', '/login', {
    email: testEmail, password: 'NewSecurePassword456'
  });
  console.log("Status:", loginRes2.status, "Login Success:", !!loginRes2.data.accessToken);
  verifyTrace(loginRes2.data, "Login With New Password");
  if (loginRes2.status !== 200) throw new Error("Login with new password failed");

  console.log("\n==========================================");
  console.log("   Auth Validation: PASSED                ");
  console.log("==========================================\n");
}

runTests().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
