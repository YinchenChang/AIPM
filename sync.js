(function () {
    async function fetchWithTimeout(url, timeoutMs = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { signal: controller.signal, cache: 'no-store' });
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function fetchGoogleFinance() {
        const btn = document.getElementById('live-update-btn');
        const headerStatus = document.getElementById('live-date-header');
        const tickers = Object.keys(window.stockData);
        let successCount = 0;

        btn.disabled = true;

        for (let i = 0; i < tickers.length; i += 5) {
            const chunk = tickers.slice(i, i + 5);
            await Promise.all(chunk.map(async (ticker) => {
                const stock = window.stockData[ticker];
                btn.innerHTML = '<span class="live-pulse"></span>SYNCING ' + Math.min(tickers.length, i + 5) + '/' + tickers.length + '...';
                headerStatus.innerText = 'Fetching ' + ticker + ' from Google Finance...';

                const url = encodeURIComponent('https://www.google.com/finance/quote/' + stock.gFin);
                const proxies = [
                    'https://api.allorigins.win/get?url=' + url,
                    'https://api.codetabs.com/v1/proxy?quest=' + url,
                    'https://corsproxy.io/?url=' + url
                ];

                for (const proxy of proxies) {
                    try {
                        const res = await fetchWithTimeout(proxy);
                        if (!res.ok) continue;

                        let html = '';
                        if (proxy.includes('allorigins')) {
                            const data = await res.json();
                            html = data.contents;
                        } else {
                            html = await res.text();
                        }

                        const match = html.match(/class="YMlKec fxKbKc"[^>]*>(?:[^0-9]*)([0-9,]+\.[0-9]+)/);
                        if (!match || !match[1]) continue;

                        const livePrice = Number.parseFloat(match[1].replace(/,/g, ''));
                        if (Number.isNaN(livePrice) || livePrice <= 0) continue;

                        stock.currentPrice = livePrice;
                        const drift = stock.currentPrice / stock.basePrice;
                        const marketCapValue = Number.parseFloat(stock.mcap.replace(/[TB]/g, ''));
                        stock.mcapLive = (marketCapValue * drift).toFixed(2) + (stock.mcap.includes('T') ? 'T' : 'B');
                        successCount += 1;
                        window.calculateRealPortfolioReturn(true);
                        break;
                    } catch (error) {
                        console.warn('[G-Finance] Failed proxy for ' + ticker + ':', error.message);
                    }
                }
            }));
        }

        const today = new Date();
        if (today.getFullYear() < window.appConfig.minDisplayYear) today.setFullYear(window.appConfig.minDisplayYear);

        if (successCount > 0) {
            btn.innerHTML = '✅ G-FINANCE SYNCED';
            btn.style.backgroundColor = '#2ea043';
            btn.style.borderColor = '#2ea043';
            headerStatus.innerText = 'Data Live as of: ' + today.toLocaleDateString() + ' (' + successCount + '/' + tickers.length + ' Synced)';
        } else {
            btn.innerHTML = '❌ NETWORK BLOCKED';
            btn.style.backgroundColor = '#da3633';
            btn.style.borderColor = '#da3633';
            headerStatus.innerText = 'Network proxy blocked API. Safely maintaining locked baseline prices. No simulations.';
            window.calculateRealPortfolioReturn(false);
        }

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '↻ FETCH LIVE DATA';
            btn.style.backgroundColor = '';
            btn.style.borderColor = '';
        }, 4000);
    }

    window.fetchGoogleFinance = fetchGoogleFinance;
})();
