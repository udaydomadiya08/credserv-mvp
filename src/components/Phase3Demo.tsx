import { motion } from 'framer-motion';
import { Database, Server, Cpu, Globe, ShieldCheck, Zap } from 'lucide-react';

const Phase3Demo = () => {
    return (
        <div className="h-full flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">System Architecture</h2>
                <p className="text-white/40">The backbone of autonomous credit orchestration.</p>
            </div>

            <div className="flex-1 glass-card rounded-[3rem] p-12 relative overflow-hidden flex items-center justify-center bg-black/40">
                {/* Animated Background Mesh */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent" />
                </div>

                <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    {/* Input Node */}
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-24 h-24 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center neon-glow-secondary"
                        >
                            <Globe className="w-10 h-10 text-secondary" />
                        </motion.div>
                        <div className="text-center">
                            <h5 className="font-bold text-white text-sm">Public API</h5>
                            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold font-mono">Gateway Node</p>
                        </div>
                    </div>

                    {/* AI Integration Node */}
                    <div className="flex flex-col items-center gap-6 relative">
                        {/* Connection Lines */}
                        <div className="absolute left-[-50%] right-[-50%] top-12 h-0.5 bg-gradient-to-r from-secondary via-primary to-accent opacity-20 hidden md:block" />

                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="w-32 h-32 rounded-full border-2 border-dashed border-primary/40 p-4"
                        >
                            <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center neon-glow-primary">
                                <Cpu className="w-12 h-12 text-primary" />
                            </div>
                        </motion.div>
                        <div className="text-center">
                            <h5 className="font-bold text-white text-lg">Gemini 1.5 Node</h5>
                            <p className="text-[10px] text-primary mt-1 uppercase tracking-widest font-bold font-mono">Inference Engine</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono text-white/40">VLM Agent</div>
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono text-white/40">Voice Agent</div>
                        </div>
                    </div>

                    {/* Storage Node */}
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                            className="w-24 h-24 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center neon-glow-accent"
                        >
                            <Database className="w-10 h-10 text-accent" />
                        </motion.div>
                        <div className="text-center">
                            <h5 className="font-bold text-white text-sm">Vector DB</h5>
                            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold font-mono">Persistent Audit</p>
                        </div>
                    </div>
                </div>

                {/* Floating Metrics */}
                <div className="absolute top-8 right-8 space-y-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <Zap className="w-4 h-4 text-primary" />
                        <div>
                            <p className="text-[8px] text-white/40 uppercase font-bold">Latency</p>
                            <p className="text-xs font-mono font-bold">120ms</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-secondary" />
                        <div>
                            <p className="text-[8px] text-white/40 uppercase font-bold">Uptime</p>
                            <p className="text-xs font-mono font-bold">99.99%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'LangGraph Hub', desc: 'Deterministic state machine control.', icon: Server },
                    { title: 'ZK-Proof Bridge', desc: 'Privacy-first verification layer.', icon: ShieldCheck },
                    { title: 'Agent Orchestrator', desc: 'Parallel task scheduling.', icon: Zap },
                ].map((item, i) => (
                    <div key={i} className="p-6 glass-card rounded-3xl border border-white/5 flex gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <item.icon className="w-6 h-6 text-white/40" />
                        </div>
                        <div>
                            <h5 className="font-bold text-sm text-white">{item.title}</h5>
                            <p className="text-xs text-white/30 mt-1">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Phase3Demo;
