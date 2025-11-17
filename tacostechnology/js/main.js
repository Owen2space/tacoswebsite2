const TACOS = (() => {
  const selectors = {
    navLinks: '.nav__link',
    header: '.site-header',
    year: '#year',
    reveals: '.reveal',
    storyPath: '.story-path',
    featureCards: '.feature-card',
    capabilityCards: '.capability-card',
    teamCards: '.team-card',
    contactForm: '.contact-form',
    droneCanvas: '#droneCanvas',
  };

  const state = {
    lastScrollY: 0,
    drone: {
      renderer: null,
      scene: null,
      camera: null,
      group: null,
      frame: 0,
    },
  };

  function initNav() {
    const navLinks = document.querySelectorAll(selectors.navLinks);
    const current = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach((link) => {
      const target = link.getAttribute('href');
      if (current === target || (current === '' && target === 'index.html')) {
        link.classList.add('is-active');
      }
    });
  }

  function initHeader() {
    const header = document.querySelector(selectors.header);
    if (!header) return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 40) {
        header.classList.add('is-scrolled');
        if (currentY > state.lastScrollY && currentY > 320) {
          header.classList.add('is-hidden');
        } else {
          header.classList.remove('is-hidden');
        }
      } else {
        header.classList.remove('is-scrolled', 'is-hidden');
      }
      state.lastScrollY = currentY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
  }

  function initYear() {
    const yearEl = document.querySelector(selectors.year);
    if (!yearEl) return;
    yearEl.textContent = new Date().getFullYear();
  }

  function initGSAP() {
    if (!window.gsap) return;
    const { gsap } = window;

    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger, window.MotionPathPlugin);
    }

    gsap.utils.toArray(selectors.reveals).forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
          },
        }
      );
    });

    gsap.utils.toArray(selectors.storyPath).forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: path.closest('section') || path,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true,
        },
      });

      gsap.fromTo(
        path,
        { opacity: 0.2 },
        {
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: path.closest('section') || path,
            start: 'top 85%',
          },
        }
      );
    });

    const hoverCards = document.querySelectorAll(
      `${selectors.featureCards}, ${selectors.capabilityCards}, ${selectors.teamCards}`
    );

    hoverCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -10, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.5, ease: 'power3.out' });
      });
      card.addEventListener('focus', () => {
        gsap.to(card, { y: -8, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('blur', () => {
        gsap.to(card, { y: 0, duration: 0.5, ease: 'power3.out' });
      });
    });
  }

  function initDrone() {
    if (!window.THREE) return;
    const canvas = document.querySelector(selectors.droneCanvas);
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f9ff, 0.08);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(3.2, 2.4, 5.2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.82);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(0xc24a4a, 2, 10, 2);
    accentLight.position.set(0, 1.4, 0);
    scene.add(accentLight);

    const droneGroup = new THREE.Group();

    const materialBody = new THREE.MeshStandardMaterial({
      color: 0xf4f5fa,
      metalness: 0.3,
      roughness: 0.2,
    });

    const materialAccent = new THREE.MeshStandardMaterial({
      color: 0xc24a4a,
      emissive: 0x742626,
      metalness: 0.4,
      roughness: 0.32,
    });

    const bodyGeometry = new THREE.BoxGeometry(2, 0.4, 1);
    const body = new THREE.Mesh(bodyGeometry, materialBody);
    droneGroup.add(body);

    const spineGeometry = new THREE.BoxGeometry(2.2, 0.12, 0.16);
    const spine = new THREE.Mesh(spineGeometry, materialAccent);
    spine.position.y = 0.2;
    droneGroup.add(spine);

    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.6, 24);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xe1e4ec, metalness: 0.2, roughness: 0.4 });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.rotation.z = Math.PI / 2;
    droneGroup.add(arm);

    const crossArm = arm.clone();
    crossArm.rotation.y = Math.PI / 2;
    droneGroup.add(crossArm);

    const rotorGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 48);
    const rotorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.3 });

    const rotorPositions = [
      [1.3, 0.2, 1.3],
      [-1.3, 0.2, 1.3],
      [1.3, 0.2, -1.3],
      [-1.3, 0.2, -1.3],
    ];

    const rotors = rotorPositions.map(([x, y, z]) => {
      const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
      rotor.position.set(x, y, z);
      droneGroup.add(rotor);

      const accentRingGeometry = new THREE.TorusGeometry(0.65, 0.04, 16, 80);
      const accentRing = new THREE.Mesh(accentRingGeometry, materialAccent);
      accentRing.rotation.x = Math.PI / 2;
      accentRing.position.set(x, y + 0.05, z);
      droneGroup.add(accentRing);

      return rotor;
    });

    const sensorGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 32);
    const sensor = new THREE.Mesh(sensorGeometry, materialAccent);
    sensor.rotation.z = Math.PI / 2;
    sensor.position.set(1.1, -0.1, 0);
    droneGroup.add(sensor);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 32), materialBody);
    tail.rotation.z = -Math.PI / 2;
    tail.position.set(-1.3, -0.1, 0);
    droneGroup.add(tail);

    droneGroup.position.y = 0;
    scene.add(droneGroup);

    const glowGeometry = new THREE.RingGeometry(0.9, 1.1, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xc24a4a, opacity: 0.24, transparent: true });
    const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = -0.38;
    droneGroup.add(glowRing);

    state.drone = { renderer, scene, camera, group: droneGroup, rotors };

    function handleResize() {
      const rect = canvas.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    function animate() {
      state.drone.frame += 0.01;
      droneGroup.rotation.y += 0.0045;
      droneGroup.position.y = Math.sin(state.drone.frame) * 0.12;
      glowRing.material.opacity = 0.2 + Math.abs(Math.sin(state.drone.frame * 2)) * 0.12;
      rotors.forEach((rotor, index) => {
        const spin = index % 2 === 0 ? 0.6 : -0.6;
        rotor.rotation.y += spin;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(droneGroup.rotation, {
        x: y * -0.4,
        z: x * 0.4,
        duration: 0.8,
        ease: 'power2.out',
      });
    });

    window.addEventListener('scroll', () => {
      const progress = Math.min(window.scrollY / 800, 1);
      gsap.to(droneGroup.position, {
        x: progress * 0.8,
        z: progress * -0.6,
        duration: 1.2,
        ease: 'power3.out',
      });
    });
  }

  function initContactForm() {
    const form = document.querySelector(selectors.contactForm);
    if (!form) return;

    const responseEl = form.querySelector('.form-response');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = formData.get('name');

      responseEl.textContent = 'Transmitting mission request...';
      gsap.to(responseEl, { opacity: 1, duration: 0.3 });

      setTimeout(() => {
        form.reset();
        responseEl.textContent = `Mission received, ${name || 'Commander'}. Our team will respond within 24 hours.`;
        gsap.fromTo(
          responseEl,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
      }, 900);
    });
  }


  function init() {
    initNav();
    initHeader();
    initYear();
    initGSAP();
    initDrone();
    initContactForm();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', TACOS.init);

