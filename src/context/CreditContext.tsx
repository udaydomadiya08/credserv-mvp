import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TransactionType = 'CREDIT' | 'DEBIT';

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
    kycStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
}

interface CreditContextType {
    user: User;
    balance: number;
    transactions: Transaction[];
    creditScore: number;
    addTransaction: (type: TransactionType, amount: number, description: string) => boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider = ({ children }: { children: ReactNode }) => {
    const [user] = useState<User>({
        name: 'Uday Domadiya',
        email: 'uday@example.com',
        accountNumber: 'BRW-001',
        kycStatus: 'VERIFIED',
    });

    const [balance, setBalance] = useState(50000);
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: '1',
            type: 'CREDIT',
            amount: 50000,
            description: 'Initial Opening Balance',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
    ]);
    const [creditScore, setCreditScore] = useState(720);

    const addTransaction = (type: TransactionType, amount: number, description: string) => {
        if (type === 'DEBIT' && balance < amount) {
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
        return true;
    };

    // Simulate credit score changes based on history
    useEffect(() => {
        const scoreModifier = transactions.length * 2 + (balance > 10000 ? 50 : -20);
        setCreditScore(Math.min(900, Math.max(300, 700 + scoreModifier)));
    }, [balance, transactions.length]);

    return (
        <CreditContext.Provider value={{ user, balance, transactions, creditScore, addTransaction }}>
            {children}
        </CreditContext.Provider>
    );
};

export const useCredit = () => {
    const context = useContext(CreditContext);
    if (!context) throw new Error('useCredit must be used within a CreditProvider');
    return context;
};
