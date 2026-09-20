document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PORTAL LOGIN MODAL
       ===================================================== */

    const portalModal = document.getElementById("portalModal");
    const portalLoginBtn = document.getElementById("portalLoginBtn");
    const closePortalBtn = document.getElementById("closePortalModalBtn");
    const verifyPortalBtn = document.getElementById("verifyPortalBtn");


    function openPortal() {

        if (!portalModal) return;

        portalModal.classList.remove("hidden");

        document.body.classList.add("modal-open");
    }


    function closePortal() {

        if (!portalModal) return;

        portalModal.classList.add("hidden");

        document.body.classList.remove("modal-open");
    }


    if (portalLoginBtn) {
        portalLoginBtn.addEventListener("click", openPortal);
    }


    if (closePortalBtn) {
        closePortalBtn.addEventListener("click", closePortal);
    }


    if (verifyPortalBtn) {

        verifyPortalBtn.addEventListener("click", () => {

            alert(
                "Demo verification successful. This is a portfolio demonstration."
            );

        });

    }


    /* =====================================================
       CERTIFICATE LIGHTBOX
       ===================================================== */

    const certLightbox = document.getElementById("certLightbox");

    const certModalImg = document.getElementById("certModalImg");

    const certModalTitle = document.getElementById("certModalTitle");

    const closeCertModalBtn =
        document.getElementById("closeCertModalBtn");


    const certificateCards =
        document.querySelectorAll(".cert-preview");


    function openCertificate(card) {

        if (!certLightbox) return;


        const imageSrc =
            card.getAttribute("data-cert-src");

        const title =
            card.getAttribute("data-cert-title") ||
            "Certificate Document";


        if (certModalImg) {

            certModalImg.src = imageSrc || "";

        }


        if (certModalTitle) {

            certModalTitle.innerHTML =
                '<i class="fa-solid fa-certificate text-[#ff0038]"></i> ' +
                title;

        }


        certLightbox.classList.remove("hidden");

        document.body.classList.add("modal-open");

    }


    function closeCertificate() {

        if (!certLightbox) return;


        certLightbox.classList.add("hidden");

        document.body.classList.remove("modal-open");


        if (certModalImg) {

            certModalImg.src = "";

        }

    }


    certificateCards.forEach((card) => {

        card.addEventListener("click", () => {

            openCertificate(card);

        });

    });


    if (closeCertModalBtn) {

        closeCertModalBtn.addEventListener(
            "click",
            closeCertificate
        );

    }


    /* Click outside certificate */
    if (certLightbox) {

        certLightbox.addEventListener("click", (event) => {

            if (event.target === certLightbox) {

                closeCertificate();

            }

        });

    }


    /* Click outside portal */
    if (portalModal) {

        portalModal.addEventListener("click", (event) => {

            if (event.target === portalModal) {

                closePortal();

            }

        });

    }


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileNav =
        document.getElementById("mobileNav");


    if (mobileMenuBtn && mobileNav) {

        mobileMenuBtn.addEventListener("click", () => {

            mobileNav.classList.toggle("hidden");

        });


        const mobileLinks =
            mobileNav.querySelectorAll("[data-mobile-close]");


        mobileLinks.forEach((link) => {

            link.addEventListener("click", () => {

                mobileNav.classList.add("hidden");

            });

        });

    }


    /* =====================================================
       ESC KEY
       ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") return;


        closeCertificate();

        closePortal();


        if (mobileNav) {

            mobileNav.classList.add("hidden");

        }

    });


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');


    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");


            if (!targetId || targetId === "#") {

                return;

            }


            const target =
                document.querySelector(targetId);


            if (target) {

                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }

        });

    });

});