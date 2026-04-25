import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const palette = {
  bg: '#f7f4ff',
  text: '#24133e',
  textSoft: '#6f5b93',
  purple: '#7c3aed',
  purpleDeep: '#5b21b6',
  border: 'rgba(124,58,237,0.14)',
  glow: 'rgba(124,58,237,0.16)',
};

const shots = [
  {
    title: 'Input built for instant setup',
    subtitle:
      'Select the microphone, test it, and control clipboard behavior before recording starts.',
    accent: 'Input',
    src: staticFile('input-area.png'),
  },
  {
    title: 'Transcription modes, ready fast',
    subtitle: 'Switch between local Whisper and cloud transcription without leaving the app flow.',
    accent: 'Transcription',
    src: staticFile('transcription.png'),
  },
  {
    title: 'Controls that stay out of your way',
    subtitle: 'Tune recording mode and hotkey behavior for a faster voice-to-text workflow.',
    accent: 'Controls',
    src: staticFile('controls-area.png'),
  },
  {
    title: 'History you can actually reuse',
    subtitle: 'Review, copy, paste, and manage previous transcripts from one panel.',
    accent: 'History',
    src: staticFile('history.png'),
  },
  {
    title: 'Dictionary memory for repeated terms',
    subtitle: 'Save the words it gets wrong once, then let future transcripts come out cleaner.',
    accent: 'Dictionary',
    src: staticFile('dictionary.png'),
  },
];

const WordVoiceMark: React.FC<{size: number; light?: boolean}> = ({size, light}) => {
  const color = light ? '#ffffff' : palette.purple;
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="5" fill={color} opacity="0.12" />
      <path
        d="M3.8 5.2l1.5 7.6 2-4.7 1.7 4.7 1.7-4.7 2 4.7 1.5-7.6"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 5.7h1.2M12.6 8.1h1.6M13 10.5h1.2"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
};

const IntroCard: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({fps, frame, config: {damping: 18, stiffness: 110}});
  const fadeOut = interpolate(frame, [60, 82], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        opacity: fadeOut,
        transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.96, 1]
        )})`,
      }}
    >
      <div
        style={{
          width: 128,
          height: 128,
          borderRadius: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #ffffff 0%, #f2e7ff 100%)',
          boxShadow: '0 28px 64px rgba(124,58,237,0.16)',
        }}
      >
        <WordVoiceMark size={72} />
      </div>
      <div
        style={{
          fontSize: 108,
          lineHeight: 0.94,
          fontWeight: 700,
          letterSpacing: '-0.08em',
          color: palette.text,
        }}
      >
        WordVoice
      </div>
      <div
        style={{
          fontSize: 28,
          color: palette.textSoft,
          letterSpacing: '0.01em',
          maxWidth: 760,
          textAlign: 'center',
        }}
      >
        AI-powered desktop dictation that makes typing feel effortless.
      </div>
    </div>
  );
};

const ScreenshotFrame: React.FC<{src: string; frame: number}> = ({src, frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({fps, frame, config: {damping: 20, stiffness: 120}});
  const scale = interpolate(enter, [0, 1], [0.965, 1]);
  const y = interpolate(enter, [0, 1], [18, 0]);

  return (
    <div
      style={{
        position: 'relative',
        width: 1120,
        height: 680,
        borderRadius: 38,
        padding: 18,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,242,255,0.98))',
        border: `1px solid ${palette.border}`,
        boxShadow: '0 34px 84px rgba(96, 59, 178, 0.18)',
        transform: `translateY(${y}px) scale(${scale})`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          right: 18,
          height: 18,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          paddingLeft: 8,
          zIndex: 2,
        }}
      >
        <span style={{width: 10, height: 10, borderRadius: 999, background: '#fca5a5'}} />
        <span style={{width: 10, height: 10, borderRadius: 999, background: '#fcd34d'}} />
        <span style={{width: 10, height: 10, borderRadius: 999, background: '#86efac'}} />
      </div>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 26,
        }}
      />
    </div>
  );
};

const SlideCard: React.FC<{frame: number; duration: number; shot: (typeof shots)[number]}> = ({
  frame,
  duration,
  shot,
}) => {
  const {fps} = useVideoConfig();
  const enter = spring({fps, frame, config: {damping: 18, stiffness: 120}});
  const fadeIn = interpolate(enter, [0, 1], [0, 1]);
  const fadeOut = interpolate(frame, [duration - 9, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const settleY = interpolate(enter, [0, 1], [24, 0]);
  const exitY = interpolate(frame, [duration - 10, duration], [0, -12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeIn * fadeOut,
        transform: `translateY(${settleY + exitY}px)`,
      }}
    >
      <div
        style={{
          width: 1620,
          minHeight: 770,
          display: 'grid',
          gridTemplateColumns: '440px minmax(0, 1fr)',
          gap: 56,
          alignItems: 'center',
          padding: '44px 48px',
          borderRadius: 48,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.58), rgba(247,240,255,0.42))',
          border: `1px solid ${palette.border}`,
          boxShadow: '0 28px 80px rgba(97, 60, 181, 0.08)',
        }}
      >
        <div
          style={{
            padding: '12px 0 12px 8px',
            transform: `translateX(${interpolate(enter, [0, 1], [-24, 0])}px)`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(124,58,237,0.08)',
              color: palette.purpleDeep,
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            {shot.accent}
          </div>
          <div
            style={{
              fontSize: 58,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: palette.text,
              maxWidth: 420,
            }}
          >
            {shot.title}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 24,
              lineHeight: 1.42,
              color: palette.textSoft,
              maxWidth: 392,
            }}
          >
            {shot.subtitle}
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <ScreenshotFrame src={shot.src} frame={frame} />
        </div>
      </div>
    </div>
  );
};

const EndCard: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({fps, frame, config: {damping: 18, stiffness: 110}});
  const backdrop = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: backdrop,
          background:
            'radial-gradient(circle at 82% 24%, rgba(124,58,237,0.16), transparent 24%), linear-gradient(180deg, rgba(252,251,255,0.82), rgba(244,236,255,0.9))',
          backdropFilter: 'blur(20px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: 1080,
          padding: '52px 58px',
          borderRadius: 42,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(246,237,255,0.98))',
          border: `1px solid ${palette.border}`,
          boxShadow: '0 36px 86px rgba(90,56,170,0.18)',
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${interpolate(
            enter,
            [0, 1],
            [0.97, 1]
          )})`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28}}>
          <WordVoiceMark size={40} />
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: '-0.06em',
              color: palette.text,
            }}
          >
            WordVoice
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            lineHeight: 1.01,
            fontWeight: 700,
            letterSpacing: '-0.065em',
            color: palette.text,
            maxWidth: 860,
          }}
        >
          Type faster. Edit less. Speak naturally.
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 24,
            lineHeight: 1.42,
            color: palette.textSoft,
            maxWidth: 760,
          }}
        >
          An AI-powered alternative to WhisperFlow for easier desktop typing, with microphone
          testing, transcription controls, history, and dictionary memory built in.
        </div>
      </div>
    </div>
  );
};

const CreditCard: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({fps, frame, config: {damping: 20, stiffness: 120}});
  const creditDuration = 42;
  const glow = interpolate(frame, [0, 24], [0.18, 0.34], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [creditDuration - 10, creditDuration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const exitY = interpolate(frame, [creditDuration - 10, creditDuration], [0, -14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        opacity: enter * fadeOut,
        transform: `translateY(${interpolate(enter, [0, 1], [22, 0]) + exitY}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.985, 1]
        )})`,
      }}
    >
      <div
        style={{
          fontSize: 24,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: palette.textSoft,
        }}
      >
        Built by
      </div>
      <div
        style={{
          fontSize: 92,
          lineHeight: 0.98,
          fontWeight: 700,
          letterSpacing: '-0.075em',
          color: palette.text,
          textAlign: 'center',
          textShadow: `0 18px 48px rgba(124,58,237,${glow})`,
        }}
      >
        Yar Muhammad
      </div>
    </div>
  );
};

const ClosingLogo: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({fps, frame, config: {damping: 18, stiffness: 110}});
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        opacity: enter * fadeIn,
        transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.94, 1]
        )})`,
      }}
    >
      <div
        style={{
          width: 148,
          height: 148,
          borderRadius: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #ffffff 0%, #f2e7ff 100%)',
          boxShadow: '0 30px 76px rgba(124,58,237,0.18)',
        }}
      >
        <WordVoiceMark size={84} />
      </div>
      <div
        style={{
          fontSize: 88,
          lineHeight: 0.96,
          fontWeight: 700,
          letterSpacing: '-0.08em',
          color: palette.text,
        }}
      >
        WordVoice
      </div>
    </div>
  );
};

export const WordVoiceLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const introDuration = 92;
  const slideDuration = 64;
  const slideStart = 82;
  const featureEnd = slideStart + shots.length * slideDuration;
  const endCardStart = featureEnd + 10;
  const endCardDuration = 54;
  const creditStart = endCardStart + endCardDuration + 12;
  const creditDuration = 42;
  const logoStart = creditStart + creditDuration + 8;
  const logoDuration = 38;

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 16% 16%, rgba(216,180,254,0.34), transparent 25%), radial-gradient(circle at 84% 16%, rgba(124,58,237,0.24), transparent 22%), linear-gradient(180deg, #fcfbff 0%, #f7f4ff 52%, #efe6ff 100%)',
        overflow: 'hidden',
        fontFamily: 'IBM Plex Sans, sans-serif',
      }}
      >
      <Audio src={staticFile('slow-burn-launch.mp3')} volume={0.16} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.48), transparent 88%)',
        }}
      />

      <Sequence from={0} durationInFrames={introDuration}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <IntroCard frame={frame} />
        </AbsoluteFill>
      </Sequence>

      {shots.map((shot, index) => {
        const from = slideStart + index * slideDuration;
        const duration = slideDuration;
        return (
          <Sequence key={shot.title} from={from} durationInFrames={duration}>
            <AbsoluteFill>
              <SlideCard frame={frame - from} duration={duration} shot={shot} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      <Sequence from={endCardStart} durationInFrames={endCardDuration}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <EndCard frame={frame - endCardStart} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={creditStart} durationInFrames={creditDuration}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <CreditCard frame={frame - creditStart} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={logoStart} durationInFrames={logoDuration}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <ClosingLogo frame={frame - logoStart} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
