import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, X, FileText, ArrowRight } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

function BlogGroups() {
    const { blogGroups, fetchBlogGroups, backendUrl, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';
    const navigate = useNavigate();

    const [showForm, setShowForm]     = useState(false);
    const [name, setName]             = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSelect = (group) => {
        localStorage.setItem("selectedBlogGroup", JSON.stringify({ _id: group._id, name: group.name }));
        navigate("/Blog");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/bloggroup`,
                { name, description },
                { withCredentials: true }
            );
            if (data._id) {
                toast.success("Blog group created");
                setName(""); setDescription(""); setShowForm(false);
                fetchBlogGroups();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        Blog Groups
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Blog Groups</CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">Select a blog group and read posts.</p>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    {isAdmin && (
                        <Button
                            variant={showForm ? "outline" : "default"}
                            size="sm"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New Group</>}
                        </Button>
                    )}

                    {isAdmin && showForm && (
                        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">New Blog Group</p>
                            <Input
                                placeholder="Group name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                            <Textarea
                                placeholder="Description (optional)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="min-h-[80px]"
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Creating..." : "Create Group"}
                                </Button>
                            </div>
                        </form>
                    )}

                    <ScrollArea className="h-[400px] pr-3">
                        {(!blogGroups || blogGroups.length === 0) ? (
                            <p className="text-center text-xs text-zinc-500 py-8">No blog groups found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {blogGroups.map(group => (
                                    <button
                                        key={group._id}
                                        type="button"
                                        onClick={() => handleSelect(group)}
                                        className="text-left overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60 transition-all hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10"
                                    >
                                        {group.coverImage ? (
                                            <img
                                                src={`${backendUrl}/uploads/${group.coverImage}`}
                                                alt={group.name}
                                                className="w-full h-32 object-cover"
                                            />
                                        ) : (
                                            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-red-500/10 to-zinc-950">
                                                <FileText className="size-10 text-red-500/70" />
                                            </div>
                                        )}
                                        <div className="p-4 space-y-1">
                                            <p className="text-base font-semibold text-white truncate">{group.name}</p>
                                            <p className="text-xs text-zinc-400 line-clamp-2">
                                                {group.description || "No description"}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-widest text-red-400 inline-flex items-center gap-1 pt-1">
                                                Read blogs <ArrowRight className="size-3" />
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default BlogGroups;
