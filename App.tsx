import React, { useState, useEffect } from 'react';
import ProductDashboard from './ProductDashboard';
import ProductTracker from './ProductTracker';
import ProductModal from './ProductModal';

interface Product {
    id: string;
    name: string;
    description: string;
    initialInvestment: number;
    unitCost: number;
    sellingPrice: number;
    initialUnits: number;
    color: string;
    icon: string;
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

interface ProductData {
    product: Product;
    transactions: Transaction[];
    expenses: Expense[];
}

interface ProductStats {
    totalRevenue: number;
    netProfit: number;
    inventory: number;
    totalSales: number;
}

interface ProductWithStats extends Product {
    stats: ProductStats;
}

type AppView = 'dashboard' | 'product';

export default function App() {
    const [currentView, setCurrentView] = useState<AppView>('dashboard');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [productsData, setProductsData] = useState<Record<string, ProductData>>({});
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem('multiBusinessFinanceTracker');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setProductsData(parsed.productsData || {});
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }, []);

    // Save data to localStorage whenever productsData changes
    useEffect(() => {
        localStorage.setItem('multiBusinessFinanceTracker', JSON.stringify({
            productsData
        }));
    }, [productsData]);

    const calculateProductStats = (productData: ProductData): ProductStats => {
        const { product, transactions, expenses } = productData;
        
        const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpenses = expenses.reduce((sum, ex) => sum + ex.amount, 0);
        const unitsSold = transactions.reduce((sum, tx) => sum + tx.quantity, 0);
        const cogs = unitsSold * product.unitCost;
        const grossProfit = totalRevenue - cogs;
        const netProfit = grossProfit - totalExpenses - product.initialInvestment;
        
        const inventory = product.initialUnits - unitsSold;

        return {
            totalRevenue,
            netProfit,
            inventory,
            totalSales: unitsSold
        };
    };

    const getProductsWithStats = (): ProductWithStats[] => {
        return Object.values(productsData).map(productData => ({
            ...productData.product,
            stats: calculateProductStats(productData)
        }));
    };

    const handleSelectProduct = (productId: string) => {
        setSelectedProductId(productId);
        setCurrentView('product');
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setSelectedProductId(null);
    };

    const handleCreateProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: `product-${Date.now()}`
        };

        const newProductData: ProductData = {
            product: newProduct,
            transactions: [],
            expenses: []
        };

        setProductsData(prev => ({
            ...prev,
            [newProduct.id]: newProductData
        }));

        setShowProductModal(false);
        setEditingProduct(null);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowProductModal(true);
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProductsData(prev => ({
            ...prev,
            [updatedProduct.id]: {
                ...prev[updatedProduct.id],
                product: updatedProduct
            }
        }));

        if (editingProduct) {
            setShowProductModal(false);
            setEditingProduct(null);
        }
    };

    const handleDeleteProduct = (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            setProductsData(prev => {
                const newData = { ...prev };
                delete newData[productId];
                return newData;
            });

            // If we're currently viewing the deleted product, go back to dashboard
            if (selectedProductId === productId) {
                handleBackToDashboard();
            }
        }
    };

    const updateProductData = (productId: string, updates: Partial<Pick<ProductData, 'transactions' | 'expenses'>>) => {
        setProductsData(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                ...updates
            }
        }));
    };

    const currentProduct = selectedProductId ? productsData[selectedProductId]?.product : null;

    if (currentView === 'product' && currentProduct && selectedProductId) {
        const productData = productsData[selectedProductId];
        
        return (
            <ProductTracker
                product={currentProduct}
                onBack={handleBackToDashboard}
                onUpdateProduct={handleUpdateProduct}
                // We'll need to pass transaction and expense data and handlers
                initialTransactions={productData.transactions}
                initialExpenses={productData.expenses}
                onUpdateTransactions={(transactions) => updateProductData(selectedProductId, { transactions })}
                onUpdateExpenses={(expenses) => updateProductData(selectedProductId, { expenses })}
            />
        );
    }

    return (
        <>
            {showProductModal && (
                <ProductModal
                    product={editingProduct || undefined}
                    onClose={() => {
                        setShowProductModal(false);
                        setEditingProduct(null);
                    }}
                    onSave={editingProduct ? 
                        (productData) => handleUpdateProduct({...editingProduct, ...productData}) : 
                        handleCreateProduct
                    }
                />
            )}
            
            <ProductDashboard
                products={getProductsWithStats()}
                onSelectProduct={handleSelectProduct}
                onCreateProduct={() => setShowProductModal(true)}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
            />
        </>
    );
} 