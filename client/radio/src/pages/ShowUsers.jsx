import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ArrowLeft, LayoutGrid, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ShowUsers = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const [allUsers, setAllUsers] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const navigate = useNavigate();

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role !== 'admin') {
            navigate('/');
            toast.error('Not an admin');
        } else if (userData) {
            getUsers();
        }
    }, [userData]);

    const getUsers = async () => {
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/all');
            setAllUsers(data);
        } catch (err) { console.log(err); }
    };

    const roleColor = (role) => role === 'admin' ? '#fa4040' : '#555';

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='flex text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <button onClick={() => navigate('/admin')}
                            className='flex left-0 rounded-3xl p-1 px-2 m-1 bg-red-500 w-fit align-middle'>
                        <ArrowLeft /> Back
                    </button>
                    <h2 className='m-auto p-5 flex text-white text-6xl font-bold'>All Users</h2>
                </div>

                <div style={styles.body}>
                    {/* toolbar */}
                    <div style={styles.toolbar}>
                        <span style={styles.count}>{allUsers.length} USERS</span>
                        <div style={styles.toggleGroup}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{ ...styles.toggleBtn, ...(viewMode === 'grid' ? styles.toggleActive : {}) }}
                                title="Grid view"
                            >
                                <LayoutGrid size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ ...styles.toggleBtn, ...(viewMode === 'list' ? styles.toggleActive : {}) }}
                                title="List view"
                            >
                                <List size={14} />
                            </button>
                        </div>
                    </div>

                    {/* GRID VIEW */}
                    {viewMode === 'grid' && (
                        <div style={styles.grid}>
                            {Array.from({ length: Math.ceil(allUsers.length / 3) }).map((_, rowIndex) => (
                                <div key={rowIndex} className="flex gap-4 mb-4">
                                    {allUsers.slice(rowIndex * 3, rowIndex * 3 + 3).map((user, index) => (
                                        <Card key={index} className="flex-1 bg-zinc-900 border-zinc-800 text-white transition-all duration-300 ease-in-out hover:flex-[1.1] cursor-pointer">
                                            <CardHeader className='flex-col justify-center'>
                                                <div style={styles.gridAvatar}>
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <CardTitle className='m-auto text-center'>{user.username}</CardTitle>
                                                <CardDescription className="text-zinc-400 text-center">{user.email}</CardDescription>
                                            </CardHeader>
                                            <CardContent className='flex justify-center'>
                                                <span style={{ ...styles.roleBadge, color: roleColor(user.role), borderColor: roleColor(user.role) + '44' }}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LIST VIEW */}
                    {viewMode === 'list' && (
                        <div style={styles.listWrap}>
                            {/* header row */}
                            <div style={styles.listHeader}>
                                <span style={{ ...styles.listCell, flex: 2 }}>USERNAME</span>
                                <span style={{ ...styles.listCell, flex: 3 }}>EMAIL</span>
                                <span style={{ ...styles.listCell, flex: 1 }}>ROLE</span>
                            </div>
                            {allUsers.map((user, i) => (
                                <div key={i} style={{ ...styles.listRow, background: i % 2 === 0 ? '#1e1e1e' : '#222' }}>
                                    <div style={{ ...styles.listCellVal, flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={styles.listAvatar}>{user.username[0].toUpperCase()}</div>
                                        <span style={styles.listName}>{user.username}</span>
                                    </div>
                                    <span style={{ ...styles.listCellVal, flex: 3, color: '#666' }}>{user.email}</span>
                                    <span style={{ ...styles.listCellVal, flex: 1, color: roleColor(user.role) }}>
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    page:        { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:      { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:      { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a", justifyContent: "center", display: "flex", flexDirection: "column" },
    body:        { padding: "24px 32px" },
    toolbar:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    count:       { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "3px", color: "#555" },
    toggleGroup: { display: "flex", gap: "4px", background: "#222", border: "1px solid #333", borderRadius: "6px", padding: "3px" },
    toggleBtn:   { background: "transparent", border: "none", borderRadius: "4px", padding: "5px 8px", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" },
    toggleActive:{ background: "#fa4040", color: "#fff" },
    grid:        { },
    gridAvatar:  { width: "40px", height: "40px", borderRadius: "50%", background: "#322d2d", border: "2px solid #fa4040", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", fontSize: "16px", color: "#fa4040", margin: "0 auto 8px auto" },
    roleBadge:   { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "2px", border: "1px solid", borderRadius: "3px", padding: "3px 8px" },
    listWrap:    { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden" },
    listHeader:  { display: "flex", padding: "10px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a" },
    listCell:    { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "3px", color: "#444" },
    listRow:     { display: "flex", padding: "10px 16px", alignItems: "center", borderBottom: "1px solid #252525" },
    listCellVal: { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#aaa" },
    listAvatar:  { width: "28px", height: "28px", borderRadius: "50%", background: "#322d2d", border: "1px solid #fa4040", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", fontSize: "12px", color: "#fa4040", flexShrink: 0 },
    listName:    { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#f5f0e8" },
};

export default ShowUsers;