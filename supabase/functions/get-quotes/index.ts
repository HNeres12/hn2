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
  isEstimate?: boolean;
}

async function getCryptoQuote(ticker: string): Promise<QuoteResponse> {
  const coinGeckoIds: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
  };

  // Fallback prices for when API is rate limited (approximate BRL values)
  const fallbackPrices: Record<string, number> = {
    'BTC': 490000,
    'ETH': 16500,
    'SOL': 1100,
    'BNB': 3800,
    'XRP': 13,
    'ADA': 5.5,
    'DOGE': 2.0,
  };

  const coinId = coinGeckoIds[ticker.toUpperCase()] || ticker.toLowerCase();
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl,usd`
    );
    
    if (!response.ok) {
      // Handle rate limiting gracefully
      if (response.status === 429) {
        console.warn(`CoinGecko rate limited for ${ticker}, using fallback`);
        const fallbackPrice = fallbackPrices[ticker.toUpperCase()] || 1000;
        return {
          ticker: ticker.toUpperCase(),
          price: fallbackPrice,
          currency: 'BRL',
          source: 'Fallback (rate limited)',
          updatedAt: new Date().toISOString(),
          isEstimate: true,
        };
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const priceData = data[coinId];

    if (!priceData) {
      console.warn(`Ticker ${ticker} not found, using fallback`);
      const fallbackPrice = fallbackPrices[ticker.toUpperCase()] || 1000;
      return {
        ticker: ticker.toUpperCase(),
        price: fallbackPrice,
        currency: 'BRL',
        source: 'Fallback (not found)',
        updatedAt: new Date().toISOString(),
        isEstimate: true,
      };
    }

    return {
      ticker: ticker.toUpperCase(),
      price: priceData.brl,
      currency: 'BRL',
      source: 'CoinGecko',
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`CoinGecko error for ${ticker}:`, error);
    // Return fallback instead of throwing
    const fallbackPrice = fallbackPrices[ticker.toUpperCase()] || 1000;
    console.log(`Using fallback price for ${ticker}: R$ ${fallbackPrice}`);
    return {
      ticker: ticker.toUpperCase(),
      price: fallbackPrice,
      currency: 'BRL',
      source: 'Fallback (error)',
      updatedAt: new Date().toISOString(),
      isEstimate: true,
    };
  }
}

async function getDollarQuote(): Promise<QuoteResponse> {
  // Try AwesomeAPI first
  try {
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
    
    if (response.ok) {
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
  } catch (error) {
    console.warn('AwesomeAPI failed, using fallback:', error);
  }

  // Fallback: Use approximate rate (updated periodically)
  // In production, you could cache the last known rate
  const fallbackRate = 6.15; // Approximate USD/BRL rate as of Dec 2024
  
  console.log('Using fallback dollar rate:', fallbackRate);
  
  return {
    ticker: 'USD',
    price: fallbackRate,
    currency: 'BRL',
    source: 'Fallback (estimated)',
    updatedAt: new Date().toISOString(),
    isEstimate: true,
  };
}

async function getUSStockQuote(ticker: string): Promise<QuoteResponse> {
  const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  
  if (alphaVantageKey) {
    try {
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
    } catch (error) {
      console.error('Alpha Vantage error:', error);
    }
  }

  // Return a placeholder with warning - don't throw error
  // Use approximate values for common stocks
  const stockEstimates: Record<string, number> = {
    'AAPL': 250,
    'GOOGL': 175,
    'MSFT': 430,
    'AMZN': 225,
    'TSLA': 450,
    'NVDA': 140,
  };

  const estimatedPrice = stockEstimates[ticker.toUpperCase()] || 100;

  console.log(`Using estimated price for ${ticker}: $${estimatedPrice}`);

  return {
    ticker: ticker.toUpperCase(),
    price: estimatedPrice,
    currency: 'USD',
    source: 'Estimate (configure ALPHA_VANTAGE_API_KEY for real quotes)',
    updatedAt: new Date().toISOString(),
    isEstimate: true,
  };
}

async function getTreasuryQuote(): Promise<QuoteResponse> {
  // Current Selic rate (Dec 2024)
  const selicRate = 12.25;

  return {
    ticker: 'SELIC',
    price: selicRate,
    currency: 'BRL',
    source: 'BCB (approximate)',
    updatedAt: new Date().toISOString(),
  };
}

serve(async (req) => {
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
