(function () {
    const S = () => window.appState;
    const D = () => window.stockData;
    const cfg = () => window.appConfig;
    const todayLabel = () => {
        const d = new Date();
        if (d.getFullYear() < cfg().minDisplayYear) d.setFullYear(cfg().minDisplayYear);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const updateChart = (chart, labels, a, b) => {
        if (!chart) return;
        chart.data.labels = labels;
        chart.data.datasets[0].data = a;
        chart.data.datasets[1].data = b;
        chart.update();
    };

    function calculateRealPortfolioReturn(updateCharts = false) {
        let realPortInc = 0, realBenchInc = 0, totalPortWeight = 0, totalBenchWeight = 0;
        Object.values(D()).forEach((stock) => {
            totalPortWeight += stock.portWeight / 100;
            totalBenchWeight += stock.benchWeight / 100;
        });
        Object.values(D()).forEach((stock) => {
            const pw = totalPortWeight ? (stock.portWeight / 100) / totalPortWeight : 0;
            const bw = totalBenchWeight ? (stock.benchWeight / 100) / totalBenchWeight : 0;
            const ret = (stock.currentPrice / stock.basePrice) - 1;
            realPortInc += pw * ret;
            realBenchInc += bw * ret;
        });

        const totalYtdPort = ((1 + 0.1424) * (1 + realPortInc) - 1) * 100;
        const totalYtdBench = ((1 + 0.085) * (1 + realBenchInc) - 1) * 100;
        realPortInc *= 100;
        realBenchInc *= 100;

        const currentAlpha = totalYtdPort - totalYtdBench;
        const finalAlphaInc = realPortInc - realBenchInc;
        document.getElementById('dash-port-inc').innerText = (realPortInc >= 0 ? '+' : '') + realPortInc.toFixed(2) + '%';
        document.getElementById('dash-port-inc').className = 'kpi-value-small ' + (realPortInc >= 0 ? 'green' : 'red');
        document.getElementById('dash-port-ytd').innerText = (totalYtdPort >= 0 ? '+' : '') + totalYtdPort.toFixed(2) + '%';
        document.getElementById('dash-port-ytd').className = 'kpi-value ' + (totalYtdPort >= 0 ? 'green' : 'red');
        document.getElementById('dash-bench-inc').innerText = (realBenchInc >= 0 ? '+' : '') + realBenchInc.toFixed(2) + '%';
        document.getElementById('dash-bench-inc').className = 'kpi-value-small ' + (realBenchInc >= 0 ? 'neutral' : 'red');
        document.getElementById('dash-bench-ytd').innerText = (totalYtdBench >= 0 ? '+' : '') + totalYtdBench.toFixed(2) + '%';
        document.getElementById('dash-bench-ytd').className = 'kpi-value ' + (totalYtdBench >= 0 ? 'neutral' : 'red');
        document.getElementById('dash-alpha-inc').innerText = (finalAlphaInc >= 0 ? '+' : '') + finalAlphaInc.toFixed(2) + '%';
        document.getElementById('dash-alpha-inc').className = 'kpi-value-small ' + (finalAlphaInc >= 0 ? 'blue' : 'red');
        document.getElementById('dash-alpha-ytd').innerText = (currentAlpha >= 0 ? '+' : '') + currentAlpha.toFixed(2) + '%';
        document.getElementById('dash-alpha-ytd').className = 'kpi-value ' + (currentAlpha >= 0 ? 'blue' : 'red');
        document.getElementById('attr-alloc').innerText = (currentAlpha >= 0 ? '+' : '') + (currentAlpha * 0.72).toFixed(2) + '%';
        document.getElementById('attr-alloc').className = currentAlpha >= 0 ? 'positive-val' : 'negative-val';
        document.getElementById('attr-sel').innerText = (currentAlpha >= 0 ? '+' : '') + (currentAlpha * 0.32).toFixed(2) + '%';
        document.getElementById('attr-sel').className = currentAlpha >= 0 ? 'positive-val' : 'negative-val';
        document.getElementById('attr-int').innerText = '-' + Math.abs(currentAlpha * 0.04).toFixed(2) + '%';
        document.getElementById('attr-tot').innerText = (currentAlpha >= 0 ? '+' : '') + currentAlpha.toFixed(2) + '%';
        document.getElementById('attr-tot').style.color = currentAlpha >= 0 ? 'var(--accent)' : 'var(--negative)';

        let battingCount = 0, totalStocks = 0, weightedBeta = 0, portUp = 0, benchUp = 0, portDn = 0, benchDn = 0, activeSq = 0;
        Object.values(D()).forEach((stock) => {
            const ret = (stock.currentPrice / stock.basePrice) - 1;
            const pw = totalPortWeight ? (stock.portWeight / 100) / totalPortWeight : 0;
            const bw = totalBenchWeight ? (stock.benchWeight / 100) / totalBenchWeight : 0;
            const portContrib = pw * ret;
            const benchContrib = bw * ret;
            totalStocks += 1;
            if (portContrib > benchContrib) battingCount += 1;
            if (ret >= 0) { portUp += portContrib; benchUp += benchContrib; } else { portDn += portContrib; benchDn += benchContrib; }
            activeSq += Math.pow((pw - bw) * ret, 2);
            weightedBeta += pw * (1 + Math.abs(stock.awNum / 100) * 0.5);
        });

        const trackingError = Math.sqrt(activeSq) * Math.sqrt(252) * 100;
        document.getElementById('perf-ir').innerText = trackingError > 0 ? (currentAlpha / trackingError).toFixed(2) : 'N/A';
        document.getElementById('perf-bat').innerText = totalStocks ? ((battingCount / totalStocks) * 100).toFixed(1) + '%' : 'N/A';
        document.getElementById('perf-up-cap').innerText = benchUp !== 0 ? Math.round((portUp / benchUp) * 100) + '%' : 'N/A';
        document.getElementById('perf-dn-cap').innerText = benchDn !== 0 ? Math.round((portDn / benchDn) * 100) + '%' : 'N/A';
        document.getElementById('risk-te').innerText = trackingError.toFixed(2) + '%';
        document.getElementById('risk-beta').innerText = weightedBeta.toFixed(2);
        document.getElementById('risk-sharpe').innerText = trackingError > 0 ? ((totalYtdPort / 100 - 0.045) / (trackingError / 100)).toFixed(2) : 'N/A';

        if (updateCharts) {
            const s = S();
            const label = todayLabel();
            s.incLabels = ['Mar 20 Base', label];
            s.incPortData = [0, Number.parseFloat(realPortInc.toFixed(2))];
            s.incBenchData = [0, Number.parseFloat(realBenchInc.toFixed(2))];
            s.ytdLabels = [...cfg().baseYtdLabels, label];
            s.ytdPortData = [...cfg().baseYtdPortData, Number.parseFloat(totalYtdPort.toFixed(2))];
            s.ytdBenchData = [...cfg().baseYtdBenchData, Number.parseFloat(totalYtdBench.toFixed(2))];
        }

        updateChart(S().charts.ytd, S().ytdLabels, S().ytdPortData, S().ytdBenchData);
        updateChart(S().charts.inc, S().incLabels, S().incPortData, S().incBenchData);
        if (S().currentTicker && window.loadStock) {
            const btn = document.getElementById('btn-' + S().currentTicker.replace(/\s+/g, '-'));
            if (btn) window.loadStock(S().currentTicker, btn, true);
        }
    }

    function buildFinTable(ticker) {
        const stock = D()[ticker];
        const tbody = document.getElementById('fin-tbody');
        const rows = [
            { key: 'rev', label: 'Total Revenue', isInput: false },
            { key: 'revyoy', label: '↳ Revenue YoY (%)', isInput: true },
            { key: 'gp', label: 'Gross Profit', isInput: false },
            { key: 'gm', label: '↳ Gross Margin (%)', isInput: true },
            { key: 'op', label: 'Operating Income', isInput: false },
            { key: 'opm', label: '↳ Operating Margin (%)', isInput: true },
            { key: 'ni', label: 'Net Income', isInput: false },
            { key: 'niyoy', label: '↳ Net Income YoY (%)', isInput: false },
            { key: 'nim', label: '↳ Net Margin (%)', isInput: true },
            { key: 'shares', label: 'Shares Outstanding', isInput: true },
            { key: 'eps', label: 'Diluted EPS', isInput: false },
            { key: 'epsyoy', label: '↳ EPS YoY (%)', isInput: false }
        ];
        tbody.innerHTML = '';
        rows.forEach((row) => {
            const tr = document.createElement('tr');
            let html = `<td>${row.label}</td>`;
            for (let j = 0; j < 3; j += 1) {
                let val = '-', isYoY = false;
                const rev = stock.past.rev[j], gp = stock.past.gp[j], op = rev * (stock.past.opm[j] / 100), ni = rev * (stock.past.nim[j] / 100), eps = stock.past.eps[j];
                if (row.key === 'rev') val = rev.toFixed(2);
                else if (row.key === 'revyoy') { val = j === 0 ? 'N/A' : (((rev / stock.past.rev[j - 1]) - 1) * 100).toFixed(1) + '%'; isYoY = true; }
                else if (row.key === 'gp') val = gp.toFixed(2);
                else if (row.key === 'gm') val = ((gp / rev) * 100).toFixed(1) + '%';
                else if (row.key === 'op') val = op.toFixed(2);
                else if (row.key === 'opm') val = stock.past.opm[j].toFixed(1) + '%';
                else if (row.key === 'ni') val = ni.toFixed(2);
                else if (row.key === 'niyoy') { if (j === 0) val = 'N/A'; else { const prevNi = stock.past.rev[j - 1] * (stock.past.nim[j - 1] / 100); val = prevNi === 0 ? 'N/A' : (((ni - prevNi) / Math.abs(prevNi)) * 100).toFixed(1) + '%'; } isYoY = true; }
                else if (row.key === 'nim') val = stock.past.nim[j].toFixed(1) + '%';
                else if (row.key === 'shares') val = stock.past.shares[j].toFixed(3);
                else if (row.key === 'eps') val = eps.toFixed(2);
                else if (row.key === 'epsyoy') { if (j === 0) val = 'N/A'; else { val = stock.past.eps[j - 1] === 0 ? 'N/A' : (((eps - stock.past.eps[j - 1]) / Math.abs(stock.past.eps[j - 1])) * 100).toFixed(1) + '%'; } isYoY = true; }
                let color = '';
                if (isYoY && val !== 'N/A') { color = Number.parseFloat(val) >= 0 ? 'positive-val' : 'negative-val'; if (Number.parseFloat(val) > 0) val = '+' + val; }
                html += `<td class="hist-col ${color}">${val}</td>`;
            }
            for (let j = 0; j < 5; j += 1) html += row.isInput ? `<td class="proj-col"><input type="number" id="inp-${row.key}-${j}" value="${stock.proj[row.key][j]}" step="0.1" oninput="runEngine()"></td>` : `<td class="proj-col derived-val" id="der-${row.key}-${j}">-</td>`;
            tr.innerHTML = html;
            tbody.appendChild(tr);
        });
        runEngine();
    }

    function runEngine() {
        if (!S().currentTicker) return;
        const stock = D()[S().currentTicker];
        let prevRev = stock.past.rev[2], prevNi = prevRev * (stock.past.nim[2] / 100), prevEps = stock.past.eps[2];
        const niArr = [], shareArr = [];
        for (let j = 0; j < 5; j += 1) {
            const ryoy = Number.parseFloat(document.getElementById(`inp-revyoy-${j}`).value) || 0;
            const gm = Number.parseFloat(document.getElementById(`inp-gm-${j}`).value) || 0;
            const opm = Number.parseFloat(document.getElementById(`inp-opm-${j}`).value) || 0;
            const nim = Number.parseFloat(document.getElementById(`inp-nim-${j}`).value) || 0;
            const parsedShares = Number.parseFloat(document.getElementById(`inp-shares-${j}`).value);
            const shares = Number.isFinite(parsedShares) ? parsedShares : 0;
            const rev = prevRev * (1 + ryoy / 100), gp = rev * (gm / 100), op = rev * (opm / 100), ni = rev * (nim / 100), eps = shares === 0 ? 0 : ni / shares;
            const niyoy = prevNi === 0 ? 0 : ((ni - prevNi) / Math.abs(prevNi)) * 100, epsyoy = prevEps === 0 ? 0 : ((eps - prevEps) / Math.abs(prevEps)) * 100;
            niArr.push(ni); shareArr.push(shares);
            document.getElementById(`der-rev-${j}`).innerText = rev.toFixed(2);
            document.getElementById(`der-gp-${j}`).innerText = gp.toFixed(2);
            document.getElementById(`der-op-${j}`).innerText = op.toFixed(2);
            document.getElementById(`der-ni-${j}`).innerText = ni.toFixed(2);
            document.getElementById(`der-eps-${j}`).innerText = eps.toFixed(2);
            const ny = document.getElementById(`der-niyoy-${j}`), ey = document.getElementById(`der-epsyoy-${j}`);
            ny.innerText = (niyoy > 0 ? '+' : '') + niyoy.toFixed(1) + '%';
            ny.className = 'proj-col derived-val ' + (niyoy >= 0 ? 'positive-val' : 'negative-val');
            ey.innerText = (epsyoy > 0 ? '+' : '') + epsyoy.toFixed(1) + '%';
            ey.className = 'proj-col derived-val ' + (epsyoy >= 0 ? 'positive-val' : 'negative-val');
            prevRev = rev; prevNi = ni; prevEps = eps;
        }
        const wacc = Number.parseFloat(document.getElementById('dcf-wacc').value) / 100;
        const tgr = Number.parseFloat(document.getElementById('dcf-tgr').value) / 100;
        const fcfc = Number.parseFloat(document.getElementById('dcf-fcfc').value) / 100;
        const elPrice = document.getElementById('dcf-price'), elUp = document.getElementById('dcf-upside');
        if (wacc <= tgr || Number.isNaN(wacc) || Number.isNaN(tgr)) { elPrice.innerText = 'Error (WACC <= TGR)'; elUp.innerText = '-'; elUp.className = 'comp-val negative-val'; return; }
        if (shareArr.some((shares) => shares <= 0)) { elPrice.innerText = 'Error (Shares <= 0)'; elUp.innerText = '-'; elUp.className = 'comp-val negative-val'; return; }
        let pvFcfPerShare = 0, finalFcfPerShare = 0;
        for (let j = 0; j < 5; j += 1) { const fcfPerShare = (niArr[j] * fcfc) / shareArr[j]; pvFcfPerShare += fcfPerShare / Math.pow(1 + wacc, j + 1); if (j === 4) finalFcfPerShare = fcfPerShare; }
        const tvPerShare = (finalFcfPerShare * (1 + tgr)) / (wacc - tgr), pvTvPerShare = tvPerShare / Math.pow(1 + wacc, 5), impliedPrice = pvFcfPerShare + pvTvPerShare;
        const upside = ((impliedPrice - stock.currentPrice) / stock.currentPrice) * 100;
        elPrice.innerText = stock.currency + impliedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        elUp.innerText = (upside >= 0 ? '+' : '') + upside.toFixed(2) + '%';
        elUp.className = 'comp-val ' + (upside >= 0 ? 'positive-val' : 'negative-val');
    }

    window.calculateRealPortfolioReturn = calculateRealPortfolioReturn;
    window.buildFinTable = buildFinTable;
    window.runEngine = runEngine;
})();
