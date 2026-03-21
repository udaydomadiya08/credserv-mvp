import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';

const Scene: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 20], [0, 1]);
    const scale = spring({ frame, fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{
            backgroundColor: '#050505',
            color: 'white',
            fontFamily: 'system-ui',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: 'url("file:///Users/uday/Downloads/credserv/remotion/remotion_bg.png")',
            backgroundSize: 'cover'
        }}>
            <div style={{ opacity, transform: `scale(${scale})`, textAlign: 'center' }}>
                <h1 style={{ fontSize: 80, marginBottom: 40 }}>{title}</h1>
                <div style={{ fontSize: 40, background: 'rgba(255,255,255,0.05)', padding: 40, borderRadius: 20, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {children}
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const Main: React.FC = () => {
    const frame = useCurrentFrame();
    if (frame < 150) return <Scene title="CredServ MVP">AI-Native FinTech Onboarding & Collections</Scene>;
    if (frame < 300) return <Scene title="Phase 1: KYC Extractor">99% Accuracy with Math Verification Engine</Scene>;
    if (frame < 450) return <Scene title="Phase 2: Orchestrator">LangGraph State Machine with Bounded Autonomy</Scene>;
    return <Scene title="Project Complete">Check demo_output.md for full results</Scene>;
};
