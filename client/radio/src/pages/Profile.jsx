import { useState, useContext } from "react";
import { AppContext } from "@/context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Pencil, Save, X, Plus, Tag } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

function Profile() {
    const { userData, backendUrl, setUserData } = useContext(AppContext);

    const userName = userData?.username || userData?.name || "";

    const [displayName, setDisplayName] = useState(userData?.displayName || userName);
    const [bio, setBio]                 = useState(userData?.bio || "");
    const [stickers, setStickers]       = useState(userData?.stickers || []);
    const [editing, setEditing]         = useState(false);
    const [saving, setSaving]           = useState(false);

    const handleAddSticker = () => setStickers([...stickers, ""]);
    const handleStickerChange = (i, v) => {
        const next = [...stickers]; next[i] = v; setStickers(next);
    };
    const handleRemoveSticker = (i) => setStickers(stickers.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(
                backendUrl + '/api/user/profile',
                { displayName, bio, stickers },
                { withCredentials: true }
            );
            if (data.success) {
                setUserData(data.userData);
                toast.success("Profile saved");
                setEditing(false);
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    };

    const handleCancel = () => {
        setDisplayName(userData?.displayName || userName);
        setBio(userData?.bio || "");
        setStickers(userData?.stickers || []);
        setEditing(false);
    };

    const initials = (displayName || userName || "?").charAt(0).toUpperCase();

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN RADIO
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    <ScrollArea className="h-[420px] pr-3">
                        <div className="space-y-4">
                            {/* Avatar + Identity */}
                            <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500 bg-zinc-900 shrink-0">
                                    <span className="text-3xl font-semibold text-red-400">{initials}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    {editing ? (
                                        <Input
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            placeholder="Display Name"
                                            className="mb-2"
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-white truncate">
                                            {displayName || userName}
                                        </p>
                                    )}
                                    <p className="text-xs text-red-400 uppercase tracking-widest">@{userName}</p>
                                    <p className="text-xs text-zinc-500 truncate">{userData?.email}</p>
                                    {userData?.role && (
                                        <span className="inline-block mt-1 text-[10px] uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5">
                                            {userData.role}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Bio</p>
                                {editing ? (
                                    <Textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Tell the station about yourself..."
                                        className="min-h-[100px]"
                                    />
                                ) : (
                                    <p className="text-sm text-zinc-300 leading-relaxed rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
                                        {bio || <span className="text-zinc-600 italic">No bio yet.</span>}
                                    </p>
                                )}
                            </div>

                            {/* Stickers */}
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">
                                    Stickers {editing && <span className="text-zinc-600">· text labels</span>}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {stickers.map((s, i) => (
                                        <div key={i} className="flex items-center gap-1">
                                            {editing ? (
                                                <>
                                                    <Input
                                                        value={s}
                                                        onChange={e => handleStickerChange(i, e.target.value)}
                                                        placeholder={`Sticker ${i + 1}`}
                                                        className="w-32 h-8"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon-xs"
                                                        onClick={() => handleRemoveSticker(i)}
                                                    >
                                                        <X />
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                                                    <Tag className="size-3 text-red-400" />
                                                    {s || `Sticker ${i + 1}`}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {editing && (
                                        <Button type="button" variant="outline" size="sm" onClick={handleAddSticker}>
                                            <Plus className="size-4" /> Add Sticker
                                        </Button>
                                    )}
                                    {!editing && stickers.length === 0 && (
                                        <p className="text-xs text-zinc-600 italic">No stickers added yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                {editing ? (
                                    <>
                                        <Button onClick={handleSave} disabled={saving}>
                                            <Save className="size-4" /> {saving ? "Saving..." : "Save"}
                                        </Button>
                                        <Button variant="outline" onClick={handleCancel}>
                                            <X className="size-4" /> Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setEditing(true)}>
                                        <Pencil className="size-4" /> Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default Profile;
