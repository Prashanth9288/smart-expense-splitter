import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const GroupList = () => {
  const { token, logout, user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');

  const fetchGroups = async () => {
    try {
        console.log("Fetching groups with token:", token ? token.substring(0, 10) + "..." : "null");
        const res = await fetch(`${API_URL}/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            const err = await res.json();
            console.error("Fetch Groups Failed:", err);
            return;
        }
        const data = await res.json();
        if (data.groups) setGroups(data.groups);
    } catch (e) {
        console.error("Fetch error:", e);
    }
  };

  useEffect(() => {
    if(token) fetchGroups();
  }, [token]);

  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;

    try {
        const res = await fetch(`${API_URL}/groups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newGroupName })
        });
        
        if (res.ok) {
          setNewGroupName('');
          fetchGroups();
        } else {
            const errData = await res.json();
            alert("Failed to create group: " + (errData.error || res.statusText));
        }
    } catch (e) {
        alert("Error creating group: " + e.message);
    }
  };

  return (
    <div className="animate-fade-in flex-col" style={{ gap: '2rem' }}>
      <div className="header">
          <span className="logo">Split Clone</span>
          <div className="flex items-center">
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700' }}>{user?.displayName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free Plan</div>
             </div>
             <button onClick={logout} className="secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Logout</button>
          </div>
      </div>
      
      <div className="container">
          <div className="glass-card stagger-1">
              <h3>Create New Group</h3>
              <form onSubmit={createGroup} className="flex" style={{ flexWrap: 'wrap' }}>
                <input 
                  placeholder="Group Name (e.g. Trip to Vegas)" 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  style={{ marginBottom: 0, flex: '1 1 300px' }}
                />
                <button type="submit" style={{ flex: '0 0 auto' }}>+ Add Group</button>
              </form>
          </div>

          <div className="stagger-2">
            <h3 style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Your Groups</h3>
            {groups.length === 0 ? (
                <div className="glass-card stagger-3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
                   <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗂️</div>
                   <p>No groups yet. Create one above to get started!</p>
                </div>
            ) : (
                <ul className="grid-list">
                    {groups.map((g, i) => (
                    <li key={g.id} className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.1}s` }}>
                        <Link to={`/groups/${g.id}`} style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%' }}>
                            <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{g.name}</span>
                            <span style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>&rarr;</span>
                        </Link>
                    </li>
                    ))}
                </ul>
            )}
          </div>
      </div>
    </div>
  );
};

export default GroupList;
