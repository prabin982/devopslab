module.exports = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: res.statusCode >= 400 ? 'ERROR' : 'INFO',
            method: req.method,
            route: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${duration}ms`,
            message: `${req.method} ${req.originalUrl} completed with ${res.statusCode}`
        };
        console.log(JSON.stringify(logEntry));
    });

    next();
};
