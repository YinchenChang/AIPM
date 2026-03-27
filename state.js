window.appConfig = {
    minDisplayYear: 2026,
    baseYtdLabels: ['Jan 2', 'Jan 16', 'Jan 30', 'Feb 13', 'Feb 27', 'Mar 6', 'Mar 13', 'Mar 20 Base'],
    baseYtdPortData: [0, 1.8, 3.5, 2.9, 6.2, 8.1, 11.5, 14.24],
    baseYtdBenchData: [0, 1.2, 2.2, 1.6, 3.8, 4.5, 6.8, 8.5]
};

window.appState = {
    currentTicker: null,
    sortedTickers: [],
    ytdLabels: [],
    ytdPortData: [],
    ytdBenchData: [],
    incLabels: [],
    incPortData: [],
    incBenchData: [],
    charts: { ytd: null, inc: null, aw: null }
};
