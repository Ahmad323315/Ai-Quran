/* data.js – SAMPLE data. Replace with data/quran.json + API. Verify all text against a trusted mushaf/translation before release. */
const QURAN=[
 {n:1,ar:'الفاتحة',en:'Al-Fatihah',meaning:'The Opening',ayat:[
  {a:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',en:'In the name of Allah, the Entirely Merciful, the Especially Merciful.',ur:'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔'},
  {a:'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',en:'[All] praise is [due] to Allah, Lord of the worlds.',ur:'تمام تعریفیں اللہ کے لیے ہیں جو سارے جہانوں کا پالنے والا ہے۔'},
  {a:'الرَّحْمَٰنِ الرَّحِيمِ',en:'The Entirely Merciful, the Especially Merciful,',ur:'بڑا مہربان، نہایت رحم والا۔'},
  {a:'مَالِكِ يَوْمِ الدِّينِ',en:'Sovereign of the Day of Recompense.',ur:'جزا کے دن کا مالک۔'},
  {a:'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',en:'It is You we worship and You we ask for help.',ur:'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔'},
  {a:'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',en:'Guide us to the straight path -',ur:'ہمیں سیدھا راستہ دکھا۔'},
  {a:'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',en:'The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.',ur:'ان لوگوں کا راستہ جن پر تو نے انعام کیا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا۔'}]},
 {n:112,ar:'الإخلاص',en:'Al-Ikhlas',meaning:'Sincerity',ayat:[
  {a:'قُلْ هُوَ اللَّهُ أَحَدٌ',en:'Say, "He is Allah, [who is] One,',ur:'کہہ دیجیے کہ وہ اللہ ایک ہے۔'},
  {a:'اللَّهُ الصَّمَدُ',en:'Allah, the Eternal Refuge.',ur:'اللہ بے نیاز ہے۔'},
  {a:'لَمْ يَلِدْ وَلَمْ يُولَدْ',en:'He neither begets nor is born,',ur:'نہ اس نے کسی کو جنا اور نہ وہ جنا گیا۔'},
  {a:'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',en:'Nor is there to Him any equivalent."',ur:'اور اس کا کوئی ہمسر نہیں۔'}]}
];
const HADITH=[
 {id:1,cat:'Knowledge',ar:'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',en:'Actions are judged by intentions, and each person will have what they intended.',ur:'اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔',ref:'Sahih al-Bukhari 1; Sahih Muslim 1907',grade:'Sahih'},
 {id:2,cat:'Knowledge',ar:'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',en:'The best of you are those who learn the Quran and teach it.',ur:'تم میں بہترین وہ ہے جو قرآن سیکھے اور سکھائے۔',ref:'Sahih al-Bukhari 5027',grade:'Sahih'}
];
const CATS=['Salah','Akhlaq','Knowledge','Patience','Dua','Good Deeds','Family','Daily Life'];
