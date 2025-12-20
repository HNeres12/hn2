import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteRequest {
  type: 'crypto' | 'stock_us' | 'treasury' | 'dollar';
  ticker?: string;
}

interface QuoteResponse {
  ticker: string;
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
}

async function getCryptoQuote(ticker: string): Promise<QuoteResponse> {
  // Map common tickers to CoinGecko IDs
  const coinGeckoIds: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
  };

  const coinId = coinGeckoIds[ticker.toUpperCase()] || ticker.toLowerCase();
  
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl,usd`
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  const priceData = data[coinId];

  if (!priceData) {
    throw new Error(`Ticker ${ticker} not found`);
  }

  return {
    ticker: ticker.toUpperCase(),
    price: priceData.brl,
    currency: 'BRL',
    source: 'CoinGecko',
    updatedAt: new Date().toISOString(),
  };
}

async function getDollarQuote(): Promise<QuoteResponse> {
  // Use AwesomeAPI for BRL/USD exchange rate (free, no key required)
  const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
  
  if (!response.ok) {
    throw new Error(`AwesomeAPI error: ${response.status}`);
  }

  const data = await response.json();
  const usdBrl = data.USDBRL;

  return {
    ticker: 'USD',
    price: parseFloat(usdBrl.bid),
    currency: 'BRL',
    source: 'AwesomeAPI',
    updatedAt: new Date().toISOString(),
  };
}

async function getUSStockQuote(ticker: string): Promise<QuoteResponse> {
  // Note: For production, you'd need Alpha Vantage, Yahoo Finance, or similar API
  // This is a placeholder that returns mock data
  // To enable real quotes, add ALPHA_VANTAGE_API_KEY secret
  
  const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  
  if (alphaVantageKey) {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${alphaVantageKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      const quote = data['Global Quote'];
      
      if (quote && quote['05. price']) {
        return {
          ticker: ticker.toUpperCase(),
          price: parseFloat(quote['05. price']),
          currency: 'USD',
          source: 'Alpha Vantage',
          updatedAt: new Date().toISOString(),
        };
      }
    }
  }

  // Fallback: return indication that API key is needed
  throw new Error(`Para cotações de ações americanas, configure a chave ALPHA_VANTAGE_API_KEY`);
}

async function getTreasuryQuote(): Promise<QuoteResponse> {
  // Tesouro Selic uses CDI rate + spread
  // This would ideally use BCB API, but for now we'll use an approximation
  // In production, integrate with Tesouro Direto API or BCB
  
  // Current Selic rate approximation (would be fetched from BCB API)
  const selicRate = 13.75; // Annual rate

  return {
    ticker: 'SELIC',
    price: selicRate,
    currency: 'BRL',
    source: 'BCB (approximate)',
    updatedAt: new Date().toISOString(),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ticker }: QuoteRequest = await req.json();
    
    console.log(`Fetching quote for type: ${type}, ticker: ${ticker}`);

    let quote: QuoteResponse;

    switch (type) {
      case 'crypto':
        if (!ticker) throw new Error('Ticker required for crypto');
        quote = await getCryptoQuote(ticker);
        break;
      case 'dollar':
        quote = await getDollarQuote();
        break;
      case 'stock_us':
        if (!ticker) throw new Error('Ticker required for US stocks');
        quote = await getUSStockQuote(ticker);
        break;
      case 'treasury':
        quote = await getTreasuryQuote();
        break;
      default:
        throw new Error(`Unknown quote type: ${type}`);
    }

    console.log(`Quote fetched successfully:`, quote);

    return new Response(JSON.stringify(quote), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching quote:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
