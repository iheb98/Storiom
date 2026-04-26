const { User } = require('./models');

const checkSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findOne({
            where: { id: userId },
            include: ['subscription']
        });

        if (!user || !user.subscription) {
            return res.status(403).json({
                success: false,
                message: 'Aucun abonnement trouvé. Accès refusé.'
            });
        }

        let { activationDate, expirationDate, duration } = user.subscription;
        let isExpired = false;
        let calculatedExpirationDate = expirationDate;
        if (!expirationDate) {
            const durationMapping = {
                "TRIAL": 30,
                "1M": 30,
                "3M": 90,
                "6M": 180,
                "12M": 365
            };

            if (durationMapping[duration]) {
                calculatedExpirationDate = new Date(activationDate);
                calculatedExpirationDate.setDate(calculatedExpirationDate.getDate() + durationMapping[duration]);
            }
        }

        if (calculatedExpirationDate && new Date() > new Date(calculatedExpirationDate)) {
            isExpired = true;
        }

        if (isExpired) {
            return res.status(402).json({
                success: false,
                subscriptionExpired: true,
                message: 'Abonnement expiré. Veuillez renouveler votre abonnement pour continuer.'
            });
        }

        // Attach subscription plan tier to request for downstream middleware
        req.subscriptionPlan = user.subscription.plan || 'STOCK';

        next();

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error: ' + err.toString()
        });
    }
};

module.exports = checkSubscription;
