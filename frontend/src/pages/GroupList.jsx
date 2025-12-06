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
    <div className="animate-fade-in">
      <div className="header">
          <span className="logo">Split Clone</span>
          <div className="flex items-center">
             <div style={{ marginRight: '1rem', textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.displayName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Free Plan</div>
             </div>
             <button onClick={logout} className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Logout</button>
          </div>
      </div>
      
      <div className="container" style={{ padding: '0 2rem' }}>
          <div className="glass-card stagger-1">
              <h3 style={{ marginTop: 0 }}>Create New Group</h3>
              <form onSubmit={createGroup} className="flex">
                <input 
                  placeholder="Group Name (e.g. Trip to Vegas)" 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  style={{ marginBottom: 0, flex: 1 }}
                />
                <button type="submit">Add Group</button>
              </form>
          </div>

          <h3 className="stagger-2" style={{ paddingLeft: '0.5rem' }}>Your Groups</h3>
          {groups.length === 0 ? (
              <div className="glass-card stagger-3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                 <p>No groups yet. Create one above!</p>
              </div>
          ) : (
              <div className="stagger-3">
                <ul className="grid-list">
                    {groups.map(g => (
                    <li key={g.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                        <Link to={`/groups/${g.id}`} className="flex justify-between items-center" style={{ width: '100%', color: 'inherit' }}>
                            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{g.name}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>View &rarr;</span>
                        </Link>
                    </li>
                    ))}
                </ul>
              </div>
          )}
      </div>
    </div>
  );
};

export default GroupList;
