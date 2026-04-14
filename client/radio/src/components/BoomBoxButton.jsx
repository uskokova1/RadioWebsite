
import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";

const STREAM_URL = "https://broadcast.shoutcheap.com/proxy/wsinradi/stream";
const POLL_INTERVAL = 30000;

const BlogButton = () => {

    const { backendUrl } = useContext(AppContext);

    const [playing, setPlaying]   = useState(false);
    const [listeners, setListeners] = useState(null);
    const [isLive, setIsLive]     = useState(false);
    const [loading, setLoading]   = useState(false);

    const audioRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stream/status');
            if (data.success) {
                setListeners(data.listeners ?? null);
                setIsLive(true);
            } else {
                setIsLive(false);
            }
        } catch {
            setIsLive(false);
        }
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
            audio.pause();
            audio.src = "";
            setPlaying(false);
            setLoading(false);
        } else {
            setLoading(true);
            audio.src = STREAM_URL;
            audio.play()
                .then(() => {
                    setPlaying(true);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Streaming error duhh", err);
                    setLoading(false);
                    setPlaying(false);
                });
        }
        setPlaying(!playing);
    };

    return (
        <div>
            <img
                src="/BoomBoxTransparent.png"
                alt="BoomBoxTransparant"
                draggable={false}
                onClick={togglePlay}
                className='absolute left-390 top-180 w-120 h-100 cursor-pointer select-none hover:scale-120 transition-all spring-duration-300 spring-bounce-60'
            />
            <audio ref={audioRef} />

            <div className="absolute left-600 top-300 text-white">
                {loading && <p>Loading...</p>}
                {!loading && playing && <p>Playing</p>}
                {!loading && !playing && <p>Paused</p>}
                <p>{isLive ? `listener: ${listeners ?? "?"}` : "Stream Offline"}</p>
            </div>
        </div>
    );
};

export default BlogButton;