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
    <div className="animate-fade-in flex-col" style={{ gap: '2rem' }}>
        <div className="header">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <span>&larr;</span> Back
            </Link>
            <span className="logo" style={{ fontSize: '1.2rem' }}>Details</span>
            <Link to={`/groups/${id}/expense/new`}>
                <button>+ Expense</button>
            </Link>
        </div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
            
            <div className="glass-card stagger-1" style={{ height: 'fit-content' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Current Balances</h4>
                    <Link to={`/groups/${id}/simplify`} style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>Settle Up &rarr;</Link>
                </div>
                
                {balances.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No balances. All settled!</p>}
                
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {balances.map(b => (
                    <li key={b.user.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center">
                            <div style={{ 
                                width: '40px', height: '40px', 
                                background: 'linear-gradient(135deg, var(--secondary) 0%, #818cf8 100%)', 
                                color: '#fff',
                                borderRadius: '50%', marginRight: '12px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}>
                                {b.user.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: '600' }}>{b.user.name}</span>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '1.1rem', color: b.net_cents >= 0 ? 'var(--success)' : 'var(--danger)', textShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                            {b.net_cents > 0 ? `+ $${b.net}` : `- $${b.net.replace('-', '')}`}
                        </span>
                    </li>
                    ))}
                </ul>
            </div>

            <div className="stagger-2">
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Recent Activity</h3>
                {expenses.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No expenses yet.</p> : (
                    <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {expenses.map((e, i) => (
                        <li key={e.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: `${i * 0.05}s`, transition: 'transform 0.2s' }}>
                            <div className="flex items-center">
                                <div style={{ fontSize: '2rem', marginRight: '1.5rem', opacity: 0.8, filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' }}>🧾</div>
                                <div className="flex-col" style={{ gap: '4px' }}>
                                    <strong style={{ fontSize: '1.25rem' }}>{e.description}</strong>
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--primary)' }}>{e.payer_user_id === user.uid ? 'You' : 'Someone'}</span> paid <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>${e.total_amount}</span>
                                    </small>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-main)' }}>${e.total_amount}</span>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
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
