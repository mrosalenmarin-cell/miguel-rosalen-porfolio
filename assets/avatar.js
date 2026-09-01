// Prototipo simple: crea un avatar low-poly y aplica cambios según respuestas
(function(){
  const canvas = document.getElementById('three-canvas');
  const WIDTH = 160, HEIGHT = 120; // low res render for pixel look

  const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:false});
  renderer.setClearColor(0x000000);
  renderer.setSize(WIDTH, HEIGHT, false);

  // scale up CSS to make pixels visible
  canvas.style.width = '640px';
  canvas.style.height = '480px';
  canvas.style.imageRendering = 'pixelated';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 100);
  camera.position.set(0,1.6,3);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,10,7);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambient);

  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshBasicMaterial({color:0x111111}));
  ground.rotation.x = -Math.PI/2; ground.position.y = -1.2; scene.add(ground);

  // avatar group
  const avatar = new THREE.Group();
  scene.add(avatar);

  // basic low-poly parts
  const materials = {
    skin: new THREE.MeshLambertMaterial({color:0xf2d0b3}),
    clothes: new THREE.MeshLambertMaterial({color:0x3a9ad9}),
    hair: new THREE.MeshLambertMaterial({color:0x231f20}),
    accent: new THREE.MeshLambertMaterial({color:0xffcc00})
  };

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.9), materials.skin);
  head.position.y = 0.9; avatar.add(head);

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1,1.2,0.6), materials.clothes);
  body.position.y = -0.1; avatar.add(body);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.9,0.25), materials.skin);
  leftArm.position.set(-0.8,0.0,0);
  avatar.add(leftArm);
  const rightArm = leftArm.clone(); rightArm.position.x = 0.8; avatar.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35,0.9,0.35), materials.clothes);
  leftLeg.position.set(-0.3,-1.1,0);
  avatar.add(leftLeg);
  const rightLeg = leftLeg.clone(); rightLeg.position.x = 0.3; avatar.add(rightLeg);

  // simple eyes (texture-less)
  const eyeGeo = new THREE.BoxGeometry(0.12,0.12,0.02);
  const eyeMat = new THREE.MeshBasicMaterial({color:0x000000});
  const le = new THREE.Mesh(eyeGeo, eyeMat); le.position.set(-0.18,0.95,0.46); avatar.add(le);
  const re = le.clone(); re.position.x = 0.18; avatar.add(re);

  // hair (simple cube)
  let hair = new THREE.Mesh(new THREE.BoxGeometry(0.95,0.45,0.95), materials.hair);
  hair.position.y = 1.2; avatar.add(hair);

  // animation state
  let clock = new THREE.Clock();

  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    avatar.rotation.y = Math.sin(t*0.5)*0.15;
    avatar.position.y = Math.sin(t*1.5)*0.02;
    renderer.render(scene, camera);
  }
  animate();

  // Question flow
  const questions = [
    {q: '¿Cómo te sientes hoy?', key:'mood', type:'choice', opts:['Feliz','Triste','Enojado','Aburrido']},
    {q: 'Color de piel', key:'skin', type:'choice', opts:['Claro','Medio','Oscuro']},
    {q: 'Color de ropa', key:'clothes', type:'choice', opts:['Azul','Rojo','Verde','Morado']},
    {q: 'Peinado', key:'hair', type:'choice', opts:['Corto','Largo','Mohicano','Calvo']},
    {q: '¿Quieres accesorio?', key:'acc', type:'choice', opts:['Gafas','Sombrero','Nada']},
    {q: '¿Listo para ser atrapado por el sistema?', key:'trap', type:'choice', opts:['Sí','No']}
  ];

  let answers = {};
  let index = 0;

  const qEl = document.getElementById('question');
  const choices = document.getElementById('choices');
  const nextBtn = document.getElementById('nextBtn');

  function renderQuestion(){
    const q = questions[index];
    qEl.textContent = q.q;
    choices.innerHTML = '';
    q.opts.forEach(opt=>{
      const btn = document.createElement('button'); btn.textContent = opt;
      btn.addEventListener('click', ()=>{
        answers[q.key] = opt;
        applyAnswer(q.key,opt);
        // auto advance
        if(index < questions.length-1) { index++; renderQuestion(); }
        else finishFlow();
      });
      choices.appendChild(btn);
    });
  }

  function applyAnswer(key,val){
    if(key === 'skin'){
      const map = { 'Claro':0xf2d0b3, 'Medio':0xd1a384, 'Oscuro':0x8b5a3c };
      materials.skin.color.setHex(map[val]||0xf2d0b3);
      head.material = materials.skin; leftArm.material = materials.skin; rightArm.material = materials.skin;
    }
    if(key === 'clothes'){
      const map = {'Azul':0x3a9ad9,'Rojo':0xd93a3a,'Verde':0x3ad96a,'Morado':0x7a39d9};
      materials.clothes.color.setHex(map[val]||0x3a9ad9);
      body.material = materials.clothes; leftLeg.material = materials.clothes; rightLeg.material = materials.clothes;
    }
    if(key === 'hair'){
      avatar.remove(hair);
      if(val === 'Calvo') hair = null;
      else if(val === 'Corto') hair = new THREE.Mesh(new THREE.BoxGeometry(0.95,0.35,0.95), materials.hair);
      else if(val === 'Largo') hair = new THREE.Mesh(new THREE.BoxGeometry(1.0,0.6,0.95), materials.hair);
      else if(val === 'Mohicano') hair = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.85,0.95), materials.hair);
      if(hair){ hair.position.y = 1.2; avatar.add(hair); }
    }
    if(key === 'acc'){
      // remove old accessory
      if(avatar._acc) { avatar.remove(avatar._acc); avatar._acc = null; }
      if(val === 'Gafas'){
        const g = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.2,0.02), new THREE.MeshBasicMaterial({color:0x000000}));
        g.position.y = 0.95; g.position.z = 0.48; avatar._acc = g; avatar.add(g);
      }
      if(val === 'Sombrero'){
        const h = new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.7,0.2,6), new THREE.MeshLambertMaterial({color:0x333333}));
        h.position.y = 1.45; avatar._acc = h; avatar.add(h);
      }
    }
    if(key === 'mood'){
      // change eye color or smile (approx)
      const colorMap = {'Feliz':0x00ff00,'Triste':0x0000ff,'Enojado':0xff0000,'Aburrido':0xaaaaaa};
      le.material.color.setHex(colorMap[val]||0x000000);
      re.material.color.setHex(colorMap[val]||0x000000);
    }
  }

  function finishFlow(){
    // If trap accepted -> show overlay and animate camera in
    const overlay = document.getElementById('overlay');
    if(answers['trap'] === 'Sí'){
      overlay.className = '';
      overlay.classList.add('trap');
      overlay.textContent = 'EL SISTEMA TE ATRAPÓ';
      overlay.style.position = 'absolute'; overlay.style.width='100%'; overlay.style.height='100%';
      // zoom camera forward
      const startZ = camera.position.z;
      let t0 = performance.now();
      function zoom(now){
        const p = Math.min(1,(now - t0)/1200);
        camera.position.z = startZ - 2*p;
        if(p < 1) requestAnimationFrame(zoom);
      }
      requestAnimationFrame(zoom);
    } else {
      const overlay = document.getElementById('overlay'); overlay.className=''; overlay.textContent='Has escapado... por ahora.'; setTimeout(()=>overlay.className='hidden',1800);
    }
    document.getElementById('question').textContent = 'Fin del cuestionario';
    choices.innerHTML = '';
    nextBtn.disabled = true;
  }

  renderQuestion();

  // expose for debugging
  window._avatarProto = {scene,avatar,applyAnswer,answers};

})();
