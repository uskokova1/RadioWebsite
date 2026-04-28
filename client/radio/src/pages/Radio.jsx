import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { io } from "socket.io-client";
import { Play, Square, Radio as RadioIcon, Users, Volume2, VolumeX, Send } from "lucide-react";
import { format } from "date-fns";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const STREAM_URL = "https://broadcast.shoutcheap.com/proxy/wsinradi/stream";
const POLL_INTERVAL = 30000;

function Radio() {
    const { backendUrl, userData } = useContext(AppContext);

    const [metadata,  setMetadata] = useState(null);

    const [playing, setPlaying]     = useState(false);
    const [listeners, setListeners] = useState(null);
    const [isLive, setIsLive]       = useState(false);
    const [loading, setLoading]     = useState(false);
    const [volume, setVolume]       = useState(0.7);
    const [isMuted, setIsMuted]     = useState(false);

    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput]       = useState('');
    const [socket, setSocket]             = useState(null);
    const chatEndRef = useRef(null);
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

    useEffect(() => {
        const s = io(backendUrl, {
            auth: { token: document.cookie.match(/token=([^;]+)/)?.[1] },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        s.on('connect', () => console.log('Socket connected:', s.id));
        s.on('connect_error', (err) => console.error('Socket connection error:', err.message));
        s.on('chat-history', (messages) => setChatMessages(messages));
        s.on('chat-message', (msg) => setChatMessages(prev => [...prev, msg]));

        setSocket(s);
        return () => { s.disconnect(); };
    }, [backendUrl]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const sendMessage = () => {
        if (!chatInput.trim() || !socket || !userData) return;
        socket.emit('chat-message', chatInput.trim());
        setChatInput('');
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume;
        if (playing) {
            audio.pause(); audio.src = ""; setLoading(false);
        } else {
            setLoading(true);
            audio.src = STREAM_URL;
            audio.volume = isMuted ? 0 : volume;
            audio.play()
                .then(() => setLoading(false))
                .catch(err => { console.error("Stream error:", err); setLoading(false); });
        }
        setPlaying(!playing);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current && !isMuted) {
            audioRef.current.volume = newVolume;
        }
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        if (audioRef.current) {
            audioRef.current.volume = newMuted ? 0 : volume;
        }
    };

    return (
        <div className="w-full h-full bg-zinc-950 text-white flex flex-col">
            <p>{metadata} </p>
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full flex flex-col min-h-0">
                <CardHeader className="border-b border-zinc-800 shrink-0">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN RADIO · 1590 AM
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Live Stream</CardTitle>
                    <p className="text-xs text-zinc-500">Southern Connecticut State University</p>
                </CardHeader>

                <ScrollArea className="flex-1">
                <CardContent className="flex space-y-4">
                    <div className='flex-row'>
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
                                    className="w-[50%] bg-red-500 rounded-t transition-all duration-300"
                                    style={{
                                        animation: playing
                                            ? `barPulse 1s ease-in-out ${(i * 0.06) % 1}s infinite`
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
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={toggleMute}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                {isMuted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                            />
                            <span className="text-xs text-zinc-500 w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                        </div>
                    </div>
                    </div>
                    {/* Live Chat */}
                    <div className="flex-row rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Live Chat</p>
                        <ScrollArea className="h-48 pr-2">
                            {chatMessages.length === 0 && (
                                <p className="text-xs text-zinc-600 italic text-center py-4">No messages yet</p>
                            )}
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className="mb-2 last:mb-0">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xs font-semibold text-red-400 truncate">{msg.username}</span>
                                        <span className="text-[9px] text-zinc-600 shrink-0">
                                            {format(new Date(msg.timestamp), 'h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 break-words">{msg.text}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </ScrollArea>
                        {userData ? (
                            <div className="flex gap-2">
                                <textarea
                                    placeholder="Type a message..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    className="flex-1 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md px-3 py-2 text-sm resize-none focus:ring-1 focus:ring-red-600"
                                />
                                <Button size="icon-xs" onClick={sendMessage} disabled={!chatInput.trim()}>
                                    <Send className="size-3" />
                                </Button>
                            </div>
                        ) : (
                            <p className="text-[10px] text-zinc-500 text-center">Sign in to join the chat</p>
                        )}
                    </div>
                </CardContent>
                </ScrollArea>
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
