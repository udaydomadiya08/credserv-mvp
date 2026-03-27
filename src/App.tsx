import { CreditProvider } from './context/CreditContext';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <CreditProvider>
            <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
                <Dashboard />
            </div>
        </CreditProvider>
    );
}

export default App;
