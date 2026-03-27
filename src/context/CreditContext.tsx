import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type TransactionType = 'CREDIT' | 'DEBIT';
export type CollectionsPhase = 'REMINDER_D15' | 'REMINDER_D7' | 'REMINDER_D1' | 'DUE_TODAY' | 'GRACE_D1' | 'DELINQUENT_D3' | 'CLOSED';
export type AppPhase = 'overview' | 'phase1' | 'phase2' | 'phase3';

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

export interface MockDoc {
    id: string;
    name: string;
    bank: string;
    previewText: string;
    extractedBalance: number;
}

interface CreditContextType {
    activePhase: AppPhase;
    setActivePhase: (phase: AppPhase) => void;
    user: User;
    balance: number;
    transactions: Transaction[];
    creditScore: number;
    systemLogs: LogEntry[];
    isScanning: boolean;
    scanProgress: number;
    scanStep: string;
    collectionsPhase: CollectionsPhase;
    selectedDoc: MockDoc | null;
    setSelectedDoc: (doc: MockDoc | null) => void;
    addTransaction: (type: TransactionType, amount: number, description: string) => boolean;
    addLog: (message: string, type?: LogEntry['type']) => void;
    startKYC: (doc: MockDoc) => void;
    advanceCollections: () => void;
    resetSystem: () => void;
    isCalling: boolean;
    setIsCalling: (val: boolean) => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

const INITIAL_USER: User = {
    name: '---',
    email: '---',
    accountNumber: '---',
    kycStatus: 'NOT_STARTED',
};

export const MOCK_DOCS: MockDoc[] = [
    { id: '1', name: 'SBI_Statement_Jan.pdf', bank: 'SBI', previewText: 'Opening: 68,500.00\nTransaction 1: -5,000...', extractedBalance: 68500 },
    { id: '2', name: 'HDFC_Salary_Stmt.pdf', bank: 'HDFC', previewText: 'Opening: 1,20,000.00\nSalary Credit: +95,000...', extractedBalance: 120000 },
];

export const CreditProvider = ({ children }: { children: ReactNode }) => {
    const [activePhase, setActivePhase] = useState<AppPhase>('overview');
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [creditScore, setCreditScore] = useState(0);
    const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStep, setScanStep] = useState('');
    const [collectionsPhase, setCollectionsPhase] = useState<CollectionsPhase>('REMINDER_D15');
    const [selectedDoc, setSelectedDoc] = useState<MockDoc | null>(null);
    const [isCalling, setIsCalling] = useState(false);

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'INFO') => {
        setSystemLogs((prev) => [
            {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                type,
                message,
            },
            ...prev.slice(0, 49),
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

    const startKYC = async (doc: MockDoc) => {
        setSelectedDoc(doc);
        setIsScanning(true);
        setScanProgress(0);
        addLog(`VLM Agent starting extraction on ${doc.name}...`, 'AI');

        const steps = [
            { msg: 'Detecting document layout...', progress: 15 },
            { msg: 'VLM Agent: Analyzing bank statement segments...', progress: 40 },
            { msg: 'Extracting account holder: Uday Domadiya', progress: 65 },
            { msg: `Deterministic math check: Balance ₹${doc.extractedBalance.toLocaleString()} VERIFIED`, progress: 85 },
            { msg: 'Finalizing JSON output generated with 0.99 confidence.', progress: 100 },
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 600));
            setScanStep(step.msg);
            setScanProgress(step.progress);
            addLog(step.msg, 'AI');
        }

        setUser({
            name: 'Uday Domadiya',
            email: 'uday@example.com',
            accountNumber: `BRW-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
            kycStatus: 'VERIFIED',
        });
        setBalance(doc.extractedBalance);
        setTransactions([{
            id: 'init',
            type: 'CREDIT',
            amount: doc.extractedBalance,
            description: 'Extracted Opening Balance',
            timestamp: new Date().toISOString(),
        }]);

        setIsScanning(false);
        addLog('Onboarding Complete. Welcome to CredServ.', 'SUCCESS');
        setActivePhase('overview');
    };

    const advanceCollections = () => {
        const phases: CollectionsPhase[] = ['REMINDER_D15', 'REMINDER_D7', 'REMINDER_D1', 'DUE_TODAY', 'GRACE_D1', 'DELINQUENT_D3', 'CLOSED'];
        const nextIdx = phases.indexOf(collectionsPhase) + 1;
        if (nextIdx < phases.length) {
            const nextPhase = phases[nextIdx];
            setCollectionsPhase(nextPhase);
            addLog(`Collections State Machine advanced to: ${nextPhase}`, 'WARNING');
            if (nextPhase === 'DELINQUENT_D3') {
                setIsCalling(true);
                addLog('CRITICAL: Initiating D+3 AI Voice Agent recovery protocol.', 'ERROR');
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
        setActivePhase('overview');
        setSelectedDoc(null);
        setIsCalling(false);
        addLog('System reset.', 'INFO');
    };

    useEffect(() => {
        if (user.kycStatus === 'VERIFIED') {
            const scoreModifier = transactions.length * 2 + (balance > 10000 ? 50 : -20);
            setCreditScore(Math.min(900, Math.max(300, 700 + scoreModifier)));
        }
    }, [balance, transactions, user.kycStatus]);

    return (
        <CreditContext.Provider value={{
            activePhase, setActivePhase, user, balance, transactions, creditScore, systemLogs,
            isScanning, scanProgress, scanStep, collectionsPhase, selectedDoc, setSelectedDoc,
            addTransaction, addLog, startKYC, advanceCollections, resetSystem, isCalling, setIsCalling
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
