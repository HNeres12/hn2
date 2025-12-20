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
  // Try AwesomeAPI first - usually most up-to-date
  try {
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      const usdBrl = data.USDBRL;
      console.log('AwesomeAPI quote found:', usdBrl.bid);

      return {
        ticker: 'USD',
        price: parseFloat(usdBrl.bid),
        currency: 'BRL',
        source: 'AwesomeAPI',
        updatedAt: new Date().toISOString(),
      };
    } else {
      console.warn('AwesomeAPI returned status:', response.status);
    }
  } catch (error) {
    console.warn('AwesomeAPI failed:', error);
  }

  // Fallback: Try BCB PTAX API
  try {
    // BCB expects date in MM-dd-yyyy format, try yesterday if today has no data yet
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatDate = (d: Date) => {
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;
    };
    
    // Try today first, then yesterday
    for (const date of [today, yesterday]) {
      const dateStr = formatDate(date);
      const bcbUrl = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${dateStr}'&$format=json`;
      
      console.log('Trying BCB with date:', dateStr);
      
      const bcbResponse = await fetch(bcbUrl);
      
      if (bcbResponse.ok) {
        const bcbData = await bcbResponse.json();
        if (bcbData.value && bcbData.value.length > 0) {
          const lastQuote = bcbData.value[bcbData.value.length - 1];
          console.log('BCB PTAX quote found:', lastQuote.cotacaoVenda);
          return {
            ticker: 'USD',
            price: lastQuote.cotacaoVenda,
            currency: 'BRL',
            source: 'BCB PTAX',
            updatedAt: new Date().toISOString(),
          };
        }
      }
    }
  } catch (error) {
    console.warn('BCB API failed:', error);
  }

  // Last fallback
  const fallbackRate = 5.54;
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
  
  if (!alphaVantageKey) {
    console.warn('ALPHA_VANTAGE_API_KEY not configured');
  } else {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${alphaVantageKey}`;
      console.log(`Fetching Alpha Vantage for ${ticker}`);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Alpha Vantage response for ${ticker}:`, JSON.stringify(data));
        
        // Check for rate limit message
        if (data.Note || data.Information) {
          console.warn('Alpha Vantage rate limited:', data.Note || data.Information);
        } else if (data['Global Quote'] && data['Global Quote']['05. price']) {
          const quote = data['Global Quote'];
          const price = parseFloat(quote['05. price']);
          console.log(`Alpha Vantage price for ${ticker}: $${price}`);
          
          return {
            ticker: ticker.toUpperCase(),
            price: price,
            currency: 'USD',
            source: 'Alpha Vantage',
            updatedAt: new Date().toISOString(),
          };
        } else {
          console.warn('Alpha Vantage returned empty quote for', ticker);
        }
      } else {
        console.error('Alpha Vantage HTTP error:', response.status);
      }
    } catch (error) {
      console.error('Alpha Vantage error:', error);
    }
  }

  // Fallback with approximate values for common stocks
  const stockEstimates: Record<string, number> = {
    'AAPL': 248,
    'GOOGL': 192,
    'MSFT': 438,
    'AMZN': 224,
    'TSLA': 421,
    'NVDA': 134,
    'META': 585,
  };

  const estimatedPrice = stockEstimates[ticker.toUpperCase()] || 100;
  const source = alphaVantageKey 
    ? 'Fallback (Alpha Vantage rate limited)' 
    : 'Estimate (configure ALPHA_VANTAGE_API_KEY)';

  console.log(`Using fallback price for ${ticker}: $${estimatedPrice}`);

  return {
    ticker: ticker.toUpperCase(),
    price: estimatedPrice,
    currency: 'USD',
    source: source,
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
