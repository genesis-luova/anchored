// AnchorEd — chat-widget.js · the Anchor assistant (KB + optional live /api/chat)
(function(){
  // ── To power Anchor with LIVE Claude, deploy the included api/chat.js to Vercel,
  //    set ANTHROPIC_API_KEY in your project, then change the line below to '/api/chat'.
  var ANCHOR_API='/api/chat';

  var KB=[
    {k:['hello','hi','hey','good morning','good afternoon','good evening','kumusta','kamusta','greetings'],
     a:"Hello! I\u2019m Anchor, your guide to the AnchorEd family. I can tell you about our learning brands, programs, locations, or how to get started. What would you like to know?",
     c:['Our programs','Where you\u2019re located','How to enroll']},
    {k:['homeschool global'],a:"Homeschool Global is our flagship program \u2014 personalized, flexible, values-based homeschooling for Nursery through Grade 12. It\u2019s parent-guided, with a worldwide community behind every family. Would you like to know how to enroll?",c:['How to enroll','Other programs']},
    {k:['vcis','victory','christian international','servant leader'],a:"VCIS (Victory Christian International School) raises servant leaders through a top-tier virtual campus \u2014 full online learning for Pre-K through Grade 12. Want details on getting started?",c:['How to enroll','Other programs']},
    {k:['edunova','edu nova'],a:"EduNova offers affordable, accessible, holistic education for Kinder through Grade 12, with a flexible mix of homeschooling, online, and in-person learning. Shall I point you to enrollment?",c:['How to enroll','Other programs']},
    {k:['homeschool pilipinas','homeschool philippines','nation-builder','nation builder','filipino'],a:"Homeschool Pilipinas cultivates Filipino nation-builders through foundational learning and character formation, for Kinder through Grade 10. Want to know more about joining?",c:['How to enroll','Other programs']},
    {k:['learning plus','learning+','books','book','resource','curriculum','material','reading'],a:"Learning Plus curates the world\u2019s best books and educational resources to help families cultivate a lifelong love of learning and teaching. Looking for something in particular?",c:['Our programs','Talk to the team']},
    {k:['learning hub','co-learning','co learning','colearning','community'],a:"The Learning Hub is a community co-learning environment where families connect, collaborate, and experience transformative learning together. Want to know how to be part of it?",c:['How to enroll','Our programs']},
    {k:['everlearn','printed','printing','print','publisher','provider'],a:"Everlearn Technologies powers education providers through high-quality printed books and learning materials. Are you an educator or provider? I can connect you with our team.",c:['Talk to the team','Our programs']},
    {k:['program','programs','brand','brands','ecosystem','school','schools','option','options','offer','services','course'],a:"AnchorEd is a family of seven learning brands \u2014 one for every stage of your journey:\n\u2022 Homeschool Global \u2014 flexible homeschooling (Nursery\u2013G12)\n\u2022 VCIS \u2014 online Christian school (Pre-K\u2013G12)\n\u2022 EduNova \u2014 affordable hybrid education (Kinder\u2013G12)\n\u2022 Homeschool Pilipinas \u2014 character-first homeschooling (Kinder\u2013G10)\n\u2022 Learning Plus \u2014 books & resources\n\u2022 The Learning Hub \u2014 co-learning community\n\u2022 Everlearn \u2014 printed learning materials\nWhich one sounds right for your family?",c:['Homeschool Global','VCIS','EduNova','How to enroll']},
    {k:['grade','grades','age','old','year level','kinder','kindergarten','nursery','high school','elementary','preschool','pre-k','prek','toddler'],a:"We cover every stage \u2014 from Nursery and Pre-K all the way to Grade 12. Homeschool Global runs Nursery\u2013G12, VCIS and EduNova go Pre-K/Kinder\u2013G12, and Homeschool Pilipinas covers Kinder\u2013G10. If you tell me your child\u2019s grade, I can suggest the best fit!",c:['Our programs','How to enroll']},
    {k:['online','virtual','distance','remote','from home','internet'],a:"Yes! VCIS is our fully online Christian school (Pre-K\u2013G12), and EduNova offers online and hybrid options. Homeschool Global is parent-guided with rich digital support too. Want me to walk you through enrollment?",c:['How to enroll','Our programs']},
    {k:['homeschool','home school','home-school','how does it work','how it works','parent-led','parent led'],a:"Homeschooling with AnchorEd is parent-led but never alone \u2014 you get a structured curriculum, guidance, and a worldwide community. Homeschool Global (Nursery\u2013G12) and Homeschool Pilipinas (Kinder\u2013G10) are built for exactly this. Would you like to start?",c:['How to enroll','Our approach']},
    {k:['location','locations','where','office','offices','country','countries','address','based','branch','philippines','manila','dubai','uae','emirates','singapore','qatar','doha','saudi','riyadh','ksa'],a:"We\u2019re present across the globe, with offices in:\n\ud83c\uddf5\ud83c\udded Philippines \u2014 Ortigas East, Pasig City\n\ud83c\udde6\ud83c\uddea UAE \u2014 Al Barsha Heights, Dubai\n\ud83c\uddf8\ud83c\uddec Singapore \u2014 The Central\n\ud83c\uddf6\ud83c\udde6 Qatar \u2014 Westbay, Doha\n\ud83c\uddf8\ud83c\udde6 Saudi Arabia \u2014 Al Rahmaniya, Riyadh\nAnd we serve families across 26 nations. Where are you based?",c:['How to enroll','Talk to the team']},
    {k:['contact','enroll','enrol','sign up','signup','register','admission','apply','get started','getting started','join','reach','email','talk','speak','call','inquire','inquiry','demo','consultation','interested','team'],a:"I\u2019d love to help you take the next step! You can reach the AnchorEd team at info@anchored.global, or follow us @anchored.global. Tell me your child\u2019s grade and your location, and I\u2019ll make sure you\u2019re pointed to the right program.",c:['Our programs','Where you\u2019re located']},
    {k:['faith','christian','god','bible','biblical','jesus','spiritual','truth','christ','values','character','formation'],a:"Faith is at the heart of everything we do. AnchorEd is \u201cAnchored in Truth, Formed for Legacy\u201d \u2014 we anchor families in God\u2019s truth while nurturing wisdom, character, and purpose (Proverbs 22:6). Schools like VCIS are explicitly Christ-centered. Would you like to know more about our approach?",c:['Our approach','Our programs']},
    {k:['what is anchored','who are you','who is anchored','about','mission','vision','tell me about','purpose','anchored'],a:"AnchorEd is a faith-driven family of learning brands on a mission to anchor families in God\u2019s truth and empower them through transformative learning. For 27 years we\u2019ve journeyed with families across 26 nations \u2014 one ecosystem with the right program for every stage. What would you like to explore?",c:['Our programs','Our approach','Where you\u2019re located']},
    {k:['four anchors','anchor','anchors','approach','philosophy','framework','method','model','believe'],a:"Our approach follows four anchors that build on each other: God\u2019s Truth \u2192 Intentional Parenting \u2192 Transformative Learning \u2192 Thriving Children. When families are rooted in truth and parents are equipped, learning transforms and children flourish. Want to see how that plays out in a program?",c:['Our programs','How to enroll']},
    {k:['cost','price','pricing','tuition','fee','fees','how much','expensive','afford','payment','scholarship','discount'],a:"Tuition varies by program, location, and grade level, so the most accurate figures come straight from our team at info@anchored.global. EduNova in particular is designed to be affordable and accessible. Shall I tell you about the programs first?",c:['Our programs','Talk to the team']},
    {k:['accredit','accreditation','recognized','recognised','certificate','diploma','transcript','deped','valid'],a:"Great question \u2014 accreditation and credentials depend on the specific program, and our team can give you the precise details for your situation at info@anchored.global. Which program are you considering?",c:['Our programs','Talk to the team']},
    {k:['thank','thanks','salamat','appreciate'],a:"You\u2019re most welcome! If there\u2019s anything else you\u2019d like to know about AnchorEd, I\u2019m right here. \ud83d\ude4f",c:['Our programs','Where you\u2019re located']},
    {k:['bye','goodbye','see you','that is all','thats all','no thanks'],a:"Thank you for getting to know the AnchorEd family! Whenever you\u2019re ready, reach us at info@anchored.global. Take care! \u2693",c:[]}
  ];
  var FALLBACK={a:"That\u2019s a wonderful question. I may not have every detail, but our team certainly will \u2014 reach them at info@anchored.global. In the meantime, I can tell you about our programs, locations, or how to get started. What sounds helpful?",c:['Our programs','Where you\u2019re located','How to enroll']};

  function norm(s){return ' '+String(s).toLowerCase().replace(/[^\w\s+]/g,' ').replace(/\s+/g,' ').trim()+' ';}
  function score(q,kws){var s=0;for(var i=0;i<kws.length;i++){var k=kws[i];if(k.length<=3){if(new RegExp('\\b'+k.replace('+','\\+')+'\\b').test(q))s+=2;}else if(q.indexOf(k)>=0){s+=(k.length>6?3:2);}}return s;}
  function matchKB(t){var q=norm(t),best=null,bs=0;for(var i=0;i<KB.length;i++){var sc=score(q,KB[i].k);if(sc>bs){bs=sc;best=KB[i];}}return bs>0?best:FALLBACK;}

  var root=document.getElementById('anchorChat'),launcher=document.getElementById('anchorLauncher'),
      bodyEl=document.getElementById('anchorBody'),chipsEl=document.getElementById('anchorChips'),
      form=document.getElementById('anchorForm'),input=document.getElementById('anchorInput'),
      minBtn=document.getElementById('anchorMin'),teaser=document.getElementById('anchorTeaser'),
      teaserX=teaser?teaser.querySelector('.achat-teaser-x'):null;
  var opened=false,greeted=false,hist=[];

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function fmt(s){return esc(s).replace(/\n/g,'<br>');}
  function addMsg(t,who){var d=document.createElement('div');d.className='amsg '+who;d.innerHTML=fmt(t);bodyEl.appendChild(d);bodyEl.scrollTop=bodyEl.scrollHeight;return d;}
  function typing(){var t=document.createElement('div');t.className='atyping';t.innerHTML='<span></span><span></span><span></span>';bodyEl.appendChild(t);bodyEl.scrollTop=bodyEl.scrollHeight;return t;}
  function setChips(a){chipsEl.innerHTML='';(a||[]).forEach(function(c){var b=document.createElement('button');b.type='button';b.className='achip';b.textContent=c;b.addEventListener('click',function(){send(c);});chipsEl.appendChild(b);});}

  function reply(t){
    if(ANCHOR_API){
      return fetch(ANCHOR_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t,history:hist})})
        .then(function(r){return r.ok?r.json():null;})
        .then(function(d){return (d&&d.reply)?{a:d.reply,c:null}:matchKB(t);})
        .catch(function(){return matchKB(t);});
    }
    return Promise.resolve(matchKB(t));
  }
  function respond(t){
    var ind=typing(),delay=600+Math.min(1300,t.length*15);
    setTimeout(function(){
      reply(t).then(function(res){
        if(ind.parentNode)ind.remove();
        addMsg(res.a,'bot');
        hist.push({role:'user',content:t});hist.push({role:'assistant',content:res.a});
        if(hist.length>12)hist=hist.slice(-12);
        setChips(res.c);
      });
    },delay);
  }
  function send(t){t=(t||'').trim();if(!t)return;addMsg(t,'user');input.value='';setChips([]);respond(t);}
  function greet(){if(greeted)return;greeted=true;addMsg("Hi, I\u2019m Anchor \u2014 your guide to the AnchorEd family \u2693  Ask me anything about our programs, locations, or how to begin!",'bot');setChips(['What is AnchorEd?','Our programs','Where you\u2019re located','How to enroll']);}
  function dismissTeaser(){if(teaser)teaser.classList.remove('show');}
  function openChat(){root.classList.add('open');document.body.classList.add('achat-on');launcher.setAttribute('aria-expanded','true');opened=true;dismissTeaser();greet();setTimeout(function(){input.focus();},430);}
  function closeChat(){root.classList.remove('open');document.body.classList.remove('achat-on');launcher.setAttribute('aria-expanded','false');}

  launcher.addEventListener('click',function(){root.classList.contains('open')?closeChat():openChat();});
  minBtn.addEventListener('click',closeChat);
  form.addEventListener('submit',function(e){e.preventDefault();send(input.value);});
  if(teaserX)teaserX.addEventListener('click',function(e){e.stopPropagation();if(teaser)teaser.style.display='none';});
  if(teaser)teaser.addEventListener('click',function(){openChat();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&root.classList.contains('open'))closeChat();});
  setTimeout(function(){if(!opened&&teaser)teaser.classList.add('show');},3800);
})();
