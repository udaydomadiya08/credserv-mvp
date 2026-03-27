import { useCredit } from '../context/CreditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Smartphone, MessageCircle, AlertTriangle, PhoneCall, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const Phase2Demo = () => {
    const { collectionsPhase, advanceCollections, user, isCalling, setIsCalling } = useCredit();

    const phases = [
        { id: 'REMINDER_D15', label: '15 Days Before Due', action: 'Gentle Reminder SMS' },
        { id: 'REMINDER_D7', label: '7 Days Before Due', action: 'Gentle Reminder Email' },
        { id: 'REMINDER_D1', label: '1 Day Before Due', action: 'Final Reminder SMS' },
        { id: 'DUE_TODAY', label: 'Due Date', action: 'Direct Repayment Link' },
        { id: 'GRACE_D1', label: 'Grace Period (D+1)', action: 'Penalty Warning' },
        { id: 'DELINQUENT_D3', label: 'Delinquent (D+3)', action: 'AI Voice Engagement' },
    ];

    const currentIdx = phases.findIndex(p => p.id === collectionsPhase);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Left: State Machine Timeline */}
            <div className="lg:col-span-7 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Collections Orchestrator</h2>
                    <p className="text-white/40">Simulate a borrower's journey through the enforcement lifecycle.</p>
                </div>

                <div className="space-y-4 relative pl-8">
                    <div className="absolute left-[39px] top-6 bottom-6 w-[1px] bg-white/5" />
                    {phases.map((p, i) => {
                        const status = i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending';
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={clsx(
                                    "p-5 glass-card rounded-2xl flex items-center gap-6 border transition-all",
                                    status === 'active' ? "border-primary/40 bg-primary/5 scale-[1.02]" : "border-white/5 opacity-50"
                                )}
                            >
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors",
                                    status === 'done' ? "bg-secondary/20 text-secondary" :
                                        status === 'active' ? "bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" :
                                            "bg-white/5 text-white/20"
                                )}>
                                    {status === 'done' ? <CheckCircle2 className="w-5 h-5" /> :
                                        status === 'active' ? <Clock className="w-5 h-5" /> : <Clock className="w-4 h-4 opacity-20" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={clsx("font-bold text-sm", status === 'active' ? "text-white" : "text-white/40")}>{p.label}</h4>
                                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mt-0.5">{p.action}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <button
                    onClick={advanceCollections}
                    className="w-full py-4 bg-primary hover:bg-primary/80 text-white rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                    <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    Advance Simulation Step
                </button>
            </div>

            {/* Right: Agent Interventions */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="glass-card p-6 rounded-[2rem] flex-1 bg-black/20 overflow-hidden relative">
                    <div className="flex items-center gap-2 mb-6">
                        <Smartphone className="w-4 h-4 text-secondary" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Mock Notification Hub</h4>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {currentIdx >= 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden"
                                >
                                    <MessageCircle className="w-3 h-3 absolute top-3 right-3 text-secondary" />
                                    <p className="text-[10px] text-secondary font-bold mb-1 uppercase tracking-tighter">CredServ SMS Agent</p>
                                    <p className="text-xs text-white/70 italic">
                                        "Hi {user.name}, your repayment of ₹5,000 is due in 3 days. Use this link: credserv.me/payX12"
                                    </p>
                                </motion.div>
                            )}
                            {currentIdx >= 5 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-accent/10 rounded-2xl border border-accent/20 relative overflow-hidden"
                                >
                                    <AlertTriangle className="w-3 h-3 absolute top-3 right-3 text-accent" />
                                    <p className="text-[10px] text-accent font-bold mb-1 uppercase tracking-tighter">Legal Escalation Queue</p>
                                    <p className="text-xs text-white/70">
                                        Warning: Account delinquent. Case ready for automated voice recovery protocol.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-[2rem]">
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                </div>

                {/* AI Voice Agent Modal Overlay Trigger */}
                <AnimatePresence>
                    {isCalling && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="glass-card p-6 rounded-[2.5rem] bg-accent/20 border-accent/30 flex flex-col items-center text-center gap-4 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-accent/5 animate-pulse" />
                            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center neon-glow-accent relative z-10">
                                <PhoneCall className="w-8 h-8 text-white animate-bounce" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold">Inbound AI Voice Agent</h4>
                                <p className="text-xs text-white/60 mt-1">Simulating D+3 Recovery Call...</p>
                                <div className="mt-4 p-3 bg-black/40 rounded-xl text-[10px] text-left font-mono text-accent italic space-y-2">
                                    <p>"Hello, is this {user.name}?"</p>
                                    <p>"I'm the CredServ Autonomous assistant. We noticed your payment is 3 days overdue..."</p>
                                </div>
                                <button
                                    onClick={() => setIsCalling(false)}
                                    className="mt-4 px-6 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-accent/80 transition-all"
                                >
                                    End Session
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Phase2Demo;
