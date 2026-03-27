import { useCredit } from '../context/CreditContext';
import { Terminal, Shield, Cpu, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const SystemConsole = () => {
    const { systemLogs, resetSystem } = useCredit();

    return (
        <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col h-[300px]">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Autonomous Agent Logs</h4>
                </div>
                <button
                    onClick={resetSystem}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white/80"
                    title="Reset System"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {systemLogs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-white/20 gap-2 opacity-50">
                            <Cpu className="w-8 h-8" />
                            <p>Systems Idle. Awaiting user input.</p>
                        </div>
                    )}
                    {systemLogs.map((log) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={log.id}
                            className="flex gap-3 items-start"
                        >
                            <span className="text-white/20 whitespace-nowrap">[{log.timestamp}]</span>
                            <span className={clsx(
                                "font-bold px-1.5 rounded text-[9px]",
                                log.type === 'AI' && "bg-primary/20 text-primary",
                                log.type === 'SUCCESS' && "bg-secondary/20 text-secondary",
                                log.type === 'WARNING' && "bg-orange-400/20 text-orange-400",
                                log.type === 'ERROR' && "bg-accent/20 text-accent",
                                log.type === 'INFO' && "bg-white/10 text-white/60"
                            )}>
                                {log.type}
                            </span>
                            <span className={clsx(
                                "flex-1 break-words",
                                log.type === 'AI' ? "text-primary/90" : "text-white/70"
                            )}>
                                {log.message}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div className="bg-primary/5 px-6 py-2 border-t border-white/5 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
                    <Shield className="w-3 h-3" /> System Secure
                </div>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        animate={{ left: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative h-full w-1/3 bg-primary/40 blur-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default SystemConsole;
