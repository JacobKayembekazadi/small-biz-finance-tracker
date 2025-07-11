import React, { useState } from 'react';
import { Plus, DollarSign, Package, TrendingUp, ArrowRight, Pencil, Trash2, ShoppingCart, FileSpreadsheet } from 'lucide-react';

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

interface ProductStats {
    totalRevenue: number;
    netProfit: number;
    inventory: number;
    totalSales: number;
}

interface ProductWithStats extends Product {
    stats: ProductStats;
}

interface ProductDashboardProps {
    products: ProductWithStats[];
    onSelectProduct: (productId: string) => void;
    onCreateProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onGoogleSheetsSettings: () => void;
}

const ProductCard: React.FC<{ 
    product: ProductWithStats; 
    onSelect: () => void; 
    onEdit: (e: React.MouseEvent) => void; 
    onDelete: (e: React.MouseEvent) => void; 
}> = ({ product, onSelect, onEdit, onDelete }) => {
    const { stats } = product;
    const profitColor = stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600';
    
    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className={`h-2 ${product.color}`}></div>
            
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${product.color} bg-opacity-10`}>
                            <ShoppingCart size={24} className={`${product.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.description}</p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-2">
                        <button 
                            onClick={onEdit}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            aria-label="Edit product"
                        >
                            <Pencil size={16} />
                        </button>
                        <button 
                            onClick={onDelete}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Delete product"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Revenue</p>
                        <p className="text-lg font-bold text-gray-800">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Profit</p>
                        <p className={`text-lg font-bold ${profitColor}`}>${stats.netProfit.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Sales</p>
                        <p className="text-lg font-bold text-gray-800">{stats.totalSales}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Inventory</p>
                        <p className="text-lg font-bold text-gray-800">{stats.inventory}</p>
                    </div>
                </div>

                <button 
                    onClick={onSelect}
                    className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                    <span>View Details</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

const CreateProductCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400"
    >
        <div className="p-6 h-full flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <div className="p-4 bg-gray-100 rounded-full">
                <Plus size={32} className="text-gray-400" />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-600">Add New Product</h3>
                <p className="text-sm text-gray-400">Start tracking a new business</p>
            </div>
        </div>
    </div>
);

export default function ProductDashboard({ products, onSelectProduct, onCreateProduct, onEditProduct, onDeleteProduct, onGoogleSheetsSettings }: ProductDashboardProps) {
    const totalRevenue = products.reduce((sum, product) => sum + product.stats.totalRevenue, 0);
    const totalProfit = products.reduce((sum, product) => sum + product.stats.netProfit, 0);
    const totalProducts = products.length;

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Business Dashboard</h1>
                        <p className="text-lg text-gray-500">Manage and track all your products</p>
                    </div>
                    <button
                        onClick={onGoogleSheetsSettings}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Google Sheets Integration"
                    >
                        <FileSpreadsheet size={20} />
                        <span>Google Sheets</span>
                    </button>
                </header>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500 rounded-full">
                                <Package size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                                <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-500 rounded-full">
                                <DollarSign size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full ${totalProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Profit</p>
                                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${totalProfit.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onSelect={() => onSelectProduct(product.id)}
                            onEdit={(e) => {
                                e.stopPropagation();
                                onEditProduct(product);
                            }}
                            onDelete={(e) => {
                                e.stopPropagation();
                                onDeleteProduct(product.id);
                            }}
                        />
                    ))}
                    
                    <CreateProductCard onClick={onCreateProduct} />
                </div>

                {products.length === 0 && (
                    <div className="text-center py-16">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Yet</h3>
                        <p className="text-gray-400 mb-6">Start by creating your first product to track</p>
                        <button
                            onClick={onCreateProduct}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Create Your First Product
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 