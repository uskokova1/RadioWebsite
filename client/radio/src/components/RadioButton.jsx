import React, {useEffect, useRef, useState} from 'react';
import { Radio as RadioIcon } from 'lucide-react';
import { useWindowManager } from '@/context/WindowManager.jsx';
import Radio from '@/pages/Radio.jsx';


const RadioButton = ({headless=false, toggle}) => {
    const { addWindow, closeGroup } = useWindowManager();
    const [open, setOpen] = useState(false);
    const firstRun = useRef(true);

    const handleToggle = () => {
        if (!open) {
            setOpen(true);
            addWindow({
                windowName: 'WSIN Radio',
                spawnx: window.innerWidth/2 - 200, spawny: window.innerHeight/2 - 200,
                onClose: () => {
                    setOpen(false);
                },
                content: (
                    <div className="w-[500px] h-[540px]">
                        <Radio />
                    </div>
                ),
            });
        } else {
            setOpen(false);
        }
    };

    useEffect(() => {
        if (firstRun.current) { firstRun.current = false; return; }
        handleToggle();
    }, [toggle]);

    return (
        <>
        {!headless && (
        <button
            onClick={handleToggle}
            title="Radio"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <RadioIcon className="size-6" />
        </button>
            )}
        </>

    );
};

export default RadioButton;
