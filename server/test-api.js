const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

const request = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("=== STARTING CODE SNIPPET MANAGER API TESTS ===\n");
  
  try {
    // 1. Get initial snippets (starter data)
    console.log("1. Fetching initial snippets...");
    const initRes = await request('/snippets');
    const initialCount = initRes.body.length;
    console.log(`Status: ${initRes.status}. Found ${initialCount} snippets initially.`);
    console.log("✓ Initial snippets fetched successfully.\n");

    // 2. Fetch stats
    console.log("2. Fetching dashboard stats...");
    const statsRes = await request('/snippets/stats');
    console.log(`Status: ${statsRes.status}. Mode: ${statsRes.body.dbMode}, Total: ${statsRes.body.totalCount}`);
    if (statsRes.body.totalCount !== initialCount) {
      throw new Error(`Stats count (${statsRes.body.totalCount}) doesn't match initial snippet count (${initialCount})`);
    }
    console.log("✓ Dashboard statistics verified.\n");

    // 3. Create a new snippet
    console.log("3. Creating a new snippet...");
    const newSnippetData = {
      title: "Javascript Debounce Function",
      language: "javascript",
      description: "A simple debounce helper function.",
      tags: ["javascript", "helper", "debounce"],
      code: "export function debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), wait);\n  };\n}"
    };
    const createRes = await request('/snippets', 'POST', newSnippetData);
    console.log(`Status: ${createRes.status}. Created title: "${createRes.body.title}"`);
    const createdId = createRes.body.id || createRes.body._id;
    if (!createdId) {
      throw new Error("Created snippet missing identifier ID");
    }
    console.log(`✓ Snippet created with ID: ${createdId}\n`);

    // 4. Verify search and filtering
    console.log("4. Verifying search filter (q=debounce)...");
    const searchRes = await request('/snippets?q=debounce');
    console.log(`Status: ${searchRes.status}. Found matching: ${searchRes.body.length}`);
    if (searchRes.body.length !== 1 || searchRes.body[0].title !== "Javascript Debounce Function") {
      throw new Error("Search filter failed to find the debounce snippet");
    }
    console.log("✓ Search filter query works.\n");

    // 5. Update snippet (Edit title and Pinned status)
    console.log("5. Updating snippet (Edit title and Pin)...");
    const updateRes = await request(`/snippets/${createdId}`, 'PUT', {
      title: "Javascript Debounce Helper (Optimized)",
      pinned: true
    });
    console.log(`Status: ${updateRes.status}. Updated Title: "${updateRes.body.title}". Pinned: ${updateRes.body.pinned}`);
    if (updateRes.body.title !== "Javascript Debounce Helper (Optimized)" || !updateRes.body.pinned) {
      throw new Error("Update snippet failed to apply modifications");
    }
    console.log("✓ Snippet edited and pinned successfully.\n");

    // 6. Delete snippet
    console.log("6. Deleting the created snippet...");
    const deleteRes = await request(`/snippets/${createdId}`, 'DELETE');
    console.log(`Status: ${deleteRes.status}. Message: ${JSON.stringify(deleteRes.body)}`);
    
    // Verify it is gone
    const checkRes = await request('/snippets');
    if (checkRes.body.some(s => (s.id || s._id) === createdId)) {
      throw new Error("Snippet was not deleted from database");
    }
    console.log("✓ Snippet deleted successfully.\n");

    console.log("=== ALL API TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
    process.exit(1);
  }
}

runTests();
