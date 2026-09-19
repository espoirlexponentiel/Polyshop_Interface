import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function AdminSettingsPage() {
  const { siteConfig, updateSiteConfig, uploadLogo, loading } = useSiteConfig();

  const [brandName, setBrandName] = useState('');
  const [brandBadge, setBrandBadge] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (siteConfig) {
      setBrandName(siteConfig.brandName || '7 SHOP');
      setBrandBadge(siteConfig.brandBadge || '7');
      setTagline(siteConfig.tagline || 'Boutique Officielle');
      setLogoUrl(siteConfig.logoUrl || '');
    }
  }, [siteConfig]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation type et taille
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await uploadLogo(file);
    if (res.success) {
      setLogoUrl(res.logoUrl);
      setSuccessMsg('✅ Logo téléversé et appliqué avec succès !');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || "Échec de l'upload du logo.");
    }
    setUploading(false);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!brandName.trim()) {
      setErrorMsg('Le nom de la marque ne peut pas être vide.');
      setSaving(false);
      return;
    }

    const res = await updateSiteConfig({
      brandName: brandName.trim(),
      brandBadge: brandBadge.trim() || brandName.trim().charAt(0),
      tagline: tagline.trim(),
      logoUrl: logoUrl.trim()
    });

    if (res.success) {
      setSuccessMsg('✅ Identité visuelle et textes enregistrés avec succès !');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
        <div className="spinner-blue" style={{ margin: '0 auto 16px' }}></div>
        <p>Chargement des paramètres de la marque...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Messages */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '24px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          color: '#ef4444',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '24px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Formulaire de modification */}
        <div style={{
          background: 'var(--admin-card-bg, #1e293b)',
          border: '1px solid var(--admin-border, #334155)',
          borderRadius: '16px',
          padding: '28px',
          color: '#ffffff'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🎨</span> Identité & Logo de la Boutique
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px', lineHeight: '1.5' }}>
            Personnalisez le logo visuel, le nom de votre marque et les textes qui apparaissent dans la barre de navigation, le pied de page et les écrans de connexion.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nom de la marque */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                Nom de la marque / Boutique *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="ex: 7 SHOP"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #475569',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              />
            </div>

            {/* Lettre / Symbole du Badge */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                Symbole / Initiale du Badge
              </label>
              <input
                type="text"
                value={brandBadge}
                onChange={(e) => setBrandBadge(e.target.value)}
                placeholder="ex: 7"
                maxLength={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #475569',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Affiché dans le badge jaune lorsque aucune image de logo personnalisée n'est fournie.
              </span>
            </div>

            {/* Slogan */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="ex: Boutique Officielle"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #475569',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Image de Logo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                Image de Logo personnalisée (PNG, SVG, JPG, WebP)
              </label>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                <label style={{
                  padding: '10px 18px',
                  background: '#0066FF',
                  color: '#ffffff',
                  borderRadius: '10px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: uploading ? 0.7 : 1
                }}>
                  <span>{uploading ? '⏳ Téléversement...' : '📁 Choisir un fichier'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: '700'
                    }}
                  >
                    🗑️ Retirer l'image
                  </button>
                )}
              </div>

              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Ou collez directement une URL d'image (https://...)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#cbd5e1',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            {/* Bouton de sauvegarde */}
            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                marginTop: '10px',
                padding: '14px',
                background: 'linear-gradient(135deg, #0066FF 0%, #0052cc 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.98rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(0, 102, 255, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {saving ? '💾 Enregistrement en cours...' : '💾 Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Aperçu en direct */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Aperçu Thème Clair (Header standard) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.5px' }}>
              👁️ Aperçu Navbar (Boutique)
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={brandName}
                    style={{ maxHeight: '42px', maxWidth: '120px', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: '#FFB800',
                    color: '#111827',
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(255, 184, 0, 0.4)'
                  }}>
                    {brandBadge || '7'}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: '900', fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.3px' }}>
                    {brandName || '7 SHOP'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0066FF' }}>Boutique</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Rayons</span>
              </div>
            </div>
          </div>

          {/* Aperçu Thème Sombre (Admin Sidebar & Footer) */}
          <div style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #1e293b'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.5px' }}>
              👁️ Aperçu Panneau Admin & Footer
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px',
              background: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  style={{ maxHeight: '38px', maxWidth: '110px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: '#FFB800',
                  color: '#111827',
                  fontWeight: '900',
                  fontSize: '1.2rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {brandBadge || '7'}
                </div>
              )}
              <div>
                <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#ffffff', letterSpacing: '-0.3px' }}>
                  {brandName || '7 SHOP'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>
                  ADMIN CONSOLE
                </div>
              </div>
            </div>
          </div>

          {/* Fiche d'information */}
          <div style={{
            background: 'rgba(0, 102, 255, 0.08)',
            border: '1px solid rgba(0, 102, 255, 0.25)',
            borderRadius: '16px',
            padding: '20px',
            color: '#cbd5e1',
            fontSize: '0.85rem',
            lineHeight: '1.6'
          }}>
            <h4 style={{ color: '#38bdf8', fontWeight: '800', marginBottom: '8px', fontSize: '0.92rem' }}>
              💡 Bon à savoir :
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              <li>Les modifications s'appliquent <strong>instantanément</strong> sur toute la boutique, la barre de navigation, le pied de page et les écrans de connexion.</li>
              <li>Pour un rendu optimal avec une image, utilisez un fichier avec un <strong>fond transparent (PNG ou SVG)</strong>.</li>
              <li>Si vous retirez l'image, le badge textuel avec l'initiale sera automatiquement utilisé.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
