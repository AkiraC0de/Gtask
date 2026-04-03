const ResponseError = require('../errors/GenericError');

const errorHandler = (err, req, res, next) => {
    if (err instanceof ResponseError) {
        return res.status(err.status).json(err.toJSON());
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            field: 'validation',
            message: err.message
        });
    }

    // Mongoose duplicate key errors
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            field: Object.keys(err.keyPattern)[0],
            message: `${Object.keys(err.keyPattern)[0]} already exists`
        });
    }

    // Unexpected errors 
    console.error('UNEXPECTED ERROR:', err);
    
   
    res.status(500).json({
        success: false,
        field: 'server',
        message:err.message
    });
};

module.exports = errorHandler;