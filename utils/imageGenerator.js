import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Zap, AlertCircle } from 'lucide-react';
// Make sure to import your CSS file if you have one specific to this component!

// ⚡ 1. Accept the new props from the Dashboard
export default function ImageGenerator({ onImageGenerated, credits, setCredits, onGoToGallery }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Frontend Check: Stop them immediately if they are out of credits
    if (credits <= 0) {
      setError("You are out of credits! Your balance will reset 24 hours after your last refill.");
      return;
    }

    setIsGenerating(true);
    setError(''); // Clear any previous errors

    try {
      // Call our REAL backend, sending the secure token
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt, style })
      });

      const data = await response.json();

      // Handle errors from the backend
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      // Update the UI with their exact new credit balance from the database
      if (data.creditsRemaining !== undefined && setCredits) {
        setCredits(data.creditsRemaining);
      }

      // Send the new image to the Dashboard to display it
      if (onImageGenerated) {
        onImageGenerated(data);
      }
      
      // Clear the prompt box so it's ready for a new idea
      setPrompt(''); 

    } catch (err) {
      console.error("Generation Error:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="generator-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* ⚡ CREDIT BADGE */}
      <div 
        className="credit-badge" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px',
          background: credits > 0 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          color: credits > 0 ? '#4f46e5' : '#ef4444',
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontWeight: '600',
          marginBottom: '24px'
        }}
      >
        <Zap size={18} />
        {credits > 0 ? `${credits} Credits Remaining` : 'Out of Credits'}
      </div>

      <div className="gallery-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Create an Image</h1>
        <p style={{ color: '#4b5563' }}>Turn your imagination into stunning visuals in seconds.</p>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: '#fef2f2', color: '#dc2626', 
          padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
          border: '1px solid #f87171'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROMPT INPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px' }}>YOUR PROMPT</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city floating in the clouds at sunset..."
            rows="4"
            style={{
              width: '100%', padding: '16px', borderRadius: '12px',
              border: '1px solid #e2e8f0', fontSize: '15px', resize: 'vertical'
            }}
            disabled={isGenerating || credits <= 0}
          />
        </div>

        {/* STYLE DROPDOWN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px' }}>ART STYLE</label>
          <div style={{ position: 'relative' }}>
            <ImageIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{
                width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px',
                border: '1px solid #e2e8f0', fontSize: '15px', appearance: 'none', cursor: 'pointer',
                background: '#fff'
              }}
              disabled={isGenerating || credits <= 0}
            >
              <option value="Realistic">Realistic Photography</option>
              <option value="Anime">Anime Style</option>
              <option value="Cinematic">Cinematic Lighting</option>
              <option value="Watercolor">Watercolor Painting</option>
              <option value="3D">3D Render</option>
            </select>
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim() || credits <= 0}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: (isGenerating || !prompt.trim() || credits <= 0) ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5, #9333ea)',
            color: '#fff', padding: '16px', borderRadius: '12px',
            fontSize: '16px', fontWeight: '600', border: 'none',
            cursor: (isGenerating || !prompt.trim() || credits <= 0) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', marginTop: '10px'
          }}
        >
          <Sparkles size={20} />
          {isGenerating ? 'Creating Masterpiece...' : 'Generate Image (Costs 1 Credit)'}
        </button>

        {/* ⚡ 2. GO TO GALLERY BUTTON (Only shows when credits hit 0) */}
        {credits <= 0 && (
          <button
            type="button"
            onClick={onGoToGallery}
            style={{
              width: '100%',
              padding: '16px',
              background: 'transparent',
              color: '#4f46e5',
              border: '2px solid #4f46e5',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              marginTop: '-8px' // Pulls it slightly closer to the disabled generate button
            }}
          >
            View My Previous Masterpieces ➔
          </button>
        )}

      </form>
    </div>
  );
}