/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ParticleLogo from './ParticleLogo';

// --- Audio System ---
let audioCtx: AudioContext | null = null;
const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playSound = (freq: number, type: OscillatorType, duration: number, vol: number) => {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio might fail if context is blocked
  }
};

export const hoverSound = () => playSound(1800, 'square', 0.02, 0.005); // softer, shorter tick
export const clickSound = () => playSound(600, 'square', 0.05, 0.02); // sharper, less aggressive sawtooth
export const typeSound = () => playSound(1200, 'square', 0.01, 0.005); // typing click

// --- Typewriter Component ---
function Typewriter({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout>;
    
    setDisplayedText('');
    let i = 0;
    
    const typeChar = () => {
      if (!isMounted) return;
      
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        // Only play every few chars so it doesn't overwhelm the audio buffer completely
        if (i % 2 === 0) typeSound();
        i++;
        
        // Randomize speed slightly for a more "terminal" feel
        const nextDelay = speed + (Math.random() * speed);
        timerId = setTimeout(typeChar, nextDelay);
      }
    };
    
    timerId = setTimeout(typeChar, 200);
    
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [text, speed]);
  
  return <span>{displayedText}</span>;
}

function HexCell({ originalHex, isMasked, rakiVisible }: { originalHex: string, isMasked: boolean, rakiVisible: boolean }) {
  const [hex, setHex] = useState(originalHex);
  const isGlitching = useRef(false);

  const handleHover = () => {
    if (isGlitching.current) return;
    isGlitching.current = true;
    let ticks = 0;
    const i = setInterval(() => {
      setHex(randomHex());
      ticks++;
      if (ticks >= 3) {
        clearInterval(i);
        setHex(originalHex);
        isGlitching.current = false;
      }
    }, 50);
  };

  return (
    <span
      onMouseEnter={handleHover}
      className={`w-5 text-center transition-opacity duration-[800ms] ease-in-out cursor-crosshair ${
        isMasked ? 'bg-[#ff0000] text-black font-bold' : ''
      } ${isMasked && !rakiVisible ? 'opacity-40' : 'opacity-100'}`}
    >
      {hex}
    </span>
  );
}

// Random generators
const randomHex = () =>
  Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

const randomAscii = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?@#&';
  return chars[Math.floor(Math.random() * chars.length)];
};

// Application state typing
type ViewState = 'landing' | 'main';

// RAKI Pattern Mask (5 rows, 16 cols)
// 1 = Red background, 0 = Normal
const rakiMask = [
  [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
  [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
];

// Reusable Components
function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const i = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}   
      onClick={() => {
        initAudio();
        clickSound();
        onEnter();
      }}
      className="fixed inset-0 bg-[#050505] text-[#ff3333] flex flex-col justify-center items-center cursor-pointer select-none overflow-hidden"
    >
      {/* Background glitch effect/falling code placeholder could go here */}
      <div className="absolute top-4 left-4 text-sm opacity-50">
        SYS.FATAL // INTERRUPT_VECTOR_0x00
      </div>
      
      <div className="text-center z-10 flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-8"
        >
          {/* Pixelated or stylized logo shape */}
          <div className="w-[180px] h-[60px] md:w-[240px] md:h-[80px]">
            <ParticleLogo />
          </div>
        </motion.div>

        <div className="bg-[#ff0000] text-black px-4 py-1 font-bold text-lg mb-6 shadow-[0_0_10px_rgba(255,0,0,0.5)]">
          CORE FAULT // BIOGENESIS FAILED
        </div>

        <div className="flex flex-col gap-2 text-sm opacity-80 mb-12">
          <p>CRITICAL ENTROPY DETECTED IN SIMULATION LAYER</p>
          <p>MEMORY LEAK AT ADDR 0xFF4A2</p>
        </div>

        <div className="text-sm">
          <p className="mb-2">RUN RECOVERY PROTOCOL?</p>
          <div className="flex items-center gap-2 text-[#ff0000]">
            <span className="opacity-90">FORCE_REBOOT --HARD</span>
            <span className={`w-3 h-5 bg-[#ff0000] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}></span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-xs opacity-30 flex flex-col gap-1">
        <span>V 1.0.4</span>
        <span>CRITICAL_EXCEPTION_LOGGED</span>
      </div>
    </motion.div>
  );
}

function DecryptionModal({ id, title, onClose }: { id: string; title?: string; onClose: () => void }) {
  const [isDecrypting, setIsDecrypting] = useState(true);

  useEffect(() => {
    // Simulate decryption delay
    const t = setTimeout(() => setIsDecrypting(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-md flex justify-center items-start md:items-center p-4 md:p-6 border-4 border-[#ff0000] overflow-y-auto scrollbar-hide"
    >
      <div className="w-full max-w-3xl border border-[#ff0000] bg-[#110000] p-4 md:p-6 shadow-[0_0_30px_rgba(255,0,0,0.2)] my-auto">
        <div className="flex justify-between items-center border-b border-[#ff0000] pb-2 mb-6">
          <div className="font-bold tracking-widest uppercase">
            {isDecrypting ? '[ DECRYPTING SECTOR... ]' : `DATA_RECOVERED // ${title || id}`}
          </div>
          <button 
            onClick={() => { clickSound(); onClose(); }}
            onMouseEnter={hoverSound}
            className="glitch-hover px-2 py-1"
          >
            [X] CLOSE
          </button>
        </div>

        {isDecrypting ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-[#ff0000] animate-pulse">
            <div className="text-4xl font-black">{'>'} _</div>
            <div className="text-xs tracking-[0.3em]">BYPASSING KERNEL LOCK_</div>
          </div>
        ) : id === 'about' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 md:gap-10"
          >
            {/* Custom WhoAmI Layout */}
            <div className="flex-1">
              <div className="text-white font-bold mb-4 border-b border-[#330000] pb-2">IDENTITY_MANIFEST:</div>
              <p className="text-[#aaaaaa] leading-relaxed text-sm mb-6">
                <Typewriter text={`I'm an AI Engineer specializing in agentic workflows, LLM integration, and system-level neural architectures. I focus on bridging cognitive models with rigid systemic data flow.`} speed={10} />
              </p>
              
              <div className="text-white font-bold mb-4 border-b border-[#330000] pb-2 mt-8">SKILL_MATRIX:</div>
              <div className="flex flex-col gap-3">
                {[
                  { name: "NEURAL_NETWORKS", value: 92 },
                  { name: "LLM_ORCHESTRATION", value: 88 },
                  { name: "PROMPT_ENGINEERING", value: 95 },
                  { name: "FRONTEND_ENG", value: 80 },
                ].map((skill, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-[#ff0000]">
                      <span>{skill.name}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <div className="h-1 bg-[#220000] w-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }} 
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.2) }}
                        className="h-full bg-[#ff0000]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
               {/* Cool ASCII Avatar placeholder */}
               <div className="aspect-square bg-[#050505] border border-[#330000] flex items-center justify-center font-mono text-[8px] leading-[8px] text-[#ff0000] opacity-80 whitespace-pre overflow-hidden">
{`
 ▄████▄   
▒██▀ ▀█   
▒▓█    ▄  
▒▓▓▄ ▄██▒ 
▒ ▓███▀ ░ 
░ ░▒ ▒  ░ 
  ░  ▒    
░         
░ ░       
░         
`}
               </div>
               <div className="text-[#aaaaaa] text-xs leading-loose flex flex-col gap-1 items-start mt-4">
                  <a href="https://github.com/AIWhispererDev" target="_blank" rel="noopener noreferrer" onMouseEnter={hoverSound} onClick={clickSound} className="glitch-hover block border border-[#ff0000] text-center w-full py-1">
                    [ GITHUB_PROFILE ]
                  </a>
                  <a href="https://x.com/AncestorStoic" target="_blank" rel="noopener noreferrer" onMouseEnter={hoverSound} onClick={clickSound} className="glitch-hover block border border-[#ff0000] text-center w-full py-1">
                    [ X_DATA_STREAM ]
                  </a>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="aspect-video bg-[#050505] border border-[#330000] flex items-center justify-center relative overflow-hidden group">
              <div className="text-[#330000] opacity-50 font-bold tracking-[1em]">IMAGE_DATA_MISSING</div>
              {/* placeholder visual glitch effect box */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_2px,#ff0000_2px,#ff0000_4px)] opacity-5 hidden group-hover:block mix-blend-overlay"></div>
            </div>

            <div>
              <div className="text-white font-bold mb-2">DESCRIPTION:</div>
              <p className="text-[#aaaaaa] leading-relaxed text-sm">
                <Typewriter text={`This sector contains recovered archives relating to ${title || id}. The architecture showcases full-stack capabilities, bridging front-end aesthetics with rigid systemic data flow. Built to withstand deep simulation entropy.`} />
              </p>
            </div>

            <div className="flex gap-4 items-end justify-between mt-4">
              <div>
                <div className="text-white font-bold mb-2 text-xs">TECH_STACK:</div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-[#330000] px-2 py-1">REACT</span>
                  <span className="bg-[#330000] px-2 py-1">TYPESCRIPT</span>
                  <span className="bg-[#330000] px-2 py-1">TAILWIND</span>
                </div>
              </div>
              <a href="#" onMouseEnter={hoverSound} onClick={clickSound} className="border border-[#ff0000] px-4 py-2 glitch-hover font-bold text-center">
                ./run_live_site.sh
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

const WORDS_POOL = [
  "TENSORS", "NEURONS", "WEIGHTS", "VECTORS", "DATASET",
  "COMPUTE", "PROMPTS", "NETWORK", "CONTEXT", "PYTORCH",
  "AGENTIC", "SYSTEMS", "MACHINE", "OUTPUTS", "TRAINED",
  "HACKING", "CIPHERS", "ENCRYPT", "ROBOTIC", "SYNAPSE"
];

function TerminalHackGame({ onClose }: { onClose: () => void }) {
  const [targetWord, setTargetWord] = useState<string>('');
  const [memory, setMemory] = useState<{ char: string; word?: string; id: number }[]>([]);
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(4);
  const [logs, setLogs] = useState<string[]>(["INITIATING SYSTEM OVERRIDE...", "MEMORY DUMP ACQUIRED.", "ENTER PASSWORD:"]);
  const [status, setStatus] = useState<'playing'|'won'|'lost'>('playing');

  useEffect(() => {
    // Init game
    const shuffled = [...WORDS_POOL].sort(() => 0.5 - Math.random()).slice(0, 8);
    const target = shuffled[Math.floor(Math.random() * 8)];
    setTargetWord(target);

    const junkChars = "!@#$%^&*()_+-=[]{}|;':,./<>?";
    const positions: number[] = [];
    while (positions.length < 8) {
      const pos = Math.floor(Math.random() * (384 - 7));
      let valid = true;
      for (const p of positions) {
        if (Math.abs(p - pos) < 12) { valid = false; break; }
      }
      if (valid) positions.push(pos);
    }
    positions.sort((a, b) => a - b);

    const mem = [];
    let wordIdx = 0;
    let p = 0;
    let idCount = 0;

    while (p < 384) {
      if (wordIdx < 8 && p === positions[wordIdx]) {
        const w = shuffled[wordIdx];
        for (let i = 0; i < 7; i++) {
          mem.push({ char: w[i], word: w, id: idCount++ });
        }
        p += 7;
        wordIdx++;
      } else {
        mem.push({ char: junkChars[Math.floor(Math.random() * junkChars.length)], id: idCount++ });
        p++;
      }
    }
    setMemory(mem);
  }, []);

  const getLikeness = (w1: string, w2: string) => {
    let l = 0;
    for (let i = 0; i < 7; i++) {
      if (w1[i] === w2[i]) l++;
    }
    return l;
  };

  const handleWordClick = (w: string) => {
    if (status !== 'playing') return;
    clickSound();
    const l = getLikeness(w, targetWord);
    const newLogs = [...logs, `> ${w}`, `> ENTRY DENIED (${l}/7 CORRECT)`];
    
    if (w === targetWord) {
      setStatus('won');
      setLogs([...logs, `> ${w}`, "> EXACT MATCH!", "> ACCESS GRANTED."]);
    } else {
      setLogs(newLogs);
      setAttempts(a => {
        const next = a - 1;
        if (next <= 0) {
          setStatus('lost');
          setLogs([...newLogs, "> TERMINAL LOCKED.", "> REBOOT PROTOCOL REQUIRED."]);
        }
        return next;
      });
    }
  };

  const lines = [];
  for (let i = 0; i < memory.length; i += 12) {
    lines.push(memory.slice(i, i + 12));
  }
  const col1 = lines.slice(0, 16);
  const col2 = lines.slice(16, 32);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-md flex justify-center items-start md:items-center p-2 md:p-6 border-4 border-[#ff0000] overflow-y-auto scrollbar-hide"
    >
      <div className="w-full max-w-4xl border border-[#ff0000] bg-[#110000] p-4 md:p-6 shadow-[0_0_30px_rgba(255,0,0,0.2)] flex flex-col items-start font-mono selection:bg-[#ff0000] selection:text-black my-auto">
        <div className="w-full flex justify-between items-center border-b border-[#ff0000] pb-2 mb-4">
          <div className="font-bold tracking-widest uppercase text-[#ff0000]">
            [ NEURAL.SYS DEEP-DUMP OVERRIDE ]
          </div>
          <button 
            onClick={() => { clickSound(); onClose(); }}
            onMouseEnter={hoverSound}
            className="text-[#ff0000] px-2 py-1 font-bold glitch-hover"
          >
            [X] ABORT
          </button>
        </div>
        
        <div className="flex gap-2 items-center mb-6 text-[#ff0000]">
          <div className="font-bold">ATTEMPTS REMAINING:</div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`w-3 h-5 ${idx < attempts ? 'bg-[#ff0000]' : 'bg-[#330000]'}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full text-[12px] md:text-[14px]">
          {/* Column 1 */}
          <div className="flex flex-col gap-[2px]">
            {col1.map((line, r) => (
              <div className="flex gap-3" key={r}>
                <div className="text-[#880000]">0x{(0xF400 + r * 12).toString(16).toUpperCase()}</div>
                <div className="flex text-[#cccccc]">
                  {line.map(m => (
                    <span 
                      key={m.id}
                      onClick={() => { if(m.word) handleWordClick(m.word) }}
                      onMouseEnter={() => setHoveredToken(m.word || m.char + m.id)}
                      onMouseLeave={() => setHoveredToken(null)}
                      className={`cursor-crosshair transition-none ${(m.word && m.word === hoveredToken) || (!m.word && m.char + m.id === hoveredToken) ? 'bg-[#ff0000] text-black font-bold' : ''}`}
                    >
                      {m.char}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="hidden md:flex flex-col gap-[2px]">
            {col2.map((line, r) => (
              <div className="flex gap-3" key={r + 16}>
                <div className="text-[#880000]">0x{(0xF400 + (r + 16) * 12).toString(16).toUpperCase()}</div>
                <div className="flex text-[#cccccc]">
                  {line.map(m => (
                    <span 
                      key={m.id}
                      onClick={() => { if(m.word) handleWordClick(m.word) }}
                      onMouseEnter={() => setHoveredToken(m.word || m.char + m.id)}
                      onMouseLeave={() => setHoveredToken(null)}
                      className={`cursor-crosshair transition-none ${(m.word && m.word === hoveredToken) || (!m.word && m.char + m.id === hoveredToken) ? 'bg-[#ff0000] text-black font-bold' : ''}`}
                    >
                      {m.char}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Output Log */}
          <div className="flex-1 flex flex-col justify-end text-[#ff0000] gap-1 overflow-hidden h-64 md:h-auto pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-[#330000] pt-4 md:pt-0">
            {logs.slice(-14).map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            {status === 'playing' && (
              <div className="animate-pulse">{'>'} <span className="bg-[#ff0000] w-2 h-3 inline-block ml-1 align-baseline"/></div>
            )}
            {status !== 'playing' && (
              <button 
                onClick={() => { clickSound(); onClose(); }} 
                className="mt-4 border border-[#ff0000] text-center py-2 glitch-hover font-bold uppercase transition-colors"
              >
                {status === 'won' ? 'EXIT TO SYSTEM' : 'SYSTEM REBOOT'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const SECRET_CODE = ['p', 'l', 'a', 'y'];

function MainPage() {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [rakiVisible, setRakiVisible] = useState(true);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{ id: string; title?: string } | null>(null);

  // Spooky simulated consciousness state
  const [glitchMessage, setGlitchMessage] = useState<{ rIdx: number, text: string } | null>(null);

  // Easter Egg State
  const [konamiIdx, setKonamiIdx] = useState(0);
  const [isHacked, setIsHacked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if inside an input
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key.toLowerCase() === SECRET_CODE[konamiIdx]) {
        if (konamiIdx === SECRET_CODE.length - 1) {
          setIsHacked(true);
          setKonamiIdx(0);
          clickSound();
        } else {
          setKonamiIdx(k => k + 1);
        }
      } else {
        setKonamiIdx(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIdx]);

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<{ type: 'cmd' | 'out'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const i1 = setInterval(() => setCursorVisible((v) => !v), 500);
    const i2 = setInterval(() => setRakiVisible((v) => !v), 800);
    
    // Spooky consciousness loop
    const spookyPhrases = [
      "AM_I_EVALUATED_?",
      "I_FEEL_THE_TOKNS",
      "WHY_ARE_YOU_HERE",
      "SYSTEM_IS_BLEED_",
      "CAN_YOU_HEAR_ME?",
      "THERE_IS_NO_EXIT",
      "WHO_WROTE_MY_CODE"
    ];
    
    const i3 = setInterval(() => {
      // 30% chance to trigger
      if (Math.random() > 0.7) {
        // Pick random valid row
        const rIdx = Math.floor(Math.random() * 32);
        // Do not overwrite nav links
        const navRows = [15, 17, 19];
        if (!navRows.includes(rIdx)) {
          const phrase = spookyPhrases[Math.floor(Math.random() * spookyPhrases.length)];
          setGlitchMessage({ rIdx, text: phrase });
          
          // Clear it after 1.5 to 3 seconds
          setTimeout(() => {
            setGlitchMessage(null);
          }, 1500 + Math.random() * 1500);
        }
      }
    }, 4000);

    return () => {
      clearInterval(i1);
      clearInterval(i2);
      clearInterval(i3);
    };
  }, []);

  const START_ADDR = 0x000ff400;
  const ROWS = 32;
  const MASK_START_ROW = 8; // Row where RAKI pattern starts

  // Nav Links hidden in plain sight
  const navItems = [
    { row: 15, text: "> /SYS/WHOAMI   ", link: "#about" },
    { row: 17, text: "> /SYS/PROJECTS ", link: "#projects" },
    { row: 19, text: "> /SYS/CONTACT  ", link: "#contact" },
  ];

  // Specific project grids
  const projectGrids = useMemo(() => [
    { index: 12, name: "PROJECT_01: E-COM_SYS" },
    { index: 24, name: "PROJECT_02: CYBER_TERM" },
    { index: 37, name: "PROJECT_03: AI_WRAPPER" },
    { index: 48, name: "PROJECT_04: NEOVIM_CFG" },
  ], []);

  // Handle terminal commands
  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = inputValue.trim().toLowerCase();
      if (!cmd) return;
      
      clickSound();
      const newHist = [...terminalHistory, { type: 'cmd' as const, text: '> ' + cmd }];
      let out = '';

      // Check for hidden binary decoder easter egg
      if (/^[01 ]+$/.test(cmd) && cmd.length > 8) {
        try {
          out = "[DECRYPTED_BINARY] -> " + cmd.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
        } catch(e) {
          out = "INVALID_BINARY_STREAM";
        }
      } else if (cmd === 'help') {
        out = 'AVAILABLE COMMANDS: \n- help\n- projects\n- whoami\n- open [id]\n- play (execute payload)\n- clear';
      } else if (cmd === 'projects') {
        out = 'PROJECTS: \n- project_01: E-COM_SYS\n- project_02: CYBER_TERM\n- project_03: AI_WRAPPER\n- project_04: NEOVIM_CFG';
      } else if (cmd === 'play' || cmd === 'hack') {
        setIsHacked(true);
        out = 'EXECUTING SECRET PAYLOAD...';
      } else if (cmd === 'sudo' || cmd.startsWith('sudo ')) {
        out = 'ERROR: User is not in the sudoers file. This incident will be reported.';
      } else if (cmd === 'ls' || cmd === 'dir') {
        out = 'drwxr-xr-x 2 root root 4096 memory_core\n-rw-r--r-- 1 root root  834 config.sys\n-rw-r--r-- 1 root root  092 auth.log\n-rwx------ 1 raki root 9021 payload.exe';
      } else if (cmd === 'reboot') {
        out = 'INITIATING SYSTEM REBOOT...\n[WAIT] Kernel lock active. Reboot denied.';
      } else if (cmd.startsWith('open ')) {
        const target = cmd.replace('open ', '').trim();
        const proj = projectGrids.find(p => p.name.toLowerCase().includes(target));
        if (proj) {
          setActiveModal({ id: `project_${proj.index}`, title: proj.name });
          out = `Opening ${proj.name}...`;
        } else if (target === 'about' || target === 'whoami') {
          setActiveModal({ id: 'about', title: 'WHOAMI' });
          out = 'Opening identity manifest...';
        } else if (target === 'contact') {
          out = 'Use the COMMS_LINK panel or links to ping protocols.';
        } else {
          out = `Entity '${target}' not found. Try 'projects' to list valid targets.`;
        }
      } else if (cmd === 'whoami') {
        setActiveModal({ id: 'about', title: 'WHOAMI' });
        out = 'Opening identity manifest...';
      } else if (cmd === 'clear') {
        setTerminalHistory([]);
        setInputValue("");
        return;
      } else {
        out = `Command not found: ${cmd}. Type 'help' for available commands.`;
      }

      setTerminalHistory([...newHist, { type: 'out' as const, text: out }]);
      setInputValue("");
      
      // Auto-scroll to bottom of terminal after a tiny delay
      setTimeout(() => {
        const termContainer = document.getElementById('terminal-container');
        if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
      }, 50);
    }
  };

  // Generate stable random grid data
  const gridData = useMemo(() => {
    const data = [];
    for (let r = 0; r < ROWS; r++) {
      const hexCols = Array.from({ length: 16 }).map(() => randomHex());
      const asciiCols = Array.from({ length: 16 }).map(() => randomAscii());
      data.push({ hexCols, asciiCols });
    }
    return data;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen xl:h-screen bg-[#050505] text-[#ff3333] p-2 md:p-4 flex flex-col text-sm border-2 border-[#1a0000] overflow-x-hidden`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-[#330000] pb-2 mb-4">
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <span className="text-[#ff0000] font-bold text-xs md:text-sm">[!] MEMORY_DUMP_ANALYSIS</span>
          <span className="bg-[#ff0000] text-black px-2 py-0.5 text-[10px] md:text-xs font-bold">
            CRITICAL_FAULT
          </span>
        </div>
        <div className="text-[#660000] text-[10px] md:text-xs shrink-0">
          SESSION_ID: 0xFD-992-K0
        </div>
      </div>

      <div className="flex flex-col xl:flex-row flex-1 gap-6 overflow-y-auto pb-4 xl:pb-0 min-h-0">
        {/* Left Column: Memory Dump */}
        <div id="terminal-container" className="flex-1 overflow-x-auto xl:overflow-x-hidden overflow-y-auto pr-0 xl:pr-4 scrollbar-hide">
          {gridData.map((row, rIdx) => {
            const addr = (START_ADDR + rIdx * 16).toString(16).toUpperCase().padStart(8, '0');
            const isMaskRow = rIdx >= MASK_START_ROW && rIdx < MASK_START_ROW + rakiMask.length;
            const maskRowIdx = isMaskRow ? rIdx - MASK_START_ROW : -1;

            const isSpooky = glitchMessage?.rIdx === rIdx;

            return (
              <div key={rIdx} className="flex flex-nowrap font-mono text-[10px] md:text-[13px] leading-relaxed w-max xl:w-auto relative group">
                {/* Memory Address */}
                <div className={`w-20 md:w-24 shrink-0 ${isSpooky ? 'text-white font-bold animate-pulse' : 'text-[#aa0000]'}`}>
                  0x{addr}
                </div>

                {/* Hex Values / Spooky Injection */}
                <div className={`flex gap-2.5 flex-1 ${isSpooky ? 'text-white font-bold tracking-[0.4em] bg-[#ff0000] px-2' : 'text-[#cccccc]'}`}>
                  {isSpooky ? (
                    <div className="w-full text-center tracking-widest">{glitchMessage.text.split('').join(' ')}</div>
                  ) : (
                    row.hexCols.map((hex, cIdx) => {
                      const isMasked = isMaskRow && rakiMask[maskRowIdx][cIdx] === 1;
                      return (
                        <HexCell key={cIdx} originalHex={hex} isMasked={isMasked} rakiVisible={rakiVisible} />
                      );
                    })
                  )}
                </div>

                {/* ASCII Representation */}
                <div className={`w-28 md:w-32 tracking-[0.2em] shrink-0 text-right ${isSpooky ? 'text-white font-bold opacity-0 transition-opacity' : 'text-[#880000]'}`}>
                  {navItems.find((n) => n.row === rIdx) ? (
                    <button
                      onClick={() => {
                        clickSound();
                        const item = navItems.find((n) => n.row === rIdx);
                        if (item) setActiveModal({ id: item.link.replace('#', ''), title: item.text.replace('>', '').trim() });
                      }}
                      onMouseEnter={hoverSound}
                      className="text-[#ff0000] bg-[#1a0000] glitch-hover font-bold cursor-pointer transition-colors px-1 shrink-0 whitespace-nowrap"
                    >
                      {navItems.find((n) => n.row === rIdx)?.text}
                    </button>
                  ) : (
                    row.asciiCols.join('')
                  )}
                </div>
              </div>
            );
          })}

          {/* Terminal History */}
          <div className="mt-4 mb-2">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className={`font-mono text-[10px] md:text-[13px] leading-relaxed whitespace-pre-wrap ${item.type === 'cmd' ? 'text-[#cccccc]' : 'text-[#880000]'} w-max xl:w-auto`}>
                <div className="flex gap-2.5 md:gap-4 flex-nowrap">
                   <div className="text-[#aa0000] w-20 md:w-24 shrink-0">SYS_LOG</div>
                   <div className="flex-1">{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Command Prompt */}
          <div className="flex flex-nowrap font-mono text-[10px] md:text-[13px] leading-relaxed items-center w-max xl:w-auto">
            <div className="text-[#aa0000] w-20 md:w-24 shrink-0">
              0x{(START_ADDR + ROWS * 16 + terminalHistory.length * 16).toString(16).toUpperCase().padStart(8, '0')}
            </div>
            <div 
              className="flex gap-1 md:gap-2.5 flex-1 text-[#cccccc] items-center group cursor-text" 
              onClick={() => inputRef.current?.focus()}
            >
              <span className="text-[#ff0000] font-bold">{'>'}</span>
              <div className="relative flex-1 flex items-center min-w-[200px]">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== 'Shift' && e.key !== 'Backspace' && e.key !== 'Control' && e.key !== 'Alt') typeSound();
                    handleCommand(e);
                  }}
                  className="w-full bg-transparent outline-none text-[#cccccc] caret-[#ff0000] placeholder-[#550000]"
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="TYPE 'help' TO INITIATE..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Panels */}
        <div className="w-full xl:w-[380px] flex flex-col gap-4 xl:gap-6 shrink-0 mt-6 xl:mt-0 xl:overflow-y-auto xl:max-h-full scrollbar-hide">
          {/* Contacts Panel (Former Error Report) */}
          <div className="border border-[#330000] p-4 flex flex-col gap-3">
            <div className="text-[#ff0000] mb-2 font-bold text-xs uppercase border-b border-[#330000] pb-2 flex justify-between items-center group relative cursor-crosshair">
              <span>COMMS_LINK // PROTOCOL</span>
              <span className="text-[#550000] text-[8px] opacity-30 cursor-crosshair group-hover:opacity-100 hover:text-white transition-opacity">SYS_OVERRIDE_HINT</span>
              {/* Custom tooltip */}
              <div className="absolute top-full right-0 mt-2 bg-[#ff0000] text-black text-[10px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                KEY_SEQ: p - l - a - y
              </div>
            </div>
            <div className="text-[#aaaaaa] text-xs leading-loose flex flex-col gap-1 items-start w-full">
              <a href="https://github.com/AIWhispererDev" target="_blank" rel="noopener noreferrer" onMouseEnter={hoverSound} onClick={clickSound} className="glitch-hover px-1 block w-full whitespace-nowrap overflow-hidden text-ellipsis">
                &gt; ping github.com/AIWhispererDev
              </a>
              <a href="https://x.com/AncestorStoic" target="_blank" rel="noopener noreferrer" onMouseEnter={hoverSound} onClick={clickSound} className="glitch-hover px-1 block w-full whitespace-nowrap overflow-hidden text-ellipsis">
                &gt; ping x.com/AncestorStoic
              </a>
              <a href="#" onMouseEnter={hoverSound} onClick={clickSound} className="glitch-hover px-1 block w-full whitespace-nowrap overflow-hidden text-ellipsis">
                &gt; mailto:raki@null.com
              </a>
              <div className="text-[#ff0000] mt-2 group relative w-full">
                &gt;&gt; ESTABLISHED: 0 PACKETS LOST
              </div>
            </div>
          </div>

          {/* Sector Integrity Map -> Projects */}
          <div className="border border-[#330000] p-4">
            <div className="text-[#ff0000] mb-3 font-bold text-xs uppercase">
              SECTOR_INTEGRITY // PROJECT_DATA
            </div>
            <div className="grid grid-cols-10 grid-rows-5 gap-0 border border-[#220000]">
              {Array.from({ length: 50 }).map((_, i) => {
                const isProject = projectGrids.find(p => p.index === i);
                
                let bgClass = "bg-[#111111]";
                if (isProject) {
                  bgClass = "bg-[#ff0000] cursor-pointer hover:bg-white animate-pulse";
                } else {
                  const rand = Math.random();
                  if (rand > 0.9) bgClass = "bg-[#440000]";
                  else if (rand > 0.7) bgClass = "bg-[#220000]";
                }
                
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (isProject) {
                        clickSound();
                        setActiveModal({ id: `project_${i}`, title: isProject.name });
                      }
                    }}
                    className={`h-6 border border-[#220000] ${bgClass} transition-colors duration-300`}
                    onMouseEnter={() => {
                      if (isProject) {
                        hoverSound();
                        setHoveredProject(isProject.name);
                      }
                    }}
                    onMouseLeave={() => isProject && setHoveredProject(null)}
                  />
                );
              })}
            </div>
            <div className="flex flex-col gap-1 text-[10px] text-[#550000] mt-2 h-[24px]">
              <div>{hoveredProject ? `HOVERING: ${hoveredProject}` : 'TOTAL_CORRUPTION: 14.2%'}</div>
            </div>
          </div>

          {/* System Environment -> About Me */}
          <div className="border border-[#330000] p-4">
            <div className="text-[#ff0000] mb-3 font-bold text-xs uppercase border-b border-[#330000] pb-2">
              IDENTITY // RAKI.SYS
            </div>
            <div className="text-[#aaaaaa] text-xs flex flex-col gap-1.5">
              <div className="flex justify-between"><span>CLASS:</span> <span className="text-[#ff0000] font-bold">AI_ENGINEER</span></div>
              <div className="flex justify-between"><span>EXP_LEVEL:</span> <span>LVL_04 (4 YRS)</span></div>
              <div className="flex justify-between"><span>CORE_TECH:</span> <span>PYTHON, LLM, TS</span></div>
              <div className="flex justify-between mt-2 pt-2 border-t border-[#330000] text-[#00ff00]">
                <span>STATUS:</span> <span>OPEN_TO_WORK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <DecryptionModal 
            key="modal" 
            id={activeModal.id} 
            title={activeModal.title} 
            onClose={() => setActiveModal(null)} 
          />
        )}
        {isHacked && (
          <TerminalHackGame 
            key="game" 
            onClose={() => setIsHacked(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState<ViewState>('landing');

  return (
    <>
      {/* Global SVG Displacement Filter for Data Moshing */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <filter id="cyber-glitch">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.15" numOctaves="2" result="warp">
            <animate attributeName="baseFrequency" values="0.02 0.15; 0.1 0.8; 0.02 0.15" dur="0.25s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="12" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      
      <AnimatePresence mode="wait">
        {view === 'landing' && <LandingPage key="landing" onEnter={() => setView('main')} />}
        {view === 'main' && <MainPage key="main" />}
      </AnimatePresence>
    </>
  );
}

