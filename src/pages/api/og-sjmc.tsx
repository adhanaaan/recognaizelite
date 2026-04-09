import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default function handler(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)',
          padding: '40px 60px',
        }}
      >
        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: '#1F2937', fontSize: '64px', fontFamily: 'Georgia, serif', lineHeight: 1.1, fontWeight: 400 }}>
            Forgetting things
          </div>
          <div style={{ color: '#E8793B', fontSize: '64px', fontFamily: 'Georgia, serif', lineHeight: 1.1, fontStyle: 'italic', fontWeight: 400 }}>
            more often?
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ color: '#4B5563', fontSize: '24px', marginTop: '30px' }}>
          Test your brain speed in 20 seconds
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', color: '#9CA3AF', fontSize: '16px' }}>
          <span>Free</span>
          <span>·</span>
          <span>No app needed</span>
          <span>·</span>
          <span>Instant results</span>
        </div>

        {/* Footer */}
        <div style={{ color: '#9CA3AF', fontSize: '14px', position: 'absolute', bottom: '30px' }}>
          Powered by ReCOGnAIze
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
