
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, TrendingUp, CheckCircle, Clock, ArrowRight, X, Settings, ShoppingCart, Pencil, Trash2 } from 'lucide-react';

// --- Type Definitions ---
interface SettingsType {
    initialInvestment: number;
    watchCost: number;
    watchPrice: number;
}

interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'sale';
    quantity: number;
    description: string;
}

interface Expense {
    id: string;
    date: string;
    amount: number;
    type: 'expense';
    description: string;
}

type CombinedLogItem = Transaction | Expense;

interface SaleData {
    quantity: number;
    description: string;
}

interface ExpenseData {
    description: string;
    amount: number;
}

// --- Helper Components ---

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const LogRow: React.FC<{ item: CombinedLogItem; index: number; onEdit: (item: CombinedLogItem) => void; onDelete: (item: CombinedLogItem) => void; }> = ({ item, index, onEdit, onDelete }) => {
    const isSale = item.type === 'sale';
    return (
        <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
            <td className="p-4 text-sm text-gray-600 font-mono">#{1001 + index}</td>
            <td className="p-4 text-sm text-gray-800">{new Date(item.date).toLocaleString()}</td>
            <td className={`p-4 text-sm font-semibold ${isSale ? 'text-green-600' : 'text-red-600'}`}>
                {isSale ? '+' : '-'}${item.amount.toFixed(2)}
            </td>
            <td className="p-4 text-sm text-gray-600">{item.description} {isSale && item.quantity > 1 && `(x${item.quantity})`}</td>
            <td className="p-4 text-sm">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700 p-1" aria-label="Edit item"><Pencil size={16} /></button>
                    <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700 p-1" aria-label="Delete item"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
};

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const FormInput: React.FC<{ label: string; type: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; step?: string }> = ({ label, type, value, onChange, placeholder, step }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            step={step}
        />
    </div>
);

const ActionButton: React.FC<{ onClick?: () => void; children: React.ReactNode; className: string; disabled?: boolean; type?: "button" | "submit" | "reset"; }> = ({ onClick, children, className, disabled = false, type = "button" }) => (
    <button onClick={onClick} disabled={disabled} type={type} className={`w-full flex items-center justify-center font-bold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out shadow-md hover:shadow-lg ${className}`}>
        {children}
    </button>
);

const SaleModal: React.FC<{ onClose: () => void; onAddSale: (sale: SaleData) => void; watchPrice: number; inventory: number }> = ({ onClose, onAddSale, watchPrice, inventory }) => {
    const [quantity, setQuantity] = useState('1');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseInt(quantity, 10);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            setError('Please enter a valid quantity.'); return;
        }
        if (numQuantity > inventory) {
            setError(`Not enough inventory. Only ${inventory} watches left.`); return;
        }
        onAddSale({ quantity: numQuantity, description: notes || 'Watch Sale' });
        onClose();
    };

    const totalRevenue = (parseInt(quantity) || 0) * watchPrice;

    return (
        <Modal onClose={onClose}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Record a New Sale</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <FormInput label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="1" />
                    <FormInput label="Customer / Notes (Optional)" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., John Smith" />
                    <div className="text-center bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="mt-6">
                    <ActionButton type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Add Sale</ActionButton>
                </div>
            </form>
        </Modal>
    );
};

const ExpenseModal: React.FC<{ onClose: () => void; onAddExpense: (expense: ExpenseData) => void }> = ({ onClose, onAddExpense }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!description.trim()) { setError('Description cannot be empty.'); return; }
        if (isNaN(numAmount) || numAmount <= 0) { setError('Please enter a valid positive amount.'); return; }
        onAddExpense({ description, amount: numAmount });
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Expense</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <FormInput label="Description" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Marketing, Shipping" />
                    <FormInput label="Amount ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" step="0.01" />
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="mt-6">
                    <ActionButton type="submit" className="bg-red-500 text-white hover:bg-red-600">Add Expense</ActionButton>
                </div>
            </form>
        </Modal>
    );
};

const SettingsModal: React.FC<{ onClose: () => void; settings: SettingsType; onSave: (settings: SettingsType) => void }> = ({ onClose, settings, onSave }) => {
    const [tempSettings, setTempSettings] = useState(settings);

    const handleChange = (key: keyof SettingsType, value: string) => {
        setTempSettings({ ...tempSettings, [key]: parseFloat(value) || 0 });
    };

    return (
        <Modal onClose={onClose}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Business Settings</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
                <FormInput label="Initial Investment ($)" type="number" value={tempSettings.initialInvestment} onChange={e => handleChange('initialInvestment', e.target.value)} />
                <FormInput label="Cost per Watch ($)" type="number" value={tempSettings.watchCost} onChange={e => handleChange('watchCost', e.target.value)} />
                <FormInput label="Selling Price per Watch ($)" type="number" value={tempSettings.watchPrice} onChange={e => handleChange('watchPrice', e.target.value)} />
            </div>
            <div className="mt-6">
                <ActionButton onClick={() => { onSave(tempSettings); onClose(); }} className="bg-gray-700 text-white hover:bg-gray-800">Save Settings</ActionButton>
            </div>
        </Modal>
    );
};

const EditLogModal: React.FC<{ logItem: CombinedLogItem; onClose: () => void; onSave: (updatedItem: CombinedLogItem) => void; watchPrice: number; }> = ({ logItem, onClose, onSave, watchPrice }) => {
    const [description, setDescription] = useState(logItem.description);
    const [date, setDate] = useState(new Date(logItem.date).toISOString().substring(0, 16));
    const [amount, setAmount] = useState(logItem.type === 'expense' ? logItem.amount.toString() : '');
    const [quantity, setQuantity] = useState(logItem.type === 'sale' ? logItem.quantity.toString() : '1');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!Date.parse(date)) { setError('Invalid date format.'); return; }
        const newDate = new Date(date).toISOString();

        if (logItem.type === 'sale') {
            const numQuantity = parseInt(quantity, 10);
            if (isNaN(numQuantity) || numQuantity <= 0) { setError('Please enter a valid quantity.'); return; }
            onSave({ ...logItem, date: newDate, description, quantity: numQuantity, amount: numQuantity * watchPrice });
        } else {
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) { setError('Please enter a valid positive amount.'); return; }
            if (!description.trim()) { setError('Description cannot be empty.'); return; }
            onSave({ ...logItem, date: newDate, description, amount: numAmount });
        }
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit {logItem.type === 'sale' ? 'Sale' : 'Expense'}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <FormInput label="Date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
                    <FormInput label="Description" type="text" value={description} onChange={e => setDescription(e.target.value)} />
                    {logItem.type === 'sale' ? (
                        <>
                            <FormInput label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
                            <div className="text-center bg-gray-100 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">${((parseInt(quantity) || 0) * watchPrice).toLocaleString()}</p>
                            </div>
                        </>
                    ) : (
                        <FormInput label="Amount ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" />
                    )}
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="mt-6">
                    <ActionButton type="submit" className="bg-green-600 text-white hover:bg-green-700">Save Changes</ActionButton>
                </div>
            </form>
        </Modal>
    );
};

// --- Main App Component ---
export default function App() {
    const [settings, setSettings] = useState<SettingsType>({
        initialInvestment: 1800,
        watchCost: 30,
        watchPrice: 600,
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingLog, setEditingLog] = useState<CombinedLogItem | null>(null);

    const { initialWatches, watchesSold, inventory } = useMemo(() => {
        if (settings.watchCost <= 0) return { initialWatches: 0, watchesSold: 0, inventory: 0 };
        const initialWatches = Math.floor(settings.initialInvestment / settings.watchCost);
        const watchesSold = transactions.reduce((acc, tx) => acc + tx.quantity, 0);
        const inventory = initialWatches - watchesSold;
        return { initialWatches, watchesSold, inventory };
    }, [settings, transactions]);

    const handleAddSale = (sale: SaleData) => {
        const newTransaction: Transaction = {
            ...sale,
            id: `sale-${Date.now()}`,
            date: new Date().toISOString(),
            amount: sale.quantity * settings.watchPrice,
            type: 'sale'
        };
        setTransactions(prev => [...prev, newTransaction]);
    };

    const handleAddExpense = (expense: ExpenseData) => {
        const newExpense: Expense = {
            ...expense,
            id: `exp-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'expense'
        };
        setExpenses(prev => [...prev, newExpense]);
    };
    
    const handleUpdateLog = (updatedItem: CombinedLogItem) => {
        if (updatedItem.type === 'sale') {
            setTransactions(prev => prev.map(tx => tx.id === updatedItem.id ? updatedItem as Transaction : tx));
        } else {
            setExpenses(prev => prev.map(ex => ex.id === updatedItem.id ? updatedItem as Expense : ex));
        }
        setEditingLog(null);
    };
    
    const handleDeleteLog = (logItem: CombinedLogItem) => {
        if (window.confirm(`Are you sure you want to delete this ${logItem.type}? This action cannot be undone.`)) {
            if (logItem.type === 'sale') {
                setTransactions(prev => prev.filter(tx => tx.id !== logItem.id));
            } else {
                setExpenses(prev => prev.filter(ex => ex.id !== logItem.id));
            }
        }
    };

    const combinedLog = useMemo<CombinedLogItem[]>(() => {
        return [...transactions, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, expenses]);

    const financialData = useMemo(() => {
        const totalSales = transactions.reduce((acc, tx) => acc + tx.amount, 0);
        const totalExpenses = expenses.reduce((acc, ex) => acc + ex.amount, 0);
        const cogs = watchesSold * settings.watchCost;
        const grossProfit = totalSales - cogs;
        const netProfit = grossProfit - totalExpenses - settings.initialInvestment;
        const roi = settings.initialInvestment > 0 ? (netProfit / settings.initialInvestment) * 100 : 0;
        const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

        return { totalSales, totalExpenses, cogs, grossProfit, netProfit, roi, profitMargin };
    }, [transactions, expenses, settings, watchesSold]);

    const chartData = useMemo(() => {
        let cumulativeProfit = -settings.initialInvestment;
        let cumulativeSales = 0;
        const chronologicalLog = [...transactions, ...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const data = [{ name: 'Start', Sales: 0, Profit: cumulativeProfit }];

        chronologicalLog.forEach((item) => {
            if (item.type === 'sale') {
                cumulativeSales += item.amount;
                cumulativeProfit += (item.amount - (item.quantity * settings.watchCost));
            } else {
                cumulativeProfit -= item.amount;
            }
            data.push({ name: new Date(item.date).toLocaleDateString(), Sales: cumulativeSales, Profit: cumulativeProfit });
        });
        return data;
    }, [transactions, expenses, settings]);

    return (
        <>
            {showSaleModal && <SaleModal onClose={() => setShowSaleModal(false)} onAddSale={handleAddSale} watchPrice={settings.watchPrice} inventory={inventory} />}
            {showExpenseModal && <ExpenseModal onClose={() => setShowExpenseModal(false)} onAddExpense={handleAddExpense} />}
            {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} settings={settings} onSave={setSettings} />}
            {editingLog && <EditLogModal logItem={editingLog} onClose={() => setEditingLog(null)} onSave={handleUpdateLog} watchPrice={settings.watchPrice} />}
            
            <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Financial Tracker</h1>
                            <p className="text-lg text-gray-500 mt-1">Your Watch Business Dashboard</p>
                        </div>
                        <ActionButton onClick={() => setShowSettingsModal(true)} className="bg-white text-gray-700 hover:bg-gray-200 w-auto px-4">
                            <Settings size={20} className="mr-2" /> Settings
                        </ActionButton>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
                                <div className="space-y-3">
                                    <ActionButton onClick={() => setShowSaleModal(true)} disabled={inventory <= 0} className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400">
                                        <ShoppingCart className="mr-2" size={20} /> Record a Sale
                                    </ActionButton>
                                    <ActionButton onClick={() => setShowExpenseModal(true)} className="bg-red-500 text-white hover:bg-red-600">
                                        <ArrowRight className="mr-2" size={20} /> Add an Expense
                                    </ActionButton>
                                </div>
                                {inventory <= 0 && <p className="text-center text-red-500 mt-3 text-sm">Out of stock!</p>}
                            </div>

                            <div className="space-y-4">
                               <StatCard title="Remaining Inventory" value={`${inventory} / ${initialWatches} units`} icon={<Package size={24} className="text-white"/>} color="bg-yellow-500" />
                                <StatCard title="Total Revenue" value={`$${financialData.totalSales.toLocaleString()}`} icon={<DollarSign size={24} className="text-white"/>} color="bg-green-500" />
                                <StatCard title="Gross Profit" value={`$${financialData.grossProfit.toLocaleString()}`} icon={<TrendingUp size={24} className="text-white"/>} color="bg-indigo-500" />
                                <StatCard title="Total Expenses" value={`$${financialData.totalExpenses.toLocaleString()}`} icon={<ArrowRight size={24} className="text-white"/>} color="bg-red-500" />
                                <StatCard title="Net Profit" value={`$${financialData.netProfit.toLocaleString()}`} icon={<CheckCircle size={24} className="text-white"/>} color="bg-teal-500" />
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Return on Investment</h3>
                                    <p className={`text-4xl font-bold ${financialData.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>{financialData.roi.toFixed(1)}%</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Profit Margin</h3>
                                    <p className="text-4xl font-bold text-blue-600">{financialData.profitMargin.toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg h-96">
                                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Overview</h2>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                        <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}}/>
                                        <YAxis yAxisId="left" stroke="#10B981" tick={{fill: '#10B981'}} tickFormatter={(v) => `$${v/1000}k`}/>
                                        <YAxis yAxisId="right" orientation="right" stroke="#6366F1" tick={{fill: '#6366F1'}} tickFormatter={(v) => `$${v/1000}k`}/>
                                        <Tooltip formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.75rem' }}/>
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="Sales" fill="#10B981" name="Cumulative Sales" radius={[4, 4, 0, 0]} />
                                        <Bar yAxisId="right" dataKey="Profit" fill="#6366F1" name="Cumulative Net Profit" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Combined Log</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase">ID</th>
                                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase">Date</th>
                                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase">Amount</th>
                                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase">Description</th>
                                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {combinedLog.length > 0 ? (
                                                combinedLog.map((item, index) => <LogRow key={item.id} item={item} index={index} onEdit={setEditingLog} onDelete={handleDeleteLog} />)
                                            ) : (
                                                <tr><td colSpan={5} className="text-center p-8 text-gray-500"><Clock size={32} className="mx-auto mb-2" />No transactions yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
