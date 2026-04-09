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
        {/* Event badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', backgroundColor: 'rgba(232,121,59,0.12)', border: '1px solid rgba(232,121,59,0.3)', borderRadius: '999px', padding: '8px 20px' }}>
          <span style={{ color: '#E8793B', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
            World Health Day @ SJMC
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: '#1F2937', fontSize: '56px', fontFamily: 'Georgia, serif', lineHeight: 1.15, fontWeight: 400 }}>
            You train your body.
          </div>
          <div style={{ color: '#1F2937', fontSize: '56px', fontFamily: 'Georgia, serif', lineHeight: 1.15, fontWeight: 400 }}>
            Have you trained your
          </div>
          <div style={{ color: '#E8793B', fontSize: '56px', fontFamily: 'Georgia, serif', lineHeight: 1.15, fontStyle: 'italic', fontWeight: 400 }}>
            brain?
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ color: '#4B5563', fontSize: '22px', marginTop: '28px' }}>
          Free 20-second brain speed test — instant results
        </div>

        {/* Footer */}
        <div style={{ color: '#9CA3AF', fontSize: '14px', position: 'absolute', bottom: '30px' }}>
          Powered by ReCOGnAIze · Gray Matter Solutions
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
