SALON website - how to use
1. Unzip and open index.html in a browser (needs internet once for the Jost font).
2. Services, prices, packages and stylists: edit the data at the top of js/main.js.
3. Photos: assets/gallery/ holds illustrated images. Replace them with real photos (same names, or edit src in index.html).
   Old note:
   style="background-image:url(assets/photo1.jpg)" on each tile in index.html.
4. Logo: assets/logo.svg (used for intro, nav, favicon). Replace the file to change it everywhere.
5. Bookings are saved in the visitor's browser only (demo). To receive real bookings, send the
   `booking` object in js/main.js (search for TODO) to your email service or booking API.
6. Address, phone, email and hours are placeholders in index.html (Contact section).
7. Intro "logo animation" is in index.html (svg#logo-animation) and style.css (section LOGO ANIMATION).
8. Custom mouse-circle cursor is in js/main.js (desktop only, off on touch devices).
