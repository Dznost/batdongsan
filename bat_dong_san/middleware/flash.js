
const flash = (req, res, next) => {

    if (!req.session.flash) {
        req.session.flash = {};
    }

    req.flash = (type, message) => {
        if (!req.session.flash[type]) {
            req.session.flash[type] = [];
        }
        req.session.flash[type].push(message);
    };

    res.locals.flash = req.session.flash || {};

    const flashMessages = req.session.flash || {};
    req.session.flash = {};

    res.locals.success = flashMessages.success ? flashMessages.success[0] : null;
    res.locals.error = flashMessages.error ? flashMessages.error[0] : null;
    res.locals.warning = flashMessages.warning ? flashMessages.warning[0] : null;
    res.locals.info = flashMessages.info ? flashMessages.info[0] : null;
    
    next();
};

module.exports = flash;
