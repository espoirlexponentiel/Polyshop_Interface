import React from 'react';
import { formatFCFA, formatEuro } from '../../utils/priceUtils';

/**
 * Composant d'affichage des prix :
 * - Prix principal en FCFA (grand et bien visible)
 * - Prix indicatif en Euro (en bas, tout petit et discret)
 */
export default function DualPrice({ 
  price, 
  oldPrice = null, 
  size = 'md', 
  align = 'left', 
  className = '',
  color = '#0f172a'
}) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  const isExtraLarge = size === 'xl';

  const mainFontSize = isExtraLarge ? '1.75rem' : isLarge ? '1.45rem' : isSmall ? '0.92rem' : '1.1rem';
  const subFontSize = isExtraLarge ? '0.82rem' : isLarge ? '0.78rem' : isSmall ? '0.68rem' : '0.72rem';

  return (
    <div className={`dual-price-box ${className}`} style={{ textAlign: align }}>
      {/* Ligne principale en FCFA */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: isLarge || isExtraLarge ? '8px' : '5px',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
      }}>
        <span style={{ 
          fontWeight: '900', 
          color: color, 
          fontSize: mainFontSize, 
          letterSpacing: '-0.3px',
          lineHeight: 1.15 
        }}>
          {formatFCFA(price)}
        </span>
        
        {oldPrice && Number(oldPrice) > Number(price) && (
          <span style={{ 
            fontSize: isLarge ? '0.95rem' : isSmall ? '0.75rem' : '0.82rem', 
            color: '#94a3b8', 
            textDecoration: 'line-through',
            fontWeight: '600'
          }}>
            {formatFCFA(oldPrice)}
          </span>
        )}
      </div>

      {/* Ligne secondaire en Euro (petit en bas) */}
      <div style={{ 
        fontSize: subFontSize, 
        color: '#64748b', 
        fontWeight: '600',
        marginTop: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
      }}>
        <span>~ {formatEuro(price)}</span>
        {oldPrice && Number(oldPrice) > Number(price) && (
          <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>
            {formatEuro(oldPrice)}
          </span>
        )}
      </div>
    </div>
  );
}
