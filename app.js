// Minimal Buddy prototype: drag, speak, canned chat, simple emotes
(() => {
  const buddy = document.getElementById('buddy');
  const svg = document.getElementById('buddy-svg');
  const bubble = document.getElementById('bubble');
  const msgInput = document.getElementById('msg');
  const sendBtn = document.getElementById('send');
  const log = document.getElementById('log');
  const waveBtn = document.getElementById('wave');
  const danceBtn = document.getElementById('dance');
  const resetBtn = document.getElementById('reset');
  const autoplay = document.getElementById('autoplay');

  // Dragging
  let dragging = false;
  let startX=0, startY=0, origLeft=0, origTop=0;
  buddy.style.position = 'relative';
  buddy.style.left = '0px';
  buddy.style.top = '0px';

  buddy.addEventListener('pointerdown', (e)=> {
    dragging = true;
    buddy.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY;
    origLeft = parseFloat(buddy.style.left) || 0;
    origTop = parseFloat(buddy.style.top) || 0;
  });
  window.addEventListener('pointermove', (e)=> {
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    buddy.style.left = (origLeft + dx) + 'px';
    buddy.style.top = (origTop + dy) + 'px';
  });
  buddy.addEventListener('pointerup', (e)=> {
    dragging = false;
    try{ buddy.releasePointerCapture(e.pointerId); }catch(e){}
  });

  // Chat logic (very small canned responder)
  const canned = [
    {q:/hello|hi|hey/i, a:"Hello! I'm Buddy. Want to see me dance?"},
    {q:/who are you/i, a:"I'm Buddy, a friendly assistant prototype."},
    {q:/dance|move|shake/i, a:"Watch me!" },
    {q:/wave/i, a:"*waves*" },
    {q:/.*/, a:"That's interesting — tell me more!"}
  ];

  function respond(text){
    // find canned match
    let ans = canned.find(c => c.q.test(text));
    let reply = ans ? ans.a : "I don't know about that yet.";
    appendLog('you', text);
    setTimeout(()=> {
      appendLog('buddy', reply);
      showBubble(reply);
      if(autoplay.checked) speak(reply);
      // simple animation triggers
      if(/dance|move|shake/i.test(text)) doDance();
      if(/wave/i.test(text)) doWave();
    }, 300);
  }

  sendBtn.addEventListener('click', ()=> {
    const v = msgInput.value.trim();
    if(!v) return;
    respond(v);
    msgInput.value = '';
  });
  msgInput.addEventListener('keydown', (e)=> {
    if(e.key === 'Enter') { sendBtn.click(); }
  });

  function appendLog(who, text){
    const d = document.createElement('div');
    d.className = 'log-item';
    d.textContent = (who === 'you' ? 'You: ' : 'Buddy: ') + text;
    log.prepend(d);
  }

  function showBubble(text){
    bubble.textContent = text;
    bubble.classList.remove('hidden');
    setTimeout(()=> bubble.classList.add('hidden'), 4000);
  }

  // Speech Synthesis
  function speak(text){
    if(!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    // prefer a voice that matches locale if available
    const voices = window.speechSynthesis.getVoices();
    if(voices && voices.length) {
      // pick a warm voice if available
      u.voice = voices.find(v => /female|alloy|samantha|zira/i.test(v.name)) || voices[0];
      u.rate = 1;
      u.pitch = 1;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  // Simple emotes
  function doWave(){
    svg.classList.remove('dance');
    svg.classList.add('wave');
    setTimeout(()=> svg.classList.remove('wave'), 900);
  }
  function doDance(){
    svg.classList.remove('wave');
    svg.classList.add('dance');
  }
  function reset(){
    svg.classList.remove('dance','wave');
    buddy.style.left = '0px';
    buddy.style.top = '0px';
  }

  waveBtn.addEventListener('click', ()=> { doWave(); showBubble("I wave!"); if(autoplay.checked) speak("I wave!"); });
  danceBtn.addEventListener('click', ()=> { doDance(); showBubble("Let's dance!"); if(autoplay.checked) speak("Let's dance!"); });
  resetBtn.addEventListener('click', ()=> { reset(); showBubble("Reset."); if(autoplay.checked) speak("All reset."); });

  // initial greeting
  setTimeout(()=> {
    const init = "Hi — I'm Buddy! Type something or press Wave/Dance.";
    appendLog('buddy', init);
    showBubble(init);
    if(autoplay.checked) speak(init);
  }, 350);

})();
