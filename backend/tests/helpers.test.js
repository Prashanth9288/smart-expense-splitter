const { calculateSplits, simplifyDebts, centsToString } = require('../helpers');

describe('Helper Functions', () => {

    describe('centsToString', () => {
        test('converts cents to formatted string', () => {
            expect(centsToString(1234)).toBe('12.34');
            expect(centsToString(5)).toBe('0.05');
            expect(centsToString(0)).toBe('0.00');
            expect(centsToString(100)).toBe('1.00');
        });
    });

    describe('calculateSplits', () => {
        test('EQUAL split divides evenly with no remainder', () => {
            const total = 3000; // $30.00
            const participants = [{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }];
            const res = calculateSplits(total, 'EQUAL', participants);
            
            expect(res).toHaveLength(3);
            expect(res[0].share_cents).toBe(1000);
            expect(res[1].share_cents).toBe(1000);
            expect(res[2].share_cents).toBe(1000);
            const sum = res.reduce((acc, p) => acc + p.share_cents, 0);
            expect(sum).toBe(total);
        });

        test('EQUAL split handles remainders correctly', () => {
            const total = 1000; // $10.00 / 3 = 3.333...
            const participants = [{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }];
            const res = calculateSplits(total, 'EQUAL', participants);
            
            // Should be 334, 333, 333
            expect(res[0].share_cents).toBe(334);
            expect(res[1].share_cents).toBe(333);
            expect(res[2].share_cents).toBe(333);
            const sum = res.reduce((acc, p) => acc + p.share_cents, 0);
            expect(sum).toBe(total);
        });

        test('PERCENT split calculates correctly', () => {
            const total = 10000; // $100.00
            const participants = [
                { user_id: 'u1', share_percent: 50 },
                { user_id: 'u2', share_percent: 25 },
                { user_id: 'u3', share_percent: 25 }
            ];
            const res = calculateSplits(total, 'PERCENT', participants);
            
            expect(res[0].share_cents).toBe(5000);
            expect(res[1].share_cents).toBe(2500);
            expect(res[2].share_cents).toBe(2500);
            const sum = res.reduce((acc, p) => acc + p.share_cents, 0);
            expect(sum).toBe(total);
        });

        test('PERCENT split handles rounding dust', () => {
            const total = 100; // $1.00
            // 33.33% * 3 = 99.99%
            const participants = [
                { user_id: 'u1', share_percent: 33.33 },
                { user_id: 'u2', share_percent: 33.33 },
                { user_id: 'u3', share_percent: 33.33 }
            ]; // Sums to 99.99, leaving 1 cent remainder
            
            const res = calculateSplits(total, 'PERCENT', participants);
            
            // Expect floors: 33, 33, 33. Remainder 1 distributed to first.
            expect(res[0].share_cents).toBe(34);
            expect(res[1].share_cents).toBe(33);
            expect(res[2].share_cents).toBe(33);
            const sum = res.reduce((acc, p) => acc + p.share_cents, 0);
            expect(sum).toBe(total);
        });
    });

    describe('simplifyDebts', () => {
        test('Simple A owes B', () => {
            // A net -100, B net +100
            const netBalances = [
                { user: { id: 'A', name: 'Alice' }, net_cents: -100 },
                { user: { id: 'B', name: 'Bob' }, net_cents: 100 }
            ];
            const result = simplifyDebts(netBalances);
            
            expect(result).toHaveLength(1);
            expect(result[0].from.id).toBe('A');
            expect(result[0].to.id).toBe('B');
            expect(result[0].amount_cents).toBe(100);
        });

        test('A->B->C (Chain debt)', () => {
            // A owes B 100
            // B owes C 100
            // Net: A (-100), B (0), C (+100)
            const netBalances = [
                { user: { id: 'A' }, net_cents: -100 },
                { user: { id: 'B' }, net_cents: 0 },
                { user: { id: 'C' }, net_cents: 100 }
            ];
            const result = simplifyDebts(netBalances);
            
            // Should simplify to A -> C directly
            expect(result).toHaveLength(1);
            expect(result[0].from.id).toBe('A');
            expect(result[0].to.id).toBe('C');
            expect(result[0].amount_cents).toBe(100);
        });

        test('Complex 3-way split', () => {
            // A owes 200
            // B owes 200
            // C is owed 400
            const netBalances = [
                { user: { id: 'A' }, net_cents: -200 },
                { user: { id: 'B' }, net_cents: -200 },
                { user: { id: 'C' }, net_cents: 400 }
            ];
            const result = simplifyDebts(netBalances);
            
            // Should be 2 payments: A->C and B->C
            expect(result).toHaveLength(2);
            // Sorting might vary, but total flow must be correct.
            const totalFlow = result.reduce((acc, p) => acc + p.amount_cents, 0);
            expect(totalFlow).toBe(400);

            const recipients = result.map(p => p.to.id);
            expect(recipients).toContain('C');
        });
        
        test('Cycle A->B->C->A (All flat)', () => {
            // A owes B 100
            // B owes C 100
            // C owes A 100
            // Net balances: All zero.
            const netBalances = [
                { user: { id: 'A' }, net_cents: 0 },
                { user: { id: 'B' }, net_cents: 0 },
                { user: { id: 'C' }, net_cents: 0 }
            ];
            const result = simplifyDebts(netBalances);
            
            expect(result).toHaveLength(0); // No payments needed
        });
    });
});
