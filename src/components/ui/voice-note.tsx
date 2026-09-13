'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  type Transition,
  MotionConfig,
} from 'motion/react';
import { Mic, X, Play, Pause, Square } from 'lucide-react';
import { RiSendPlaneFill } from 'react-icons/ri';

export const RecorderState = {
  IDLE: 'IDLE',
  RECORDING: 'RECORDING',
  PAUSED: 'PAUSED',
  REVIEWING: 'REVIEWING',
  PLAYING: 'PLAYING',
} as const;

export type RecorderState = (typeof RecorderState)[keyof typeof RecorderState];

interface VoiceNoteRecorderProps {
  onSend?: (data: { duration: number; blob: Blob | null }) => void;
  onCancel?: () => void;
  maxDuration?: number;
}

export const VoiceNote: React.FC<VoiceNoteRecorderProps> = ({
  onSend,
  onCancel,
  maxDuration = 4,
}) => {
  const [state, setState] = useState<RecorderState>(RecorderState.IDLE);
  const [duration, setDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [hasCompletedPlayback, setHasCompletedPlayback] = useState(false);
  const [playSessionId, setPlaySessionId] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spring: Transition = { type: 'spring', stiffness: 480, damping: 46, mass: 0.8 };
  const iconSpring: Transition = { type: 'spring', stiffness: 520, damping: 34, mass: 0.6 };

  const beginRecordingInterval = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => {
        if (prev >= maxDuration) {
          stopRecordingAt();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setDuration(0);
    setHasCompletedPlayback(false);
    setState(RecorderState.RECORDING);
    beginRecordingInterval();
  };

  const pauseRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(RecorderState.PAUSED);
  };

  const resumeRecording = () => {
    setState(RecorderState.RECORDING);
    beginRecordingInterval();
  };

  const stopRecordingAt = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setHasCompletedPlayback(false);
    setState(RecorderState.REVIEWING);
  };

  const stopRecording = stopRecordingAt;

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setDuration(0);
    setPlaybackTime(0);
    setHasCompletedPlayback(false);
    setState(RecorderState.IDLE);
    onCancel?.();
  };

  const startPlayback = () => {
    setState(RecorderState.PLAYING);
    setPlaybackTime(duration);
    setPlaySessionId((id) => id + 1);
    playbackTimerRef.current = setInterval(() => {
      setPlaybackTime((prev) => {
        if (prev <= 1) {
          finishPlayback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishPlayback = () => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setPlaybackTime(0);
    setHasCompletedPlayback(true);
    setState(RecorderState.REVIEWING);
  };

  const stopPlayback = () => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setPlaybackTime(0);
    setHasCompletedPlayback(false);
    setState(RecorderState.REVIEWING);
  };

  const handleSend = () => {
    onSend?.({ duration, blob: null });
  };

  const [barHeights, setBarHeights] = useState<number[][]>([]);

  useEffect(() => {
    const heights = [...Array(6)].map(() => [
      8 + Math.random() * 6,
      18 + Math.random() * 10,
      12 + Math.random() * 8,
      24 + Math.random() * 12,
      10 + Math.random() * 6,
    ]);
    requestAnimationFrame(() => setBarHeights(heights));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  const isRecordingOrPaused =
    state === RecorderState.RECORDING || state === RecorderState.PAUSED;
  const isReviewingOrPlaying =
    state === RecorderState.REVIEWING || state === RecorderState.PLAYING;
  const isPaused = state === RecorderState.PAUSED;

  const actionBtnClass = `w-16 h-16 rounded-full flex items-center justify-center shrink-0 glass-control`;

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center space-y-12 bg-transparent p-8">
      <div className="glass-group flex items-center p-1.5">
        <MotionConfig transition={spring}>
          <AnimatePresence mode="popLayout">
            {state !== RecorderState.IDLE && (
              <motion.button
                key="cancel-btn"
                layout
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={cancelRecording}
                className={actionBtnClass}
              >
                <X size={26} className="glass-icon text-white/85" />
              </motion.button>
            )}
          </AnimatePresence>

          <GlassBridge show={state !== RecorderState.IDLE} />

          <motion.div
            animate={{
              width: state === RecorderState.IDLE ? '64px' : '124px',
            }}
            className={`relative z-20 rounded-full flex items-center justify-center overflow-hidden glass-control ${
              state === RecorderState.IDLE ? 'h-16 w-16' : 'h-16 px-6'
            } ${isRecordingOrPaused ? 'glass-control--recording' : ''}`}
          >
            <AnimatePresence mode="popLayout">
              {state === RecorderState.PLAYING && (
                <motion.svg
                  key="playback-progress"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  initial={{ opacity: 0, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, filter: 'blur(0)' }}
                  exit={{ opacity: 0, filter: 'blur(8px)' }}
                >
                  <motion.rect
                    key={playSessionId}
                    x="2"
                    y="2"
                    rx="9999"
                    width="calc(100% - 4px)"
                    height="calc(100% - 4px)"
                    fill="none"
                    className="stroke-red-500"
                    strokeWidth="2.5"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 1 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration: Math.max(duration, 1),
                      ease: 'linear',
                    }}
                  />
                </motion.svg>
              )}

              {state === RecorderState.REVIEWING && hasCompletedPlayback && (
                <motion.svg
                  key="playback-progress-complete"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  initial={{ opacity: 0, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, filter: 'blur(0)' }}
                  exit={{ opacity: 0, filter: 'blur(8px)' }}
                >
                  <motion.rect
                    x="2"
                    y="2"
                    rx="9999"
                    width="calc(100% - 4px)"
                    height="calc(100% - 4px)"
                    fill="none"
                    className="stroke-red-500"
                    strokeWidth="2.5"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={0}
                    strokeLinecap="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout" initial={false}>
              {state === RecorderState.IDLE && (
                <motion.button
                  key="mic-icon"
                  initial={{ opacity: 0, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, filter: 'blur(0)' }}
                  exit={{ opacity: 0, filter: 'blur(8px)' }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={startRecording}
                  className="flex items-center justify-center"
                >
                  <Mic size={28} className="glass-icon text-white" />
                </motion.button>
              )}

              {isRecordingOrPaused && (
                <motion.div
                  key="recording-ui"
                  className="z-10 flex items-center gap-1.5"
                >
                  {barHeights.map((heights, i) => (
                    <motion.div
                      key={i}
                      animate={isPaused ? { height: heights[0] } : { height: heights }}
                      transition={
                        isPaused
                          ? { duration: 0 }
                          : {
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                              delay: i * 0.08,
                            }
                      }
                      style={{ originY: 1 }}
                      className="bg-red-500 w-1.5 rounded-full"
                    />
                  ))}
                </motion.div>
              )}

              {isReviewingOrPlaying && (
                <motion.div
                  key="review-ui"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="z-10 flex items-center gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={
                      state === RecorderState.PLAYING
                        ? stopPlayback
                        : startPlayback
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      state === RecorderState.PLAYING
                        ? 'text-red-400'
                        : 'text-white'
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {state === RecorderState.PLAYING ? (
                        <motion.span
                          key="stop-icon"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={iconSpring}
                          className="glass-icon flex items-center justify-center"
                        >
                          <Square size={22} fill="currentColor" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="play-icon"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={iconSpring}
                          className="glass-icon flex items-center justify-center"
                        >
                          <Play size={22} fill="currentColor" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <span className="glass-icon text-white flex items-center justify-center gap-0.5 text-[20px] font-bold tabular-nums transition-colors">
                    <AnimatedNumber
                      value={
                        state === RecorderState.PLAYING
                          ? playbackTime
                          : duration
                      }
                    />
                    <motion.span layout>s</motion.span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <GlassBridge show={isRecordingOrPaused} />

          <AnimatePresence mode="popLayout">
            {isRecordingOrPaused && (
              <motion.button
                key="pause-resume-btn"
                layout
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={state === RecorderState.RECORDING ? pauseRecording : resumeRecording}
                className={actionBtnClass}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {state === RecorderState.RECORDING ? (
                    <motion.span
                      key="pause-icon"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={iconSpring}
                      className="glass-icon flex items-center justify-center"
                    >
                      <Pause size={24} className="text-white/85" fill="currentColor" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="resume-icon"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={iconSpring}
                      className="glass-icon flex items-center justify-center"
                    >
                      <Play size={24} className="text-white" fill="currentColor" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </AnimatePresence>

          <GlassBridge show={isRecordingOrPaused} />

          <AnimatePresence mode="popLayout">
            {isRecordingOrPaused && (
              <motion.button
                key="stop-btn"
                layout
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={stopRecording}
                className={actionBtnClass}
              >
                <Square size={22} className="glass-icon text-red-500" fill="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>

          <GlassBridge show={isReviewingOrPlaying} />

          <AnimatePresence mode="popLayout">
            {isReviewingOrPlaying && (
              <motion.button
                key="send-btn"
                layout
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleSend}
                className={actionBtnClass}
              >
                <RiSendPlaneFill size={24} className="glass-icon text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </MotionConfig>
      </div>
    </div>
  );
};

interface GlassBridgeProps {
  show: boolean;
}

/* The neck connecting two adjacent glass controls. Its own geometry never
   changes (a fixed capsule sliver) — only its vertical scale and opacity
   animate, driven by the same spring as the control it borders, so the
   pair reads as one material stretching apart / fusing back together
   rather than two independent shapes crossfading past each other. */
const GlassBridge: React.FC<GlassBridgeProps> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        key="bridge"
        initial={{ scaleY: 1, opacity: 0.85 }}
        animate={{ scaleY: 0.14, opacity: 0 }}
        exit={{ scaleY: 1, opacity: 0.85 }}
        className="glass-bridge h-16 w-3.5 shrink-0"
      />
    )}
  </AnimatePresence>
);

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

const digitVariants = {
  initial: (dir: number) => ({
    y: dir > 0 ? 8 : -8,
    opacity: 0,
    scale: 0.5,
    z: 0,
    filter: 'blur(2px)',
  }),
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    z: 10,
    filter: 'blur(0px)',
  },
  exit: (dir: number) => ({
    y: dir > 0 ? -8 : 8,
    opacity: 0,
    scale: 0.5,
    z: 0,
    filter: 'blur(2px)',
  }),
};

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const [direction, setDirection] = React.useState(0);
  const prevValueRef = React.useRef(value);

  React.useEffect(() => {
    const prev = prevValueRef.current;
    if (value > prev) setDirection(1);
    else if (value < prev) setDirection(-1);
    prevValueRef.current = value;
  }, [value]);

  const digits = value.toString().split('');

  const [prevDigits, setPrevDigits] = React.useState<string[]>([]);
  const [prevTicks, setPrevTicks] = React.useState<number[]>([]);

  const len = digits.length;
  const lenDiff = len - prevDigits.length;

  const nextTicks = digits.map((digit, i) => {
    const prevI = i - lenDiff;
    const prevDigit = prevI >= 0 ? prevDigits[prevI] : undefined;
    const prevTick = prevI >= 0 ? prevTicks[prevI] : 0;
    return digit !== prevDigit ? (prevTick ?? 0) + 1 : (prevTick ?? 0);
  });

  if (prevDigits.join('') !== digits.join('')) {
    setPrevTicks(nextTicks);
    setPrevDigits(digits);
  }

  return (
    <div
      className={`relative flex items-center justify-center gap-1 tabular-nums ${className ?? ''}`}
    >
      {digits.map((digit, index) => (
        <div key={`${index}-${len}`} className="relative w-3">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.span
              layout
              key={nextTicks[index]}
              custom={direction}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 16,
                mass: 1.2,
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
