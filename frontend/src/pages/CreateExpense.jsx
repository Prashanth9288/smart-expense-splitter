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
        <div className="animate-fade-in">
            <div className="header">
                 <Link to={`/groups/${id}`} style={{ color: 'var(--text-main)' }}>Cancel</Link>
                 <span className="logo" style={{ fontSize: '1.2rem' }}>Add Expense</span>
                 <span style={{ width: '50px' }}></span> 
            </div>
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="glass-card">
                    <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1.5rem' }}>
                        
                        <div className="flex items-center" style={{ borderBottom: '2px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📝</span>
                            <input 
                                placeholder="Enter a description" 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)} 
                                required 
                                style={{ 
                                    border: 'none', background: 'transparent', fontSize: '1.2rem', 
                                    margin: 0, padding: '0.5rem', fontWeight: '500' 
                                }}
                            />
                        </div>

                        <div className="flex items-center" style={{ borderBottom: '2px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', marginRight: '1rem', width: '30px', textAlign: 'center' }}>$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                value={amount} 
                                onChange={e => setAmount(e.target.value)} 
                                required 
                                style={{ 
                                    border: 'none', background: 'transparent', fontSize: '2rem', 
                                    margin: 0, padding: '0.5rem', fontWeight: 'bold' 
                                }}
                            />
                        </div>

                        <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>SPLIT METHOD</label>
                                <select value={splitType} onChange={e => setSplitType(e.target.value)} style={{ background: 'rgba(255,255,255,0.8)' }}>
                                    <option value="EQUAL">Split Equally (=)</option>
                                    <option value="PERCENT">Split by Percent (%)</option>
                                    <option value="EXACT">Split by Exact Amounts ($)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                             <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>PARTICIPANTS</label>
                             <input 
                                value={memberIdsInput} 
                                onChange={e => setMemberIdsInput(e.target.value)} 
                                placeholder="Enter friend UIDs (comma separated)" 
                                style={{ background: 'rgba(255,255,255,0.8)' }}
                             />
                             <small style={{ color: 'var(--text-secondary)' }}>
                                For this demo, manually enter User IDs. In production, this would be a contact list.
                             </small>
                        </div>

                        <button type="submit" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>Save Expense</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateExpense;
