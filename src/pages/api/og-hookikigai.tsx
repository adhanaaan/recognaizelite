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
          background: 'linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)',
          padding: '40px 60px',
        }}
      >
        {/* Ikigai branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ color: '#ffffff', fontSize: '28px', fontWeight: 300, letterSpacing: '0.45em' }}>
            I K I G A I
          </div>
          <div style={{ width: '120px', height: '1px', backgroundColor: '#6B7280', margin: '12px 0' }} />
          <div style={{ color: '#9CA3AF', fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Medical Clinic
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: '#ffffff', fontSize: '64px', fontFamily: 'Georgia, serif', lineHeight: 1.1, fontWeight: 400 }}>
            Are you sleeping
          </div>
          <div style={{ color: '#5CE0D8', fontSize: '64px', fontFamily: 'Georgia, serif', lineHeight: 1.1, fontStyle: 'italic', fontWeight: 400 }}>
            enough?
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ color: '#9CA3AF', fontSize: '20px', marginTop: '30px' }}>
          Take the 30-Second Cognitive Screening
        </div>

        {/* Footer */}
        <div style={{ color: '#4B5563', fontSize: '14px', position: 'absolute', bottom: '30px' }}>
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
