# Multi-Business Finance Tracker

A comprehensive financial tracking dashboard for managing multiple product lines with automatic Google Sheets synchronization.

## Features

- **Multi-Product Dashboard** - Track finances for different product lines
- **Individual Product Trackers** - Detailed analytics per product
- **Google Sheets Integration** - Automatic data logging and backup
- **Real-time Analytics** - Revenue, profit, inventory, and performance metrics
- **Data Persistence** - Local storage + cloud backup via Google Sheets

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in [.env.local](.env.local):
   ```
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Google Sheets Setup

1. **Enable Google Sheets API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
   - Enable the Google Sheets API

2. **Create API Key**:
   - Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
   - Create credentials → API Key
   - Copy your API key

3. **Create Spreadsheet**:
   - Go to [Google Sheets](https://sheets.google.com/)
   - Create a new spreadsheet
   - Copy the Spreadsheet ID from the URL (long string after `/d/`)

4. **Configure App**:
   - Update `.env.local` with your credentials
   - Restart the development server
   - Click "Google Sheets" button in the dashboard
   - Test connection and initialize spreadsheet

## Data Structure

Your Google Sheet will automatically track:
- Transaction ID
- Date & Time
- Type (Sale/Expense)
- Amount
- Quantity (for sales)
- Description
- Product ID
- Product Name

## Usage

1. **Create Products** - Add different product lines with their costs and pricing
2. **Track Transactions** - Record sales and expenses for each product
3. **View Analytics** - Monitor performance across all products
4. **Google Sheets Sync** - All data automatically syncs to your spreadsheet
