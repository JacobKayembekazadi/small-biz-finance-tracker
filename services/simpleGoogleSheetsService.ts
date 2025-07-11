interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'sale';
    quantity: number;
    description: string;
    productId: string;
    productName: string;
}

interface Expense {
    id: string;
    date: string;
    amount: number;
    type: 'expense';
    description: string;
    productId: string;
    productName: string;
}

type LogEntry = Transaction | Expense;

class SimpleGoogleSheetsService {
    private apiKey: string;
    private spreadsheetId: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';
        this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
    }

    private isConfigured(): boolean {
        return !!(this.apiKey && this.spreadsheetId && 
                  this.apiKey !== 'PLACEHOLDER_GOOGLE_SHEETS_API_KEY' && 
                  this.spreadsheetId !== 'PLACEHOLDER_SPREADSHEET_ID');
    }

    // Test connection to Google Sheets
    async testConnection(): Promise<{ success: boolean; message: string }> {
        if (!this.isConfigured()) {
            return {
                success: false,
                message: 'Google Sheets not configured. Please set your API key and Spreadsheet ID.'
            };
        }

        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: `Connected to spreadsheet: ${data.properties?.title || 'Unknown'}`
                };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    message: `Failed to connect: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    // Export data as CSV for manual import
    exportToCSV(allEntries: LogEntry[]): string {
        const headers = ['ID', 'Date', 'Type', 'Amount', 'Quantity', 'Description', 'Product ID', 'Product Name'];
        
        const rows = allEntries.map(entry => [
            entry.id,
            new Date(entry.date).toLocaleString(),
            entry.type,
            entry.amount.toString(),
            entry.type === 'sale' ? (entry as Transaction).quantity.toString() : '',
            entry.description,
            entry.productId,
            entry.productName
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // Download CSV file
    downloadCSV(allEntries: LogEntry[], filename: string = 'finance-data.csv'): void {
        const csvContent = this.exportToCSV(allEntries);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Get configuration status
    getConfigurationStatus(): { configured: boolean; hasApiKey: boolean; hasSpreadsheetId: boolean } {
        const hasApiKey = !!(this.apiKey && this.apiKey !== 'PLACEHOLDER_GOOGLE_SHEETS_API_KEY');
        const hasSpreadsheetId = !!(this.spreadsheetId && this.spreadsheetId !== 'PLACEHOLDER_SPREADSHEET_ID');
        
        return {
            configured: this.isConfigured(),
            hasApiKey,
            hasSpreadsheetId
        };
    }

    // Read data from Google Sheets (read-only)
    async readAllData(): Promise<LogEntry[]> {
        if (!this.isConfigured()) {
            console.log('Google Sheets not configured, returning empty data');
            return [];
        }

        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1?key=${this.apiKey}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to read data: ${response.statusText}`);
            }

            const data = await response.json();
            const rows = data.values || [];
            
            // Skip header row
            const dataRows = rows.slice(1);
            
            const entries: LogEntry[] = dataRows.map((row: string[]) => {
                const [id, date, type, amount, quantity, description, productId, productName] = row;
                
                const baseEntry = {
                    id: id || `imported-${Date.now()}-${Math.random()}`,
                    date: new Date(date).toISOString(),
                    amount: parseFloat(amount) || 0,
                    description: description || '',
                    productId: productId || '',
                    productName: productName || ''
                };

                if (type === 'sale') {
                    return {
                        ...baseEntry,
                        type: 'sale' as const,
                        quantity: parseInt(quantity) || 1
                    } as Transaction;
                } else {
                    return {
                        ...baseEntry,
                        type: 'expense' as const
                    } as Expense;
                }
            });

            console.log(`Read ${entries.length} entries from Google Sheets`);
            return entries;
        } catch (error) {
            console.error('Failed to read data from Google Sheets:', error);
            return [];
        }
    }
}

// Export singleton instance
export const simpleGoogleSheetsService = new SimpleGoogleSheetsService();
export default simpleGoogleSheetsService; 