import { useState, useMemo } from 'react';
import { useCredit } from '../context/CreditContext';
import {
    Wallet,
    TrendingUp,
    History,
    User as UserIcon,
    ArrowUpCircle,
    ArrowDownCircle,
    ShieldCheck,
    CreditCard,
    FileSearch,
    Zap,
    CheckCircle2,
    Clock,
    ScanLine,
    Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SystemConsole from './SystemConsole';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Sparkline = ({ data }: { data: number[] }) => {
    const points = useMemo(() => {
        if (data.length < 2) return "";
        const max = Math.max(...data, 100);
        const min = Math.min(...data, 0);
        const range = max - min;
        const width = 100;
        const height = 30;

        return data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(" ");
    }, [data]);

    return (
        <svg viewBox="0 0 100 30" className="w-24 h-8 text-secondary opacity-50">
            <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

const Dashboard = () => {
    const {
        user, balance, transactions, creditScore,
        addTransaction, startKYC, advanceCollections, collectionsPhase
    } = useCredit();
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleTransaction = (type: 'CREDIT' | 'DEBIT') => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            setError('Enter a valid positive amount');
            return;
        }
        const success = addTransaction(type, val, description || (type === 'CREDIT' ? 'Manual Deposit' : 'Manual Withdrawal'));
        if (!success) {
            setError('Insufficient balance');
        } else {
            setAmount('');
            setDescription('');
            setError('');
        }
    };

    const isKYCComplete = user.kycStatus === 'VERIFIED';

    return (
        <div className="w-full max-w-6xl flex flex-col gap-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary rounded-2xl neon-glow-primary">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">CredServ <span className="text-white/40 font-light">Ecosystem</span></h1>
                        <p className="text-white/60 text-sm">Autonomous Financial Orchestration</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "px-4 py-2 rounded-xl transition-all",
                            activeTab === 'overview' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "px-4 py-2 rounded-xl transition-all",
                            activeTab === 'history' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        Transactions
                    </button>
                </div>
            </header>

            {!isKYCComplete ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 rounded-[3rem] flex flex-col items-center text-center gap-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center neon-glow-primary border border-primary/20">
                        <ScanLine className="w-12 h-12 text-primary" />
                    </div>
                    <div className="max-w-md space-y-4">
                        <h2 className="text-4xl font-bold">Registration Required</h2>
                        <p className="text-white/40">
                            To unlock the autonomous credit ecosystem, please complete the <span className="text-white">Gemini VLM KYC understanding</span> simulation.
                        </p>
                        <button
                            onClick={startKYC}
                            className="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-2xl font-bold transition-all text-xl flex items-center gap-2 mx-auto mt-4 group"
                        >
                            <Play className="fill-current w-5 h-5 group-hover:scale-110 transition-transform" />
                            Start KYC Simulation
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Stats & Actions */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Balance Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group"
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-white/40 text-sm uppercase tracking-widest font-semibold text-xs">Available Credit</span>
                                        <Wallet className="text-primary w-6 h-6" />
                                    </div>
                                    <h2 className="text-5xl font-bold text-white mb-2">₹{balance.toLocaleString()}</h2>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-secondary text-sm">
                                            <TrendingUp className="w-4 h-4" />
                                            <span>+2.4% this week</span>
                                        </div>
                                        <Sparkline data={transactions.map(t => t.type === 'CREDIT' ? t.amount : -t.amount).reverse()} />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700"></div>
                            </motion.div>

                            {/* Credit Score Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group"
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-white/40 text-sm uppercase tracking-widest font-semibold text-xs">Credit Reliability</span>
                                        <CreditCard className="text-secondary w-6 h-6" />
                                    </div>
                                    <h2 className="text-5xl font-bold text-white mb-2">{creditScore}</h2>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full",
                                                    i < (creditScore - 300) / 120 ? "bg-secondary" : "bg-white/10"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-4 text-white/40 text-xs">Based on autonomous math verification & audit history.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/20 transition-all duration-700"></div>
                            </motion.div>
                        </div>

                        {/* Action Center */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-8 rounded-[2.5rem]"
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                Simulate Transaction
                            </h3>

                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Amount (₹)"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-xl"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (Optional)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                {error && <p className="text-accent text-sm px-2">{error}</p>}

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <button
                                        onClick={() => handleTransaction('CREDIT')}
                                        className="flex items-center justify-center gap-2 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/20 py-4 rounded-2xl font-bold transition-all text-lg group"
                                    >
                                        <ArrowUpCircle className="group-hover:translate-x-1 transition-transform" /> Add Credit
                                    </button>
                                    <button
                                        onClick={() => handleTransaction('DEBIT')}
                                        className="flex items-center justify-center gap-2 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/20 py-4 rounded-2xl font-bold transition-all text-lg group"
                                    >
                                        <ArrowDownCircle className="group-hover:-translate-x-1 transition-transform" /> Remove Credit
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Phase 1 & 2 Simulation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* KYC Extraction (Phase 1) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-6 rounded-[2rem]"
                            >
                                <h4 className="font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-widest text-white/50">
                                    <FileSearch className="w-4 h-4 text-primary" /> Phase 1: VLM Extraction
                                </h4>
                                <div className="space-y-3 font-mono text-[10px]">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-white/30">Document</span>
                                        <span className="text-white/80 italic">SBI_Statement_992.pdf</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-white/30">Auth Agent</span>
                                        <span className="text-primary font-bold">VLM Extractor</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-white/30">Math Proof</span>
                                        <span className="text-secondary font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                        </span>
                                    </div>
                                    <div className="p-3 bg-black/40 rounded-xl text-primary leading-tight overflow-hidden">
                                        <code className="text-xs break-all">
                                            {`{ "id": "BRW-992", "verified": true, "conf": 0.99 }`}
                                        </code>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Collections Engine (Phase 2) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card p-6 rounded-[2rem] relative flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
                                        <Zap className="w-4 h-4 text-secondary" /> Phase 2: Collections
                                    </h4>
                                    <button
                                        onClick={advanceCollections}
                                        className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10 text-white/40 hover:text-white/80 transition-all font-bold"
                                    >
                                        Step Forward
                                    </button>
                                </div>
                                <div className="relative flex flex-col gap-3 flex-1">
                                    {[
                                        { label: 'PENDING_D15', val: 'REMINDER_D15' },
                                        { label: 'REMINDER_D7', val: 'REMINDER_D7' },
                                        { label: 'REMINDER_D1', val: 'REMINDER_D1' },
                                        { label: 'DUE_TODAY', val: 'DUE_TODAY' },
                                        { label: 'GRACE', val: 'GRACE_D1' },
                                        { label: 'DELINQUENT', val: 'DELINQUENT_D3' },
                                    ].map((step, i) => {
                                        const phases = ['REMINDER_D15', 'REMINDER_D7', 'REMINDER_D1', 'DUE_TODAY', 'GRACE_D1', 'DELINQUENT_D3', 'CLOSED'];
                                        const currentIdx = phases.indexOf(collectionsPhase);
                                        const stepIdx = phases.indexOf(step.val);
                                        const status = stepIdx < currentIdx ? 'done' : stepIdx === currentIdx ? 'active' : 'pending';

                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center relative z-10 transition-all",
                                                    status === 'done' ? "bg-secondary/20 text-secondary" :
                                                        status === 'active' ? "bg-primary text-white scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]" :
                                                            "bg-white/5 text-white/10"
                                                )}>
                                                    {status === 'done' ? <CheckCircle2 className="w-3 h-3" /> :
                                                        status === 'active' ? <Clock className="w-3 h-3" /> :
                                                            <div className="w-1 h-1 bg-white/20 rounded-full" />}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-bold tracking-tight transition-all",
                                                    status === 'active' ? "text-white" : "text-white/30"
                                                )}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="absolute left-[9px] top-6 bottom-4 w-[1px] bg-white/10 z-0" />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: User & System Console */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-6 rounded-[2.5rem]"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center neon-glow-primary">
                                    <UserIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{user.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                        <span className="text-xs text-white/40 tracking-wider font-bold">BRW: {user.accountNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-white/40 text-[10px] uppercase font-bold mb-1">KYC Agent</p>
                                    <p className="text-secondary font-bold flex items-center gap-2 text-sm">
                                        <ShieldCheck className="w-4 h-4" /> Comprehensive VLM Pass
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-white/40 text-[10px] uppercase font-bold mb-1">Identity Vector</p>
                                    <p className="text-white/80 font-medium truncate text-sm">{user.email}</p>
                                </div>
                            </div>
                        </motion.div>

                        <SystemConsole />
                    </div>
                </div>
            )}

            {/* Footer / Tech Stack Shoutout */}
            <footer className="mt-4 flex justify-center text-white/10 text-[10px] items-center gap-8 uppercase tracking-[0.2em] font-bold">
                <span className="flex items-center gap-2 hover:text-white/30 transition-colors cursor-default"><ShieldCheck className="w-3" /> ZK-Proofs Enabled</span>
                <span className="flex items-center gap-2 hover:text-white/30 transition-colors cursor-default"><History className="w-3" /> Audit Traceable</span>
                <span className="flex items-center gap-2 hover:text-white/30 transition-colors cursor-default"><CreditCard className="w-3" /> Gemini Node Verified</span>
            </footer>
        </div>
    );
};

export default Dashboard;
