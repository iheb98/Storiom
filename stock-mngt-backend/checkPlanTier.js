/**
 * Middleware factory to check if the user's subscription plan includes a specific tier.
 * Must be used AFTER checkSubscription middleware (which attaches req.subscriptionPlan).
 *
 * Usage: checkPlanTier('STOCK_WEBSITE')
 */
const checkPlanTier = (requiredPlan) => {
    return (req, res, next) => {
        const userPlan = req.subscriptionPlan;

        if (!userPlan) {
            return res.status(403).json({
                success: false,
                message: 'Aucun abonnement trouvé.'
            });
        }

        // Plan hierarchy: STOCK_WEBSITE includes everything STOCK has
        const planHierarchy = {
            'STOCK': ['STOCK'],
            'STOCK_WEBSITE': ['STOCK', 'STOCK_WEBSITE']
        };

        const allowedPlans = planHierarchy[userPlan] || [];

        if (!allowedPlans.includes(requiredPlan)) {
            return res.status(403).json({
                success: false,
                planRequired: requiredPlan,
                currentPlan: userPlan,
                message: 'Votre abonnement actuel ne donne pas accès à cette fonctionnalité. Veuillez passer au plan Stock + Boutique.'
            });
        }

        next();
    };
};

module.exports = checkPlanTier;
