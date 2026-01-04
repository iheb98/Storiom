/**
 * Modern, responsive email templates for Storiom
 * Beautiful HTML email designs with inline CSS for maximum compatibility
 */

const baseStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
`;

/**
 * Creates the base email wrapper with consistent styling
 */
function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Storiom</title>
  ${baseStyles}
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <!--<div style="width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                      <span style="font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -1px;">S</span>
                    </div>-->
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Storiom</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.8);">Gestion de Stock Intelligente</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e8ecef;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px; font-size: 13px; color: #8492a6;">
                      Vous recevez cet e-mail car vous avez créé un compte sur Storiom.
                    </p>
                    <p style="margin: 0 0 15px; font-size: 13px; color: #8492a6;">
                      © ${new Date().getFullYear()} Storiom. Tous droits réservés.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="https://storiom.com" style="font-size: 12px; color: #667eea; text-decoration: none;">Site Web</a>
                        </td>
                        <td style="color: #cbd5e0;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://storiom.com/privacy" style="font-size: 12px; color: #667eea; text-decoration: none;">Confidentialité</a>
                        </td>
                        <td style="color: #cbd5e0;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://storiom.com/contact" style="font-size: 12px; color: #667eea; text-decoration: none;">Contact</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Bottom note -->
        <p style="margin: 20px 0 0; font-size: 11px; color: #a0aec0; text-align: center;">
          Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.
        </p>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Account confirmation email - sent when user first registers
 */
function accountConfirmationEmail(userName, confirmUrl) {
  const firstName = userName ? userName.split(' ')[0] : 'utilisateur';

  const content = `
    <!-- Welcome Icon -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; line-height: 80px;">
        <span style="font-size: 36px;">✉️</span>
      </div>
    </div>
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 600; color: #1a202c; text-align: center;">
      Bienvenue sur Storiom, ${firstName} ! 🎉
    </h2>
    
    <p style="margin: 0 0 25px; font-size: 15px; color: #4a5568; text-align: center; line-height: 1.6;">
      Nous sommes ravis de vous compter parmi nous ! Pour commencer à utiliser votre compte, veuillez confirmer votre adresse e-mail.
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 35px 0;">
      <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
        ✓ Confirmer mon compte
      </a>
    </div>
    
    <!-- Or copy link -->
    <p style="margin: 0 0 10px; font-size: 13px; color: #718096; text-align: center;">
      Ou copiez ce lien dans votre navigateur :
    </p>
    <p style="margin: 0 0 30px; font-size: 12px; color: #667eea; text-align: center; word-break: break-all; background-color: #f7fafc; padding: 12px 15px; border-radius: 8px; border: 1px dashed #e2e8f0;">
      ${confirmUrl}
    </p>
    
    <!-- Info boxes -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
      <tr>
        <td style="background-color: #fef3c7; border-radius: 12px; padding: 16px 20px; border-left: 4px solid #f59e0b;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px; vertical-align: top;">
                <span style="font-size: 20px;">⏰</span>
              </td>
              <td>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #92400e;">Lien valable 24 heures</p>
                <p style="margin: 5px 0 0; font-size: 13px; color: #b45309;">Ce lien expirera dans 24 heures. Si vous ne confirmez pas à temps, vous pourrez en demander un nouveau.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Features preview -->
    <div style="margin-top: 35px; padding-top: 30px; border-top: 1px solid #e8ecef;">
      <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 600; color: #1a202c; text-align: center;">
        Ce qui vous attend sur Storiom
      </h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="33%" style="text-align: center; padding: 10px;">
            <div style="font-size: 28px; margin-bottom: 8px;">📦</div>
            <p style="margin: 0; font-size: 13px; color: #4a5568; font-weight: 500;">Gestion des stocks</p>
          </td>
          <td width="33%" style="text-align: center; padding: 10px;">
            <div style="font-size: 28px; margin-bottom: 8px;">📊</div>
            <p style="margin: 0; font-size: 13px; color: #4a5568; font-weight: 500;">Statistiques</p>
          </td>
          <td width="33%" style="text-align: center; padding: 10px;">
            <div style="font-size: 28px; margin-bottom: 8px;">🛒</div>
            <p style="margin: 0; font-size: 13px; color: #4a5568; font-weight: 500;">Marketplace</p>
          </td>
        </tr>
      </table>
    </div>
  `;

  return emailWrapper(content);
}

/**
 * Link expired - new confirmation link email
 */
function expiredLinkEmail(userName, confirmUrl) {
  const firstName = userName ? userName.split(' ')[0] : 'utilisateur';

  const content = `
    <!-- Warning Icon -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; line-height: 80px;">
        <span style="font-size: 36px;">🔄</span>
      </div>
    </div>
    
    <!-- Title -->
    <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 600; color: #1a202c; text-align: center;">
      Nouveau lien de confirmation
    </h2>
    
    <p style="margin: 0 0 25px; font-size: 15px; color: #4a5568; text-align: center; line-height: 1.6;">
      Bonjour ${firstName}, votre précédent lien de confirmation a expiré. Pas de souci, nous vous en avons généré un nouveau !
    </p>
    
    <!-- Alert box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
      <tr>
        <td style="background-color: #fef3c7; border-radius: 12px; padding: 16px 20px; border-left: 4px solid #f59e0b;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px; vertical-align: top;">
                <span style="font-size: 20px;">⚠️</span>
              </td>
              <td>
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  Votre ancien lien n'est plus valide. Utilisez le nouveau lien ci-dessous pour confirmer votre compte.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 35px 0;">
      <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        ✓ Confirmer mon compte
      </a>
    </div>
    
    <!-- Or copy link -->
    <p style="margin: 0 0 10px; font-size: 13px; color: #718096; text-align: center;">
      Ou copiez ce lien dans votre navigateur :
    </p>
    <p style="margin: 0 0 30px; font-size: 12px; color: #667eea; text-align: center; word-break: break-all; background-color: #f7fafc; padding: 12px 15px; border-radius: 8px; border: 1px dashed #e2e8f0;">
      ${confirmUrl}
    </p>
    
    <!-- Validity info -->
    <div style="text-align: center; padding: 20px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
      <p style="margin: 0; font-size: 14px; color: #166534;">
        <strong>🕐 Ce nouveau lien est valable pendant 24 heures</strong>
      </p>
    </div>
  `;

  return emailWrapper(content);
}

/**
 * Resend confirmation email
 */
function resendConfirmationEmail(userName, confirmUrl) {
  const firstName = userName ? userName.split(' ')[0] : 'utilisateur';

  const content = `
    <!-- Resend Icon -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; line-height: 80px;">
        <span style="font-size: 36px;">📨</span>
      </div>
    </div>
    
    <!-- Title -->
    <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 600; color: #1a202c; text-align: center;">
      Votre lien de confirmation
    </h2>
    
    <p style="margin: 0 0 25px; font-size: 15px; color: #4a5568; text-align: center; line-height: 1.6;">
      Bonjour ${firstName}, comme demandé, voici un nouveau lien pour confirmer votre compte Storiom.
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 35px 0;">
      <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        ✓ Confirmer mon compte
      </a>
    </div>
    
    <!-- Or copy link -->
    <p style="margin: 0 0 10px; font-size: 13px; color: #718096; text-align: center;">
      Ou copiez ce lien dans votre navigateur :
    </p>
    <p style="margin: 0 0 30px; font-size: 12px; color: #667eea; text-align: center; word-break: break-all; background-color: #f7fafc; padding: 12px 15px; border-radius: 8px; border: 1px dashed #e2e8f0;">
      ${confirmUrl}
    </p>
    
    <!-- Info boxes -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background-color: #eff6ff; border-radius: 12px; padding: 16px 20px; border-left: 4px solid #3b82f6;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px; vertical-align: top;">
                <span style="font-size: 20px;">ℹ️</span>
              </td>
              <td>
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                  <strong>Rappel :</strong> Ce lien est valable pendant 24 heures. Une fois confirmé, vous pourrez accéder à toutes les fonctionnalités de Storiom.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Help section -->
    <div style="margin-top: 30px; text-align: center;">
      <p style="margin: 0; font-size: 13px; color: #718096;">
        Des questions ? Contactez-nous à <a href="mailto:support@storiom.com" style="color: #667eea; text-decoration: none;">support@storiom.com</a>
      </p>
    </div>
  `;

  return emailWrapper(content);
}

module.exports = {
  accountConfirmationEmail,
  expiredLinkEmail,
  resendConfirmationEmail,
  serviceRequestStatusEmail,
  emailWrapper
};

/**
 * Service request status change email
 */
function serviceRequestStatusEmail(data) {
  const { customerName, serviceName, storeName, status, statusLabel, trackingCode, adminNote, trackUrl } = data;

  // Status-specific styling
  const statusStyles = {
    PENDING: { color: '#f59e0b', bg: '#fef3c7', icon: '⏳', border: '#f59e0b' },
    IN_PROGRESS: { color: '#0ea5e9', bg: '#e0f2fe', icon: '🔧', border: '#0ea5e9' },
    COMPLETED: { color: '#10b981', bg: '#d1fae5', icon: '✅', border: '#10b981' },
    CANCELLED: { color: '#ef4444', bg: '#fee2e2', icon: '❌', border: '#ef4444' }
  };

  const style = statusStyles[status] || statusStyles.PENDING;
  const firstName = customerName ? customerName.split(' ')[0] : 'Client';

  const content = `
    <!-- Status Icon -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 80px; height: 80px; background: ${style.bg}; border-radius: 50%; line-height: 80px; border: 3px solid ${style.border};">
        <span style="font-size: 36px;">${style.icon}</span>
      </div>
    </div>
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 600; color: #1a202c; text-align: center;">
      Mise à jour de votre demande
    </h2>
    
    <p style="margin: 0 0 25px; font-size: 15px; color: #4a5568; text-align: center; line-height: 1.6;">
      Bonjour ${firstName}, le statut de votre demande de service a été mis à jour.
    </p>
    
    <!-- Status badge -->
    <div style="text-align: center; margin-bottom: 25px;">
      <span style="display: inline-block; background: ${style.bg}; color: ${style.color}; font-size: 16px; font-weight: 700; padding: 12px 28px; border-radius: 50px; border: 2px solid ${style.border};">
        ${style.icon} ${statusLabel}
      </span>
    </div>
    
    <!-- Request details card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
      <tr>
        <td style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Service</p>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">${serviceName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Boutique</p>
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #334155;">🏪 ${storeName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 16px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Code de suivi</p>
                <p style="margin: 0; font-size: 20px; font-weight: 700; color: #6366f1; letter-spacing: 2px; font-family: 'SF Mono', Monaco, Consolas, monospace;">${trackingCode}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${adminNote ? `
    <!-- Admin note -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
      <tr>
        <td style="background-color: #eff6ff; border-radius: 12px; padding: 16px 20px; border-left: 4px solid #3b82f6;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px; vertical-align: top;">
                <span style="font-size: 20px;">💬</span>
              </td>
              <td>
                <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #1e40af; text-transform: uppercase;">Message de la boutique</p>
                <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.5;">${adminNote}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ` : ''}
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 35px 0;">
      <a href="${trackUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        📋 Voir ma demande
      </a>
    </div>
    
    <!-- Help section -->
    <div style="margin-top: 30px; text-align: center; padding-top: 25px; border-top: 1px solid #e8ecef;">
      <p style="margin: 0; font-size: 13px; color: #718096;">
        Des questions ? Contactez directement la boutique ou écrivez-nous à <a href="mailto:support@storiom.com" style="color: #667eea; text-decoration: none;">support@storiom.com</a>
      </p>
    </div>
  `;

  return emailWrapper(content);
}

