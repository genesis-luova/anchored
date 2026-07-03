// AnchorEd — legend.js · location legend <-> map pin sync
(function(){
  document.querySelectorAll('.lrow').forEach(function(r){
    var k=r.getAttribute('data-loc');
    var pin=document.querySelector('.pin[data-loc="'+k+'"]');
    function on(){r.classList.add('active'); if(pin)pin.classList.add('active');}
    function off(){r.classList.remove('active'); if(pin)pin.classList.remove('active');}
    r.addEventListener('mouseenter',on); r.addEventListener('mouseleave',off);
    r.addEventListener('focus',on); r.addEventListener('blur',off);
    if(pin){pin.addEventListener('mouseenter',on); pin.addEventListener('mouseleave',off);}
  });
})();
