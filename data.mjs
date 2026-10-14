export const book = {
  id:'medicin-demo', title:'Medicin i praksis', subtitle:'En demobog til Lægereolen',
  chapters:[
    {id:'respiration',number:1,title:'Luftveje og respiration',subtitle:'Fra indånding til udånding – kroppens udveksling af luft.',category:'Fysiologi',sourceTitle:'Åndedræt',sourceUrl:'https://da.wikipedia.org/wiki/%C3%85ndedr%C3%A6t',sections:[
      {id:'respiration-intro',title:'Det normale åndedræt',paragraphs:[{id:'resp-intro-1',text:'Ved vejrtrækning skiftes luften i lungerne. Kroppen optager ilt til cellernes stofskifte og afgiver kuldioxid. Indåndingen fører luft ind, mens udåndingen fører den ud igen.'}]},
      {id:'respiration-inspiration',title:'Indånding',paragraphs:[{id:'resp-in-1',text:'Når mellemgulvet trækker sig sammen, øges pladsen i brysthulen. Brystkassens bevægelser bidrager til udvidelsen. Trykket i lungerne falder, og luft bevæger sig ind fra omgivelserne.'}]},
      {id:'respiration-expiration',title:'Udånding',paragraphs:[{id:'resp-out-1',text:'I hvile sker udåndingen overvejende ved, at musklerne slapper af. Brystkassen og mellemgulvet vender tilbage, og luften bevæger sig ud. Et åndedrag består af en indånding og en udånding.'}]}
    ]},
    {id:'lungs',number:2,title:'Lungerne',subtitle:'Lungernes opbygning og gasudveksling.',category:'Anatomi',sourceTitle:'Lunge',sourceUrl:'https://da.wikipedia.org/wiki/Lunge',sections:[
      {id:'lungs-anatomy',title:'Lungernes placering',paragraphs:[{id:'lungs-anatomy-1',text:'Lungerne ligger i brysthulen. Her udveksles ilt fra den indåndede luft og kuldioxid fra blodet. Lungernes forbindelse til brysthulen sker via lungehinden.'}]},
      {id:'lungs-airways',title:'Luftens vej',paragraphs:[{id:'lungs-airways-1',text:'Luften føres gennem mund eller næse til luftrøret. Luftrøret deler sig i to hovedbronkier, som forgrener sig i mindre luftveje. De mindste luftveje ender i alveoler, som er små luftfyldte hulrum.'}]},
      {id:'lungs-exchange',title:'Gasudveksling i alveolerne',paragraphs:[{id:'lungs-exchange-1',text:'Et net af fine blodkar omkring alveolerne bringer blodet tæt på luften. Ilt bevæger sig fra luften til blodet, mens kuldioxid bevæger sig den modsatte vej. De tynde vægge gør denne udveksling mulig.'}]}
    ]},
    {id:'asthma',number:3,title:'Astma',subtitle:'Luftvejenes inflammation, symptomer og udredning.',category:'Lungemedicin',sourceTitle:'Astma',sourceUrl:'https://da.wikipedia.org/wiki/Astma',sections:[
      {id:'asthma-overview',title:'Overblik',paragraphs:[{id:'asthma-overview-1',text:'Astma er en kronisk betændelsestilstand i luftvejene. Symptomerne kan variere over tid og omfatter blandt andet hoste, åndenød og en fornemmelse af trykken for brystet.'},{id:'asthma-overview-2',text:'Både arvelige forhold og påvirkninger fra omgivelserne kan spille en rolle. Sygdommens forløb og symptomernes hyppighed er forskellige fra person til person.'}]},
      {id:'asthma-symptoms',title:'Symptomer',paragraphs:[{id:'asthma-symptoms-1',text:'Symptomerne kan være tilbagevendende og vise sig i forbindelse med bestemte påvirkninger. De kan blandt andet optræde ved fysisk aktivitet eller i kold luft. Hos nogle er de mere fremtrædende om natten eller tidligt om morgenen.'}],table:{caption:'Symptomer omtalt i eksempelteksten',headers:['Symptom','Beskrivelse'],rows:[['Hoste','Kan være tilbagevendende'],['Åndenød','Kan variere over tid'],['Trykken for brystet','Kan ledsage de øvrige symptomer']]}},
      {id:'asthma-assessment',title:'Udredning',paragraphs:[{id:'asthma-assessment-1',text:'Sygehistorien og måling af lungefunktionen indgår i vurderingen. Spirometri kan bidrage til at beskrive luftvejenes funktion. Symptomer og undersøgelsesfund ses i sammenhæng.'}]}
    ]}
  ]
};

book.chapters.push(
  {id:'copd',number:4,title:'KOL',subtitle:'Vedvarende luftvejsobstruktion og gradvist tiltagende symptomer.',category:'Lungemedicin',sourceName:'Lægehåndbogen',sourceTitle:'KOL',sourceUrl:'https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/lunger/tilstande-og-sygdomme/obstruktive-lungesygdomme/kol/',sections:[
    {id:'copd-findings',title:'Symptomer og fund',paragraphs:[{id:'copd-findings-1',text:'KOL kan vise sig med langvarig hoste, opspyt og åndenød ved fysisk aktivitet. Symptomerne udvikler sig ofte gradvist. Tidligere udsættelse for tobaksrøg og andre påvirkninger indgår i sygehistorien.'}]},
    {id:'copd-assessment',title:'Udredning og differentialdiagnoser',paragraphs:[{id:'copd-assessment-1',text:'Spirometri indgår i udredningen af vedvarende luftvejsobstruktion. Astma kan give lignende symptomer, og nogle har begge tilstande. Tidlig lungesygdom eller familiehistorie kan gøre alfa-1-antitrypsinmangel relevant at undersøge.'}]}
  ]},
  {id:'aat',number:5,title:'Alfa-1-antitrypsinmangel',subtitle:'Et eksempel på et sjældent, arveligt sygdomsopslag.',category:'Sjældne sygdomme',sourceName:'Lægehåndbogen',sourceTitle:'Alfa-1-antitrypsinmangel',sourceUrl:'https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/sjaeldne-sygdomme/sjaeldne-sygdomme/alfa-1-antitrypsinmangel/',sections:[
    {id:'aat-overview',title:'Hvornår er sygdommen relevant?',paragraphs:[{id:'aat-overview-1',text:'Alfa-1-antitrypsinmangel er en arvelig tilstand, som kan påvirke lungerne og leveren. Proteinet dannes i leveren og beskytter lungevævet. Tidligt opstået KOL og familiær lungesygdom kan være relevante spor.'}]},
    {id:'aat-assessment',title:'Undersøgelser',paragraphs:[{id:'aat-assessment-1',text:'Måling af alfa-1-antitrypsin i blodet og genetiske undersøgelser indgår i udredningen. Symptomerne skal ses sammen med øvrige fund fra lunger og lever.'}]}
  ]},
  {id:'eczema',number:6,title:'Håndeksem',subtitle:'Et dermatologisk demoopslag med et klinisk foto.',category:'Dermatologi',sourceName:'Lægehåndbogen',sourceTitle:'Udslæt på hænder',sourceUrl:'https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/hud/symptomer-og-tegn/udslaet-paa-haender/',sections:[
    {id:'eczema-findings',title:'Udslættets udseende',paragraphs:[{id:'eczema-findings-1',text:'Håndeksem kan have forskellige udseender. Vesikler er små væskefyldte blærer. Lokalisation, forløb og udsættelse for påvirkninger er en del af beskrivelsen af et udslæt.'}]},
    {id:'eczema-context',title:'Sygehistorie og sammenhæng',paragraphs:[{id:'eczema-context-1',text:'Spørgsmål om arbejde, handsker og kontakt med forskellige stoffer kan hjælpe med at sætte hudforandringerne i sammenhæng. Et foto kan illustrere et fund, men skal læses sammen med sygehistorien og afsnittets beskrivelse.'}]}
  ]}
);
const asthma=book.chapters.find(c=>c.id==='asthma');
asthma.sourceName='Lægehåndbogen';asthma.sourceUrl='https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/lunger/tilstande-og-sygdomme/obstruktive-lungesygdomme/astma/';
asthma.sections[1].paragraphs.push({id:'asthma-alert-1',text:'Ved svære anfald kan åndenøden gøre det svært at tale. Udmattelse og påvirket bevidsthed er alvorlige fund. En akut forværring skal vurderes ud fra hele det kliniske billede.'});

export const figures=[
  {id:'airways-path',src:'assets/airways.svg',title:'Luftens vej',type:'Anatomi',body:'Thorax',chapterId:'lungs',sectionId:'lungs-airways',caption:'Forenklet forløb fra mund og næse til alveolerne.',credit:'Lægereolen · skematisk demofigur',tags:['bronkier','luftrør','alveoler','luftveje'],labels:[{x:38,y:46,text:'Luftrør'},{x:62,y:46,text:'Bronkier'},{x:86,y:46,text:'Alveoler'}]},
  {id:'chest-xray',src:'assets/chest-xray.jpg',title:'Thoraxrøntgen · normal anatomi',type:'Røntgen',body:'Thorax',chapterId:'lungs',sectionId:'lungs-anatomy',caption:'PA-optagelse med normal anatomi. Brug billedet som visuelt eksempel sammen med bogteksten.',credit:'Ptrump16 · CC BY-SA 4.0 · Wikimedia Commons',sourceUrl:'https://commons.wikimedia.org/wiki/File:Chest_X-ray.jpg',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',tags:['røntgen','scanning','skanning','lunger','thorax','ribs','ribben'],labels:[{x:28,y:43,text:'Lungefelt'},{x:67,y:61,text:'Hjerteskygge'}]},
  {id:'hand-eczema',src:'assets/hand-eczema.jpg',title:'Vesikuløst håndeksem',type:'Dermatologi',body:'Hænder',chapterId:'eczema',sectionId:'eczema-findings',caption:'Klinisk foto af dyshidrosiformt håndeksem.',credit:'Haendels · CC BY-SA 3.0 · Wikimedia Commons',sourceUrl:'https://commons.wikimedia.org/wiki/File:Handekzem_dyshidrosiform.jpg',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',tags:['udslæt','blærer','vesikler','hånd','eksem','derma'],labels:[]}
];
const authorExamples={
  'airways-path':{width:760,height:340,description:'Markeringerne fremhæver luftrøret og bronkierne. Pilene viser, hvilke dele af figuren forklaringen henviser til.',regions:[{points:[[29,31],[47,31],[47,59],[29,59]],color:'#6e9fd1'},{points:[[53,31],[71,31],[71,59],[53,59]],color:'#9570be'}],arrows:[{from:[30,79],to:[38,54],color:'#467cab'},{from:[69,79],to:[62,54],color:'#7a559c'}],labels:[{x:30,y:81,text:'Luftrør',color:'#467cab'},{x:69,y:81,text:'Bronkier',color:'#7a559c'}]},
  'chest-xray':{width:500,height:561,description:'Den blå markering fremhæver et lungefelt. Den lilla pil peger på hjerteskyggen. Markeringerne er skematiske eksempler til prototypen.',regions:[{points:[[18,22],[35,25],[44,33],[41,53],[39,60],[19,64],[11,58],[12,40]],color:'#62a9ea'}],arrows:[{from:[65,22],to:[29,42],color:'#4790cb'},{from:[87,79],to:[61,60],color:'#bc82dc'}],labels:[{x:66,y:21,text:'Lungefelt',color:'#347cb6'},{x:77,y:82,text:'Hjerteskygge',color:'#9160ae'}]},
  'hand-eczema':{width:643,height:427,description:'Markeringen fremhæver et udsnit af hudens overflade, som kan sammenholdes med afsnittets beskrivelse.',regions:[{points:[[22,25],[51,25],[51,63],[22,63]],color:'#eeb26a'}],arrows:[{from:[77,27],to:[44,41],color:'#a96d28'}],labels:[{x:72,y:21,text:'Se hudens overflade',color:'#a96d28'}]}
};
for(const f of figures){f.authorAnnotations=authorExamples[f.id];book.chapters.find(c=>c.id===f.chapterId).sections.find(s=>s.id===f.sectionId).figureId=f.id;}
export const paragraphIndex = Object.fromEntries(book.chapters.flatMap(chapter=>chapter.sections.flatMap(section=>section.paragraphs.map(paragraph=>[paragraph.id,{...paragraph,chapterId:chapter.id,sectionId:section.id}]))));
