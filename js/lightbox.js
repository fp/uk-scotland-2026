(function(){
  var overlay = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  var closeBtn = document.getElementById('lightboxClose');

  function openLightbox(src, alt){
    img.src = src;
    img.alt = alt || '';
    overlay.classList.add('open');
    document.documentElement.classList.add('lb-lock');
  }
  function closeLightbox(){
    overlay.classList.remove('open');
    document.documentElement.classList.remove('lb-lock');
    img.src = '';
  }
  document.addEventListener('click', function(e){
    var target = e.target.closest && e.target.closest('.lb-photo');
    if(target){
      openLightbox(target.currentSrc || target.src, target.alt);
      return;
    }
    if(e.target === overlay){
      closeLightbox();
    }
  });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('open')){
      closeLightbox();
    }
  });
})();
