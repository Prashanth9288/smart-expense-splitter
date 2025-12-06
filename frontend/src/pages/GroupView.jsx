import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const GroupView = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resExp = await fetch(`${API_URL}/groups/${id}/expenses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!resExp.ok) {
            const err = await resExp.json();
            console.error("Expenses Fetch Failed:", err);
            if (err.error && err.error.includes("index")) {
                alert("Backend Error: " + err.error + "\n\nCHECK YOUR BACKEND TERMINAL FOR THE LINK TO CREATE THE INDEX.");
            }
            return;
        }
        const dataExp = await resExp.json();
        setExpenses(dataExp.expenses || []);

        const resBal = await fetch(`${API_URL}/groups/${id}/balances`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dataBal = await resBal.json();
        setBalances(dataBal.balances || []);
      } catch (e) {
        console.error("Load failed", e);
      }
    };
    if (token) load();
  }, [id, token]);

  return (
    <div className="animate-fade-in">
        <div className="header">
            <Link to="/" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>&larr;</span> Back
            </Link>
            <span className="logo" style={{ fontSize: '1.2rem' }}>Details</span>
            <Link to={`/groups/${id}/expense/new`}>
                <button>+ Expense</button>
            </Link>
        </div>

        <div className="container" style={{ padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            
            <div className="glass-card stagger-1" style={{ height: 'fit-content' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Balances</h3>
                    <Link to={`/groups/${id}/simplify`} style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Settle Up</Link>
                </div>
                
                {balances.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No balances. All settled!</p>}
                
                <ul style={{ margin: 0, padding: 0 }}>
                    {balances.map(b => (
                    <li key={b.user.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center">
                            <div style={{ 
                                width: '36px', height: '36px', 
                                background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)', 
                                color: '#006064',
                                borderRadius: '50%', marginRight: '10px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                            }}>
                                {b.user.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: '500' }}>{b.user.name}</span>
                        </div>
                        <span style={{ fontWeight: '700', color: b.net_cents >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {b.net_cents > 0 ? `+ $${b.net}` : `- $${b.net.replace('-', '')}`}
                        </span>
                    </li>
                    ))}
                </ul>
            </div>

            <div className="stagger-2">
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Activity</h3>
                {expenses.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No expenses yet.</p> : (
                    <ul style={{ padding: 0 }}>
                        {expenses.map((e, i) => (
                        <li key={e.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: `${i * 0.05}s` }}>
                            <div className="flex items-center">
                                <div style={{ fontSize: '1.5rem', marginRight: '1rem', opacity: 0.8 }}>🧾</div>
                                <div className="flex-col" style={{ gap: '2px' }}>
                                    <strong style={{ fontSize: '1.1rem' }}>{e.description}</strong>
                                    <small style={{ color: 'var(--text-secondary)' }}>
                                        {e.payer_user_id === user.uid ? 'You' : 'Someone'} paid <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>${e.total_amount}</span>
                                    </small>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${e.total_amount}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</div>
                            </div>
                        </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
  );
};

export default GroupView;
