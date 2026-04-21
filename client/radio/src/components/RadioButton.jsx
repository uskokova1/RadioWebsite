import React, {useState} from 'react';
import { Radio as RadioIcon } from 'lucide-react';
import { useWindowManager } from '@/context/WindowManager.jsx';
import Radio from '@/pages/Radio.jsx';


const RadioButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { open, setOpen } = useState(false);

    const handleToggle = () => {
        if (open) {
            setOpen(!open);
        } else {
            addWindow({
                windowName: 'WSIN Radio',
                spawnx: 400, spawny: 160,
                content: (
                    <div className="w-[500px] h-[540px]">
                        <Radio />
                    </div>
                ),
            });
        }
    };

    return (
        <button
            onClick={handleToggle}
            title="Radio"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <RadioIcon className="size-6" />
        </button>
    );
};

export default RadioButton;
