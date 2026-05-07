import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext.jsx";
import { useWindowManager } from "@/context/WindowManager.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { Mail, KeyRound, LogOut, ShieldCheck, BadgeCheck, XCircle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResetPassword from "@/pages/ResetPassword.jsx";

function Account() {
    const { userData, backendUrl, logout, sendVerificationOtp } = useContext(AppContext);
    const { addWindow } = useWindowManager();

    const [email, setEmail] = useState(userData?.email || "");
    const [sendingReset, setSendingReset] = useState(false);

    const handleSendReset = async () => {
        if (!email) return toast.error("Enter an email");
        setSendingReset(true);
        try {
            const { data } = await axios.post(
                backendUrl + '/api/auth/send-reset-otp',
                { email }
            );
            if (data.success) {
                toast.success("Reset code sent");
                addWindow({
                    windowName: 'Reset Password',
                    spawnx: 520, spawny: 160,
                    group: 'reset-password',
                    content: <div className="w-[420px]"><ResetPassword /></div>,
                });
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setSendingReset(false); }
    };

    const handleLogout = async () => {
        try { await logout(); toast.success("Logged out"); }
        catch (err) { toast.error(err.message); }
    };

    if (!userData) {
        return (
            <div className="w-full h-full bg-zinc-950 text-white">
                <Card className="w-full max-w-none rounded-none border-0 bg-zinc-950 h-full">
                    <CardHeader className="border-b border-zinc-800 pb-4">
                        <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                            Account
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold">Not signed in</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm text-zinc-400">Sign in to view and manage your account.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN RADIO
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Account Settings</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    {/* Identity block */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Signed in as</p>
                        <p className="text-lg font-semibold text-white">
                            {userData.username || userData.name}
                        </p>
                        <p className="text-sm text-zinc-400 break-all">{userData.email}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {userData.role && (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-300 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5">
                                    <ShieldCheck className="size-3" /> {userData.role}
                                </span>
                            )}
                            <span className={[
                                "inline-flex items-center gap-1 text-[10px] uppercase tracking-widest rounded px-2 py-0.5 border",
                                userData.isAccountVerified
                                    ? "text-green-400 bg-green-500/10 border-green-500/30"
                                    : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
                            ].join(' ')}>
                                {userData.isAccountVerified
                                    ? <><BadgeCheck className="size-3" /> verified</>
                                    : <><XCircle className="size-3" /> unverified</>}
                            </span>
                        </div>
                    </div>

                    {/* Email verify */}
                    {!userData.isAccountVerified && (
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
                            <p className="text-xs uppercase tracking-widest text-yellow-400">Verify your email</p>
                            <p className="text-sm text-zinc-300">
                                Secure your account by verifying your email address.
                            </p>
                            <Button variant="outline" size="sm" onClick={sendVerificationOtp}>
                                <Mail className="size-4" /> Send verification code
                            </Button>
                        </div>
                    )}

                    {/* Reset password */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Reset password</p>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email"
                                className="flex-1"
                            />
                            <Button onClick={handleSendReset} disabled={sendingReset}>
                                <KeyRound className="size-4" />
                                {sendingReset ? "Sending..." : "Send Code"}
                            </Button>
                        </div>
                    </div>

                    {/* Sign out */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Session</p>
                        <Button variant="destructive" size="sm" onClick={handleLogout}>
                            <LogOut className="size-4" /> Sign out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Account;
