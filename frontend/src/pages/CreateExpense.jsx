import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CreateExpense = () => {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [splitType, setSplitType] = useState('EQUAL');
    const [memberIdsInput, setMemberIdsInput] = useState('');
    
    const [participants, setParticipants] = useState([{ user_id: user?.uid }]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let finalParticipants = [...participants];
        if (memberIdsInput) {
            const others = memberIdsInput.split(',').map(s => s.trim()).filter(Boolean).map(uid => ({ user_id: uid }));
            finalParticipants = [...finalParticipants, ...others];
        }
        
        const uniqueIds = new Set();
        finalParticipants = finalParticipants.filter(p => {
             if (!p.user_id || uniqueIds.has(p.user_id)) return false;
             uniqueIds.add(p.user_id);
             return true;
        });

        const body = {
            group_id: id,
            description: desc,
            total_amount: amount,
            currency: 'USD',
            payer_user_id: user.uid,
            split_type: splitType,
            participants: finalParticipants
        };

        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            });
            if (res.ok) navigate(`/groups/${id}`);
            else alert("Failed to create expense");
        } catch(e) {
            alert("Error: " + e.message);
        }
    };

    return (
        <div className="animate-fade-in flex-col" style={{ gap: '2rem' }}>
            <div className="header">
                 <Link to={`/groups/${id}`} style={{ color: 'var(--text-muted)' }}>Cancel</Link>
                 <span className="logo" style={{ fontSize: '1.25rem' }}>Add Expense</span>
                 <span style={{ width: '50px' }}></span> 
            </div>
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="glass-card stagger-1">
                    <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '2rem' }}>
                        
                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            <div className="flex items-center">
                                <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📝</span>
                                <input 
                                    placeholder="What was this for?" 
                                    value={desc} 
                                    onChange={e => setDesc(e.target.value)} 
                                    required 
                                    style={{ 
                                        border: 'none', background: 'transparent', fontSize: '1.5rem', 
                                        margin: 0, padding: '0.5rem', fontWeight: '600', width: '100%',
                                        boxShadow: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            <div className="flex items-center">
                                <span style={{ fontSize: '1.5rem', marginRight: '1rem', width: '30px', textAlign: 'center', color: 'var(--success)' }}>$</span>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)} 
                                    required 
                                    style={{ 
                                        border: 'none', background: 'transparent', fontSize: '2.5rem', 
                                        margin: 0, padding: '0.5rem', fontWeight: '800', width: '100%',
                                        color: 'var(--success)', boxShadow: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Split Method</label>
                                <select value={splitType} onChange={e => setSplitType(e.target.value)} style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                                    <option value="EQUAL">Split Equally (=)</option>
                                    <option value="PERCENT">Split by Percent (%)</option>
                                    <option value="EXACT">Split by Exact Amounts ($)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                             <label style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participants (User IDs)</label>
                             <input 
                                value={memberIdsInput} 
                                onChange={e => setMemberIdsInput(e.target.value)} 
                                placeholder="Enter friend UIDs (comma separated)" 
                             />
                             <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '-0.5rem' }}>
                                *For demo, manually enter IDs.
                             </small>
                        </div>

                        <button type="submit" style={{ marginTop: '1rem', padding: '1.2rem' }}>Save Expense</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateExpense;
