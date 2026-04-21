import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import axios from 'axios';
import { LayoutGrid, List } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ShowUsers = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const [allUsers, setAllUsers] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = allUsers.filter(user => {
        const query = searchQuery.toLowerCase();
        return user.username.toLowerCase().includes(query) || 
               user.email.toLowerCase().includes(query);
    });

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role === 'admin') getUsers();
    }, [userData]);

    const getUsers = async () => {
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/all');
            setAllUsers(data);
        } catch (err) { console.log(err); }
    };

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) {
        return (
            <div className="w-full h-full bg-zinc-950 text-white p-4 text-sm text-zinc-400">
                Admins only.
            </div>
        );
    }

    const initial = (name) => (name || '?').charAt(0).toUpperCase();

    return (
        <div className="w-full h-full bg-zinc-950 text-white flex flex-col">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full flex flex-col min-h-0">
                <CardHeader className="border-b border-zinc-800 pb-4 shrink-0">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN Admin
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">All Users</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 flex-1 min-h-0 flex flex-col gap-3">
                    <div className="flex items-center justify-between shrink-0 gap-2">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-8 bg-zinc-900 border-zinc-800 text-xs"
                            />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-zinc-500">
                            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="icon-xs"
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                <LayoutGrid />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="icon-xs"
                                onClick={() => setViewMode('list')}
                                title="List view"
                            >
                                <List />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0 pr-3">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredUsers.map((user) => {
                                    const isAdminUser = user.role === 'admin';
                                    return (
                                        <Card key={user._id || user.email} size="sm" className="bg-zinc-900/60 ring-zinc-800">
                                            <CardContent className="p-4 flex flex-col items-center gap-2">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-500 bg-zinc-900 text-red-400 font-semibold">
                                                    {initial(user.username)}
                                                </div>
                                                <p className="text-sm font-medium text-white truncate w-full text-center">{user.username}</p>
                                                <p className="text-[10px] text-zinc-500 truncate w-full text-center">{user.email}</p>
                                                <span className={[
                                                    "inline-block text-[9px] uppercase tracking-widest rounded border px-2 py-0.5",
                                                    isAdminUser
                                                        ? "text-red-400 bg-red-500/10 border-red-500/40"
                                                        : "text-zinc-400 bg-zinc-800 border-zinc-700",
                                                ].join(' ')}>
                                                    {user.role}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-md border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                                <div className="grid grid-cols-[2fr_3fr_1fr] gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                                    <span>Username</span>
                                    <span>Email</span>
                                    <span>Role</span>
                                </div>
                                {filteredUsers.map((user, i) => (
                                    <div
                                        key={user._id || user.email || i}
                                        className={[
                                            "grid grid-cols-[2fr_3fr_1fr] gap-2 px-4 py-2 items-center border-b border-zinc-800/50",
                                            i % 2 === 0 ? "bg-zinc-900/30" : "bg-zinc-900/60",
                                        ].join(' ')}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500 bg-zinc-900 text-red-400 text-xs font-semibold shrink-0">
                                                {initial(user.username)}
                                            </div>
                                            <span className="text-sm text-white truncate">{user.username}</span>
                                        </div>
                                        <span className="text-xs text-zinc-400 truncate">{user.email}</span>
                                        <span className={[
                                            "text-[10px] uppercase tracking-widest",
                                            user.role === 'admin' ? "text-red-400" : "text-zinc-500",
                                        ].join(' ')}>
                                            {user.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default ShowUsers;
