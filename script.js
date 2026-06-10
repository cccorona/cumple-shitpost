document.addEventListener('DOMContentLoaded', () => {
    
    // --- START OVERLAY (AUTOPLAY POLICY BYPASS) ---
    const startOverlay = document.getElementById('start-overlay');
    const fakeScreen = document.getElementById('fake-screen');
    const ramenContainer = document.getElementById('ramen-container');
    const winamp = document.getElementById('winamp');
    const toolsSidebar = document.getElementById('sidebar');

    startOverlay.addEventListener('click', () => {
        startOverlay.style.display = 'none';
        fakeScreen.classList.remove('hidden');
        ramenContainer.classList.remove('hidden');
        winamp.classList.remove('hidden');
        toolsSidebar.classList.remove('hidden');
        
        initAudio();
        loadTrack(0); // auto-start the first track
    });


    // --- WINAMP PLAYER LOGIC ---
    const tracks = [
        { src: 'track3.mp4', name: '1. 코라손_불타 (Corazon)' },
        { src: 'track2.mp4', name: '2. 오늘_밤_주인공 (Tonight)' },
        { src: 'track1.mp4', name: '3. Mexico_to_Seoul' }
    ];
    let currentTrackIndex = 0;
    const video = document.getElementById('winamp-video');
    const trackName = document.getElementById('track-name');
    const timeDisplay = document.querySelector('.winamp-time');

    function loadTrack(index) {
        currentTrackIndex = index;
        video.src = tracks[currentTrackIndex].src;
        trackName.innerText = tracks[currentTrackIndex].name;
        video.play().catch(e => console.log("Autoplay prevented", e));
    }

    document.getElementById('wa-play').addEventListener('click', () => video.play());
    document.getElementById('wa-pause').addEventListener('click', () => video.pause());
    document.getElementById('wa-stop').addEventListener('click', () => {
        video.pause();
        video.currentTime = 0;
    });
    
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
    }
    
    document.getElementById('wa-next').addEventListener('click', nextTrack);
    document.getElementById('wa-prev').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
    });
    document.getElementById('wa-vol-up').addEventListener('click', () => {
        if(video.volume < 1) video.volume = Math.min(1, video.volume + 0.1);
        video.muted = false;
    });
    document.getElementById('wa-vol-down').addEventListener('click', () => {
        if(video.volume > 0) video.volume = Math.max(0, video.volume - 0.1);
    });

    video.addEventListener('timeupdate', () => {
        const mins = Math.floor(video.currentTime / 60);
        const secs = Math.floor(video.currentTime % 60);
        timeDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    });

    video.addEventListener('ended', nextTrack);

    // --- RAMENS VOLADORES ---
    setInterval(() => {
        const ramen = document.createElement('div');
        ramen.className = 'ramen';
        ramen.innerText = '🍜';
        ramen.style.top = Math.random() * 100 + 'vh';
        ramen.style.animationDuration = (Math.random() * 3 + 4) + 's'; 
        ramenContainer.appendChild(ramen);
        setTimeout(() => { if (ramen.parentNode) ramen.parentNode.removeChild(ramen); }, 8000);
    }, 1500);

    // --- BACKGROUND CONFETTI ---
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    setInterval(() => {
        if(isDestroyed) return;
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (Math.random() * 3 + 2) + 's';
        fakeScreen.appendChild(conf);
        setTimeout(() => { if (conf.parentNode) conf.parentNode.removeChild(conf); }, 5000);
    }, 200);

    // --- AUDIO SYNTHESIS ENGINE ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playSound(type) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        if (type === 'hammer') {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
            gainNode.gain.setValueAtTime(1.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'saw') {
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(300, now);
            osc2.frequency.setValueAtTime(305, now); 
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.1);
            osc2.stop(now + 0.1);
        } else if (type === 'bomb' || type === 'explosion') {
            const bufferSize = audioCtx.sampleRate * 3.0; 
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noiseSrc = audioCtx.createBufferSource();
            noiseSrc.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(50, now + 2);
            const gainNode = audioCtx.createGain();
            noiseSrc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            gainNode.gain.setValueAtTime(3, now); 
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
            noiseSrc.start(now);
        }
    }

    // --- BREAKING MECHANIC ---
    let MAX_LIFE = 1000000;
    let life = MAX_LIFE;
    let selectedTool = 'hammer';
    let damageAmount = 50000;
    let isDestroyed = false;
    let isDragging = false;
    let lastDragTime = 0;
    
    const cursors = {
        hammer: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='0' y='45' font-size='45'>🔨</text></svg>\") 15 15, auto",
        saw: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='0' y='45' font-size='45'>🪚</text></svg>\") 15 15, auto",
        bomb: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='0' y='45' font-size='45'>💣</text></svg>\") 15 15, auto"
    };

    const toolBtns = document.querySelectorAll('.tool-btn');
    const progressBar = document.getElementById('progress-bar');
    const realInvitation = document.getElementById('real-invitation');
    const bombBtn = document.getElementById('bomb-btn');

    const toolDamages = {
        hammer: 50000,
        saw: 5000,
        bomb: 300000
    };

    fakeScreen.style.cursor = cursors[selectedTool];

    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(btn.disabled) return;
            initAudio(); 
            toolBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedTool = e.target.getAttribute('data-tool');
            damageAmount = toolDamages[selectedTool];
            fakeScreen.style.cursor = cursors[selectedTool];
        });
    });

    function spawnParticles(x, y) {
        const count = selectedTool === 'hammer' ? 15 : 5;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.transform = `translate(0px, 0px) scale(1) rotate(0deg)`;
            p.style.opacity = '1';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 200; 
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            if (selectedTool === 'saw') {
                p.style.backgroundColor = Math.random() > 0.5 ? '#ffff00' : '#ffa500';
                p.style.boxShadow = "0 0 10px #ff0000";
                p.style.width = '10px';
                p.style.height = '10px';
            } else if (selectedTool === 'bomb') {
                p.style.backgroundColor = Math.random() > 0.5 ? '#ff0000' : '#333333';
                p.style.width = '30px';
                p.style.height = '30px';
            } else if (selectedTool === 'hammer') {
                p.style.backgroundColor = '#00ffff'; 
            }

            fakeScreen.appendChild(p);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    p.style.transform = `translate(${dx}px, ${dy}px) scale(0.1) rotate(720deg)`;
                    p.style.opacity = '0';
                });
            });
            setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 600);
        }
    }

    function applyDamage(x, y, isDragEvent = false) {
        if (life <= 0 || isDestroyed) return;

        if (isDragEvent && selectedTool === 'saw') {
            const now = Date.now();
            if (now - lastDragTime < 80) return; // throttle
            lastDragTime = now;
        } else if (isDragEvent && (selectedTool === 'hammer' || selectedTool === 'bomb')) {
            return; // Hammer and Bomb don't drag
        }

        life -= damageAmount;
        if (life < 0) life = 0;

        const percentage = (life / MAX_LIFE) * 100;
        progressBar.style.height = percentage + '%';
        progressBar.innerText = `${life} / 1,000,000 HP`;

        if (percentage <= 30 && bombBtn.disabled) {
            bombBtn.disabled = false;
            bombBtn.classList.add('blink'); 
            alert("¡BOMBA DESBLOQUEADA! Úsala para el remate final.");
        }

        playSound(selectedTool);

        fakeScreen.classList.remove('shake', 'shake-hard');
        void fakeScreen.offsetWidth; 
        if (selectedTool === 'bomb') {
            fakeScreen.classList.add('shake-hard');
        } else {
            fakeScreen.classList.add('shake');
        }

        spawnParticles(x, y);

        if (selectedTool === 'hammer') {
            const crack = document.createElement('div');
            crack.className = 'crack-img';
            crack.style.left = x + 'px';
            crack.style.top = y + 'px';
            crack.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
            fakeScreen.appendChild(crack);
        } else if (selectedTool === 'saw') {
            const sawCut = document.createElement('div');
            sawCut.className = 'saw-cut';
            sawCut.style.left = x + 'px';
            sawCut.style.top = y + 'px';
            sawCut.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
            fakeScreen.appendChild(sawCut);
        }

        checkWin();
    }

    function checkWin() {
        if (life === 0 && !isDestroyed) {
            isDestroyed = true;
            
            playSound('explosion');
            fakeScreen.classList.add('shake-hard');
            
            const finalExplosion = document.createElement('div');
            finalExplosion.className = 'explosion-gif';
            finalExplosion.style.left = '50%';
            finalExplosion.style.top = '50%';
            fakeScreen.appendChild(finalExplosion);

            setTimeout(() => {
                fakeScreen.style.opacity = '0';
                setTimeout(() => {
                    fakeScreen.classList.add('hidden');
                    realInvitation.classList.remove('hidden');
                    toolsSidebar.classList.add('hidden'); // Hide weapons!
                }, 2000); 
            }, 1000); 
        }
    }

    fakeScreen.addEventListener('mousedown', (e) => {
        if(isDestroyed) return;
        initAudio();
        isDragging = true;
        const rect = fakeScreen.getBoundingClientRect();
        applyDamage(e.clientX - rect.left, e.clientY - rect.top, false);
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    fakeScreen.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = fakeScreen.getBoundingClientRect();
            applyDamage(e.clientX - rect.left, e.clientY - rect.top, true);
        }
    });

    fakeScreen.addEventListener('touchstart', (e) => {
        if(isDestroyed) return;
        initAudio();
        isDragging = true;
        const rect = fakeScreen.getBoundingClientRect();
        applyDamage(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top, false);
    });
    window.addEventListener('touchend', () => { isDragging = false; });
    fakeScreen.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const rect = fakeScreen.getBoundingClientRect();
            applyDamage(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top, true);
        }
    });


    // --- EVASIVE "NO" BUTTON ---
    const btnNo = document.getElementById('btn-no');
    ['mouseover', 'touchstart'].forEach(evt => {
        btnNo.addEventListener(evt, (e) => {
            e.preventDefault(); 
            btnNo.style.position = 'fixed';
            const maxX = window.innerWidth - btnNo.offsetWidth;
            const maxY = window.innerHeight - btnNo.offsetHeight;
            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY);
            btnNo.style.left = randomX + 'px';
            btnNo.style.top = randomY + 'px';
            btnNo.style.zIndex = 9999;
        });
    });
    btnNo.addEventListener('click', () => {
        alert("¡JA! Muy lento. Intenta de nuevo.");
    });


    // --- WRONG TIME RADIO BUTTON EXPLOSIONS ---
    const wrongTimes = document.querySelectorAll('.wrong-time');
    wrongTimes.forEach(label => {
        const input = label.querySelector('input');
        input.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            playSound('explosion');
            
            const rect = label.getBoundingClientRect();
            const explode = document.createElement('div');
            explode.className = 'mini-explosion';
            explode.style.left = rect.left + 'px';
            explode.style.top = rect.top + 'px';
            document.body.appendChild(explode);
            
            label.style.visibility = 'hidden';
            
            setTimeout(() => {
                if(explode.parentNode) explode.parentNode.removeChild(explode);
            }, 1000);
        });
    });

    // --- FINAL CONFIRMATION (BAILES CULEROS) ---
    const btnYes = document.getElementById('btn-yes');
    const baileContainer = document.getElementById('baile-container');
    const baileVideo = document.getElementById('baile-video');

    btnYes.addEventListener('click', () => {
        // La música de winamp NO se pausa
        // Solo revelamos el contenedor y corremos el video y su animacion
        
        baileContainer.classList.remove('hidden');
        baileVideo.classList.add('spin-anim');
        
        baileVideo.play().catch(e => console.log(e));
        
        alert("¡Excelente! Nos vemos el 11 a las 7:00 PM en La Gardela. ❤️");
    });

    const correctTime = document.querySelector('.correct-time input');
    correctTime.addEventListener('change', () => {
        alert("¡Hora perfecta elegida! Solo te falta aceptar abajo.");
    });

});
