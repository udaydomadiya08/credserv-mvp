import { useState } from 'react';
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
    AlertCircle,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Dashboard = () => {
    const { user, balance, transactions, creditScore, addTransaction } = useCredit();
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
                                <div className="flex items-center gap-2 text-secondary text-sm">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+2.4% from last month</span>
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
                                    <span className="text-white/40 text-sm uppercase tracking-widest font-semibold text-xs">Credit Score</span>
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
                                <p className="mt-4 text-white/40 text-xs">Excellent reliability based on Phase 2 simulation.</p>
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
                                    <span className="text-white/80 italic">SBI_Statement_Jan24.pdf</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/30">OCR Engine</span>
                                    <span className="text-primary font-bold">Gemini 1.5 Flash</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/30">Math Verification</span>
                                    <span className="text-secondary font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> PASSED
                                    </span>
                                </div>
                                <div className="p-2 bg-black/40 rounded-lg text-primary leading-tight overflow-hidden">
                                    <code>{'{ "confidence": 0.98, "extraction": "SUCCESS" }'}</code>
                                </div>
                            </div>
                        </motion.div>

                        {/* Collections Engine (Phase 2) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-6 rounded-[2rem]"
                        >
                            <h4 className="font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-widest text-white/50">
                                <Zap className="w-4 h-4 text-secondary" /> Phase 2: Collections
                            </h4>
                            <div className="relative flex flex-col gap-3">
                                {[
                                    { label: 'REMINDER_D7', status: 'done', icon: CheckCircle2 },
                                    { label: 'DUE_TODAY', status: 'active', icon: Clock },
                                    { label: 'DELINQUENT_D3', status: 'pending', icon: AlertCircle },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center relative z-10",
                                            step.status === 'done' ? "bg-secondary/20 text-secondary" :
                                                step.status === 'active' ? "bg-primary/20 text-primary animate-pulse" :
                                                    "bg-white/5 text-white/20"
                                        )}>
                                            <step.icon className="w-3 h-3" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold",
                                            step.status === 'active' ? "text-white" : "text-white/30"
                                        )}>{step.label}</span>
                                    </div>
                                ))}
                                <div className="absolute left-3 top-6 bottom-4 w-[1px] bg-white/10 z-0" />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Column: User & Recent Activity */}
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
                                    <span className="text-xs text-white/40 tracking-wider font-bold">ACCOUNT: {user.accountNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-white/40 text-xs uppercase font-bold mb-1">KYC Status</p>
                                <p className="text-secondary font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Fully Verified
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-white/40 text-xs uppercase font-bold mb-1">Email</p>
                                <p className="text-white/80 font-medium truncate">{user.email}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mini History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 rounded-[2.5rem] flex-1"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-lg">Activity Feed</h4>
                            <button
                                onClick={() => setActiveTab('history')}
                                className="text-xs text-primary hover:underline font-bold"
                            >
                                View all
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <AnimatePresence mode="popLayout">
                                {transactions.slice(0, 5).map((t) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={t.id}
                                        className="flex justify-between items-center group cursor-default"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl border transition-all duration-300",
                                                t.type === 'CREDIT'
                                                    ? "bg-secondary/10 border-secondary/20 text-secondary group-hover:bg-secondary/20"
                                                    : "bg-accent/10 border-accent/20 text-accent group-hover:bg-accent/20"
                                            )}>
                                                {t.type === 'CREDIT' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white/90">{t.description}</p>
                                                <p className="text-[10px] text-white/30 uppercase tracking-tighter">
                                                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(t.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "font-mono font-bold",
                                            t.type === 'CREDIT' ? "text-secondary" : "text-accent"
                                        )}>
                                            {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer / Tech Stack Shoutout */}
            <footer className="mt-4 flex justify-center text-white/20 text-xs items-center gap-6">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3" /> Zero-Knowledge Proofs</span>
                <span className="flex items-center gap-1.5"><History className="w-3" /> Immutable Audit Logs</span>
                <span className="flex items-center gap-1.5"><CreditCard className="w-3" /> VLM KYC Integration</span>
            </footer>
        </div>
    );
};

export default Dashboard;
