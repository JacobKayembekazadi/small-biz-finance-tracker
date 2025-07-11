import React, { useState } from 'react';
import { X } from 'lucide-react';

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

interface ProductModalProps {
    product?: Product;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'>) => void;
}

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {children}
        </div>
    </div>
);

const FormInput: React.FC<{
    label: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    step?: string;
    required?: boolean;
    multiline?: boolean;
}> = ({ label, type, value, onChange, placeholder, step, required = false, multiline = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        {multiline ? (
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                step={step}
                required={required}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
        )}
    </div>
);

const ColorOption: React.FC<{ 
    color: string; 
    selected: boolean; 
    onClick: () => void;
    label: string;
}> = ({ color, selected, onClick, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-3 rounded-lg border-2 transition-all ${
            selected ? 'border-gray-400 scale-105' : 'border-gray-200 hover:border-gray-300'
        }`}
        title={label}
    >
        <div className={`w-6 h-6 rounded-full ${color}`}></div>
    </button>
);

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        initialInvestment: product?.initialInvestment || 0,
        unitCost: product?.unitCost || 0,
        sellingPrice: product?.sellingPrice || 0,
        initialUnits: product ? Math.floor(product.initialInvestment / (product.unitCost || 1)) : 0,
        color: product?.color || 'bg-blue-500',
        icon: product?.icon || 'package'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const colorOptions = [
        { value: 'bg-blue-500', label: 'Blue' },
        { value: 'bg-green-500', label: 'Green' },
        { value: 'bg-purple-500', label: 'Purple' },
        { value: 'bg-red-500', label: 'Red' },
        { value: 'bg-yellow-500', label: 'Yellow' },
        { value: 'bg-indigo-500', label: 'Indigo' },
        { value: 'bg-pink-500', label: 'Pink' },
        { value: 'bg-teal-500', label: 'Teal' }
    ];

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.initialInvestment <= 0) {
            newErrors.initialInvestment = 'Initial investment must be greater than 0';
        }

        if (formData.unitCost <= 0) {
            newErrors.unitCost = 'Unit cost must be greater than 0';
        }

        if (formData.sellingPrice <= 0) {
            newErrors.sellingPrice = 'Selling price must be greater than 0';
        }

        if (formData.sellingPrice <= formData.unitCost) {
            newErrors.sellingPrice = 'Selling price must be higher than unit cost';
        }

        if (formData.initialUnits <= 0) {
            newErrors.initialUnits = 'Initial units must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSave(formData);
        }
    };

    const isEditing = !!product;

    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditing ? 'Edit Product' : 'Create New Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormInput
                        label="Product Name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Luxury Watches, Electronics"
                        required
                    />
                    {errors.name && <p className="text-red-500 text-sm -mt-2">{errors.name}</p>}

                    <FormInput
                        label="Description"
                        type="text"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Brief description of your product line"
                        multiline
                        required
                    />
                    {errors.description && <p className="text-red-500 text-sm -mt-2">{errors.description}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FormInput
                                label="Initial Investment ($)"
                                type="number"
                                value={formData.initialInvestment}
                                onChange={(e) => handleChange('initialInvestment', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                            {errors.initialInvestment && <p className="text-red-500 text-sm mt-1">{errors.initialInvestment}</p>}
                        </div>

                        <div>
                            <FormInput
                                label="Unit Cost ($)"
                                type="number"
                                value={formData.unitCost}
                                onChange={(e) => handleChange('unitCost', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                            {errors.unitCost && <p className="text-red-500 text-sm mt-1">{errors.unitCost}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FormInput
                                label="Selling Price ($)"
                                type="number"
                                value={formData.sellingPrice}
                                onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                            {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>}
                        </div>

                        <div>
                            <FormInput
                                label="Initial Units"
                                type="number"
                                value={formData.initialUnits}
                                onChange={(e) => handleChange('initialUnits', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                required
                            />
                            {errors.initialUnits && <p className="text-red-500 text-sm mt-1">{errors.initialUnits}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme Color</label>
                        <div className="grid grid-cols-4 gap-3">
                            {colorOptions.map((option) => (
                                <ColorOption
                                    key={option.value}
                                    color={option.value}
                                    selected={formData.color === option.value}
                                    onClick={() => handleChange('color', option.value)}
                                    label={option.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Profit Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Business Overview</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Profit per unit: <span className="font-semibold text-green-600">
                                ${Math.max(0, formData.sellingPrice - formData.unitCost).toFixed(2)}
                            </span></p>
                            <p>Initial units: <span className="font-semibold">
                                {formData.initialUnits}
                            </span></p>
                            <p>Total inventory value: <span className="font-semibold text-blue-600">
                                ${(formData.initialUnits * formData.unitCost).toFixed(2)}
                            </span></p>
                            <p>Potential max revenue: <span className="font-semibold text-purple-600">
                                ${(formData.initialUnits * formData.sellingPrice).toFixed(2)}
                            </span></p>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            {isEditing ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
} 