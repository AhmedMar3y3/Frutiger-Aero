export type Soundscape = { play: () => Promise<void>; pause: () => Promise<void>; volume: (v: number) => void; world: (v: number) => void; dispose: () => void };
/** An original, endless ambient composition. All sound is synthesized locally. */
export function createSoundscape(initialVolume: number, initialWorld: number): Soundscape {
  const context = new AudioContext();
  const master = context.createGain(); master.gain.value = initialVolume * 0.48;
  const compressor = context.createDynamicsCompressor(); master.connect(compressor); compressor.connect(context.destination);
  const delay = context.createDelay(3); delay.delayTime.value = 0.72;
  const feedback = context.createGain(); feedback.gain.value = .35;
  const wet = context.createGain(); wet.gain.value = .28;
  delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(master);
  let scene = initialWorld, step = 0, nextChord = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const chords = [[48,55,59,62,67],[45,52,55,59,64],[41,48,52,55,60],[43,50,53,57,62]];
  function tone(midi: number, at: number, duration: number, gain: number, bell = false) {
    const osc = context.createOscillator(), envelope = context.createGain();
    osc.type = 'sine'; osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    const pan = context.createStereoPanner(); pan.pan.value = Math.sin(midi * 3.2) * .6;
    envelope.gain.setValueAtTime(0, at); envelope.gain.linearRampToValueAtTime(gain, at + (bell ? .02 : 2.5)); envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
    osc.connect(envelope); envelope.connect(pan); pan.connect(master); pan.connect(delay);
    osc.start(at); osc.stop(at + duration + .1);
    osc.onended = () => { osc.disconnect(); envelope.disconnect(); pan.disconnect(); };
  }
  function schedule() {
    const now = context.currentTime + .08, chord = chords[step % chords.length], shift = scene === 2 ? -5 : scene === 1 ? 2 : 0;
    chord.forEach(note => tone(note + shift, now, 12, .045));
    [0, 2, 4, 2, 1, 3, 4, 1].forEach((index, i) => tone(chord[index] + 24 + shift, now + i * .9, 3.8, scene === 2 ? .025 : .038, true)); step++; nextChord = context.currentTime + 8;
  }
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 6, context.sampleRate), samples = noiseBuffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * .06;
  const noise = context.createBufferSource(); noise.buffer = noiseBuffer; noise.loop = true;
  const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 650;
  const noiseGain = context.createGain(); noiseGain.gain.value = .16;
  noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(master); noise.start();
  void context.suspend();
  return {
    async play() { await context.resume(); if (!timer) { if (context.currentTime >= nextChord) schedule(); timer = setInterval(() => { if (context.currentTime >= nextChord) schedule(); }, 150); } },
    async pause() { await context.suspend(); if (timer) clearInterval(timer); timer = undefined; },
    volume(v) { master.gain.setTargetAtTime(v * .48, context.currentTime, .15); },
    world(v) { scene = v; filter.frequency.setTargetAtTime(v === 1 ? 1200 : v === 2 ? 350 : 650, context.currentTime, 1); },
    dispose() { if (timer) clearInterval(timer); void context.close(); },
  };
}
