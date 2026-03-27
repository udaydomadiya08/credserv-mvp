import { useCredit } from '../context/CreditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const ScannerOverlay = () => {
    const { isScanning, scanProgress, scanStep } = useCredit();

    return (
        <AnimatePresence>
            {isScanning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-6"
                >
                    <div className="w-full max-w-2xl flex flex-col items-center text-center gap-8">
                        <div className="relative w-64 h-80 glass-card rounded-2xl overflow-hidden border-primary/30">
                            {/* Fake Document */}
                            <div className="p-6 space-y-4 opacity-40">
                                <div className="h-4 w-3/4 bg-white/20 rounded" />
                                <div className="h-4 w-1/2 bg-white/20 rounded" />
                                <div className="space-y-2 pt-8">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="flex gap-2">
                                            <div className="h-2 w-12 bg-white/10 rounded" />
                                            <div className="h-2 w-24 bg-white/10 rounded" />
                                            <div className="h-2 w-10 bg-white/10 rounded ml-auto" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scanner Line */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-20"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                        </div>

                        <div className="space-y-4 w-full">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        VLM Agent Extractions
                                    </h3>
                                    <p className="text-white/40 font-mono text-sm">{scanStep}</p>
                                </div>
                                <span className="text-primary font-bold text-3xl">{scanProgress}%</span>
                            </div>

                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scanProgress}%` }}
                                    className="h-full bg-primary neon-glow-primary"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <FileSearch className="w-5 h-5 mb-2 text-primary mx-auto" />
                                    <p className="text-[10px] text-white/40 uppercase font-bold">OCR Sync</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <CheckCircle2 className="w-5 h-5 mb-2 text-secondary mx-auto" />
                                    <p className="text-[10px] text-white/40 uppercase font-bold">Math Check</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <ShieldCheck className="w-5 h-5 mb-2 text-purple-400 mx-auto" />
                                    <p className="text-[10px] text-white/40 uppercase font-bold">DPDP Valid</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScannerOverlay;
