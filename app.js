(function () {
    const S = () => window.appState;
    const D = () => window.stockData;
    const cfg = () => window.appConfig;

    function seedSeries() {
        S().ytdLabels = [...cfg().baseYtdLabels];
        S().ytdPortData = [...cfg().baseYtdPortData];
        S().ytdBenchData = [...cfg().baseYtdBenchData];
        S().incLabels = ['Mar 20 Base'];
        S().incPortData = [0];
        S().incBenchData = [0];
    }

    function initCharts() {
        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#c9d1d9', font: { size: 11 } } } }, scales: { y: { grid: { color: '#30363d' }, ticks: { color: '#8b949e', callback: (v) => '+' + v + '%' } }, x: { grid: { display: false }, ticks: { color: '#c9d1d9', font: { size: 10 } } } } };
        const incOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#c9d1d9', font: { size: 11 } } } }, scales: { y: { grid: { color: '#30363d' }, ticks: { color: '#8b949e', callback: (v) => (v > 0 ? '+' : '') + v + '%' } }, x: { grid: { display: false }, ticks: { color: '#c9d1d9', font: { size: 10 }, maxTicksLimit: 10 } } } };
        S().charts.ytd = new Chart(document.getElementById('ytdPerformanceChart').getContext('2d'), { type: 'line', data: { labels: S().ytdLabels, datasets: [ { label: 'Active Portfolio YTD (%)', data: S().ytdPortData, borderColor: '#58a6ff', backgroundColor: 'rgba(88, 166, 255, 0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: '#58a6ff' }, { label: 'Passive Benchmark YTD (%)', data: S().ytdBenchData, borderColor: '#8b949e', borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.3, pointRadius: 2, pointBackgroundColor: '#8b949e' } ] }, options: chartOptions });
        S().charts.inc = new Chart(document.getElementById('inceptionPerformanceChart').getContext('2d'), { type: 'line', data: { labels: S().incLabels, datasets: [ { label: 'Portfolio Since Inception (%)', data: S().incPortData, borderColor: '#3fb950', backgroundColor: 'rgba(63, 185, 80, 0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#3fb950' }, { label: 'Benchmark Since Inception (%)', data: S().incBenchData, borderColor: '#8b949e', borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.3, pointRadius: 3, pointBackgroundColor: '#8b949e' } ] }, options: incOptions });
        const awData = S().sortedTickers.map((ticker) => D()[ticker].awNum);
        S().charts.aw = new Chart(document.getElementById('activeWeightsChart').getContext('2d'), { type: 'bar', data: { labels: S().sortedTickers, datasets: [{ label: 'Active Weight (%)', data: awData, backgroundColor: awData.map((v) => v >= 0 ? 'rgba(63, 185, 80, 0.85)' : 'rgba(248, 81, 73, 0.85)'), borderColor: awData.map((v) => v >= 0 ? '#2ea043' : '#d73a49'), borderWidth: 1, borderRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => 'Active Weight: ' + (ctx.raw > 0 ? '+' : '') + ctx.raw.toFixed(2) + '%' } } }, scales: { y: { grid: { color: '#30363d' }, ticks: { color: '#8b949e', callback: (v) => (v > 0 ? '+' : '') + v + '%' } }, x: { grid: { display: false }, ticks: { color: '#c9d1d9', font: { size: 9, weight: 'bold' }, maxRotation: 90, minRotation: 90 } } }, onClick: (_e, els) => { if (!els.length) return; const btn = document.getElementById('btn-' + S().sortedTickers[els[0].index].replace(/\s+/g, '-')); if (btn) btn.click(); }, onHover: (e, els) => { if (e.native && e.native.target) e.native.target.style.cursor = els.length ? 'pointer' : 'default'; } } });
    }

    function showHome() {
        document.querySelectorAll('.nav-item').forEach((btn) => btn.classList.remove('active'));
        document.getElementById('btn-home').classList.add('active');
        document.getElementById('stock-panel').style.display = 'none';
        const home = document.getElementById('home-panel');
        home.style.display = 'block';
        home.style.animation = 'none';
        home.offsetHeight;
        home.style.animation = 'fadeIn 0.3s ease-in-out';
        window.scrollTo(0, 0);
    }

    function loadStock(ticker, btnElement, preventScroll = false) {
        const stock = D()[ticker];
        S().currentTicker = ticker;
        document.querySelectorAll('.nav-item').forEach((btn) => btn.classList.remove('active'));
        document.getElementById('btn-home').classList.remove('active');
        if (btnElement) {
            btnElement.classList.add('active');
            if (!preventScroll) btnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        document.getElementById('home-panel').style.display = 'none';
        const panel = document.getElementById('stock-panel');
        panel.style.display = 'block';
        if (!preventScroll) { panel.style.animation = 'none'; panel.offsetHeight; panel.style.animation = 'fadeIn 0.3s ease-in-out'; panel.scrollTo(0, 0); }
        document.getElementById('stock-name').innerText = stock.name;
        document.getElementById('stock-ticker').innerText = stock.ticker;
        document.getElementById('last-price').innerText = stock.currency + stock.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('market-cap').innerText = stock.currency + stock.mcapLive;
        document.getElementById('target-price').innerText = stock.currency + stock.target.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const upside = ((stock.target - stock.currentPrice) / stock.currentPrice) * 100;
        const upEl = document.getElementById('upside');
        upEl.innerText = (upside >= 0 ? '+' : '') + upside.toFixed(2) + '%';
        upEl.className = 'metric-value ' + (upside >= 0 ? 'accent' : 'negative');
        const awEl = document.getElementById('active-weight');
        awEl.innerText = (stock.awNum > 0 ? '+' : '') + stock.awNum.toFixed(2) + '%';
        awEl.className = 'metric-value ' + (stock.awNum >= 0 ? 'accent' : 'negative');
        document.getElementById('rationale').innerHTML = stock.rationale;
        document.getElementById('comp-pe').innerText = stock.comps.pe;
        document.getElementById('comp-peg').innerText = stock.comps.peg;
        document.getElementById('comp-ps').innerText = stock.comps.ps;
        document.getElementById('comp-psg').innerText = stock.comps.psg;
        document.getElementById('dcf-wacc').value = stock.dcf.wacc;
        document.getElementById('dcf-tgr').value = stock.dcf.tgr;
        document.getElementById('dcf-fcfc').value = stock.dcf.fcfc;
        window.buildFinTable(ticker);
    }

    function buildSidebar() {
        const list = document.getElementById('sidebar-list');
        list.innerHTML = '';
        S().sortedTickers.forEach((ticker, idx) => {
            const stock = D()[ticker], btn = document.createElement('div');
            const awClass = stock.awNum >= 0 ? 'stock-aw' : 'stock-aw neg';
            const awText = (stock.awNum > 0 ? '+' : '') + stock.awNum.toFixed(2) + '%';
            btn.className = 'nav-item';
            btn.id = 'btn-' + ticker.replace(/\s+/g, '-');
            btn.innerHTML = `<div class="btn-top-row">${idx + 1}. ${stock.name}</div><div class="btn-bottom-row"><span style="opacity:0.8">${ticker}</span><span class="${awClass}">${awText}</span></div>`;
            btn.onclick = () => loadStock(ticker, btn);
            list.appendChild(btn);
        });
    }

    function initApp() {
        S().sortedTickers = Object.keys(D()).sort((a, b) => D()[b].awNum - D()[a].awNum);
        buildSidebar();
        seedSeries();
        initCharts();
        Object.keys(D()).forEach((ticker) => { D()[ticker].mcapLive = D()[ticker].mcap; });
        window.calculateRealPortfolioReturn(true);
    }

    window.showHome = showHome;
    window.loadStock = loadStock;
    window.addEventListener('load', initApp);
})();
