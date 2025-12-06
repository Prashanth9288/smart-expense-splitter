const { calculateSplits, simplifyDebts, centsToString } = require('./helpers');
const assert = require('assert');

console.log("Running Manual Tests...");

try {
    // 1. Cents to String
    assert.strictEqual(centsToString(1234), '12.34', 'centsToString failed');
    console.log("PASS: centsToString");

    // 2. Equal Split
    const resEqual = calculateSplits(1000, 'EQUAL', [{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }]);
    assert.strictEqual(resEqual[0].share_cents, 334);
    assert.strictEqual(resEqual[1].share_cents, 333);
    assert.strictEqual(resEqual.reduce((a,b)=>a+b.share_cents,0), 1000);
    console.log("PASS: Equal Split");

    // 3. Percent Split
    const resPercent = calculateSplits(10000, 'PERCENT', [
        { user_id: 'u1', share_percent: 50 },
        { user_id: 'u2', share_percent: 50 }
    ]);
    assert.strictEqual(resPercent[0].share_cents, 5000);
    assert.strictEqual(resPercent[1].share_cents, 5000);
    console.log("PASS: Percent Split");

    // 4. Simplify Debts
    const netBalances = [
        { user: { id: 'A' }, net_cents: -100 },
        { user: { id: 'B' }, net_cents: 100 }
    ];
    const resSimplify = simplifyDebts(netBalances);
    assert.strictEqual(resSimplify.length, 1);
    assert.strictEqual(resSimplify[0].from.id, 'A');
    assert.strictEqual(resSimplify[0].to.id, 'B');
    assert.strictEqual(resSimplify[0].amount_cents, 100);
    console.log("PASS: Simplify Debts");

    console.log("ALL TESTS PASSED ✅");
} catch (e) {
    console.error("TEST FAILED ❌");
    console.error(e);
}
