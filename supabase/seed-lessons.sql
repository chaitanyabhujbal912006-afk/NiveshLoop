-- NiveshLoop — Lesson seed data
-- Run this in the Supabase SQL editor after schema.sql.
-- Slugs and unlocks_action values match LOGIC.md §1 exactly.
-- Body text for all 15 lessons is PLACEHOLDER — replace before launch.

INSERT INTO lessons (slug, title, body_md, order_index, unlocks_action) VALUES

(
  'what-is-a-stock',
  'What is a stock?',
  E'# What is a stock?\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nA stock (also called a *share* or *equity*) represents a small ownership stake in a company. When a company wants to raise money to grow, it can divide its ownership into millions of tiny pieces and sell them to the public. When you buy a share of Reliance Industries, you own a tiny fraction of that business — its factories, its profits, and yes, its losses too.\n\n## Why do companies issue shares?\n\nInstead of borrowing money (which they''d have to repay with interest), companies can raise funds by selling shares. Early investors in companies like Infosys who held their shares for decades saw enormous returns — but they also took on the risk that the company might not succeed.\n\n## Why do share prices move?\n\nA share''s price is simply what someone is willing to pay for it right now. If more people want to buy than sell, the price rises. If more want to sell than buy, it falls. This happens every second during market hours (9:15 AM – 3:30 PM IST, Monday–Friday on BSE/NSE).\n\n## What you''ll do next\n\nNow that you understand what a share is, you''re going to buy one — using ₹1,00,000 in simulated cash. This is the first entry in your passbook.\n\n---\n*Completing this lesson unlocks your trading ticket for the first time.*',
  1,
  'first_trade'
),

(
  'how-prices-move',
  'How prices move',
  E'# How prices move\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nYou bought your first share in the last lesson. But why does its price change every second, even when nothing obvious is happening to the company?\n\n## Supply and demand\n\nShare prices are set by an auction. Thousands of buyers place *bid* orders (prices they''re willing to pay) and thousands of sellers place *ask* orders (prices they''ll accept). The exchange matches them.\n\nWhen good news breaks — a strong earnings report, a new contract, a government policy benefit — more buyers appear and fewer sellers, so the price rises. The reverse is also true.\n\n## Price ≠ value\n\nThis is the hardest lesson for new investors to internalise: the *price* of a share at any given moment is not the same as its *value*. Price is what the market agrees to right now, driven by emotion and information. Value is what a business is genuinely worth based on its future earnings — and that takes work to estimate.\n\n## What this means for you\n\nWhen you see a stock fall 3% today, that doesn''t mean the company is 3% worse. It might mean a large fund sold its position for reasons unrelated to your investment thesis. Understanding this helps you avoid panic-selling — which we''ll talk about later.\n\n---\n*This lesson sets up context for Lesson 6 (Reading a candlestick chart).*',
  2,
  NULL
),

(
  'order-types',
  'Order types: market vs. limit',
  E'# Order types: market vs. limit\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nEvery trade you place is called an *order*. There are two main types you''ll use as a beginner.\n\n## Market orders\n\nA market order means: "Buy/sell this share right now at whatever the current price is." It''s fast and guaranteed to execute — but you don''t control the exact price. In a fast-moving market, you might pay slightly more (or sell for slightly less) than you expected. This difference is called *slippage*.\n\nNiveshLoop has been using market orders for your simulated trades so far.\n\n## Limit orders\n\nA limit order means: "Buy this share, but only if the price drops to ₹X or below" (or "Sell only if it rises to ₹Y or above.") This gives you price control, but the trade might not execute at all if the price never reaches your limit.\n\n**Example:** TCS is trading at ₹3,900. You place a limit buy at ₹3,750. If TCS drops to ₹3,750, your order executes. If it never does, nothing happens.\n\n## Which should you use?\n\nFor most small, patient investors, limit orders are better — they prevent you from overpaying in the heat of the moment. We''ll use them from this lesson onwards.\n\n---\n*Completing this lesson unlocks the market vs. limit option on your trade ticket.*',
  3,
  'limit_order_option'
),

(
  'diversification',
  'Diversification',
  E'# Diversification\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\n"Don''t put all your eggs in one basket" is the oldest rule in investing, and it''s still the most important one.\n\n## What is diversification?\n\nDiversification means spreading your investments across different companies, sectors, and asset classes, so that a disaster in one area doesn''t wipe out your entire portfolio.\n\n**Example:** If you held only Jet Airways in 2019, you lost everything when it shut down. If you''d held 10 airline + non-airline stocks, Jet''s collapse would have been painful but survivable.\n\n## Sectors in the Indian market\n\nNSE/BSE stocks are grouped into sectors: IT, Pharma, FMCG, Auto, Banking, Energy, Infrastructure, and more. A diversified portfolio holds stocks from at least 3–4 different sectors.\n\n## In your simulated portfolio\n\nLook at your current holdings. Are they all in one sector? If yes, that''s concentration risk — even in a simulation, it''s worth noticing.\n\n## The concentration nudge\n\nAfter this lesson, if you try to place a buy that would put more than 40% of your portfolio value into one stock, NiveshLoop will gently point that out. It won''t stop you — it''s your money, simulated or otherwise — but it will make sure you''re doing it consciously.\n\n---\n*Completing this lesson activates the concentration warning on your trade form.*',
  4,
  'concentration_nudge'
),

(
  'stop-losses',
  'Stop-losses',
  E'# Stop-losses\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nOne of the most common beginner mistakes is holding a losing position for too long — hoping it will "come back" — until the loss becomes catastrophic. A stop-loss is a simple tool to prevent this.\n\n## What is a stop-loss?\n\nA stop-loss is a pre-set exit price. You decide *before* you buy: "If this stock falls to ₹X, I''ll sell automatically, no matter what." This takes the emotional decision out of your hands in the moment when emotion is most dangerous.\n\n**Example:** You buy INFY at ₹1,500. You set a stop-loss at ₹1,350 (10% below). If INFY drops to ₹1,350, your position closes automatically. Your maximum loss is locked in at 10%.\n\n## Why do most beginners skip this?\n\nBecause setting a stop-loss feels like admitting the trade might fail. But every professional trader uses them — because they know they''ll be wrong sometimes, and the goal is to make sure being wrong doesn''t ruin them.\n\n## The right stop-loss level\n\nThere''s no single correct answer. Common approaches:\n- **Fixed percentage**: e.g. always 8–10% below your buy price\n- **Support levels**: below a recent price floor the stock has repeatedly bounced off\n- **ATR-based**: using the stock''s average daily volatility (more advanced)\n\nFor now, practise setting a stop-loss on every buy — even a rough one. The habit matters more than the exact number.\n\n---\n*Completing this lesson adds a stop-loss field to every future buy order.*',
  5,
  'stop_loss_nudge'
),

(
  'reading-a-candlestick',
  'Reading a candlestick chart',
  E'# Reading a candlestick chart\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nAlmost every trading platform shows candlestick charts. Once you know how to read them, you''ll never want to go back to a plain line chart.\n\n## The anatomy of a candle\n\nEach "candle" represents one time period (1 day, 1 hour, 5 minutes, etc.) and contains four pieces of information:\n\n- **Open**: the price when the period started\n- **Close**: the price when the period ended\n- **High**: the highest price reached during the period\n- **Low**: the lowest price reached\n\nA **green (or white) candle** means the close was higher than the open — the stock went up. A **red (or black) candle** means the close was lower — it went down. The thin lines above and below (called *wicks* or *shadows*) show the high and low.\n\n## What to look for\n\n- **Long wicks**: indicate volatility and indecision — the price moved far but then reversed\n- **Doji candle**: open and close are almost equal — the market is genuinely undecided\n- **Large body, short wicks**: strong trend in that direction, with conviction\n\n---\n*Completing this lesson upgrades your holding detail view to show a candlestick chart.*',
  6,
  'chart_view'
),

(
  'index-funds-vs-stock-picking',
  'Index funds vs. stock picking',
  E'# Index funds vs. stock picking\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nMost professional fund managers fail to beat the Nifty 50 index over 10+ years. This is one of the most uncomfortable facts in finance — and one of the most useful ones for individual investors.\n\n## What is an index fund?\n\nAn index fund (or ETF — Exchange Traded Fund) simply buys all the stocks in an index (like Nifty 50 or Sensex) in proportion to their weight. Instead of picking winners, you own a slice of the entire market.\n\n**In India:** Nifty 50 index funds from HDFC AMC, ICICI Prudential, and others charge as little as 0.1% annual expense ratio — among the cheapest investments you can make.\n\n## Stock picking: the honest picture\n\nPicking individual stocks can outperform an index — some investors do it consistently. But it requires time, skill, information, and emotional discipline that most retail investors (including most professionals) don''t maintain over long periods.\n\n## What this means for you\n\nThis simulation lets you practise both. From this lesson, ETFs and index funds appear in your symbol search, tagged as "lower risk" — not because risk is zero, but because diversification is built in.\n\n---\n*Completing this lesson tags index funds/ETFs in your symbol search.*',
  7,
  'index_fund_tagging'
),

(
  'common-beginner-mistakes',
  'Common beginner mistakes',
  E'# Common beginner mistakes\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nEvery beginner makes roughly the same set of mistakes. Knowing them doesn''t make you immune — but it does mean you might catch yourself faster.\n\n## 1. Following tips\n\nWhatsApp group tips, YouTube "analysts," friends who doubled their money — the advice is almost always wrong by the time it reaches you. By the time a tip is popular enough to reach a beginner, any edge it had is gone.\n\n## 2. Overtrading\n\nBuying and selling too frequently racks up brokerage costs and taxes, and keeps you exposed to short-term noise rather than long-term fundamentals. Most retail investors would do better trading less, not more.\n\n## 3. Averaging down on bad businesses\n\nBuying more of a falling stock is only a good idea if the underlying business is sound and your original thesis still holds. Averaging down on a company that is genuinely deteriorating just means owning more of a bad business at a slightly lower price.\n\n## 4. Checking your portfolio every hour\n\nShort-term price movements are mostly noise. Checking constantly makes you more likely to act on that noise emotionally.\n\n## 5. Ignoring fees and taxes\n\nBrokerage, STT, SEBI charges, and capital gains tax all eat into returns. A 20% return on paper can become a 13–14% return after taxes.\n\n---\n*Completing this lesson unlocks the behavioral insights panel on your dashboard.*',
  8,
  'insights_panel'
),

(
  'emotional-investing',
  'Emotional investing',
  E'# Emotional investing\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nThe single biggest determinant of investing outcomes for retail investors isn''t stock selection — it''s behavior. Specifically, buying high out of excitement and selling low out of fear.\n\n## Fear and greed: the two enemies\n\n**Fear** makes you sell good companies at the worst possible time — during market crashes, when prices are lowest and future returns are statistically highest. The 2020 COVID crash wiped 38% off the Nifty in 6 weeks. Investors who sold then locked in losses. Those who held (or bought) were up 90% within 18 months.\n\n**Greed** makes you buy overpriced assets at their peak — because they''ve been rising and you don''t want to miss out. This is called FOMO (Fear Of Missing Out).\n\n## The reflective pause\n\nOne evidence-based intervention: insert a mandatory waiting period before selling during a sharp drop. The research on "cooling off" periods shows they significantly reduce panic-sell regret.\n\nNiveshLoop implements this literally: if you try to sell a position that''s down sharply today, you''ll see a 10-second reflection screen before the sell button activates. This isn''t a block — it''s a breath.\n\n---\n*Completing this lesson activates the cooldown pause on sharp-drop sell attempts.*',
  9,
  'cooldown_nudge'
),

(
  'reading-financial-news',
  'Reading financial news',
  E'# Reading financial news\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nFinancial news is designed to be read constantly — which is often the opposite of what makes you a good investor. Here''s how to use it without being used by it.\n\n## Signal vs. noise\n\nMost daily market news is noise: short-term price moves explained after the fact with plausible-sounding narratives. The "reason" a market fell 1% today is often made up — markets are too complex for daily attribution.\n\n**What''s worth reading:** earnings reports, RBI policy decisions, major sector-level regulatory changes, and annual reports of companies you own.\n\n**What''s usually noise:** daily market roundups, analyst target prices, "hot stock" listicles, most Twitter/X finance content.\n\n## How to read an earnings report\n\nFocus on: revenue growth (is the business getting bigger?), operating profit margin (is it getting more efficient?), management guidance (what do they expect next quarter?), and the balance sheet (is debt manageable?).\n\n---\n*Completing this lesson adds a curated, non-personalised financial headlines tab to your dashboard.*',
  10,
  'news_tab'
),

(
  'taxes-and-brokerage-basics',
  'Taxes and brokerage basics',
  E'# Taxes and brokerage basics\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nReturns on paper are not returns in your pocket. Understanding what gets deducted is essential.\n\n## Brokerage\n\nDiscount brokers in India (Zerodha, Groww, Upstox) typically charge ₹20 or 0.03% per trade, whichever is lower, for intraday. For delivery trades, many charge zero. But there are other charges layered on top.\n\n## Transaction charges\n\n- **STT (Securities Transaction Tax):** 0.1% on both buy and sell for delivery equity\n- **Exchange transaction charges:** ~0.00297% (NSE)\n- **SEBI charges:** ₹10 per crore\n- **GST:** 18% on brokerage and transaction charges\n- **Stamp duty:** 0.015% on buys (varies by state)\n\n## Capital gains tax\n\n- **Short-term capital gains (STCG):** If you sell within 12 months of buying, profits taxed at 15%\n- **Long-term capital gains (LTCG):** If you hold 12+ months, profits above ₹1 lakh taxed at 10%\n\nFrom this lesson, your simulated trades will show an estimated post-brokerage net cost — so your portfolio math reflects what real trading actually looks like.\n\n---\n*Completing this lesson adds simulated brokerage/STT deductions to your trade ticket.*',
  11,
  'fee_simulation'
),

(
  'long-term-vs-short-term',
  'Long-term vs. short-term investing',
  E'# Long-term vs. short-term investing\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nThe single most proven edge available to retail investors is one most never use: time.\n\n## The compounding argument\n\n₹1,00,000 invested in the Nifty 50 in 2004 was worth ~₹12,00,000 by 2024 — a 12x return over 20 years. That''s roughly 13% annually. No stock-picking skill required, just patience.\n\nThe reason most retail investors don''t capture this return: they sell during downturns, chase short-term momentum, and never stay invested long enough for compounding to work.\n\n## Short-term trading: the honest numbers\n\nStudies consistently show that 80–90% of active day traders lose money over a full year. The ones who win typically have structural advantages (speed, information, technology) unavailable to retail investors.\n\n## Where this shows up in your passbook\n\nFrom this lesson, positions you''ve held for 30+ days get a "30d+" badge in your passbook. Positions held 180+ days get a "180d+" badge. These are passive rewards for patience — not streaks, not pressure, just a record of what you''ve done.\n\n---\n*Completing this lesson adds holding-period stamps to your positions.*',
  12,
  'holding_period_stamp'
),

(
  'building-a-watchlist',
  'Building a watchlist',
  E'# Building a watchlist\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nA watchlist is a list of companies you''re researching but haven''t bought yet. Professional investors maintain watchlists for months before buying — because the best time to research a company is when you have no position in it and therefore no emotional stake in the outcome.\n\n## What to put on a watchlist\n\n- Companies in sectors you understand (your profession, your daily life)\n- Companies you''ve read about in earnings reports\n- Companies whose products you use and like — though remember, "I like the product" is not the same as "the stock is cheap"\n\n## What a watchlist is not\n\nA watchlist is not a "buy later" list. It''s a research list. Many stocks will stay on your watchlist forever because you never get comfortable enough with the business to invest.\n\n## How this works in NiveshLoop\n\nYou can now add symbols to a watchlist from the symbol search or holding detail page. Your watchlist tracks price changes without requiring you to own the stock.\n\n---\n*Completing this lesson unlocks the watchlist feature.*',
  13,
  'watchlist'
),

(
  'your-investing-personality',
  'Your investing personality',
  E'# Your investing personality\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nBy this point, you''ve made enough trades that your behavior data tells a story. Not a story about whether you''re "good" at picking stocks — but a story about how you make decisions under uncertainty.\n\n## What patterns look like\n\nSome investors are consistently patient — they hold through volatility and check prices rarely. Others are reactive — they sell when prices drop and buy when they''re rising (exactly backwards from what the evidence suggests). Neither is a character flaw; both are learnable patterns.\n\n## What NiveshLoop has observed about you\n\n*(This section will be personalised with your actual trade history in the insights panel.)*\n\nThe upgraded insights panel — available from this lesson — analyses your full transaction history for:\n- Holding period distribution (do you hold for days or months?)\n- Stop-loss usage (do you set them? do they trigger?)\n- Sector concentration over time\n- Response to volatility (did you sell during drops, or hold?)\n\n---\n*Completing this lesson unlocks the upgraded insights panel.*',
  14,
  'insights_panel_v2'
),

(
  'what-next',
  'What next? Moving from simulation to real investing',
  E'# What next?\n\n> **[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]**\n\nYou''ve completed all 14 lessons and accumulated a real track record in the simulation. What does the path to real investing look like?\n\n## NiveshLoop will never handle real money\n\nThis is a deliberate constraint, not a limitation. The entire point of this tool is to build habits and understanding *before* real money is involved. Moving to real investing means opening an account with a SEBI-registered broker — not upgrading within this app.\n\n## What a regulated broker account looks like\n\nIn India, you need:\n1. **A Demat account** (holds your shares electronically) — most brokers open this for free\n2. **A trading account** (places orders) — bundled with the Demat account\n3. **Linked bank account** — for fund transfers\n\nSEBI-registered brokers include Zerodha, Groww, Upstox, Angel One, ICICI Direct, and others. Check SEBI''s registered intermediaries list before opening an account with anyone.\n\n## The transition checklist\n\n- [ ] Can you explain why you''re buying a specific stock (not just "it seems good")?\n- [ ] Have you set a stop-loss plan before clicking buy?\n- [ ] Is this money you can afford to lose entirely?\n- [ ] Have you diversified across at least 3 sectors?\n- [ ] Do you have an emergency fund that''s separate from your investing capital?\n\nIf you can answer yes to all five: you''re ready to start small with real money.\n\n---\n*This is the capstone lesson. No further unlock — just the reminder that this is where the simulation ends and the real thing begins.*',
  15,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  body_md = EXCLUDED.body_md,
  order_index = EXCLUDED.order_index,
  unlocks_action = EXCLUDED.unlocks_action;

