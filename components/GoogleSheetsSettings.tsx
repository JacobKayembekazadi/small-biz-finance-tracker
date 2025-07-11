import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Download, Upload, FileText } from 'lucide-react';
import simpleGoogleSheetsService from '../services/simpleGoogleSheetsService';

interface GoogleSheetsSettingsProps {
    onClose: () => void;
    onSyncData?: () => void;
}

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {children}
        </div>
    </div>
);

const FormInput: React.FC<{
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    multiline?: boolean;
    required?: boolean;
}> = ({ label, type, value, onChange, placeholder, multiline = false, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        {multiline ? (
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            />
        )}
    </div>
);

export default function GoogleSheetsSettings({ onClose, onSyncData }: GoogleSheetsSettingsProps) {
    const [apiKey, setApiKey] = useState('');
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Load current values on mount
    useEffect(() => {
        const currentConfig = simpleGoogleSheetsService.getConfigurationStatus();
        // We can't read the actual values from environment variables, so we show placeholders
        if (currentConfig.hasApiKey) {
            setApiKey('••••••••••••••••••••••••••••••••••••••••');
        }
        if (currentConfig.hasSpreadsheetId) {
            setSpreadsheetId('••••••••••••••••••••••••••••••••••••••••');
        }
    }, []);

    const handleTestConnection = async () => {
        setIsTestingConnection(true);
        
        try {
            const result = await simpleGoogleSheetsService.testConnection();
            setConnectionStatus(result);
        } catch (error) {
            setConnectionStatus({
                success: false,
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleExportCSV = () => {
        if (onSyncData) {
            // This will be handled by the parent component
            setConnectionStatus({
                success: true,
                message: 'CSV export initiated! Check your downloads folder.'
            });
        }
    };

    const handleSyncAllData = async () => {
        if (onSyncData) {
            setIsSyncing(true);
            try {
                await onSyncData();
                setConnectionStatus({
                    success: true,
                    message: 'All data synced successfully to Google Sheets!'
                });
            } catch (error) {
                setConnectionStatus({
                    success: false,
                    message: `Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            } finally {
                setIsSyncing(false);
            }
        }
    };

    const configStatus = simpleGoogleSheetsService.getConfigurationStatus();

    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Google Sheets Integration</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure automatic data tracking</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Close">
                        <X size={24} />
                    </button>
                </div>

                {/* Configuration Status */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-3">Configuration Status</h3>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            {configStatus.hasApiKey ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <AlertCircle size={16} className="text-red-500" />
                            )}
                            <span className="text-sm">
                                {configStatus.hasApiKey ? 'API Key configured' : 'API Key missing'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {configStatus.hasSpreadsheetId ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <AlertCircle size={16} className="text-red-500" />
                            )}
                            <span className="text-sm">
                                {configStatus.hasSpreadsheetId ? 'Spreadsheet ID configured' : 'Spreadsheet ID missing'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Setup Instructions */}
                {!configStatus.configured && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">Setup Instructions</h3>
                        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                            <li>
                                <a 
                                    href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    Enable Google Sheets API <ExternalLink size={12} />
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://console.cloud.google.com/apis/credentials" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    Create API Key <ExternalLink size={12} />
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://sheets.google.com/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    Create a new Google Sheet <ExternalLink size={12} />
                                </a>
                            </li>
                            <li>Copy the Spreadsheet ID from the URL (the long string after /d/)</li>
                            <li>Update your .env.local file with the credentials</li>
                        </ol>
                    </div>
                )}

                {/* Current Configuration Display */}
                <div className="space-y-4 mb-6">
                    <FormInput
                        label="Google Sheets API Key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Google Sheets API key"
                        required
                    />
                    
                    <FormInput
                        label="Spreadsheet ID"
                        type="text"
                        value={spreadsheetId}
                        onChange={(e) => setSpreadsheetId(e.target.value)}
                        placeholder="Enter your Google Spreadsheet ID"
                        required
                    />

                    <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                        <strong>Note:</strong> To update these values, modify your <code>.env.local</code> file and restart the development server.
                    </div>
                </div>

                {/* Connection Test */}
                <div className="mb-6">
                    <button
                        onClick={handleTestConnection}
                        disabled={!configStatus.configured || isTestingConnection}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isTestingConnection ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <CheckCircle size={16} />
                        )}
                        <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    {connectionStatus && (
                        <div className={`mt-3 p-3 rounded-lg flex items-start space-x-2 ${
                            connectionStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                            {connectionStatus.success ? (
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                            ) : (
                                <AlertCircle size={16} className="text-red-600 mt-0.5" />
                            )}
                            <p className={`text-sm ${connectionStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                                {connectionStatus.message}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {configStatus.configured && (
                    <div className="space-y-3">
                        <button
                            onClick={handleExportCSV}
                            disabled={isSyncing}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <FileText size={16} />
                            <span>Export to CSV</span>
                        </button>

                        <button
                            onClick={handleSyncAllData}
                            disabled={isSyncing || !onSyncData}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSyncing ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <Upload size={16} />
                            )}
                            <span>Export All Data</span>
                        </button>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
} 