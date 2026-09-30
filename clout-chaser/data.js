/* Clout Chaser — static game data. All people, brands and platforms are fictional. */
'use strict';

const NICHES = {
  beauty:    { name: 'Beauty',    tags: ['#GRWM', '#SkincareCheck', '#MakeupTok'],      phrase: ['my 10-step skincare routine', 'a drugstore dupe that slaps', 'the no-makeup makeup look'] },
  gaming:    { name: 'Gaming',    tags: ['#GamerLife', '#Speedrun', '#ClutchPlay'],      phrase: ['a 1v5 clutch', 'the hardest boss in Ashen Crown', 'my ranked grind'] },
  fitness:   { name: 'Fitness',   tags: ['#GymTok', '#LegDay', '#FitCheck'],             phrase: ['a 30-day ab challenge', 'my leg day routine', 'what I eat in a day'] },
  comedy:    { name: 'Comedy',    tags: ['#Skit', '#Relatable', '#StandUp'],             phrase: ['types of people at the airport', 'my landlord impression', 'roasting my own outfit'] },
  tech:      { name: 'Tech',      tags: ['#TechReview', '#Unboxing', '#SetupTour'],      phrase: ['the new Orbit 9 phone', 'my desk setup', 'a $300 laptop torture test'] },
  food:      { name: 'Food',      tags: ['#Foodie', '#RecipeOfTheDay', '#TasteTest'],    phrase: ['a 5-ingredient pasta', 'ranking gas station snacks', "my grandma's dumplings"] },
  music:     { name: 'Music',     tags: ['#NewMusic', '#CoverSong', '#StudioSession'],   phrase: ["a cover of this week's #1", 'an unreleased hook', 'a beat made from kitchen sounds'] },
  fashion:   { name: 'Fashion',   tags: ['#OOTD', '#ThriftFlip', '#StreetStyle'],        phrase: ['a thrift flip', '5 ways to style one jacket', 'my fall capsule wardrobe'] },
  travel:    { name: 'Travel',    tags: ['#Wanderlust', '#HiddenGems', '#TravelHacks'],  phrase: ['a beach nobody knows about', 'Lisbon on $40 a day', 'my carry-on packing system'] },
  lifestyle: { name: 'Lifestyle', tags: ['#DayInMyLife', '#ThatGirl', '#SundayReset'],   phrase: ['my 5am routine', 'a Sunday reset', 'my apartment tour'] },
};
const GENERIC_TAGS = ['#fyp', '#viral', '#explorepage'];

const HOT_TAKES = ['tipping culture', 'hustle culture', 'pineapple on pizza', 'rich-kid influencers', 'the four-day work week',
  'cancel culture', 'gym etiquette', 'AI art', 'open-plan offices', 'reply guys'];

const PLATFORMS = {
  pix:   { name: 'Pixgram',  kind: 'Photos & reels',  unlock: 0,    start: 150, baseEng: 6,  cpm: 0,   color: '#D6307A' },
  chirp: { name: 'Chirp',    kind: 'Posts & threads', unlock: 0,    start: 60,  baseEng: 3,  cpm: 0,   color: '#2E8BD6' },
  clipz: { name: 'Clipz',    kind: 'Short video',     unlock: 500,  start: 0,   baseEng: 8,  cpm: 0.4, color: '#12A596' },
  tube:  { name: 'ViewTube', kind: 'Long video',      unlock: 2500, start: 0,   baseEng: 5,  cpm: 3.5, color: '#D8452F' },
  live:  { name: 'Streamly', kind: 'Livestreams',     unlock: 8000, start: 0,   baseEng: 11, cpm: 0,   color: '#8452D6' },
};

const FORMATS = {
  photo:    { p: 'pix',   name: 'Photo',       e: 10, reach: 1.0,  skill: 'creativity' },
  carousel: { p: 'pix',   name: 'Carousel',    e: 14, reach: 1.12, skill: 'creativity', rep: 0.3 },
  reel:     { p: 'pix',   name: 'Reel',        e: 22, reach: 1.6,  skill: 'editing', viral: 0.02, video: true },
  story:    { p: 'pix',   name: 'Story',       e: 8,  reach: 0.5,  skill: 'charisma', eng: 1.4 },
  take:     { p: 'chirp', name: 'Hot take',    e: 8,  reach: 1.2,  skill: 'charisma', viral: 0.02 },
  thread:   { p: 'chirp', name: 'Thread',      e: 12, reach: 1.05, skill: 'creativity', rep: 0.6 },
  meme:     { p: 'chirp', name: 'Meme',        e: 9,  reach: 1.3,  skill: 'charisma', viral: 0.02 },
  short:    { p: 'clipz', name: 'Short',       e: 18, reach: 1.8,  skill: 'editing', viral: 0.03, video: true },
  dance:    { p: 'clipz', name: 'Trend dance', e: 20, reach: 1.9,  skill: 'charisma', viral: 0.03, video: true, trendy: true },
  skit:     { p: 'clipz', name: 'Skit',        e: 25, reach: 2.1,  skill: 'charisma', viral: 0.035, video: true },
  vlog:     { p: 'tube',  name: 'Vlog',        e: 30, reach: 1.4,  skill: 'charisma', video: true },
  tutorial: { p: 'tube',  name: 'Tutorial',    e: 35, reach: 1.3,  skill: 'editing', rep: 1.2, video: true },
  doc:      { p: 'tube',  name: 'Documentary', e: 55, reach: 2.3,  skill: 'editing', rep: 2, viral: 0.02, video: true },
  reaction: { p: 'tube',  name: 'Reaction',    e: 18, reach: 1.6,  skill: 'charisma', rep: -0.8, video: true },
};

const STREAMS = {
  s1:  { name: '1-hour stream',  hours: 1,  e: 15, chats: 1 },
  s3:  { name: '3-hour stream',  hours: 3,  e: 35, chats: 2 },
  s12: { name: '12-hour subathon', hours: 12, e: 80, chats: 4, stress: 20 },
};

const TONES = {
  authentic:   { name: 'Authentic',   reach: 1.0,  eng: 1.1,  rep: 1,    heat: 0,  follow: 1.15, desc: 'Honest and personal. Builds trust.' },
  funny:       { name: 'Funny',       reach: 1.15, eng: 1.2,  rep: 0.5,  heat: 0,  follow: 1.1,  desc: 'Scales with charisma.', skill: 'charisma' },
  wholesome:   { name: 'Wholesome',   reach: 0.9,  eng: 1.15, rep: 2,    heat: -3, follow: 1.0,  desc: 'Cools things down. Big rep boost.' },
  educational: { name: 'Educational', reach: 0.92, eng: 1.0,  rep: 1.8,  heat: -1, follow: 1.2,  desc: 'Loyal followers, slower reach.', skill: 'creativity' },
  clickbait:   { name: 'Clickbait',   reach: 1.4,  eng: 0.8,  rep: -1.5, heat: 2,  follow: 0.85, desc: 'More views, fewer real fans.' },
  thirst:      { name: 'Thirst trap', reach: 1.5,  eng: 1.2,  rep: -1,   heat: 3,  follow: 0.9,  desc: 'Works. People notice it works.' },
  flex:        { name: 'Flex',        reach: 1.2,  eng: 0.85, rep: -1.2, heat: 3,  follow: 0.8,  desc: 'Aspirational or insufferable.' },
  ragebait:    { name: 'Rage bait',   reach: 2.0,  eng: 1.3,  rep: -4,   heat: 12, follow: 0.75, desc: 'Huge reach. Burns reputation.', viral: 0.03 },
};

const EFFORT = {
  quick:    { name: 'Quick',    e: 0.6, q: 0.75 },
  normal:   { name: 'Normal',   e: 1.0, q: 1.0 },
  polished: { name: 'Polished', e: 1.6, q: 1.3 },
};

const TIMES = {
  morning: { name: '8 AM',        reach: 0.9 },
  noon:    { name: 'Lunch',       reach: 1.0 },
  prime:   { name: 'Prime time',  reach: 1.25 },
  late:    { name: '3 AM',        reach: 0.7, viral: 0.025 },
};

const TREND_POOL = [
  { tag: '#SilentWalking',      niches: ['fitness', 'lifestyle'] },
  { tag: '#TomatoGirlSummer',   niches: ['fashion', 'lifestyle', 'travel'] },
  { tag: '#BarnacleCore',       niches: ['fashion', 'beauty'] },
  { tag: '#PickleballBeef',     niches: ['fitness', 'comedy'], edgy: true },
  { tag: '#GhostKitchenReview', niches: ['food', 'comedy'] },
  { tag: '#AIBoyfriend',        niches: ['tech', 'comedy', 'lifestyle'], edgy: true },
  { tag: '#CottageGoblin',      niches: ['lifestyle', 'fashion', 'food'] },
  { tag: '#DeskTreadmill',      niches: ['tech', 'fitness'] },
  { tag: '#FrogHatSeason',      niches: ['fashion', 'comedy'] },
  { tag: '#NoBuyMonth',         niches: ['lifestyle', 'fashion', 'beauty'] },
  { tag: '#QuietLuxury',        niches: ['fashion', 'lifestyle', 'travel'] },
  { tag: '#SideEyeChallenge',   niches: ['comedy', 'music', 'all'] },
  { tag: '#GrassTouching',      niches: ['lifestyle', 'travel', 'fitness'] },
  { tag: '#ProteinCoffee',      niches: ['fitness', 'food'] },
  { tag: '#LoudBudgeting',      niches: ['lifestyle', 'fashion'] },
  { tag: '#FlipPhoneComeback',  niches: ['tech', 'lifestyle'] },
  { tag: '#DelulusSolulu',      niches: ['comedy', 'lifestyle', 'all'] },
  { tag: '#CursedRecipes',      niches: ['food', 'comedy'] },
  { tag: '#MainCharacterWalk',  niches: ['lifestyle', 'fashion', 'travel'] },
  { tag: '#OfficeSiren',        niches: ['fashion', 'beauty'] },
  { tag: '#5amClub',            niches: ['fitness', 'lifestyle'] },
  { tag: '#MysteryBoxUnbox',    niches: ['tech', 'gaming', 'comedy'] },
  { tag: '#IceBathDare',        niches: ['fitness', 'comedy'], edgy: true },
  { tag: '#SeaShantyRemix',     niches: ['music', 'comedy'] },
  { tag: '#RetroConsoleHunt',   niches: ['gaming', 'tech'] },
  { tag: '#SpeedrunAnything',   niches: ['gaming', 'comedy'] },
  { tag: '#GlassSkin',          niches: ['beauty'] },
  { tag: '#BedRotting',         niches: ['lifestyle', 'comedy'], edgy: true },
  { tag: '#ChefKissChallenge',  niches: ['food', 'music'] },
  { tag: '#PassportBingo',      niches: ['travel'] },
  { tag: '#LoFiStudyBeats',     niches: ['music', 'lifestyle'] },
  { tag: '#AuroraVsJaxon',      niches: ['all'], edgy: true },
  { tag: '#BoycottFastFashion', niches: ['fashion', 'lifestyle'], edgy: true },
  { tag: '#RateMySetup',        niches: ['tech', 'gaming'] },
  { tag: '#HotSauceGauntlet',   niches: ['food', 'comedy'] },
  { tag: '#VocalRunChallenge',  niches: ['music'] },
];

/* ego: how hard they are to impress; kind: warmth; drama: how likely they start/join beef; rep: public image */
const NPCS = {
  aurora: { name: 'Aurora Vance',   handle: 'auroravance',   type: 'Pop superstar',       niche: 'music',     followers: 182e6, ego: 0.9, kind: 0.4, drama: 0.5, rep: 72, color: '#C2407E', bio: 'Six-time Glitz award winner. Tour sold out in 11 minutes.' },
  jaxon:  { name: 'Jaxon Reyes',    handle: 'jaxonreyes',    type: 'Movie star',          niche: 'lifestyle', followers: 94e6,  ego: 0.85, kind: 0.5, drama: 0.4, rep: 68, color: '#3C6FB8', bio: 'Action hero. Allegedly does his own stunts.' },
  nova:   { name: 'Nova Sterling',  handle: 'novasterling',  type: 'Tech billionaire',    niche: 'tech',      followers: 128e6, ego: 0.95, kind: 0.2, drama: 0.9, rep: 44, color: '#4B5563', bio: 'Rockets, robots and 3 AM posts.' },
  mira:   { name: 'Mira Okafor',    handle: 'miraglow',      type: 'Beauty mogul',        niche: 'beauty',    followers: 66e6,  ego: 0.7, kind: 0.6, drama: 0.3, rep: 81, color: '#B7791F', bio: 'Founder of Okafor Beauty. Shade range queen.' },
  rico:   { name: 'Rico Swavé',     handle: 'ricoswave',     type: 'Rapper',              niche: 'music',     followers: 55e6,  ego: 0.8, kind: 0.4, drama: 0.8, rep: 58, color: '#7C3AED', bio: 'Three platinum albums. Zero chill.' },
  dex:    { name: 'Dex "Blitz" Moreno', handle: 'blitzdex',  type: 'Streamer',            niche: 'gaming',    followers: 42e6,  ego: 0.6, kind: 0.6, drama: 0.5, rep: 70, color: '#0E9F6E', bio: 'Most-watched streamer on Streamly. Allergic to losing.' },
  marcus: { name: 'Marcus Hale',    handle: 'marcushale',    type: 'Pro athlete',         niche: 'fitness',   followers: 40e6,  ego: 0.7, kind: 0.7, drama: 0.2, rep: 84, color: '#D97706', bio: '2x champion. Runs a youth sports foundation.' },
  luna:   { name: 'Luna Park',      handle: 'lunaparkstyle', type: 'Fashion icon',        niche: 'fashion',   followers: 31e6,  ego: 0.65, kind: 0.55, drama: 0.35, rep: 76, color: '#DB2777', bio: 'Runway to street. Trend forecaster.' },
  gordon: { name: 'Gordon Flambé',  handle: 'chefflambe',    type: 'Celebrity chef',      niche: 'food',      followers: 25e6,  ego: 0.85, kind: 0.3, drama: 0.6, rep: 66, color: '#B91C1C', bio: 'Michelin stars and a very short temper.' },
  tate:   { name: 'Tate Nguyen',    handle: 'techtate',      type: 'Tech reviewer',       niche: 'tech',      followers: 18e6,  ego: 0.5, kind: 0.7, drama: 0.2, rep: 83, color: '#2563EB', bio: 'Honest reviews. Has never taken a paid review.' },
  chad:   { name: 'Chad Brolington', handle: 'chadlifts',    type: 'Fitness bro',         niche: 'fitness',   followers: 12e6,  ego: 0.75, kind: 0.35, drama: 0.75, rep: 49, color: '#EA580C', bio: 'Sells a pre-workout that is mostly glitter.' },
  kenzie: { name: 'Kenzie Blake',   handle: 'kenzietea',     type: 'Drama channel',       niche: 'comedy',    followers: 9e6,   ego: 0.6, kind: 0.2, drama: 1.0, rep: 40, color: '#9D174D', bio: 'Spilling tea since before you were verified.' },
  priya:  { name: 'Priya Kapoor',   handle: 'priyalols',     type: 'Comedian',            niche: 'comedy',    followers: 8e6,   ego: 0.4, kind: 0.8, drama: 0.2, rep: 80, color: '#0891B2', bio: 'Stand-up special streaming now.' },
  brody:  { name: 'Brody Kane',     handle: 'brodypranks',   type: 'Prankster',           niche: 'comedy',    followers: 7e6,   ego: 0.55, kind: 0.3, drama: 0.85, rep: 30, color: '#65A30D', bio: 'Banned from 4 malls and 1 aquarium.' },
  bella:  { name: 'Bella Brooks',   handle: 'bellabrookshome', type: 'Momfluencer',       niche: 'lifestyle', followers: 6e6,   ego: 0.45, kind: 0.7, drama: 0.4, rep: 67, color: '#A16207', bio: 'Beige toddler outfits and organized pantries.' },
  twins:  { name: 'The Wander Twins', handle: 'wandertwins', type: 'Travel duo',          niche: 'travel',    followers: 4e6,   ego: 0.35, kind: 0.8, drama: 0.15, rep: 78, color: '#0D9488', bio: '97 countries. One shared suitcase.' },
  sage:   { name: 'Sage Willow',    handle: 'sagewillowheals', type: 'Wellness guru',     niche: 'lifestyle', followers: 3e6,   ego: 0.6, kind: 0.5, drama: 0.5, rep: 45, color: '#4D7C0F', bio: 'Crystals, cold plunges, and a $300 course.' },
  tony:   { name: 'Big Tony Eats',  handle: 'bigtonyeats',   type: 'Food challenger',     niche: 'food',      followers: 2.5e6, ego: 0.3, kind: 0.85, drama: 0.1, rep: 82, color: '#C2410C', bio: 'Finished the 12-pound burrito. Twice.' },
  ivy:    { name: 'Ivy Marlow',     handle: 'ivymarlowmusic', type: 'Indie musician',     niche: 'music',     followers: 1.2e6, ego: 0.3, kind: 0.8, drama: 0.1, rep: 85, color: '#6D28D9', bio: 'Bedroom pop. Tour van named Gerald.' },
  skye:   { name: 'Skye Rivera',    handle: 'skyerivera',    type: 'Rising creator',      niche: 'lifestyle', followers: 160e3, ego: 0.25, kind: 0.75, drama: 0.3, rep: 70, color: '#0284C7', bio: 'Started posting last spring. Going places.' },
  milo:   { name: 'Milo Fenn',      handle: 'milofenn',      type: 'Rising creator',      niche: 'gaming',    followers: 48e3,  ego: 0.2, kind: 0.7, drama: 0.4, rep: 64, color: '#15803D', bio: 'Speedruns games nobody has heard of.' },
};

const NPC_POSTS = {
  music:     ['New single at midnight. Are you ready?', 'Studio till 4am again. Worth it.', 'Tour rehearsals are brutal but the lights are INSANE', 'Wrote a song about a trend: {trend}'],
  lifestyle: ['Morning routine, but honest this time', 'Moved my whole closet around. Therapy.', 'Trying {trend} for a week. Update soon.', 'Gratitude post. Love you all.'],
  tech:      ['Unpopular opinion: phones peaked in 2019', 'Tested it for 30 days. Full review up now.', 'My thoughts on {trend}: overhyped?', 'Server room selfie.'],
  beauty:    ['This shade just launched and I am emotional', 'Skin day. No filter.', '{trend} but make it glam', 'Restocked. Go go go.'],
  gaming:    ['Going live in 10. Ranked grind.', 'That clutch last night was not luck.', '{trend} speedrun attempt tonight', 'Patch notes ruined my main.'],
  fitness:   ['5am. No excuses.', 'Leg day is a personality.', 'Rating {trend} as a coach', 'Rest days matter too.'],
  fashion:   ['Paris fit dump', 'Thrifted this for $8.', '{trend} is the look of the season', 'Styled one jacket six ways.'],
  food:      ['This sauce took 9 hours. No regrets.', 'Rating gas station sushi. Pray for me.', 'Tried {trend}. Chef\'s verdict inside.', 'Brunch that slaps.'],
  comedy:    ['Me when the group chat goes quiet', 'New bit. Be honest.', '{trend} explained badly', 'Got banned from another Costco (lie).'],
  travel:    ['Found a village with 40 people and one very large dog', 'Airport lounge ranking', '{trend} in 3 countries', 'Sunrise from 4,000 meters.'],
};

const NEWS_NPC = [
  '{npc} spotted leaving a studio at 4 AM. New project?',
  '{npc} unfollows three co-stars overnight. Fans panic.',
  '{npc} under fire after old posts resurface',
  '{npc} announces a surprise charity drive',
  '{npc} crosses a major follower milestone',
  "{npc}'s brand deal with a sketchy app raises eyebrows",
  '{npc} and {npc2} seen at the same restaurant. Coincidence?',
  '{npc} posts a cryptic "I\'m done" story, deletes it an hour later',
  '{npc} launches a merch line. Hoodie is $140.',
  '{npc} addresses rumors in a 40-minute video',
];

const BRANDS = {
  glow:   { name: 'GlowUp Cosmetics',   niches: ['beauty', 'fashion', 'lifestyle'], base: 40, rep: 0 },
  fizz:   { name: 'FizzBolt Energy',    niches: ['gaming', 'fitness', 'comedy'],    base: 35, rep: -0.5 },
  shield: { name: 'ShieldLine VPN',     niches: ['tech', 'gaming', 'travel'],       base: 45, rep: 0 },
  chair:  { name: 'ThroneForge Chairs', niches: ['gaming', 'tech'],                 base: 50, rep: 0 },
  meal:   { name: 'PlateCrate Meal Kits', niches: ['food', 'fitness', 'lifestyle'], base: 40, rep: 0 },
  eco:    { name: 'EcoThreads',         niches: ['fashion', 'lifestyle', 'travel'], base: 45, rep: 1 },
  sky:    { name: 'SkyHop Airlines',    niches: ['travel', 'lifestyle'],            base: 55, rep: 0 },
  crunch: { name: 'Crunchos Chips',     niches: ['comedy', 'gaming', 'food'],       base: 30, rep: 0 },
  realm:  { name: 'Dragon Realms Mobile', niches: ['gaming', 'comedy'],             base: 55, rep: -0.5 },
  pulse:  { name: 'Pulse Audio',        niches: ['music', 'tech'],                  base: 50, rep: 0 },
  iron:   { name: 'IronCore Gyms',      niches: ['fitness'],                        base: 45, rep: 0.5 },
  paws:   { name: 'Paws & Co',          niches: ['lifestyle', 'comedy', 'all'],     base: 35, rep: 1 },
  aurele: { name: 'Maison Aurèle',      niches: ['fashion', 'lifestyle', 'beauty'], base: 120, rep: 0.5, min: 1e5 },
  orbit:  { name: 'Orbit Phones',       niches: ['tech', 'all'],                    base: 90, rep: 0, min: 5e5 },
  moon:   { name: 'MoonRocket Coin',    niches: ['all'],                            base: 95, rep: -6, shady: true },
  slim:   { name: 'SlimSip Detox Tea',  niches: ['fitness', 'beauty', 'lifestyle'], base: 65, rep: -4, shady: true },
  cash:   { name: 'CashNow Loans',      niches: ['all'],                            base: 75, rep: -5, shady: true },
  spin:   { name: 'LuckySpin Casino',   niches: ['all'],                            base: 110, rep: -7, shady: true, min: 2e4 },
};

/* q: quality bonus, plats: which platforms it helps, reach: global reach bonus, upkeep: $/day */
const SHOP = [
  { id: 'phone',    cat: 'Gear', name: 'Pro phone camera',     price: 400,    q: 0.08, desc: '+8% quality on every post.' },
  { id: 'ring',     cat: 'Gear', name: 'Ring light',           price: 120,    q: 0.05, plats: ['pix', 'clipz', 'tube', 'live'], desc: '+5% quality on photo and video.' },
  { id: 'mic',      cat: 'Gear', name: 'Studio mic',           price: 250,    q: 0.06, plats: ['clipz', 'tube', 'live'], desc: '+6% quality on video and streams.' },
  { id: 'editsw',   cat: 'Gear', name: 'Editing suite',        price: 350,    q: 0.07, plats: ['clipz', 'tube', 'pix'], desc: '+7% quality, doubles editing XP.' },
  { id: 'dslr',     cat: 'Gear', name: 'Mirrorless camera',    price: 1800,   q: 0.12, plats: ['pix', 'tube'], desc: '+12% quality on Pixgram and ViewTube.' },
  { id: 'drone',    cat: 'Gear', name: 'Camera drone',         price: 900,    q: 0.1,  plats: ['tube', 'clipz'], desc: '+10% on video. Travel creators get +10% more.' },
  { id: 'pc',       cat: 'Gear', name: 'Streaming PC',         price: 3000,   q: 0.15, plats: ['live', 'tube'], desc: '+15% on streams and long video.' },
  { id: 'studio',   cat: 'Gear', name: 'Home studio build-out', price: 15000, q: 0.2,  desc: '+20% quality on everything.' },
  { id: 'wardrobe', cat: 'Lifestyle', name: 'Designer wardrobe', price: 6000,  reach: 0.05, desc: '+5% reach. Unlocks the Flex topic.' },
  { id: 'car',      cat: 'Lifestyle', name: 'Supercar',        price: 90000,   reach: 0.06, upkeep: 150, desc: '+6% reach. $150/day upkeep.' },
  { id: 'mansion',  cat: 'Lifestyle', name: 'Hillside mansion', price: 2.5e6,  reach: 0.1, upkeep: 2000, desc: '+10% reach, +10 max energy, less stress. $2K/day.' },
  { id: 'jet',      cat: 'Lifestyle', name: 'Private jet',     price: 2e7,     reach: 0.12, upkeep: 10000, desc: '+12% reach. $10K/day. People will have opinions.' },
  { id: 'island',   cat: 'Lifestyle', name: 'Private island',  price: 1.2e8,   reach: 0.15, upkeep: 30000, desc: 'The endgame flex. +15% reach.' },
];

const CONSUMABLES = [
  { id: 'coffee',   name: 'Oat latte',       price: 6,    desc: '+12 energy.',                         fx: { energy: 12, stress: 1 } },
  { id: 'drink',    name: 'FizzBolt can',    price: 4,    desc: '+25 energy, +8 stress.',              fx: { energy: 25, stress: 8 } },
  { id: 'spa',      name: 'Spa day',         price: 400,  desc: '−35 stress.',                         fx: { stress: -35 } },
  { id: 'therapy',  name: 'Therapy session', price: 180,  desc: '−22 stress, +2 max energy tomorrow.', fx: { stress: -22 } },
  { id: 'vacation', name: 'Week in Bali',    price: 5000, desc: 'Stress to zero, skip 3 days, travel content bonus after.', special: 'vacation' },
];

const GROWTH = [
  { id: 'bots1',  name: '1K followers (bots)',   price: 40,   n: 1000,   desc: 'Cheap numbers. Hurts engagement rate.' },
  { id: 'bots10', name: '10K followers (bots)',  price: 350,  n: 10000,  desc: 'Looks great until someone checks.' },
  { id: 'bots100', name: '100K followers (bots)', price: 3000, n: 100000, desc: 'Drama channels love finding these.' },
  { id: 'check',  name: 'Chirp Premium badge',   price: 8,    desc: 'Paid checkmark. +10% Chirp reach, −2 reputation.', special: 'check' },
  { id: 'ads',    name: 'Promoted post campaign', price: 500, desc: 'Real ad spend. Gains followers based on reach.', special: 'ads' },
];

const COURSES = {
  charisma:   { name: 'On-camera coaching',   base: 500,  desc: 'Funny tone, skits, streams, vlogs.' },
  creativity: { name: 'Creative workshop',    base: 450,  desc: 'Photos, threads, educational posts.' },
  editing:    { name: 'Editing masterclass',  base: 600,  desc: 'Reels, shorts, tutorials, docs.' },
  business:   { name: 'Creator business course', base: 900, desc: 'Better deal pay, ad revenue, merch.' },
};

const TEAM = {
  assistant: { name: 'Personal assistant', pay: 60,  req: 1000,  desc: '+20 max energy every day.' },
  editor:    { name: 'Video editor',       pay: 120, req: 5000,  desc: 'Video posts cost 20% less energy and get +10% quality.' },
  manager:   { name: 'Talent manager',     pay: 80,  req: 10000, desc: 'Deals pay 25% more and arrive more often.' },
  smm:       { name: 'Community manager',  pay: 70,  req: 20000, desc: 'Replies to fans daily. Engagement drifts up.' },
  pr:        { name: 'PR agent',           pay: 150, req: 50000, desc: 'Heat cools twice as fast. Scandal damage cut by 40%.' },
  therapist: { name: 'On-call therapist',  pay: 90,  req: 20000, desc: '−12 stress every day.' },
  lawyer:    { name: 'Entertainment lawyer', pay: 200, req: 100000, desc: 'Halves fines, wins most copyright disputes.' },
  bodyguard: { name: 'Bodyguard',          pay: 100, req: 250000, desc: 'Handles stalkers and paparazzi scuffles.' },
};

const TIERS = [
  { min: 0,    name: 'Nobody' },
  { min: 1e3,  name: 'Nano' },
  { min: 1e4,  name: 'Micro' },
  { min: 1e5,  name: 'Mid-tier' },
  { min: 5e5,  name: 'Macro' },
  { min: 1e6,  name: 'Mega' },
  { min: 1e7,  name: 'Celebrity' },
  { min: 1e8,  name: 'Icon' },
];

const CAPTIONS = {
  authentic:   ['Real talk: {t}.', 'Not my usual post, but {t} has been on my mind.', 'Honest thoughts on {t}.', 'No filter today. Just {t}.'],
  funny:       ['POV: you tried {t} and regretted it immediately', 'me explaining {t} to my group chat', '{t} but make it chaotic', 'nobody: / me at 2am: {t}'],
  wholesome:   ['Grateful for every one of you. {t}', 'Small wins today: {t}', 'You all made {t} possible. Thank you.'],
  educational: ['Everything I learned about {t}, in 60 seconds', '{t}: a quick guide (save this)', '3 mistakes people make with {t}'],
  clickbait:   ["I CAN'T BELIEVE {T} (NOT CLICKBAIT)", "You're doing {t} WRONG", 'This changed EVERYTHING... {t}', 'Watch before they delete this: {t}'],
  ragebait:    ['Unpopular opinion: {t} is overrated and you all know it.', 'If you like {t}, unfollow me.', '{t} people are the worst. Fight me.', 'Nobody is ready for this take on {t}.'],
  thirst:      ['{t}, but the fit is the real story', "Didn't come to play. {t}", 'Soft launch of {t}'],
  flex:        ['Casual Tuesday. {t}', 'Worked hard for this. {t}', 'Manifested. {t}'],
};

const COMMENTS = {
  pos: ['this is everything', 'obsessed with this', 'ok why is this so good', 'you never miss', 'saving this forever', 'been here since the early days', 'W post', 'the algorithm finally blessed me', 'I needed this today', 'ate and left no crumbs', 'this made my whole week', 'underrated creator fr'],
  neg: ['mid', 'who asked', 'unfollowing', 'this aged badly', 'ratio', 'fell off hard', 'be so for real', 'the audacity', 'this is why the internet is cooked', 'reported'],
  fun: ['I am WHEEZING', 'not the ending', 'the way I screamed', 'sir this is a bakery', 'my roman empire now', 'crying in the club rn', 'my mom sent me this'],
  bot: ['Nice pic! DM @promo.boost4u for collab', 'follow back?', 'Earn $900/day from home, link in bio', 'Hot deals near you, check my page'],
  spon: ['#ad lol', 'sellout arc unlocked', 'how much did they pay u', 'the code did not work btw', 'not another sponsor'],
  heat: ['you should log off', 'deleting this in 3... 2...', 'screenshotted', 'the replies are a crime scene', 'PR team is sweating'],
};
const HANDLE_A = ['sleepy', 'cosmic', 'tiny', 'feral', 'cozy', 'salty', 'iced', 'lowkey', 'based', 'glitter', 'midnight', 'chaotic', 'soft', 'spicy', 'lunar', 'rogue'];
const HANDLE_B = ['panda', 'bean', 'gremlin', 'raccoon', 'latte', 'moth', 'frog', 'noodle', 'goblin', 'daisy', 'byte', 'comet', 'otter', 'mango', 'pixel'];

const AVATAR_COLORS = ['#D6307A', '#E0662B', '#C99A06', '#1F9D6B', '#1C8AB8', '#6B4FD6', '#B03FB5', '#44505E'];
