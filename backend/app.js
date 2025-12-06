const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { db, collections } = require('./db');
const verifyToken = require('./auth');
const { calculateSplits, simplifyDebts, centsToString } = require('./helpers');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Splitwise Backend'));

app.use('/api', verifyToken);

app.get('/api/me', async (req, res) => {
    try {
        const doc = await collections.users.doc(req.user.uid).get();
        if (!doc.exists) return res.status(404).json({ error: 'Not found' });
        res.json({ user: { id: doc.id, ...doc.data() } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/groups', async (req, res) => {
    try {
        const { name, description, members } = req.body; 
        const groupId = uuidv4();
        const ts = new Date();
        const memberIds = [req.user.uid, ...(members || [])];
        const uniqueMembers = [...new Set(memberIds)];

        const membersMap = {};
        uniqueMembers.forEach(uid => {
            membersMap[uid] = { 
                is_admin: uid === req.user.uid, 
                joined_at: ts 
            };
        });

        const groupData = {
            name,
            description: description || '',
            creator_user_id: req.user.uid,
            is_archived: false,
            created_at: ts,
            members: membersMap,
            member_ids: uniqueMembers 
        };

        await collections.groups.doc(groupId).set(groupData);
        res.status(201).json({ group: { id: groupId, ...groupData } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/groups', async (req, res) => {
    try {
        const snapshot = await collections.groups
            .where('member_ids', 'array-contains', req.user.uid)
            .get();
            
        const groups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ groups });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/groups/:id/members', async (req, res) => {
    try {
        const { user_id, is_admin } = req.body;
        const groupRef = collections.groups.doc(req.params.id);
        
        await db.runTransaction(async (t) => {
            const doc = await t.get(groupRef);
            if (!doc.exists) throw new Error('Group not found');
            
            const data = doc.data();
            const members = data.members || {};
            const memberIds = data.member_ids || [];

            members[user_id] = { is_admin: !!is_admin, joined_at: new Date() };
            if (!memberIds.includes(user_id)) memberIds.push(user_id);

            t.update(groupRef, { members, member_ids: memberIds });
        });

        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/expenses', async (req, res) => {
    try {
        const { group_id, description, total_amount, currency, payer_user_id, split_type, participants } = req.body;
        const totalCents = Math.round(parseFloat(total_amount) * 100);

        const splitResults = calculateSplits(totalCents, split_type, participants);

        const expenseId = uuidv4();
        const ts = new Date();

        await db.runTransaction(async (t) => {
            const expenseRef = collections.expenses.doc(expenseId);
            t.set(expenseRef, {
                group_id,
                creator_user_id: req.user.uid,
                payer_user_id,
                description,
                total_cents: totalCents,
                currency: currency || 'USD',
                split_type,
                created_at: ts,
                updated_at: ts
            });

            splitResults.forEach(p => {
                const pRef = expenseRef.collection('participants').doc(p.user_id);
                t.set(pRef, {
                    user_id: p.user_id,
                    share_cents: p.share_cents,
                    share_percent: p.share_percent || null,
                    exact_cents: p.exact_cents || null
                });
            });

            splitResults.forEach(p => {
                if (p.user_id !== payer_user_id) {
                    const ledgerId = uuidv4();
                    const ledgerRef = collections.ledger.doc(ledgerId);
                    t.set(ledgerRef, {
                        from_user_id: p.user_id,
                        to_user_id: payer_user_id,
                        amount_cents: p.share_cents,
                        currency: currency || 'USD',
                        expense_id: expenseId,
                        group_id: group_id || null, 
                        description: description,
                        created_at: ts
                    });
                }
            });
        });

        res.status(201).json({ 
            expense_id: expenseId, 
            total_cents: totalCents, 
            participants: splitResults 
        });

    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/groups/:id/expenses', async (req, res) => {
    try {
        const snapshot = await collections.expenses
            .where('group_id', '==', req.params.id)
            
            .get();
        
        let expenses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        expenses.sort((a, b) => {
            const tA = a.created_at && a.created_at.toDate ? a.created_at.toDate() : new Date(a.created_at);
            const tB = b.created_at && b.created_at.toDate ? b.created_at.toDate() : new Date(b.created_at);
            return tB - tA; 
        });

        expenses = expenses.map(e => ({ ...e, total_amount: centsToString(e.total_cents) }));
        
        res.json({ expenses });
    } catch (e) { 
        console.error("GET /expenses ERROR:", e);
        res.status(500).json({ error: e.message }); 
    }
});

app.get('/api/groups/:id/balances', async (req, res) => {
    try {
        const groupId = req.params.id;
        
        const snapshot = await collections.ledger.where('group_id', '==', groupId).get();
        const entries = snapshot.docs.map(d => d.data());

        const balances = {}; 
        const userIds = new Set();

        entries.forEach(e => {
            const { from_user_id, to_user_id, amount_cents } = e;
            
            balances[from_user_id] = (balances[from_user_id] || 0) - amount_cents;
            balances[to_user_id] = (balances[to_user_id] || 0) + amount_cents;
            
            userIds.add(from_user_id);
            userIds.add(to_user_id);
        });

        const users = [];
        const userMap = {};
        if (userIds.size > 0) {
           for (const uid of userIds) {
               const uDoc = await collections.users.doc(uid).get();
               if (uDoc.exists) userMap[uid] = uDoc.data();
           }
        }

        const result = Object.keys(balances).map(uid => ({
            user: { id: uid, name: userMap[uid]?.name || uid },
            net_cents: balances[uid],
            net: centsToString(balances[uid])
        }));

        res.json({ balances: result });

    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/simplify', async (req, res) => {
    try {
        const { scope, groupId } = req.query;
        let query = collections.ledger;
        if (scope === 'group' && groupId) {
            query = query.where('group_id', '==', groupId);
        }
        
        const snapshot = await query.get();
        const entries = snapshot.docs.map(d => d.data());

        const balances = {};
        const userIds = new Set();

        entries.forEach(e => {
            balances[e.from_user_id] = (balances[e.from_user_id] || 0) - e.amount_cents;
            balances[e.to_user_id] = (balances[e.to_user_id] || 0) + e.amount_cents;
            userIds.add(e.from_user_id);
            userIds.add(e.to_user_id);
        });

        const userMap = {};
        for (const uid of userIds) {
           const uDoc = await collections.users.doc(uid).get();
           if (uDoc.exists) userMap[uid] = uDoc.data();
        }

        const netList = Object.keys(balances).map(uid => ({
            user: { id: uid, name: userMap[uid]?.name || uid },
            net_cents: balances[uid]
        }));

        const payments = simplifyDebts(netList);
        res.json({ payments });

    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settlements', async (req, res) => {
    try {
        const { from_user_id, to_user_id, amount, group_id, method, notes } = req.body;
        const amountCents = Math.round(parseFloat(amount) * 100);
        const settlementId = uuidv4();
        const ts = new Date();

        await db.runTransaction(async (t) => {
            const settRef = collections.settlements.doc(settlementId);
            t.set(settRef, {
                from_user_id,
                to_user_id,
                amount_cents: amountCents,
                currency: 'USD',
                group_id,
                method,
                notes,
                created_at: ts
            });

            
            const ledgerRef = collections.ledger.doc(uuidv4());
            t.set(ledgerRef, {
                from_user_id: to_user_id, 
                to_user_id: from_user_id, 
                amount_cents: amountCents,
                currency: 'USD',
                settlement_id: settlementId,
                group_id: group_id || null,
                description: 'Settlement' + (notes ? ': ' + notes : ''),
                created_at: ts
            });
        });

        res.status(201).json({ ok: true });
    } catch (e) { 
        console.error("GET /api/groups ERROR:", e);
        res.status(500).json({ error: e.message }); 
    }
});

app.get('/api/debug-info', (req, res) => {
    try {
        const sa = require('./serviceAccountKey.json');
        res.json({
            time: new Date().toISOString(),
            env_project_id: process.env.FIREBASE_PROJECT_ID,
            sa_project_id: sa.project_id,
            sa_client_email: sa.client_email,
            auth_emulator: process.env.FIREBASE_AUTH_EMULATOR_HOST,
            firestore_emulator: process.env.FIRESTORE_EMULATOR_HOST
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
