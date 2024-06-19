/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
// https://www.farcaster.in/api/tokens/tn100x
const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'
interface TokenPriceResponse {
  stats: {
    base_token_price_usd: string;
  };
}
async function fetchTokenPrice(token: string): Promise<string> {
  try {
    const res = await fetch(`https://www.farcaster.in/api/tokens/${token}`);
    if (!res.ok) return "-";
    const data: TokenPriceResponse = await res.json();
    const worthADollar = 1 / parseFloat(data?.stats.base_token_price_usd);
    return formatToSignificantFigures(worthADollar);
  } catch (error) {
    console.error(`Error fetching data for ${token}:`, error);
    return "-";
  }
}

async function getTokenPrices(
  tokens: string[]
): Promise<{ [key: string]: string }> {
  const fetchPromises = tokens.map((token) => fetchTokenPrice(token));

  const results = await Promise.allSettled(fetchPromises);
  const prices: { [key: string]: string } = {};

  results.forEach((result, index) => {
    prices[tokens[index]] = result.status === "fulfilled" ? result.value : "-";
  });

  return prices;
}

function formatToSignificantFigures(
  value: number,
  figures: number = 4
): string {
  if (value === 0) return "0";
  const absValue = Math.abs(value);
  const magnitude = Math.floor(Math.log10(absValue));
  const factor = Math.pow(10, figures - magnitude - 1);
  const roundedValue = Math.round(value * factor) / factor;
  return roundedValue.toString();
}

app.frame("/", async (c) => {
  const tokens = ["degen", "farther", "tn100x"];
  const prices = await getTokenPrices(tokens);
  console.log(prices);

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#8863d1",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h1
            style={{
              fontSize: "4rem",
              fontWeight: "bold",
            }}
          >
            Tip Exchange Rate
          </h1>
          <div
            style={{
              display: "flex",
              backgroundColor: "white",
              padding: "2rem 4rem",
              color: "black",
              borderRadius: "1rem",
              margin: "2rem",
              justifyContent: "center",
              alignItems: "center",
              gap: "3rem",
              fontSize: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>💰</h1>
              <h1
                style={{
                  lineHeight: "0.25rem",
                }}
              >
                $1
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>=</h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>🎩</h1>
              <h1
                style={{
                  lineHeight: "0.25rem",
                }}
              >
                {prices.degen}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>=</h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>✨</h1>
              <h1
                style={{
                  lineHeight: "0.25rem",
                }}
              >
                {prices.farther}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>=</h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>🍖</h1>
              <h1
                style={{
                  lineHeight: "0.25rem",
                }}
              >
                {prices.tn100x}
              </h1>
            </div>
          </div>
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter token name" />, // Add name attribute to capture the input
      <Button action="/token">Token Price</Button>,
    ],
  });
});

app.frame("/token", async (c) => {
  const { inputText } = c;
  console.log("//////\\\\//////");
  console.log(inputText);
  let image;
  if (!inputText) {
    image = <div style={{ display: "flex" }}>Please enter a token name</div>;
  } else {
    const price = await fetchTokenPrice(inputText);
    console.log("price", price);

    if (price == "-") {
      image = (
        <div style={{ display: "flex" }}>No data found for {inputText}</div>
      );
    } else {
      image = <div style={{ display: "flex" }}>{price}</div>;
    }
  }
  return c.res({
    image: image,
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
