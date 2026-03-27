import { useState, useMemo } from 'react';
import { useCredit } from '../context/CreditContext';
import {
    TrendingUp,
    History,
    User as UserIcon,
    ShieldCheck,
    Zap,
    Users,
    Activity,
    Server,
    LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SystemConsole from './SystemConsole';
import Phase1Demo from './Phase1Demo';
import Phase2Demo from './Phase2Demo';
import Phase3Demo from './Phase3Demo';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Sparkline = ({ data }: { data: number[] }) => {
    const points = useMemo(() => {
        if (data.length < 2) return "";
        const max = Math.max(...data, 100);
        const min = Math.min(...data, 0);
        const range = max - min;
        const width = 100; const height = 30;
        return data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(" ");
    }, [data]);
    return (
        <svg viewBox="0 0 100 30" className="w-24 h-8 text-secondary opacity-50">
            <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
    );
};

const Dashboard = () => {
    const {
        activePhase, setActivePhase, user, balance, transactions, creditScore,
        addTransaction
    } = useCredit();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleTransaction = (type: 'CREDIT' | 'DEBIT') => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;
        addTransaction(type, val, description || (type === 'CREDIT' ? 'Manual Deposit' : 'Manual Withdrawal'));
        setAmount(''); setDescription('');
    };

    const sidebarItems = [
        { id: 'overview', label: 'Ecosystem', icon: LayoutDashboard },
        { id: 'phase1', label: 'KYC Hub', icon: Users },
        { id: 'phase2', label: 'Collections', icon: Activity },
        { id: 'phase3', label: 'Infrastructure', icon: Server },
    ];

    return (
        <div className="w-full flex gap-8 h-[90vh] max-h-[900px]">
            {/* Sidebar Navigation */}
            <nav className="w-72 glass-card rounded-[3rem] p-8 flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary rounded-2xl neon-glow-primary">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">CredServ</h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Autonomous OS</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePhase(item.id as any)}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all relative group overflow-hidden",
                                activePhase === item.id ? "bg-primary text-white" : "text-white/40 hover:bg-white/5 hover:text-white/60"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", activePhase === item.id ? "text-white" : "text-white/20")} />
                            <span>{item.label}</span>
                            {activePhase === item.id && (
                                <motion.div layoutId="nav-bg" className="absolute inset-0 bg-primary/10 -z-10" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="glass-card p-4 rounded-3xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-white/30 truncate">BRW: {user.accountNumber}</p>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary w-3/4" />
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide">
                <AnimatePresence mode="wait">
                    {activePhase === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-6">
                            <header className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-4xl font-bold">System Overview</h2>
                                    <p className="text-white/40">Real-time health of your autonomous credit account.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Reliability Score</p>
                                    <h3 className="text-3xl font-bold text-white">{creditScore}</h3>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-4">Total Liquidity</p>
                                        <h2 className="text-6xl font-black mb-4">₹{balance.toLocaleString()}</h2>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-secondary text-sm font-bold">
                                                <TrendingUp className="w-4 h-4" /> Healthy
                                            </div>
                                            <Sparkline data={transactions.map(t => t.type === 'CREDIT' ? t.amount : -t.amount).reverse()} />
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700"></div>
                                </div>

                                <div className="glass-card p-8 rounded-[2.5rem]">
                                    <h3 className="font-bold mb-6 flex items-center gap-2 text-sm uppercase text-white/40"><History className="w-4 h-4" /> Quick Simulation</h3>
                                    <div className="flex flex-col gap-4">
                                        <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => handleTransaction('CREDIT')} className="bg-secondary/20 text-secondary py-4 rounded-2xl font-bold hover:bg-secondary/30 transition-all border border-secondary/10">Credit</button>
                                            <button onClick={() => handleTransaction('DEBIT')} className="bg-accent/20 text-accent py-4 rounded-2xl font-bold hover:bg-accent/30 transition-all border border-accent/10">Debit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8">
                                    <SystemConsole />
                                </div>
                                <div className="md:col-span-4 flex flex-col gap-6">
                                    <div className="glass-card p-6 rounded-[2rem] border border-primary/20 bg-primary/5 flex flex-col items-center text-center gap-4">
                                        <Zap className="text-primary w-8 h-8" />
                                        <div>
                                            <h4 className="font-bold text-sm">Autonomous Engine</h4>
                                            <p className="text-[10px] text-white/40 mt-1 uppercase">Phase 2: Active Monitoring</p>
                                        </div>
                                    </div>
                                    <div className="glass-card p-6 rounded-[2rem] flex flex-col items-center text-center gap-4">
                                        <ShieldCheck className="text-secondary w-8 h-8" />
                                        <div>
                                            <h4 className="font-bold text-sm">VLM Verified</h4>
                                            <p className="text-[10px] text-white/40 mt-1 uppercase">Doc Integrity: 100%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activePhase === 'phase1' && <motion.div key="phase1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><Phase1Demo /></motion.div>}
                    {activePhase === 'phase2' && <motion.div key="phase2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><Phase2Demo /></motion.div>}
                    {activePhase === 'phase3' && <motion.div key="phase3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><Phase3Demo /></motion.div>}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
