'use client';
/* oxlint-disable jsx-a11y/media-has-caption -- Instrumental music; the track title is displayed in the player. */
/* oxlint-disable next/no-img-element -- Transparent decorative fish sprites use their original alpha-channel asset. */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, AudioLines, CloudSun, Fish, Globe2, Headphones, Maximize2, Minimize2, Moon, Pause, Play, Sparkles, Volume2, Waves } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const worlds = [
  { name: 'Paradise', icon: CloudSun, color: 'blue' },
  { name: 'Aquarium', icon: Fish, color: 'aqua' },
  { name: 'After hours', icon: Moon, color: 'night' },
];

export default function Home() {
  const [world, setWorld] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(45);
  const [motion, setMotion] = useState(true);
  const [immersed, setImmersed] = useState(false);
  const [about, setAbout] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioError, setAudioError] = useState('');
  const [fullscreenError, setFullscreenError] = useState('');
  const audio = useRef<HTMLAudioElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const audioBusy = useRef(false);
  const fullscreenBusy = useRef(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMotion(!matchMedia('(prefers-reduced-motion: reduce)').matches));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (audio.current) audio.current.volume = volume / 100;
  }, [volume]);
  useEffect(() => {
    const fullscreenChanged = () => { setImmersed(document.fullscreenElement === stage.current); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setAbout(false); if (!document.fullscreenElement) setImmersed(false); } };
    document.addEventListener('fullscreenchange', fullscreenChanged);
    window.addEventListener('keydown', escape);
    return () => { document.removeEventListener('fullscreenchange', fullscreenChanged); window.removeEventListener('keydown', escape); };
  }, []);
  async function toggleAudio() {
    if (!audio.current || audioBusy.current) return;
    audioBusy.current = true;
    try {
      if (audio.current.paused) await audio.current.play(); else audio.current.pause();
      setAudioError('');
    } catch { setAudioError('Music could not start. Tap play to try again.'); }
    finally { audioBusy.current = false; }
  }
  async function enterFullscreen() {
    if (fullscreenBusy.current || !stage.current) return;
    fullscreenBusy.current = true;
    setFullscreenError('');
    try {
      if (!stage.current.requestFullscreen) throw new Error('Fullscreen unavailable');
      await stage.current.requestFullscreen();
      setImmersed(true);
    } catch { setFullscreenError('This browser blocked fullscreen. Try opening the site in a full browser window.'); }
    finally { fullscreenBusy.current = false; }
  }
  async function leaveFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); setImmersed(false); }
    catch { setFullscreenError('Press Esc to leave fullscreen.'); }
  }
  return (
    <div ref={stage} className={`aero-world world-${world} ${motion ? '' : 'still'} ${immersed ? 'immersed' : ''}`}>
      <audio ref={audio} src="/new-look.mp3" loop preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={event => setElapsed(Math.floor(event.currentTarget.currentTime))} onError={() => { setPlaying(false); setAudioError('The music could not load. Please refresh and try again.'); }} />
      <div className="landscape" aria-hidden="true" /><div className="atmosphere" aria-hidden="true" /><div className="sunshine" aria-hidden="true" />
      <div className="life" aria-hidden="true">
        {Array.from({ length: 13 }, (_, i) => <span key={i} className="bubble" style={{ '--size': `${18 + (i * 37 % 105)}px`, '--left': `${i * 8.1}%`, '--delay': `${-i * 4.3}s`, '--duration': `${22 + i * 2}s` } as CSSProperties} />)}
        {Array.from({ length: 5 }, (_, i) => <div className={`swimmer swimmer-${i}`} key={i}><img src="/goldfish.png" alt="" draggable="false" /></div>)}
        <div className="glass-orb orb-one" /><div className="glass-orb orb-two" />
      </div>
      <header className="site-header chrome">
        <a href="#experience" className="brand" aria-label="Aero home"><span className="brand-orb"><Globe2 size={24} strokeWidth={1.3} /></span>aero<span className="brand-period">.</span></a>
        <nav className="nav-glass" aria-label="Main navigation"><a href="#experience" className="nav-active">The experience</a><button onClick={() => setAbout(true)}>The aesthetic <ArrowUpRight size={13} /></button></nav>
        <button className={`sound-toggle glass ${playing ? 'is-playing' : ''}`} onClick={toggleAudio}><AudioLines size={17} /><span>Sound {playing ? 'on' : 'off'}</span><span className="status-dot" /></button>
      </header>
      <main id="experience">
        <div className="hero chrome">
          <div className="eyebrow"><span /> YOUR INTERNET ESCAPE, CIRCA 2007</div>
          <h1>The future<br />we <span>dreamed of.</span></h1>
          <p>Clear skies. A quieter mind. A world that feels<br className="desktop-break" /> like a memory you haven’t made yet.</p>
          <div className="hero-actions"><button className="enter-button" onClick={enterFullscreen}><Sparkles size={18} /> Stay here a while <Maximize2 size={18} /></button><span className="headphone-note"><Headphones size={16} /> Best with headphones</span></div>
          {fullscreenError && <output className="fullscreen-error">{fullscreenError}</output>}
        </div>
        <div className="world-marker chrome"><span className="tiny-cross">+</span><div>YOU ARE SOMEWHERE BETTER<span>{world === 2 ? '02:07 AM · UNDER THE SAME MOON' : '25° · ALWAYS A LITTLE SUNNY'}</span></div></div>
        <div className="vertical-note chrome">BREATHE IN. FLOAT ON. <span>↓</span></div>
        <section className="bottom-deck chrome" aria-label="Experience controls">
          <div className="scene-picker glass">
            <div className="section-label">CHOOSE YOUR LITTLE WORLD <span>01 — 03</span></div>
            <div className="scene-options">{worlds.map((scene, i) => <button key={scene.name} className={`scene scene-${scene.color} ${world === i ? 'selected' : ''}`} onClick={() => setWorld(i)} aria-pressed={world === i}><span className="scene-preview"><scene.icon size={24} strokeWidth={1.4} />{world === i && <span className="scene-dot" />}</span><span className="scene-name">{scene.name}</span></button>)}</div>
          </div>
          <div className="player glass">
            <div className="player-main"><div className="album-art"><span><Waves size={27} /></span></div><div className="track-info"><div className="section-label">AERO RADIO <span className="radio-live">● LOFI</span></div><h2>New Look</h2><p>Wii U Mii Maker · Lofi Mix</p></div><button className="play-button" onClick={toggleAudio} aria-label={playing ? 'Pause music' : 'Play music'}>{playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button></div>
            <div className="player-bottom"><span className="track-time">{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</span><div className={`waveform ${playing ? 'active' : ''}`} aria-hidden="true">{Array.from({ length: 42 }, (_, i) => <i key={i} style={{ '--height': `${4 + (i * 13 % 16)}px`, '--beat': `${0.5 + (i % 7) * 0.17}s` } as CSSProperties} />)}</div><span className="infinity">∞</span><Volume2 size={15} /><Slider aria-label="Sound volume" value={[volume]} onValueChange={v => setVolume(Array.isArray(v) ? v[0] : v)} min={0} max={100} className="volume-slider" /></div>
            {audioError && <p role="alert" className="audio-error">{audioError}</p>}
          </div>
        </section>
      </main>
      <footer className="site-footer chrome"><span><span className="status-dot" /> All is well in this little corner of the internet.</span><div><button onClick={() => setMotion(!motion)} aria-pressed={motion}>{motion ? <Pause size={13} /> : <Play size={13} />} Motion {motion ? 'on' : 'off'}</button><span className="footer-divider" /><button onClick={enterFullscreen}><Maximize2 size={14} /> Immerse</button></div></footer>
      {immersed && <button className="exit-immerse glass" onClick={leaveFullscreen}><Minimize2 size={16} /> Back to the world <span>ESC</span></button>}
      <Dialog open={about} onOpenChange={setAbout}><DialogContent className="about-card glass"><Globe2 size={38} /><div className="eyebrow">A FUTURE FULL OF FEELING</div><DialogTitle>Remember when<br />the future was blue?</DialogTitle><DialogDescription>Frutiger Aero brings together the glossy interfaces, blue skies, green landscapes, and watery reflections of the mid-2000s internet. Technology felt friendly. Everything had a little shine.</DialogDescription><p>This is a small place to revisit that optimism. Pick a world, turn on the sound, and watch the fish drift by.</p><p className="credits">Day background: <a href="https://wallpapersafari.com/w/164HTj" target="_blank" rel="noreferrer">WallpaperSafari · paulblack</a>. Night background: <a href="https://wallpaper-house.com/wallpaper-id-500733.php" target="_blank" rel="noreferrer">Wallpaper House</a>. Music: New Look (Wii U Mii Maker Lofi Mix).</p><button className="enter-button" onClick={() => setAbout(false)}>Back to paradise <ArrowDown size={17} /></button></DialogContent></Dialog>
    </div>
  );
}
