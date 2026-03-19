/* ═══════════════════════════════════════════
   script.js  —  Gallery Logic (Enhanced)
   ═══════════════════════════════════════════ */

const cloudName = "shadomarch"

/* ── STATE ── */
let allImages  = []   // full list of {src, name, index}
let lightboxIdx = 0   // current lightbox position

/* ══════════════════════════════
   LOAD IMAGES
══════════════════════════════ */
async function loadImages() {
    const masonry  = document.getElementById("gallery")
    const countEl  = document.getElementById("img-count")
    const labelEl  = document.querySelector(".g-toolbar__label")

    // Show skeletons while fetching
    showSkeletons(masonry, 12)

    try {
        const res  = await fetch("images.json")
        const data = await res.json()

        masonry.innerHTML = ""

        if (!data.images || data.images.length === 0) {
            masonry.innerHTML = "<div class='g-error'>[ NO IMAGES FOUND IN ARCHIVE ]</div>"
            return
        }

        // Build image list
        allImages = data.images.map((publicId, i) => ({
            src:  `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`,
            name: publicId.slice(0, 18) + ".jpg",
            idx:  i
        }))

        if (countEl) countEl.textContent = allImages.length + " photo" + (allImages.length !== 1 ? "s" : "")
        if (labelEl) labelEl.textContent  = "▓ ARCHIVE LOADED"

        // Render items with staggered entrance
        allImages.forEach((item, i) => {
            const el = buildCard(item, i)
            masonry.appendChild(el)

            // Staggered reveal via IntersectionObserver
            observeItem(el, i)
        })

    } catch (err) {
        console.error("Error loading images:", err)
        masonry.innerHTML = "<div class='g-error'>[ ERROR LOADING ARCHIVE ]</div>"
        if (labelEl) labelEl.textContent = "⚠ LOAD FAILED"
    }
}

/* ── SKELETON PLACEHOLDERS ── */
function showSkeletons(container, count) {
    container.innerHTML = ""
    // varied heights for masonry feel
    const heights = [180, 240, 200, 260, 180, 220, 200, 240, 180, 200, 220, 260]
    for (let i = 0; i < count; i++) {
        const sk = document.createElement("div")
        sk.className = "gallery-skeleton"
        sk.style.height = (heights[i % heights.length]) + "px"
        container.appendChild(sk)
    }
}

/* ── BUILD CARD ── */
function buildCard(item, i) {
    const wrap = document.createElement("div")
    wrap.className = "gallery-item"

    const img = document.createElement("img")
    img.alt     = "Archive photo " + (i + 1)
    img.loading = "lazy"

    // Lazy-load src via IntersectionObserver (set after observe)
    img.dataset.src = item.src

    const overlay = document.createElement("div")
    overlay.className = "gallery-item__overlay"

    const info = document.createElement("div")
    info.className = "gallery-item__info"
    info.innerHTML = `
        <span class="gallery-item__name">${item.name}</span>
        <span class="gallery-item__num">#${String(i + 1).padStart(2, "0")}</span>
    `

    const badge = document.createElement("div")
    badge.className   = "gallery-item__badge"
    badge.textContent = "PHOTO · " + String(i + 1).padStart(2, "0")

    wrap.appendChild(img)
    wrap.appendChild(overlay)
    wrap.appendChild(info)
    wrap.appendChild(badge)

    wrap.addEventListener("click", () => openLightbox(i))

    return wrap
}

/* ── INTERSECTION OBSERVER (entrance + lazy load) ── */
const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el  = entry.target
        const img = el.querySelector("img")

        // Load real image
        if (img && img.dataset.src) {
            img.src = img.dataset.src
            delete img.dataset.src
        }

        // Animate in (with a small delay based on column position)
        setTimeout(() => {
            el.classList.add("is-visible")
        }, Math.random() * 120)  // slight randomness for natural feel

        io.unobserve(el)
    })
}, { rootMargin: "80px", threshold: 0.05 })

function observeItem(el, i) {
    io.observe(el)
}

/* ══════════════════════════════
   LIGHTBOX
══════════════════════════════ */
function openLightbox(index) {
    lightboxIdx = index
    renderLightbox()
    document.getElementById("lightbox").classList.add("active")
    document.body.style.overflow = "hidden"
}

function closeLightbox() {
    document.getElementById("lightbox").classList.remove("active")
    document.body.style.overflow = ""
}

function lightboxPrev() {
    if (lightboxIdx > 0) { lightboxIdx--; renderLightbox() }
}
function lightboxNext() {
    if (lightboxIdx < allImages.length - 1) { lightboxIdx++; renderLightbox() }
}

function renderLightbox() {
    const item    = allImages[lightboxIdx]
    const img     = document.getElementById("lightbox-img")
    const cap     = document.getElementById("lightbox-cap")
    const counter = document.getElementById("lightbox-counter")
    const prevBtn = document.getElementById("lb-prev")
    const nextBtn = document.getElementById("lb-next")

    // fade out → swap src → fade in
    img.classList.add("is-loading")
    const newSrc = item.src
    img.onload = () => img.classList.remove("is-loading")
    img.src    = newSrc

    if (cap)     cap.textContent     = "PHOTO " + String(lightboxIdx + 1).padStart(2, "0") + " · " + item.name.toUpperCase()
    if (counter) counter.textContent = (lightboxIdx + 1) + " / " + allImages.length

    if (prevBtn) prevBtn.disabled = lightboxIdx === 0
    if (nextBtn) nextBtn.disabled = lightboxIdx === allImages.length - 1
}

/* keyboard nav */
document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("lightbox")
    if (!lb || !lb.classList.contains("active")) return
    if (e.key === "ArrowLeft"  || e.key === "a") lightboxPrev()
    if (e.key === "ArrowRight" || e.key === "d") lightboxNext()
    if (e.key === "Escape")                       closeLightbox()
})