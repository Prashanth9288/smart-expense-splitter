import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Simplify = () => {
    const { id } = useParams();
    const { token, user } = useAuth();
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchSimplify = async () => {
             if(!token) return;
             try {
                const res = await fetch(`${API_URL}/simplify?scope=group&groupId=${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setPayments(data.payments || []);
             } catch(e) { console.error(e); }
        };
        fetchSimplify();
    }, [id, token]);

    const handleSettle = async (payment) => {
        if (!confirm("Confirm you received/paid this amount?")) return;
        try {
            const res = await fetch(`${API_URL}/settlements`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    from_user_id: payment.from.id,
                    to_user_id: payment.to.id,
                    amount: payment.amount,
                    group_id: id,
                    method: 'CASH',
                    notes: 'Simplified Settlement'
                })
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch(e) { alert("Error"); }
    };

    return (
        <div className="animate-fade-in">
             <div className="header">
                 <Link to={`/groups/${id}`} style={{ color: 'var(--text-main)' }}>Done</Link>
                 <span className="logo" style={{ fontSize: '1.2rem' }}>Settle Up</span>
                 <span style={{ width: '50px' }}></span>
             </div>
             
             <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                 <div className="glass-card">
                     <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                        <h2 style={{ margin: 0 }}>Efficient Settlements</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                           The following payments will settle all debts in the group.
                        </p>
                     </div>
                     
                     <ul style={{ margin: 0 }}>
                         {payments.map((p, idx) => (
                             <li key={idx} style={{ 
                                 padding: '1.5rem', 
                                 marginBottom: '1rem', 
                                 background: 'rgba(255,255,255,0.5)', 
                                 borderRadius: 'var(--radius-md)',
                                 display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                             }}>
                                 <div className="flex-col">
                                     <div className="flex items-center">
                                         <strong style={{ fontSize: '1.1rem' }}>{p.from.name}</strong>
                                         <span style={{ margin: '0 0.5rem', color: 'var(--text-secondary)' }}>&rarr;</span>
                                         <strong style={{ fontSize: '1.1rem' }}>{p.to.name}</strong>
                                     </div>
                                 </div>
                                 <div className="flex items-center">
                                     <strong style={{ marginRight: '1rem', fontSize: '1.2rem', color: 'var(--success)' }}>${p.amount}</strong>
                                     {p.from.id === user.uid && (
                                         <button onClick={() => handleSettle(p)} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                             Pay
                                         </button>
                                     )}
                                     {p.to.id === user.uid && (
                                         <div className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #ccc', opacity: 0.7 }}>
                                             Receiving
                                         </div>
                                     )}
                                 </div>
                             </li>
                         ))}
                         {payments.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ fontSize: '2em' }}>🎉</span>
                                <p style={{ fontWeight: '600' }}>You are all settled up!</p>
                            </div>
                         )}
                     </ul>
                 </div>
             </div>
        </div>
    );
};

export default Simplify;
