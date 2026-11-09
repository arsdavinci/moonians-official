'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('is-open', !expanded);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});
const dialog = document.querySelector('#photo-dialog');
const photoButtons = [...document.querySelectorAll('[data-photo]')];
const photoImage = document.querySelector('#dialog-image');
const photoCaption = document.querySelector('#dialog-caption');
let photoIndex = 0;
let lastPhotoButton;
function showPhoto(index) {
  photoIndex = (index + photoButtons.length) % photoButtons.length;
  const button = photoButtons[photoIndex];
  photoImage.src = button.dataset.photo;
  photoImage.alt = button.querySelector('img').alt;
  photoCaption.textContent = button.dataset.caption;
  document.querySelector('.photo-counter').textContent = `${photoIndex + 1} / ${photoButtons.length}`;
}
photoButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    lastPhotoButton = button;
    showPhoto(index);
    dialog.showModal();
    document.body.classList.add('photo-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('.photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
document.querySelector('.photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('photo-open');
  lastPhotoButton?.focus({ preventScroll: true });
});
