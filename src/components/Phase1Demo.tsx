import { useCredit, MOCK_DOCS } from '../context/CreditContext';
import { motion } from 'framer-motion';
import { FileText, Search, ShieldCheck, Database, LayoutPanelLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const Phase1Demo = () => {
    const { startKYC, isScanning, scanStep, scanProgress, user } = useCredit();

    if (user.kycStatus === 'VERIFIED' && !isScanning) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center neon-glow-secondary">
                    <CheckCircle2 className="w-10 h-10 text-secondary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold">Phase 1 Complete</h2>
                    <p className="text-white/40 mt-2">Data has been successfully extracted and verified.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl max-w-md w-full font-mono text-left text-xs text-primary">
                    <pre>{`{
  "user": "Uday Domadiya",
  "status": "VERIFIED",
  "vlm_confidence": 0.99,
  "math_audit": "PASSED"
}`}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left: Doc Selection */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2">VLM Data Factory</h2>
                    <p className="text-white/40">Select a raw document to simulate autonomous extraction.</p>
                </div>

                <div className="space-y-4">
                    {MOCK_DOCS.map((doc) => (
                        <motion.button
                            key={doc.id}
                            whileHover={{ x: 10 }}
                            onClick={() => !isScanning && startKYC(doc)}
                            className={clsx(
                                "w-full p-6 glass-card rounded-3xl flex items-center gap-6 border transition-all text-left group",
                                isScanning ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 border-white/5"
                            )}
                        >
                            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg">{doc.name}</h4>
                                <p className="text-xs text-white/30 uppercase tracking-widest font-bold mt-1">{doc.bank} • UNSTRUCTURED</p>
                            </div>
                            <ArrowRight className="text-white/20 group-hover:text-primary transition-colors" />
                        </motion.button>
                    ))}
                </div>

                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                    <p className="text-xs text-white/50 leading-relaxed">
                        Our VLM Agent (Gemini 1.5 Flash) understands visual layouts and verifies math natively without pre-built templates.
                    </p>
                </div>
            </div>

            {/* Right: Live Monitor */}
            <div className="glass-card rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden bg-black/40">
                <div className="flex items-center gap-2 mb-8">
                    <Search className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Extraction Monitor</h4>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center gap-8">
                    {isScanning ? (
                        <div className="w-full space-y-8">
                            <div className="relative w-48 h-64 mx-auto glass-card rounded-xl overflow-hidden border-primary/20">
                                <div className="p-4 space-y-2 opacity-20">
                                    <div className="h-2 w-1/2 bg-white/40 rounded" />
                                    <div className="h-10 w-full bg-white/10 rounded" />
                                    <div className="h-2 w-3/4 bg-white/10 rounded" />
                                    <div className="space-y-1 pt-4">
                                        {[...Array(6)].map((_, i) => <div key={i} className="h-1 w-full bg-white/5 rounded" />)}
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(99,102,241,1)]"
                                />
                            </div>
                            <div>
                                <p className="text-primary font-mono text-xs mb-2 animate-pulse">{scanStep}</p>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 max-w-xs mx-auto">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scanProgress}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 opacity-40">
                            <Database className="w-16 h-16 mx-auto text-white/20" />
                            <p className="text-sm font-mono tracking-tighter italic">Select a source document to begin agentic extraction.</p>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex gap-4 justify-center">
                        <div className="flex items-center gap-1.5 text-[9px] text-white/30"><LayoutPanelLeft className="w-3" /> LAYOUT ANALYSIS</div>
                        <div className="flex items-center gap-1.5 text-[9px] text-white/30"><ShieldCheck className="w-3" /> MATH VERIFICATION</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Phase1Demo;
