import React from 'react';
import { formatFCFA } from '../../utils/priceUtils';

/**
 * Composant d'affichage des prix :
 * - Prix principal en FCFA (grand et bien visible)
 * - Ancien prix barré en FCFA si réduction
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
            fontSize: isLarge ? '0.92rem' : isSmall ? '0.72rem' : '0.80rem', 
            color: '#94a3b8', 
            opacity: 0.65,
            textDecoration: 'line-through',
            fontWeight: '500'
          }}>
            {formatFCFA(oldPrice)}
          </span>
        )}
      </div>
    </div>
  );
}
