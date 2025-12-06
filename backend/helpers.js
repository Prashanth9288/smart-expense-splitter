const { v4: uuidv4 } = require('uuid');

// Utility: Convert cents to string "12.34"
const centsToString = (cents) => {
    return (cents / 100).toFixed(2);
};

// Split Logic
// participants: [{ user_id }] (for EQUAL) or [{ user_id, share_percent }] (for PERCENT) or [{ user_id, exact_share }] (for EXACT - though EXACT usually just sums up)
// Returns: [{ user_id, share_cents, ... }]
const calculateSplits = (totalCents, splitType, participants) => {
    let results = participants.map(p => ({ ...p, share_cents: 0 }));
    const count = participants.length;

    if (splitType === 'EQUAL') {
        const share = Math.floor(totalCents / count);
        let remainder = totalCents % count;
        
        results = results.map((p, index) => {
            let userShare = share;
            if (remainder > 0) {
                userShare += 1;
                remainder--;
            }
            return { ...p, share_cents: userShare };
        });

    } else if (splitType === 'PERCENT') {
        // Floor each share, distribute remainder
        let allocatedCents = 0;
        
        results = results.map(p => {
            // share_percent is e.g. 33.33
            const rawShare = Math.floor(totalCents * (p.share_percent / 100));
            allocatedCents += rawShare;
            return { ...p, share_cents: rawShare };
        });

        let remainder = totalCents - allocatedCents;
        // Distribute remainder to first participants
        results = results.map((p) => {
            if (remainder > 0) {
                p.share_cents += 1;
                remainder--;
            }
            return p;
        });

    } else if (splitType === 'EXACT') {
        // Trust the frontend/request to sum up, but we could validate
        // In this helper, we assume 'participants' already has 'share_cents' or 'exact_cents' populated or passed in effectively.
        // If the request format for EXACT passes "exact_cents" in participants, we just use it.
        // We generally expect totalCents to match sum(exact_cents).
        results = results.map(p => ({
            ...p,
            share_cents: p.share_cents || p.exact_cents || 0 // Defensive
        }));
    }

    return results;
};

// Simplify Debts (Greedy)
// netBalances: [{ user_id: 'u1', net_cents: -400 }, { user_id: 'u2', net_cents: 400 }]
// Returns: [{ from: user_id, to: user_id, amount_cents: 400 }]
const simplifyDebts = (netBalances) => {
    // Separate into debtors (net < 0) and creditors (net > 0)
    let debtors = netBalances.filter(b => b.net_cents < 0).sort((a, b) => a.net_cents - b.net_cents); // Ascending (most negative first)
    let creditors = netBalances.filter(b => b.net_cents > 0).sort((a, b) => b.net_cents - a.net_cents); // Descending (most positive first)

    const payments = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the minimum of magnitude(debt) and credit
        let amount = Math.min(Math.abs(debtor.net_cents), creditor.net_cents);

        // Record payment
        payments.push({
            from: debtor.user, // Keeping whole user object if available, or just id
            to: creditor.user,
            amount_cents: amount,
            amount: centsToString(amount)
        });

        // Update balances
        debtor.net_cents += amount;
        creditor.net_cents -= amount;

        // If settled, move to next
        if (debtor.net_cents === 0) i++;
        if (creditor.net_cents === 0) j++;
    }

    return payments;
};

module.exports = {
    centsToString,
    calculateSplits,
    simplifyDebts
};
