import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type TransactionType = 'CREDIT' | 'DEBIT';
export type CollectionsPhase = 'REMINDER_D15' | 'REMINDER_D7' | 'REMINDER_D1' | 'DUE_TODAY' | 'GRACE_D1' | 'DELINQUENT_D3' | 'CLOSED';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    timestamp: string;
}

export interface User {
    name: string;
    email: string;
    accountNumber: string;
    kycStatus: 'VERIFIED' | 'PENDING' | 'FAILED' | 'NOT_STARTED';
}

export interface LogEntry {
    id: string;
    timestamp: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'AI';
    message: string;
}

interface CreditContextType {
    user: User;
    balance: number;
    transactions: Transaction[];
    creditScore: number;
    systemLogs: LogEntry[];
    isScanning: boolean;
    scanProgress: number;
    scanStep: string;
    collectionsPhase: CollectionsPhase;
    addTransaction: (type: TransactionType, amount: number, description: string) => boolean;
    addLog: (message: string, type?: LogEntry['type']) => void;
    startKYC: () => void;
    advanceCollections: () => void;
    resetSystem: () => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

const INITIAL_USER: User = {
    name: '---',
    email: '---',
    accountNumber: '---',
    kycStatus: 'NOT_STARTED',
};

export const CreditProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [creditScore, setCreditScore] = useState(0);
    const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStep, setScanStep] = useState('');
    const [collectionsPhase, setCollectionsPhase] = useState<CollectionsPhase>('REMINDER_D15');

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'INFO') => {
        setSystemLogs((prev) => [
            {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                type,
                message,
            },
            ...prev.slice(0, 49), // Keep last 50 logs
        ]);
    }, []);

    const addTransaction = useCallback((type: TransactionType, amount: number, description: string) => {
        if (type === 'DEBIT' && balance < amount) {
            addLog(`Insufficient balance for withdrawal: ₹${amount.toLocaleString()}`, 'ERROR');
            return false;
        }

        const newTransaction: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            amount,
            description,
            timestamp: new Date().toISOString(),
        };

        setTransactions((prev) => [newTransaction, ...prev]);
        setBalance((prev) => (type === 'CREDIT' ? prev + amount : prev - amount));
        addLog(`${type === 'CREDIT' ? 'Credit' : 'Debit'} processed: ₹${amount.toLocaleString()} - ${description}`, 'SUCCESS');
        return true;
    }, [balance, addLog]);

    const startKYC = async () => {
        setIsScanning(true);
        setScanProgress(0);
        addLog('Starting AI-Native KYC Extraction Flow...', 'AI');

        const steps = [
            { msg: 'Detecting document layout...', progress: 10 },
            { msg: 'VLM Agent: Analyzing bank statement segments...', progress: 30 },
            { msg: 'Extracting account holder: Uday Domadiya', progress: 50 },
            { msg: 'Verifying row-level math (157 transactions)...', progress: 70 },
            { msg: 'Deterministic math check: PASSED', progress: 85 },
            { msg: 'Finalizing JSON schema output...', progress: 95 },
        ];

        for (const step of steps) {
            setScanStep(step.msg);
            setScanProgress(step.progress);
            addLog(step.msg, 'AI');
            await new Promise(r => setTimeout(r, 800));
        }

        setUser({
            name: 'Uday Domadiya',
            email: 'uday@example.com',
            accountNumber: 'BRW-992-041',
            kycStatus: 'VERIFIED',
        });
        setBalance(68500);
        setCreditScore(740);
        setTransactions([{
            id: 'init',
            type: 'CREDIT',
            amount: 68500,
            description: 'Extracted Opening Balance',
            timestamp: new Date().toISOString(),
        }]);

        setIsScanning(false);
        setScanProgress(100);
        addLog('KYC Extraction Complete. Account Initialized.', 'SUCCESS');
    };

    const advanceCollections = () => {
        const phases: CollectionsPhase[] = ['REMINDER_D15', 'REMINDER_D7', 'REMINDER_D1', 'DUE_TODAY', 'GRACE_D1', 'DELINQUENT_D3', 'CLOSED'];
        const nextIdx = phases.indexOf(collectionsPhase) + 1;
        if (nextIdx < phases.length) {
            const nextPhase = phases[nextIdx];
            setCollectionsPhase(nextPhase);
            addLog(`Collections State Machine advanced to: ${nextPhase}`, 'WARNING');

            if (nextPhase === 'DELINQUENT_D3') {
                addLog('ESCALATION: Triggering D+3 Voice Agent system prompt generation.', 'ERROR');
            }
        }
    };

    const resetSystem = () => {
        setUser(INITIAL_USER);
        setBalance(0);
        setTransactions([]);
        setCreditScore(0);
        setSystemLogs([]);
        setCollectionsPhase('REMINDER_D15');
        addLog('System reset to initial state.', 'INFO');
    };

    useEffect(() => {
        if (user.kycStatus === 'VERIFIED') {
            const scoreModifier = transactions.length * 2 + (balance > 10000 ? 50 : -20);
            setCreditScore(Math.min(900, Math.max(300, 700 + scoreModifier)));
        }
    }, [balance, transactions.length, user.kycStatus]);

    return (
        <CreditContext.Provider value={{
            user, balance, transactions, creditScore, systemLogs,
            isScanning, scanProgress, scanStep, collectionsPhase,
            addTransaction, addLog, startKYC, advanceCollections, resetSystem
        }}>
            {children}
        </CreditContext.Provider>
    );
};

export const useCredit = () => {
    const context = useContext(CreditContext);
    if (!context) throw new Error('useCredit must be used within a CreditProvider');
    return context;
};
