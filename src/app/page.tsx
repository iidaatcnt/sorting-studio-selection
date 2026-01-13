'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Github,
  Info,
  Code2,
  Zap,
  Lightbulb
} from 'lucide-react';

// --- Types ---
type SortState = 'compare' | 'swap' | 'find_min' | 'sorted' | 'init' | 'complete';

interface SortingStep {
  array: number[];
  indices: number[]; // 注目している要素
  minIdx?: number;   // 暫定最小値
  type: SortState;
  description: string;
  codeLine?: number;
}

// --- Constants ---
const ARRAY_SIZE = 10;
const INITIAL_SPEED = 600;

const CODE_PYTHON = [
  "def selection_sort(arr):",
  "    n = len(arr)",
  "    for i in range(n):",
  "        min_idx = i",
  "        for j in range(i + 1, n):",
  "            if arr[j] < arr[min_idx]:",
  "                min_idx = j",
  "        arr[i], arr[min_idx] = arr[min_idx], arr[i]"
];

// --- Algorithm Logic ---
const generateSteps = (initialArray: number[]): SortingStep[] => {
  const steps: SortingStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  steps.push({
    array: [...arr],
    indices: [],
    type: 'init',
    description: '選択ソートを開始します。未整列の部分から最小値を探して先頭に持ってくる作業を繰り返します。',
    codeLine: 0
  });

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    steps.push({
      array: [...arr],
      indices: [i],
      minIdx: i,
      type: 'find_min',
      description: `インデックス ${i} の値 ${arr[i]} を、現在の暫定最小値としてセットします。`,
      codeLine: 3
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        indices: [j],
        minIdx: minIdx,
        type: 'compare',
        description: `現在の最小値 ${arr[minIdx]} と、インデックス ${j} の値 ${arr[j]} を比較します。`,
        codeLine: 5
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...arr],
          indices: [j],
          minIdx: minIdx,
          type: 'find_min',
          description: `より小さい値 ${arr[minIdx]} が見つかりました。最小値を更新します。`,
          codeLine: 6
        });
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({
        array: [...arr],
        indices: [i, minIdx],
        type: 'swap',
        description: `見つかった最小値 ${arr[i]} を、未整列の先頭（インデックス ${i}）と入れ替えます。`,
        codeLine: 7
      });
    } else {
      steps.push({
        array: [...arr],
        indices: [i],
        minIdx: i,
        type: 'compare',
        description: `インデックス ${i} がすでに最小値なので、入れ替えは行いません。`,
        codeLine: 7
      });
    }

    steps.push({
      array: [...arr],
      indices: Array.from({ length: i + 1 }, (_, k) => k),
      type: 'sorted',
      description: `左端から ${i + 1} つ分の要素が整列済みとして確定しました。`,
      codeLine: 2
    });
  }

  steps.push({
    array: [...arr],
    indices: Array.from({ length: n }, (_, k) => k),
    type: 'complete',
    description: 'すべての要素が昇順に並び替えられました！',
    codeLine: 0
  });

  return steps;
};


// --- Main App ---
export default function SelectionSortStudio() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 85) + 10);
    const newSteps = generateSteps(newArray);
    setArray(newArray);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)), [steps.length]);
  const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1001 - speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep] || { array: [], indices: [], type: 'init', description: '' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Zap className="text-slate-950 w-5 h-5 fill-current" />
            </div>
            <h1 className="font-black italic tracking-tighter text-xl uppercase">Selection_Sort_Studio</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-[10px] mono uppercase text-slate-500">
              <span>Status:</span>
              <span className={isPlaying ? 'text-emerald-400' : 'text-amber-400'}>
                {isPlaying ? 'Computing' : 'Idle'}
              </span>
            </div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Visualization & Controls */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          <div className="relative aspect-video lg:aspect-square max-h-[500px] bg-slate-900/50 rounded-3xl border border-white/5 p-12 flex items-end justify-center gap-2 overflow-hidden group">
            <div className="absolute top-6 left-6 flex items-center gap-2 mono text-[10px] text-slate-500 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Selection Sort Lab
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {step.array.map((val, idx) => {
                const isSelected = step.indices.includes(idx);
                const isMin = step.minIdx === idx;

                let colorClass = "bg-slate-700/50";

                if (isSelected) {
                  if (step.type === 'compare') colorClass = "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]";
                  if (step.type === 'swap') colorClass = "bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]";
                  if (step.type === 'sorted') colorClass = "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]";
                  if (step.type === 'find_min') colorClass = "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]";
                  if (step.type === 'complete') colorClass = "bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)]";
                }

                if (isMin && step.type !== 'complete') {
                  colorClass = "bg-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)]";
                }

                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    style={{ height: `${val}%` }}
                    className={`flex-1 min-w-[30px] rounded-t-lg relative ${colorClass} transition-colors duration-200`}
                  >
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 mono text-xs font-bold ${isSelected || isMin ? 'text-white' : 'text-slate-600'}`}>
                      {val}
                    </div>
                    {isMin && step.type !== 'complete' && (
                      <div className="absolute inset-x-0 -bottom-6 flex justify-center">
                        <div className="text-[8px] font-bold text-rose-400 uppercase">Min</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]" />
          </div>

          <div className="p-8 bg-slate-900/80 rounded-3xl border border-white/10 flex flex-col gap-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex items-center gap-2">
                <button onClick={stepBackward} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"><StepBack size={20} /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-white text-slate-950 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-rose-500/10">
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={stepForward} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"><StepForward size={20} /></button>
                <button onClick={reset} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors ml-2"><RotateCcw size={20} /></button>
              </div>

              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                  <span>Playback Speed</span>
                  <span className="text-rose-400">{Math.round((speed / 980) * 100)}%</span>
                </div>
                <input type="range" min="20" max="980" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full appearance-none bg-slate-800 h-1.5 rounded-full accent-rose-500 cursor-pointer" />
              </div>
            </div>

            <div className="p-5 bg-slate-950/50 rounded-2xl border border-white/5 flex gap-4">
              <Info size={18} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed italic">{step.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Code & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="text-amber-400 w-5 h-5" />
              <h2 className="font-bold text-[10px] uppercase tracking-widest">About Algorithm</h2>
            </div>
            <div className="p-5 bg-black/40 rounded-2xl border border-white/5 mb-6">
              <h3 className="text-rose-400 font-bold mb-2 text-sm">選択ソート</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                未整列の部分から一番小さい値（最小値）を探し出し、それを整列済みの直後の位置と入れ替える作業を繰り返します。「最小値を選んでいく」シンプルな手法です。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mono text-[10px] uppercase">
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <span className="text-slate-500 block mb-1 tracking-tighter">Complexity</span>
                <span className="text-white">O(N²)</span>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <span className="text-slate-500 block mb-1 tracking-tighter">Stability</span>
                <span className="text-white">Unstable</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-black border border-white/5 rounded-3xl flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-400 w-5 h-5" />
                <h2 className="font-bold text-[10px] uppercase tracking-widest">Python Logic</h2>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <div className="flex-1 bg-zinc-950/50 p-6 rounded-2xl mono text-[11px] leading-loose overflow-auto border border-white/5">
              {CODE_PYTHON.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-6 transition-all duration-300 ${step.codeLine === i ? 'text-rose-400 bg-rose-400/10 -mx-6 px-6 border-l-2 border-rose-400' : 'text-slate-700'}`}
                >
                  <span className="text-slate-800 tabular-nums w-4 select-none">{i + 1}</span>
                  <pre className="whitespace-pre">{line}</pre>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-[10px] mono text-slate-500 uppercase tracking-widest">Informatics I // Selection Sort</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 px-6 text-center">
        <p className="text-[10px] mono text-slate-700 uppercase tracking-[0.4em]">Educational_Sandbox // Algo_Lab</p>
      </footer>
    </div>
  );
}
