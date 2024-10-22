const { StatusCodes } = require('http-status-codes');

class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        // Send stack only in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};

module.exports = {
    ErrorHandler,
    errorMiddleware
};
