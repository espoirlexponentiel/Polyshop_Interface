// ========================================================
// 💰 UTILITAIRES DE GESTION DES DEVISES (FCFA & EURO)
// Parité officielle fixe : 1 EUR = 655.957 FCFA (XOF / XAF)
// ========================================================

export const EUR_RATE = 655.957;

/**
 * Formate un montant en FCFA (séparateur de milliers français, arrondi entier)
 * Ex: 15000 -> "15 000 FCFA"
 */
export function formatFCFA(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '0 FCFA';
  }
  const rounded = Math.round(Number(amount));
  return `${rounded.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Convertit un montant en FCFA vers l'Euro (€) et le formate
 * Ex: 15000 -> "22,87 €"
 */
export function formatEuro(amountInFcfa) {
  if (amountInFcfa === undefined || amountInFcfa === null || isNaN(Number(amountInFcfa))) {
    return '0,00 €';
  }
  const eur = Number(amountInFcfa) / EUR_RATE;
  return `${eur.toFixed(2).replace('.', ',')} €`;
}

/**
 * Convertit des Euros en FCFA (arrondi entier)
 */
export function euroToFcfa(amountInEuro) {
  if (!amountInEuro || isNaN(Number(amountInEuro))) return 0;
  return Math.round(Number(amountInEuro) * EUR_RATE);
}

/**
 * Convertit des FCFA en Euros (valeur numérique)
 */
export function fcfaToEuro(amountInFcfa) {
  if (!amountInFcfa || isNaN(Number(amountInFcfa))) return 0;
  return Number((Number(amountInFcfa) / EUR_RATE).toFixed(2));
}
