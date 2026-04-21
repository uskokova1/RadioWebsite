import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { Play, Square, Radio as RadioIcon, Users } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STREAM_URL = "https://broadcast.shoutcheap.com/proxy/wsinradi/stream";
const POLL_INTERVAL = 30000;

function Radio() {
    const { backendUrl } = useContext(AppContext);

    const [playing, setPlaying]     = useState(false);
    const [listeners, setListeners] = useState(null);
    const [isLive, setIsLive]       = useState(false);
    const [loading, setLoading]     = useState(false);

    const audioRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stream/status');
            if (data.success) {
                setListeners(data.listeners ?? null);
                setIsLive(true);
            } else setIsLive(false);
        } catch { setIsLive(false); }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause(); audio.src = ""; setLoading(false);
        } else {
            setLoading(true);
            audio.src = STREAM_URL;
            audio.play()
                .then(() => setLoading(false))
                .catch(err => { console.error("Stream error:", err); setLoading(false); });
        }
        setPlaying(!playing);
    };

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN RADIO · 1590 AM
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Live Stream</CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">Southern Connecticut State University</p>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    {/* Status Row */}
                    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className={[
                                "inline-block size-2.5 rounded-full",
                                isLive ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" : "bg-zinc-600"
                            ].join(' ')} />
                            <span className={[
                                "text-xs uppercase tracking-[0.3em] font-semibold",
                                isLive ? "text-red-500" : "text-zinc-500"
                            ].join(' ')}>
                                {isLive ? "On Air" : "Off Air"}
                            </span>
                        </div>
                        {listeners !== null && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                <Users className="size-3.5" />
                                <span>{listeners} listener{listeners !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Visualizer */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                        <div className="flex items-end justify-center gap-1 h-14">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 bg-red-500 rounded-t transition-all duration-300"
                                    style={{
                                        animation: playing
                                            ? `barPulse 0.9s ease-in-out ${(i * 0.06) % 1}s infinite`
                                            : 'none',
                                        height: playing ? undefined : '4px',
                                        opacity: playing ? 1 : 0.25,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Player Control */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                        <audio ref={audioRef} preload="none" />
                        <Button
                            size="lg"
                            onClick={togglePlay}
                            disabled={loading}
                            variant={playing ? "outline" : "default"}
                            className={playing ? "w-full" : "w-full bg-red-500 hover:bg-red-600 text-white"}
                        >
                            {playing ? <Square className="size-4" /> : <Play className="size-4" />}
                            <span className="font-semibold tracking-wider">
                                {loading ? "CONNECTING..." : playing ? "STOP" : "PLAY LIVE"}
                            </span>
                        </Button>
                        <p className="text-xs text-zinc-500 text-center">
                            {playing ? "Streaming live · 96kbps AAC" : "Tap to connect to the live stream"}
                        </p>
                    </div>

                    {/* Station Info */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Station Info</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ['Frequency', '1590 AM'],
                                ['Format', 'College Radio'],
                                ['Bitrate', '96 kbps'],
                                ['Location', 'New Haven, CT'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex flex-col gap-0.5">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</span>
                                    <span className="text-sm text-zinc-200 font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <style>{`
                @keyframes barPulse {
                    0%, 100% { height: 6px; }
                    50% { height: 40px; }
                }
            `}</style>
        </div>
    );
}

export default Radio;
