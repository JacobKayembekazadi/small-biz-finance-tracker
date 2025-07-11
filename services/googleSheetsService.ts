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

interface SheetData {
    id: string;
    date: string;
    type: 'sale' | 'expense';
    amount: number;
    quantity?: number;
    description: string;
    productId: string;
    productName: string;
}

class GoogleSheetsService {
    private apiKey: string;
    private spreadsheetId: string;
    private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

    constructor() {
        this.apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';
        this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
        
        if (!this.apiKey || !this.spreadsheetId) {
            console.warn('Google Sheets API key or Spreadsheet ID not configured');
        }
    }

    private isConfigured(): boolean {
        return !!(this.apiKey && this.spreadsheetId && 
                  this.apiKey !== 'PLACEHOLDER_GOOGLE_SHEETS_API_KEY' && 
                  this.spreadsheetId !== 'PLACEHOLDER_SPREADSHEET_ID');
    }

    // Initialize the spreadsheet with headers
    async initializeSpreadsheet(): Promise<boolean> {
        if (!this.isConfigured()) {
            console.log('Google Sheets not configured, skipping initialization');
            return false;
        }

        try {
            const headers = [
                'ID', 'Date', 'Type', 'Amount', 'Quantity', 'Description', 'Product ID', 'Product Name'
            ];

            // Clear existing data and add headers
            await this.clearSheet();
            await this.appendRows([headers]);
            
            console.log('Google Sheets initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Sheets:', error);
            return false;
        }
    }

    // Clear all data from the sheet
    private async clearSheet(): Promise<void> {
        const url = `${this.baseUrl}/${this.spreadsheetId}/values/Sheet1:clear?key=${this.apiKey}`;
        
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    // Append rows to the sheet
    private async appendRows(rows: string[][]): Promise<void> {
        const url = `${this.baseUrl}/${this.spreadsheetId}/values/Sheet1:append?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: rows
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to append rows: ${response.statusText}`);
        }
    }

    // Convert log entry to sheet row format
    private logEntryToRow(entry: LogEntry): string[] {
        return [
            entry.id,
            new Date(entry.date).toLocaleString(),
            entry.type,
            entry.amount.toString(),
            entry.type === 'sale' ? (entry as Transaction).quantity.toString() : '',
            entry.description,
            entry.productId,
            entry.productName
        ];
    }

    // Add a single transaction or expense
    async addLogEntry(entry: LogEntry): Promise<boolean> {
        if (!this.isConfigured()) {
            console.log('Google Sheets not configured, skipping log entry');
            return false;
        }

        try {
            const row = this.logEntryToRow(entry);
            await this.appendRows([row]);
            console.log(`Added ${entry.type} to Google Sheets:`, entry.description);
            return true;
        } catch (error) {
            console.error('Failed to add log entry to Google Sheets:', error);
            return false;
        }
    }

    // Sync all data to Google Sheets (full replacement)
    async syncAllData(allEntries: LogEntry[]): Promise<boolean> {
        if (!this.isConfigured()) {
            console.log('Google Sheets not configured, skipping sync');
            return false;
        }

        try {
            // Clear and reinitialize
            await this.initializeSpreadsheet();
            
            if (allEntries.length > 0) {
                // Convert all entries to rows
                const rows = allEntries.map(entry => this.logEntryToRow(entry));
                await this.appendRows(rows);
            }
            
            console.log(`Synced ${allEntries.length} entries to Google Sheets`);
            return true;
        } catch (error) {
            console.error('Failed to sync data to Google Sheets:', error);
            return false;
        }
    }

    // Read all data from Google Sheets
    async readAllData(): Promise<LogEntry[]> {
        if (!this.isConfigured()) {
            console.log('Google Sheets not configured, returning empty data');
            return [];
        }

        try {
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/Sheet1?key=${this.apiKey}`;
            
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

    // Test connection to Google Sheets
    async testConnection(): Promise<{ success: boolean; message: string }> {
        if (!this.isConfigured()) {
            return {
                success: false,
                message: 'Google Sheets not configured. Please set your API key and Spreadsheet ID.'
            };
        }

        try {
            const url = `${this.baseUrl}/${this.spreadsheetId}?key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: `Connected to spreadsheet: ${data.properties?.title || 'Unknown'}`
                };
            } else {
                return {
                    success: false,
                    message: `Failed to connect: ${response.status} ${response.statusText}`
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
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
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService; 