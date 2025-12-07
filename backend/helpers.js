const { v4: uuidv4 } = require('uuid');

const centsToString = (cents) => {
    return (cents / 100).toFixed(2);
};

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
        let allocatedCents = 0;
        
        results = results.map(p => {
            const rawShare = Math.floor(totalCents * (p.share_percent / 100));
            allocatedCents += rawShare;
            return { ...p, share_cents: rawShare };
        });

        let remainder = totalCents - allocatedCents;
        results = results.map((p) => {
            if (remainder > 0) {
                p.share_cents += 1;
                remainder--;
            }
            return p;
        });

    } else if (splitType === 'EXACT') {
        
        results = results.map(p => ({
            ...p,
            share_cents: p.share_cents || p.exact_cents || 0
        }));
    }

    return results;
};


const simplifyDebts = (netBalances) => {
    let debtors = netBalances.filter(b => b.net_cents < 0).sort((a, b) => a.net_cents - b.net_cents); 
    let creditors = netBalances.filter(b => b.net_cents > 0).sort((a, b) => b.net_cents - a.net_cents); 

    const payments = [];

    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        let amount = Math.min(Math.abs(debtor.net_cents), creditor.net_cents);

        payments.push({
            from: debtor.user,
            to: creditor.user,
            amount_cents: amount,
            amount: centsToString(amount)
        });

        debtor.net_cents += amount;
        creditor.net_cents -= amount;

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
