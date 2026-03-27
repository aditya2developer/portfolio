const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // make canvas background transparent
camera.position.z = 5;

// Light
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(5,5,5);
scene.add(light);

// Load GLTF Model (DOWNLOAD model first)
let model;
const loader = new THREE.GLTFLoader();

loader.load(
    "model.gltf",
    function(gltf) {
        model = gltf.scene;
        model.scale.set(2, 2, 2);
        scene.add(model);
        console.log("3D Model loaded successfully");
    },
    function(progress) {
        console.log((progress.loaded / progress.total * 100) + "% loaded");
    },
    function(error) {
        console.error("Error loading 3D model:", error);
        console.log("Make sure model.gltf is in the same directory");
    }
);

// Scroll Animation (GSAP)
gsap.to(camera.position, {
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    },
    z: 2,
    x: 2
});

// Animate
function animate(){
    requestAnimationFrame(animate);

    if(model){
        model.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}

animate();

const cursor = document.querySelector(".cursor");

const trails = [];
const trailCount = Math.min(15, window.innerWidth > 768 ? 15 : 8); // Reduce trails on mobile

// Create trail particles
for (let i = 0; i < trailCount; i++) {
    const trail = document.createElement("div");
    trail.classList.add("trail");
    document.body.appendChild(trail);
    trails.push({ el: trail, x: 0, y: 0 });
}

let mouse = { x: 0, y: 0 };

document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    cursor.style.top = mouse.y + "px";
    cursor.style.left = mouse.x + "px";
});

// Disable custom cursor on touch devices
if (window.matchMedia("(pointer: coarse)").matches) {
    cursor.style.display = "none";
}

// Explosion on click 💥 (skip on real links & form controls so mailto / nav work)
document.addEventListener("click", (e) => {
    // e.target can be a Text node inside <a> — Text has no .closest(); must use parent element
    const t = e.target;
    const el = t instanceof Element ? t : t.parentElement;
    if (!el || typeof el.closest !== "function") return;
    if (
        el.closest(
            'a.contact-mailto, a[href^="mailto:"], a[href^="http://"], a[href^="https://"], a[href^="#"], button, input, textarea, select, label'
        )
    ) {
        return;
    }

    // Professional burst effect with rays
    const rayCount = 12;
    
    for (let i = 0; i < rayCount; i++) {
        const ray = document.createElement("div");
        ray.classList.add("burst-ray");
        document.body.appendChild(ray);

        const angle = (i / rayCount) * Math.PI * 2;
        const length = 80;
        
        ray.style.left = e.clientX + "px";
        ray.style.top = e.clientY + "px";
        ray.style.width = length + "px";
        ray.style.height = "2px";
        ray.style.transform = `rotate(${(angle * 180) / Math.PI}deg)`;
        ray.style.opacity = "1";

        ray.animate([
            { width: length + "px", opacity: 1 },
            { width: length * 2 + "px", opacity: 0 }
        ], {
            duration: 600,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        });

        setTimeout(() => ray.remove(), 600);
    }

    // Particle bursts
    if (window.innerWidth < 480) return;
    
    for (let i = 0; i < 12; i++) {
        const spark = document.createElement("div");
        spark.classList.add("spark");
        document.body.appendChild(spark);

        spark.style.left = e.clientX + "px";
        spark.style.top = e.clientY + "px";

        const angle = Math.random() * 2 * Math.PI;
        const distance = 60 + Math.random() * 80;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        spark.animate([
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: "ease-out"
        });

        setTimeout(() => spark.remove(), 600);
    }
});

// Animate trail
function animateTrail() {
    let x = mouse.x;
    let y = mouse.y;

    trails.forEach((trail, index) => {
        trail.x += (x - trail.x) * 0.6; // increased from 0.3 to 0.6 for faster response
        trail.y += (y - trail.y) * 0.6;

        trail.el.style.left = trail.x + "px";
        trail.el.style.top = trail.y + "px";

        trail.el.style.transform = `scale(${1 - index / trailCount})`;

        x = trail.x;
        y = trail.y;
    });

    requestAnimationFrame(animateTrail);
}

animateTrail();

const texts = [
    "Cloud computing enthusiast (AWS, CloudStack)",
    "Building scalable cloud solutions",
    "Passionate about AWS & DevOps",
    "Quick learner with strong problem-solving skills"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const fullText = texts[textIndex];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    const currentText = fullText.substring(0, charIndex);
    document.getElementById("typing").textContent = currentText;

    let speed = isDeleting ? 40 : 70;

    // when full text typed
    if (!isDeleting && charIndex === fullText.length) {
        speed = 1500; // pause
        isDeleting = true;
    }

    // when fully deleted
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        speed = 500;
    }

    setTimeout(typeEffect, speed);
}

typeEffect();

// Ensure background video plays in browsers where autoplay needs explicit play call
const bgVideo = document.getElementById('bg-video');
if (bgVideo) {
    bgVideo.play().catch((err) => {
        console.warn('Background video autoplay blocked, user interaction needed:', err);
    });
}

// Nav link click effect - highlight active nav link
const navLinks = document.querySelectorAll('.nav a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.panel');
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
});

// =============================================================================
// CONTACT EMAIL (single place to edit your public address)
// =============================================================================
// Your address — used for:
//   • All <a class="contact-mailto"> links (intro + footer) via initContactEmailLink()
//   • Web3Forms: register the same inbox at https://web3forms.com when creating the key
// =============================================================================
const CONTACT_EMAIL = 'adityakumarsingh83401@gmail.com';

const WEB3FORMS_ACCESS_KEY = 'bc6385cb-92ab-47d8-a270-20bdf11cf115';

(function initContactEmailLink() {
    const addr = typeof CONTACT_EMAIL === 'string' ? CONTACT_EMAIL.trim() : '';
    if (!addr) return;
    const mailtoHref = 'mailto:' + addr;
    document.querySelectorAll('a.contact-mailto').forEach((link) => {
        link.href = mailtoHref;
        link.textContent = link.id === 'contact-email-link' ? 'Email: ' + addr : addr;
        link.setAttribute('title', 'Email ' + addr);
    });
})();

// Download Resume Handler - Open in new tab AND download
const downloadResumeBtn = document.getElementById('download-resume');
if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', (e) => {
        e.preventDefault(); // prevent default link behavior
        
        const resumeFile = 'Aks (1).pdf';
        
        // Open in new tab
        window.open(resumeFile, '_blank');
        
        // Trigger download
        const link = document.createElement('a');
        link.href = resumeFile;
        link.download = 'Aks.pdf'; // name it will be saved as
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const contactSubmit = document.getElementById('contact-submit');

if (contactForm && formStatus && contactSubmit) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        formStatus.textContent = '';
        formStatus.classList.remove('form-success', 'form-error');

        if (!WEB3FORMS_ACCESS_KEY) {
            formStatus.textContent = 'Add your Web3Forms access key in script.js (see https://web3forms.com).';
            formStatus.classList.add('form-error');
            return;
        }

        const name = document.getElementById('contact-name')?.value.trim() || '';
        const email = document.getElementById('contact-email')?.value.trim() || '';
        const message = document.getElementById('contact-message')?.value.trim() || '';

        if (!name || !email || !message) {
            formStatus.textContent = 'Please fill in all fields.';
            formStatus.classList.add('form-error');
            return;
        }

        contactSubmit.disabled = true;
        formStatus.textContent = 'Sending…';

        try {
            // Submissions are delivered to the inbox tied to WEB3FORMS_ACCESS_KEY (same as CONTACT_EMAIL in dashboard).
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    subject: `Portfolio contact from ${name}`,
                    name,
                    email,
                    message,
                    from_name: name
                })
            });

            const data = await res.json();

            if (data.success) {
                formStatus.textContent = 'Message sent. I will get back to you soon.';
                formStatus.classList.add('form-success');
                contactForm.reset();
            } else {
                formStatus.textContent = data.message || 'Something went wrong. Please try again.';
                formStatus.classList.add('form-error');
            }
        } catch (err) {
            formStatus.textContent = 'Network error. Check your connection and try again.';
            formStatus.classList.add('form-error');
        } finally {
            contactSubmit.disabled = false;
        }
    });
}

// Certificate Upload Handler
function handleCertUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
    }

    // Read file and display
    const reader = new FileReader();
    reader.onload = function(e) {
        const certNumber = event.target.dataset.cert;
        const imgElement = document.getElementById(`cert-img-${certNumber}`);
        
        if (imgElement) {
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
            
            // Store in localStorage for persistence
            localStorage.setItem(`cert-image-${certNumber}`, e.target.result);
        }
    };
    reader.readAsDataURL(file);
}

// Load certificate images from localStorage on page load
// Make certificate image wrappers clickable to trigger file upload
document.addEventListener('DOMContentLoaded', function() {
    // Load certificate images from localStorage
    for (let i = 1; i <= 6; i++) {
        const savedImage = localStorage.getItem(`cert-image-${i}`);
        if (savedImage) {
            const imgElement = document.getElementById(`cert-img-${i}`);
            if (imgElement) {
                imgElement.src = savedImage;
                imgElement.style.display = 'block';
            }
        }
    }

    // Make certificate image wrappers clickable to trigger file upload
    const certWrappers = document.querySelectorAll('.cert-image-wrapper');
    certWrappers.forEach((wrapper) => {
        wrapper.addEventListener('click', function() {
            const fileInput = this.querySelector('.cert-upload-input');
            if (fileInput) {
                fileInput.click();
            }
        });
    });

});