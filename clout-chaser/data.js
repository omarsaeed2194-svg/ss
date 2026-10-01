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

/* pay is a MONTHLY salary, paid every 30 days from the hire date */
const TEAM = {
  assistant: { name: 'Personal assistant', pay: 400,  req: 1000,  desc: '+20 max energy every day.' },
  editor:    { name: 'Video editor',       pay: 800, req: 5000,  desc: 'Video posts cost 20% less energy and get +10% quality.' },
  manager:   { name: 'Talent manager',     pay: 600,  req: 10000, desc: 'Deals pay 25% more and arrive more often.' },
  socialmgr: { name: 'Social media manager', pay: 900, req: 2000, desc: 'Runs your accounts on autopilot: films and posts for you every day, replies to comments, and books small paid promos. Posts, money and achievements roll in while you sleep.' },
  smm:       { name: 'Community manager',  pay: 500,  req: 20000, desc: 'Replies to fans daily. Engagement drifts up.' },
  pr:        { name: 'PR agent',           pay: 1000, req: 50000, desc: 'Heat cools twice as fast. Scandal damage cut by 40%.' },
  therapist: { name: 'On-call therapist',  pay: 600,  req: 20000, desc: '−12 stress every day.' },
  lawyer:    { name: 'Entertainment lawyer', pay: 1400, req: 100000, desc: 'Halves fines, wins most copyright disputes.' },
  bodyguard: { name: 'Bodyguard',          pay: 700, req: 250000, desc: 'Handles stalkers and paparazzi scuffles.' },
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

/* ---------- Parody A-listers ----------
   Satirical stand-ins for real public figures, with tweaked names. Everything they say and do
   in the game is invented and played for laughs; nothing here describes the real people. */
const PARODY_NPCS = {
  taylor:    { name: 'Taylor Shift',        handle: 'taylorshift',      type: 'Pop superstar',     niche: 'music',     followers: 283e6, ego: 0.7, kind: 0.6, drama: 0.5, rep: 82, color: '#B4528A', bio: 'Writing a song about you right now. Era number 14 loading.', lines: ['Hidden a clue in this post. Good luck.', 'Friendship bracelets restocked. You know what to do.', 'New era. Same cats.', 'The tour just added 40 more dates. Sorry, wallets.'] },
  elon:      { name: 'Elon Tusk',           handle: 'elontusk',         type: 'Tech billionaire',  niche: 'tech',      followers: 212e6, ego: 0.98, kind: 0.2, drama: 0.95, rep: 41, color: '#3F4A5A', bio: 'Rockets, robots, and posting at 3 AM. Bought a platform once.', lines: ['Rocket go up. Stock go up.', 'Considering buying the moon. Thoughts?', 'This app needs an edit button. Maybe.', 'Sleep is a bug.'] },
  zuck:      { name: 'Mark Zuckerburger',   handle: 'zuckerburger',     type: 'Tech CEO',          niche: 'tech',      followers: 16e6,  ego: 0.8, kind: 0.4, drama: 0.6, rep: 48, color: '#2F5FB3', bio: 'Built a social network in a dorm. Now trains MMA. Smells like sunscreen.', lines: ['Wore a new t-shirt today. Big day.', 'Hydrofoiling into the metaverse.', 'Just did a 5-hour jiu-jitsu session. Feeling human.', 'Our new headset lets you attend meetings as a cartoon.'] },
  kym:       { name: 'Kym Kardashion',      handle: 'kymkardashion',    type: 'Reality mogul',     niche: 'fashion',   followers: 362e6, ego: 0.85, kind: 0.5, drama: 0.8, rep: 58, color: '#8C6A54', bio: 'Shapewear empire. Law student. Contour is a lifestyle.', lines: ['New shapewear drop. You will not be able to breathe, but you will look amazing.', 'Studying for my exam. Contour still on.', 'Family dinner was dramatic. Watch the show.', 'Neutral tones only. Forever.'] },
  kylie:     { name: 'Kylie Jenmer',        handle: 'kyliejenmer',      type: 'Beauty billionaire', niche: 'beauty',   followers: 394e6, ego: 0.8, kind: 0.5, drama: 0.6, rep: 60, color: '#C25E7C', bio: 'Lip kits and a very large closet. Rise and shine.', lines: ['Rise and shine ☀️', 'New lip shade dropping Friday.', 'My closet tour is 3 hours long. You are welcome.', 'Matching outfits with the kids today.'] },
  ronaldough:{ name: 'Cristiano Ronaldough', handle: 'cronaldough',     type: 'Football legend',   niche: 'fitness',   followers: 640e6, ego: 0.95, kind: 0.55, drama: 0.6, rep: 74, color: '#B91C3C', bio: 'Most-followed human on the internet. SIUUU. Hydrate.', lines: ['SIUUUU', 'Ice bath at 5 AM. Discipline.', 'Moved the soda bottle again. Drink water.', 'Another record. Another day.'] },
  messy:     { name: 'Leonel Messy',        handle: 'leonelmessy',      type: 'Football legend',   niche: 'fitness',   followers: 505e6, ego: 0.3, kind: 0.85, drama: 0.15, rep: 90, color: '#3A7BC8', bio: 'Quiet guy. Eight golden balls. Likes mate tea.', lines: ['Good game today 🙏', 'Family time.', 'Thank you fans ❤️', 'Mate and a nap.'] },
  mrfeast:   { name: 'MrFeast',             handle: 'mrfeast',          type: 'Mega YouTuber',     niche: 'comedy',    followers: 342e6, ego: 0.5, kind: 0.75, drama: 0.35, rep: 79, color: '#2C7BE5', bio: 'I gave away an island. Next video: last to leave the chocolate factory wins it.', lines: ['Last to leave this circle wins $1,000,000.', 'I built 100 houses and gave them away.', 'Our chocolate bar is in stores. Please eat it.', 'Uploading in 10 minutes. Thumbnail took 3 weeks.'] },
  drayke:    { name: 'Drayke',              handle: 'drayke6god',       type: 'Rapper',            niche: 'music',     followers: 146e6, ego: 0.88, kind: 0.4, drama: 0.85, rep: 61, color: '#6B5B3E', bio: 'Started from the bottom. Sad song specialist. Owl enthusiast.', lines: ['Sad song at 3 AM. You know the vibes.', 'Started from the bottom, now I own a basketball court indoors.', 'Toronto weather got me writing again.', 'New album when it is ready.'] },
  kendrik:   { name: 'Kendrik Lamarr',      handle: 'kendriklamarr',    type: 'Rapper',            niche: 'music',     followers: 31e6,  ego: 0.6, kind: 0.55, drama: 0.7, rep: 86, color: '#7A3B2E', bio: 'Pulitzer on the shelf. Posts once a year. Every word counts.', lines: ['.', 'Wrote 40 verses. Kept one.', 'The halftime show was a message.', 'Silence is also a verse.'] },
  rihannah:  { name: 'Rihannah Fenti',      handle: 'rihannahfenti',    type: 'Music & beauty icon', niche: 'beauty',  followers: 151e6, ego: 0.7, kind: 0.6, drama: 0.4, rep: 85, color: '#9F2D2D', bio: '40 shades and zero new albums. Stop asking.', lines: ['No, the album is not out. Here is a lip gloss.', 'Fenti drop. Every shade.', 'Stop asking about the album.', 'Umbrella weather.'] },
  beyonslay: { name: 'Beyonslay',           handle: 'beyonslay',        type: 'Pop icon',          niche: 'music',     followers: 315e6, ego: 0.8, kind: 0.55, drama: 0.2, rep: 92, color: '#C9952A', bio: 'Posts three times a year. Every post breaks the internet.', lines: ['✨', 'Tour visuals are ready. Are you?', 'Country era. Yee-slay.', 'Thank you to the hive.'] },
  beaver:    { name: 'Justin Beaver',       handle: 'justinbeaver',     type: 'Pop star',          niche: 'music',     followers: 293e6, ego: 0.6, kind: 0.6, drama: 0.5, rep: 66, color: '#8B6A4F', bio: 'Grew up on the internet. Wears hoodies to formal events.', lines: ['Hoodie to the gala. Comfort first.', 'Grateful for the journey.', 'Baby baby baby... just kidding. New music soon.', 'Peace and love.'] },
  venti:     { name: 'Ariana Venti',        handle: 'arianaventi',      type: 'Pop star',          niche: 'music',     followers: 376e6, ego: 0.65, kind: 0.7, drama: 0.35, rep: 80, color: '#B38BB0', bio: 'Whistle notes and a very high ponytail. Thank u, next.', lines: ['Thank u, next.', 'Hit a whistle note and a dog showed up.', 'Ponytail stays up. Standards stay up.', 'New skincare line, made with love.'] },
  pebble:    { name: 'Dwayne "The Pebble" Johnson', handle: 'thepebble',  type: 'Action star',       niche: 'fitness',   followers: 396e6, ego: 0.7, kind: 0.8, drama: 0.2, rep: 87, color: '#7B4A2A', bio: 'Wakes up at 3:30 AM. Eats 10 meals. Raises one eyebrow professionally.', lines: ['3:30 AM. The iron is waiting.', 'Cheat meal: 12 pancakes, 4 pizzas. Earned it.', 'Raising an eyebrow at all of you.', 'Be kind. Be strong. Be early.'] },
  loganp:    { name: 'Logan Pall',          handle: 'loganpall',        type: 'Influencer boxer',  niche: 'comedy',    followers: 27e6,  ego: 0.85, kind: 0.35, drama: 0.85, rep: 38, color: '#3D7A6A', bio: 'Podcast, wrestling, energy drinks, and one very expensive card.', lines: ['New drink flavor just dropped. Hydrate like a champion.', 'Wore a $5M card to the ring. Normal Tuesday.', 'Podcast up. We talked about aliens for 2 hours.', 'Wrestling is real to me.'] },
  jakep:     { name: 'Jake Pall',           handle: 'jakepall',         type: 'Influencer boxer',  niche: 'fitness',   followers: 28e6,  ego: 0.9, kind: 0.3, drama: 0.9, rep: 36, color: '#4A6A8A', bio: 'Undefeated against people who are not boxers. Calling out everyone.', lines: ['Who wants smoke? Name a price.', 'Knocked out another retired athlete. Next.', 'I am the face of boxing. Cope.', 'Training camp day 1. Sauna day 2.'] },
  senate:    { name: 'Kai Senate',          handle: 'kaisenate',        type: 'Streamer',          niche: 'gaming',    followers: 19e6,  ego: 0.6, kind: 0.65, drama: 0.6, rep: 70, color: '#4E7A2E', bio: 'Record-breaking subathons. Yelling is a love language.', lines: ['30-day subathon starts NOW.', 'Chat broke the record again. W chat.', 'I did not sleep. I streamed.', 'Bringing a celebrity on stream tonight 👀'] },
  snoop:     { name: 'Snoop Doug',          handle: 'snoopdoug',        type: 'Rapper & TV chef',  niche: 'food',      followers: 86e6,  ego: 0.4, kind: 0.9, drama: 0.15, rep: 88, color: '#5B4A8A', bio: 'Rap legend, cooking show host, Olympic commentator, professional relaxer.', lines: ['Cooking up something special, nephew.', 'Commentating the equestrian finals. Horse got rhythm.', 'Fo shizzle, the brunch is served.', 'Peace, love and a slow cooker.'] },
  eyelash:   { name: 'Billie Eyelash',      handle: 'billieeyelash',    type: 'Alt-pop star',      niche: 'music',     followers: 121e6, ego: 0.4, kind: 0.75, drama: 0.25, rep: 84, color: '#2E6E5A', bio: 'Whispers into microphones. Wins every award. Hair color varies.', lines: ['whispered a song. it went platinum.', 'new hair color. guess.', 'thank you for the award. again.', 'tour merch is oversized on purpose.'] },
};
Object.assign(NPCS, PARODY_NPCS);

/* Rivalries the world keeps coming back to. kind decides the flavor text. */
const RIVALRIES = [
  { a: 'drayke', b: 'kendrik', kind: 'Diss track war', verbA: 'dropped a 9-minute diss track', verbB: 'answered with a one-line verse' },
  { a: 'elon', b: 'zuck', kind: 'Cage match', verbA: 'challenged them to a cage fight', verbB: 'posted a jiu-jitsu photo in reply' },
  { a: 'ronaldough', b: 'messy', kind: 'GOAT debate', verbA: 'posted his trophy cabinet', verbB: 'posted a quiet photo with eight golden balls' },
  { a: 'mrfeast', b: 'loganp', kind: 'Snack vs drink war', verbA: 'called their drink "sparkling regret"', verbB: 'said the chocolate bar tastes like a thumbnail' },
  { a: 'jakep', b: 'pebble', kind: 'Boxing callout', verbA: 'called them out for a boxing match', verbB: 'raised one eyebrow' },
  { a: 'kylie', b: 'rihannah', kind: 'Beauty empire war', verbA: 'launched 40 new shades', verbB: 'launched 50' },
  { a: 'taylor', b: 'kym', kind: 'Old receipts', verbA: 'released a song with suspiciously specific lyrics', verbB: 'posted an old phone call' },
  { a: 'venti', b: 'eyelash', kind: 'Award show snub', verbA: 'thanked everyone except them', verbB: 'whispered "congrats" in a way that felt like a threat' },
  { a: 'senate', b: 'dex', kind: 'Streaming record race', verbA: 'broke the subscriber record', verbB: 'broke it back by 12 subs' },
  { a: 'gordon', b: 'snoop', kind: 'Cooking show rivalry', verbA: 'called their brunch "a crime scene"', verbB: 'said "relax, nephew" and plated a perfect omelette' },
  { a: 'beyonslay', b: 'taylor', kind: 'Album of the year race', verbA: 'dropped a surprise album at midnight', verbB: 'announced a re-recording at 12:01' },
  { a: 'beaver', b: 'jakep', kind: 'Hoodie vs suit beef', verbA: 'showed up to the gala in a hoodie', verbB: 'called it disrespectful in a $40K suit' },
];
const CLASH_LINES = {
  attack: ['@{b} you fell off and the charts know it', 'imagine being @{b} right now lol', '@{b} we are not the same', 'respectfully @{b}, no', 'still waiting on @{b} to say it to my face', '@{b} come get your fans'],
  defend: ['not dignifying that with a response. (this is the response)', 'my fans already won this', 'some of us are busy working', 'stay pressed @{a}', 'the receipts are in the drafts. do not test me'],
};

/* Post "looks": a creative layer on photo and video posts */
const FILTERS = {
  clean:     { name: 'Clean',     desc: '+rep, crisp and trustworthy', g: ['#E6EEF5', '#9DB4C8'], ink: '#14202B', rep: 0.3 },
  neon:      { name: 'Neon',      desc: '+reach, loud and electric',   g: ['#FF2E9A', '#21D4FD'], reach: 0.05 },
  vintage:   { name: 'Vintage',   desc: '+engagement, warm nostalgia', g: ['#C9A26B', '#6B4A2B'], eng: 0.06 },
  chaotic:   { name: 'Chaotic',   desc: '+viral chance, a little heat', g: ['#F7D000', '#E8341C'], viral: 0.015, heat: 1 },
  cinematic: { name: 'Cinematic', desc: '+quality, costs 3 more energy', g: ['#1B2A41', '#C08A3E'], q: 0.06, e: 3 },
  lofi:      { name: 'Lo-fi',     desc: 'Costs 2 less energy',          g: ['#7A8B7F', '#3E4A44'], e: -2 },
};

/* ---------- More parody A-listers (satire, tweaked names, invented behavior) ---------- */
Object.assign(PARODY_NPCS, {
  badbunni:  { name: 'Bad Bunni',        handle: 'badbunni',       type: 'Reggaeton king',    niche: 'music',     followers: 46e6,  ego: 0.6, kind: 0.7, drama: 0.4, rep: 83, color: '#C2410C', bio: 'Painted nails, sold-out stadiums, and a skirt at the Met. Sí.', lines: ['Nuevo álbum. Sin aviso.', 'Painted my nails for the tour. Rate them.', 'Wrestling cameo tonight. Do not ask.', 'Gracias a todos 🐰'] },
  selina:    { name: 'Selina Gomes',     handle: 'selinagomes',    type: 'Actor & beauty founder', niche: 'beauty', followers: 421e6, ego: 0.5, kind: 0.85, drama: 0.3, rep: 86, color: '#B45F7A', bio: 'Solving murders on TV, selling blush off TV. Mental health matters.', lines: ['Reminder: take breaks from your phone (after liking this).', 'Blush restock. Liquid. Iconic.', 'Filming season 5. No spoilers.', 'Cooking show disaster, part 3.'] },
  zendayah:  { name: 'Zendayah',         handle: 'zendayah',       type: 'Movie star',        niche: 'fashion',   followers: 184e6, ego: 0.5, kind: 0.8, drama: 0.15, rep: 91, color: '#7A5C3E', bio: 'Every red carpet is a costume. Every costume is a moment.', lines: ['Red carpet look tonight is a reference. Guess it.', 'Press tour day 40.', 'Sand. So much sand. Movie out Friday.', 'Thank you for 10 years 🤍'] },
  oprah:     { name: 'Oprah Windfall',   handle: 'oprahwindfall',  type: 'Media legend',      niche: 'lifestyle', followers: 23e6,  ego: 0.6, kind: 0.85, drama: 0.1, rep: 92, color: '#7E3F8F', bio: 'You get a follow! You get a follow! Everybody gets a follow!', lines: ['YOU get a book club pick!', 'Gratitude journal: entry 9,000.', 'Bread is still my favorite food.', 'Live your best life, and hydrate.'] },
  khaby:     { name: 'Khaby Same',       handle: 'khabysame',      type: 'Silent comedian',   niche: 'comedy',    followers: 162e6, ego: 0.3, kind: 0.8, drama: 0.1, rep: 89, color: '#3A6B4A', bio: '🤷', lines: ['🤷', '(points at the obvious)', '🤲', '...'] },
  lebrawn:   { name: 'LeBrawn James',    handle: 'lebrawnjames',   type: 'Basketball legend', niche: 'fitness',   followers: 160e6, ego: 0.8, kind: 0.65, drama: 0.4, rep: 80, color: '#552583', bio: 'Year 22. Taco Tuesday forever. Spends $1.5M a year on his body.', lines: ['TACO TUESDAYYYY', 'Year 22. Still here.', 'Recovery day. Cryo chamber. Wine.', 'Playing with my son. Surreal.'] },
  shakirra:  { name: 'Shakirra',         handle: 'shakirra',       type: 'Pop superstar',     niche: 'music',     followers: 90e6,  ego: 0.6, kind: 0.6, drama: 0.6, rep: 82, color: '#C08A2E', bio: 'Hips do not lie. Neither do lyrics. Women no longer cry, they invoice.', lines: ['Women don\'t cry anymore, they bill.', 'My hips still don\'t lie.', 'Waka waka (rehearsal day).', 'New song, very specific lyrics. No comment.'] },
  charlie:   { name: "Charlie D'Amelo",  handle: 'charliedamelo',  type: 'Dance creator',     niche: 'lifestyle', followers: 156e6, ego: 0.4, kind: 0.7, drama: 0.35, rep: 72, color: '#E07B9B', bio: 'Learned one dance in my bedroom. Now there is a reality show.', lines: ['New dance. Learn it in 10 seconds.', 'Family dinner on camera again lol', 'Dunkin\' order hasn\'t changed in 5 years.', 'Grateful 🤍'] },
  doja:      { name: 'Doja Kat',         handle: 'dojakat',        type: 'Rapper & chaos agent', niche: 'music',  followers: 25e6,  ego: 0.7, kind: 0.45, drama: 0.85, rep: 63, color: '#D4572B', bio: 'Will roast my own fans. Will meow on a track. Cannot be stopped.', lines: ['stop calling yourselves that name, love you though', 'meow', 'shaved my eyebrows for art', 'I said what I said'] },
  cardi:     { name: 'Cardi C',          handle: 'cardic',         type: 'Rapper',            niche: 'music',     followers: 166e6, ego: 0.75, kind: 0.6, drama: 0.9, rep: 68, color: '#C4245C', bio: 'Okurrr. Will go live about the price of groceries.', lines: ['Why are eggs so expensive??? OKURRR', 'Going live in 5. It is about to be a long one.', 'Hit single dropping Friday.', 'My accountant is crying.'] },
  nicki:     { name: 'Nicki Menage',     handle: 'nickimenage',    type: 'Rap queen',         niche: 'music',     followers: 230e6, ego: 0.92, kind: 0.4, drama: 0.9, rep: 64, color: '#E0479E', bio: 'Queen of rap. Barbz, assemble. Pink wigs only.', lines: ['Barbz, the album is coming.', 'Pink wig day.', 'They will never be me.', 'Did someone say my name? Because I heard it.'] },
  sped:      { name: 'IShowSped',        handle: 'ishowsped',      type: 'Streamer',          niche: 'gaming',    followers: 37e6,  ego: 0.6, kind: 0.6, drama: 0.75, rep: 66, color: '#E2462C', bio: 'Barks at strangers on world tours. SUIII adjacent. Backflips.', lines: ['WORLD TOUR DAY 12 LET\'S GOOO', 'Did a backflip in a museum. Got kicked out.', 'Barked at a tourist. They barked back.', 'Chat, I am NOT okay'] },
});
Object.assign(NPCS, PARODY_NPCS);
RIVALRIES.push(
  { a: 'cardi', b: 'nicki', kind: 'Rap queen showdown', verbA: 'went live for 45 minutes about "certain people"', verbB: 'posted a pink-wig selfie captioned "irrelevant"' },
  { a: 'lebrawn', b: 'ronaldough', kind: 'Greatest athlete debate', verbA: 'posted his career points total', verbB: 'posted his goals total with a SIUUU' },
  { a: 'sped', b: 'senate', kind: 'Streamer world tour race', verbA: 'claimed his world tour was bigger', verbB: 'announced a tour of 30 countries in 30 days' },
  { a: 'shakirra', b: 'kym', kind: 'Lyrics with receipts', verbA: 'released a song with very specific lyrics', verbB: 'posted a 9-slide notes-app response' },
  { a: 'doja', b: 'charlie', kind: 'Dance trend beef', verbA: 'called the dance "cringe, respectfully"', verbB: 'did the dance with 40 million views in reply' },
  { a: 'zendayah', b: 'eyelash', kind: 'Best-dressed war', verbA: 'wore a robot suit to the gala', verbB: 'wore pajamas to the same gala and won best dressed' },
);

/* Home countries and where your audience lives */
const COUNTRIES = {
  us: { name: 'United States', flag: '🇺🇸' }, br: { name: 'Brazil', flag: '🇧🇷' }, in: { name: 'India', flag: '🇮🇳' },
  gb: { name: 'United Kingdom', flag: '🇬🇧' }, mx: { name: 'Mexico', flag: '🇲🇽' }, ph: { name: 'Philippines', flag: '🇵🇭' },
  id: { name: 'Indonesia', flag: '🇮🇩' }, jp: { name: 'Japan', flag: '🇯🇵' }, kr: { name: 'South Korea', flag: '🇰🇷' },
  ng: { name: 'Nigeria', flag: '🇳🇬' }, eg: { name: 'Egypt', flag: '🇪🇬' }, sa: { name: 'Saudi Arabia', flag: '🇸🇦' },
  ae: { name: 'UAE', flag: '🇦🇪' }, fr: { name: 'France', flag: '🇫🇷' }, de: { name: 'Germany', flag: '🇩🇪' },
  es: { name: 'Spain', flag: '🇪🇸' }, it: { name: 'Italy', flag: '🇮🇹' }, tr: { name: 'Turkey', flag: '🇹🇷' },
  ca: { name: 'Canada', flag: '🇨🇦' }, au: { name: 'Australia', flag: '🇦🇺' }, ar: { name: 'Argentina', flag: '🇦🇷' },
  pt: { name: 'Portugal', flag: '🇵🇹' }, co: { name: 'Colombia', flag: '🇨🇴' }, za: { name: 'South Africa', flag: '🇿🇦' },
  pr: { name: 'Puerto Rico', flag: '🇵🇷' }, bb: { name: 'Barbados', flag: '🇧🇧' }, tt: { name: 'Trinidad and Tobago', flag: '🇹🇹' },
};
const TRAVEL_SPOTS = ['us', 'br', 'jp', 'kr', 'fr', 'it', 'gb', 'mx', 'ae', 'id', 'in', 'ng', 'eg', 'es', 'au', 'tr', 'co', 'pt'];
const NPC_COUNTRY = { aurora: 'us', jaxon: 'us', nova: 'us', mira: 'ng', rico: 'us', dex: 'mx', marcus: 'us', luna: 'kr', gordon: 'gb', tate: 'us', chad: 'us', kenzie: 'us', priya: 'in', brody: 'au', bella: 'us', twins: 'ca', sage: 'us', tony: 'it', ivy: 'gb', skye: 'us', milo: 'de',
  taylor: 'us', elon: 'us', zuck: 'us', kym: 'us', kylie: 'us', ronaldough: 'pt', messy: 'ar', mrfeast: 'us', drayke: 'ca', kendrik: 'us', rihannah: 'bb', beyonslay: 'us', beaver: 'ca', venti: 'us', pebble: 'us', loganp: 'us', jakep: 'us', senate: 'us', snoop: 'us', eyelash: 'us',
  badbunni: 'pr', selina: 'us', zendayah: 'us', oprah: 'us', khaby: 'it', lebrawn: 'us', shakirra: 'co', charlie: 'us', doja: 'us', cardi: 'us', nicki: 'tt', sped: 'us' };

/* Parody company accounts: they post, roast, comment and sponsor */
const COMPANIES = {
  windys:   { name: "Windy's",      handle: 'windys',      color: '#D7263D', cat: 'Fast food', roast: true, posts: ['Our burgers are fresh. Our replies are fresher.', 'Imagine freezing your beef. Couldn\'t be us.', 'Someone said our fries are mid. They have been reported to the fryer.'], replies: ['this post is fresher than our competitor\'s beef. barely.', 'we would roast this but it already roasted itself', 'ok this one is actually good. don\'t tell anyone we said that.', 'counterpoint: no'] },
  mcdougals:{ name: "McDougal's",   handle: 'mcdougals',   color: '#E2A400', cat: 'Fast food', posts: ['The ice cream machine is working. Today only. Hurry.', 'New nugget shape just dropped.', 'Breakfast ends at 10:30. Respect the clock.'], replies: ['ba da ba ba ba 🍟', 'this deserves a happy meal', 'ice cream machine is down but our love for this is up'] },
  nikey:    { name: 'Nikey',        handle: 'nikey',       color: '#111111', cat: 'Sportswear', posts: ['Just did it.', 'New runner. Old excuses not included.', 'Champions don\'t sleep. They lace up.'], replies: ['just did it. respect.', 'this energy runs in our shoes', 'we see the vision 👟'] },
  pear:     { name: 'Pear',         handle: 'pear',        color: '#8E9AA6', cat: 'Tech', posts: ['Introducing the Pear 17. It is the same, but more.', 'Shot on Pear.', 'Now in a new color: slightly different gray.'], replies: ['shot on Pear? 👀', 'courageous', 'this is what we call a magic moment'] },
  tezla:    { name: 'Tezla',        handle: 'tezla',       color: '#CC0000', cat: 'EVs', posts: ['Self-driving update: it now drives itself to the service center.', 'Cybertruck window test, round 2.', 'Delivery dates: soon™'], replies: ['this post has autopilot', 'faster than our delivery dates', 'Elon Tusk liked this (probably)'] },
  netflux:  { name: 'Netflux',      handle: 'netflux',     color: '#B20710', cat: 'Streaming', posts: ['Are you still watching?', 'Canceled a show you loved. Renewed one you did not watch.', 'Sharing passwords is love. Sharing passwords is also $7.99.'], replies: ['renewed for season 2', 'are you still watching? we are.', 'this has documentary potential'] },
  starbux:  { name: 'Starbux',      handle: 'starbux',     color: '#00704A', cat: 'Coffee', posts: ['Pumpkin season is a state of mind.', 'Your name, spelled wrong, with love.', 'New drink: it is coffee pretending to be dessert.'], replies: ['we\'ll name a drink after this (spelled wrong)', 'venti levels of iconic', 'this deserves an extra shot'] },
  redbully: { name: 'Red Bully',    handle: 'redbully',    color: '#1E3264', cat: 'Energy drink', posts: ['Jumped out of space again. Normal Tuesday.', 'Wings not included. Legally.', 'Sponsoring a guy who skis down a volcano.'], replies: ['this post gives wings (legally not)', 'extreme content detected 🪽', 'send this to space'] },
  cocakola: { name: 'Coca-Kola',    handle: 'cocakola',    color: '#E41E2B', cat: 'Soda', posts: ['Share a Kola with someone you tolerate.', 'Polar bears were consulted.', 'Holiday trucks are coming.'], replies: ['open happiness, close this tab', 'this is the real thing', 'ice cold take'] },
  amazin:   { name: "Amazin'",      handle: 'amazin',      color: '#FF9900', cat: 'Shopping', posts: ['Your package is 3 stops away. It will remain 3 stops away.', 'Prime day is every day if you believe.', 'We put a smile on the box. You put boxes in your closet.'], replies: ['added to cart', 'arriving tomorrow: our respect', 'customers who liked this also liked you'] },
  gucchi:   { name: 'Gucchi',       handle: 'gucchi',      color: '#1F4E3D', cat: 'Luxury', posts: ['A belt. $1,200. Holds up pants.', 'New collection inspired by your grandmother\'s couch.', 'Logos, but bigger.'], replies: ['this is luxury', 'very on brand for us', 'we would put this on a $900 shirt'] },
  duolinguo:{ name: 'Duolinguo',    handle: 'duolinguo',   color: '#58CC02', cat: 'Language app', roast: true, posts: ['You missed your Spanish lesson. We know where you live.', 'Streak frozen. Like your heart.', '5 minutes a day. Or else. 🦉'], replies: ['you posted this but skipped your lesson 🦉', 'cute post. do your french lesson.', 'we are watching. always.'] },
};
for (const [id, c] of Object.entries(COMPANIES)) {
  BRANDS[id] = { name: c.name, niches: ['all'], base: 60 + (c.cat === 'Luxury' ? 80 : 0), rep: c.cat === 'Luxury' ? 1 : 0.3, min: c.cat === 'Luxury' ? 2e5 : 5e3, company: true };
}

/* Silly secrets you can collect and spill. Harmless by design. */
const TEA_LINES = [
  'still uses a flip phone for "important" calls', 'runs 14 burner accounts to defend themselves', 'cried at a cereal commercial last week',
  'ghostwrites their own fan account', 'cannot parallel park, at all', 'sleeps with a dolphin-shaped nightlight', 'takes 400 selfies to post one',
  'secretly hates the drink they promote', 'once got lost inside their own house', 'practices their "candid" laugh in the mirror',
  'has never seen the movie they quote constantly', 'buys their own merch to make it look sold out', 'serves takeout on nice plates and calls it homemade',
  'has a secret account that only posts pictures of bread', 'still does not know how to pronounce "quinoa"', 'is terrified of geese',
];

/* Creative comment templates. {w} = a word from your post, {h} = your handle, {n} = niche, {p} = platform */
const COMMENT_TPL = {
  pos: ['the way you said "{w}" 😭', '"{w}" supremacy', 'saving this to my {n} folder', '@{h} never misses', 'I didn\'t know I needed "{w}" in my life', 'this is the {n} content {p} was built for', 'printing this and putting it on my fridge', 'my therapist will hear about "{w}"', 'you\'re carrying {p} on your back', 'okay "{w}" just healed me'],
  neg: ['"{w}" 💀 who approved this', 'this is the {n} equivalent of a parking ticket', 'unfollowing, refollowing, unfollowing again', 'the audacity of "{w}"', 'I\'ve seen better {n} content from my microwave', 'ratio + "{w}" is not a thing', 'blink twice if your manager wrote this', 'this aged badly and it\'s been 4 minutes'],
  fun: ['me reading "{w}" at 3am', 'POV: your mom finds this post', 'the "{w}" to unemployment pipeline', 'adding "{w}" to my personality', 'my roman empire is now "{w}"', 'not me sending this to the group chat with no context', 'the dog barked when I read this. true story'],
  stan: ['MOTHER', '@{h} for president', 'we\'re getting married in the comments, it\'s decided', 'I\'d take a bullet for this post', 'protect @{h} at all costs', 'ICON behavior'],
  ask: ['wait is "{w}" a real thing?', 'is this sponsored?', 'what filter is this??', 'tutorial when?', 'can someone explain "{w}" to me', 'drop the playlist'],
  thread: ['literally', 'this', 'came here to say this', 'LMAOOO', 'you\'re so real for this', 'no because why is this so true'],
};
const COUNTRY_FAN = ['{f} {c} loves you!!', 'come to {c} please 🙏 {f}', 'greetings from {c} {f}', '{f} {c} fans where you at', 'you\'re trending in {c} {f}'];

/* Big emoji motifs for generated post art */
const NICHE_EMOJI = { beauty: ['💄', '✨', '🪞'], gaming: ['🎮', '🕹️', '🏆'], fitness: ['🏋️', '💪', '🥇'], comedy: ['😂', '🎭', '🤡'], tech: ['📱', '💻', '🤖'], food: ['🍜', '🍕', '🧁'], music: ['🎤', '🎧', '🎸'], fashion: ['👗', '🕶️', '👠'], travel: ['✈️', '🏝️', '🗺️'], lifestyle: ['☕', '🌿', '🛋️'] };

/* ---------- Fans that actually read your post ---------- */
const KEYWORD_BANK = [
  [/\b(food|pizza|pasta|burger|cook|recipe|eat|ate|dinner|lunch|breakfast|snack)/i, ['ok but where is the recipe', 'I just got hungry at 2am because of you', 'rating: 10/10 would eat through my screen', 'not me licking my phone']],
  [/\b(gym|workout|lift|leg day|abs|run|cardio|protein)/i, ['skipping leg day after reading this, sorry', 'my rest day is offended', 'the motivation I needed to stay in bed', 'protein shake in hand, reading this']],
  [/\b(money|rich|broke|rent|salary|paid|budget|bank)/i, ['my bank account felt this', 'teach me your ways, I have $4', 'rent is due and so is this energy', 'financially and emotionally invested']],
  [/\b(love|crush|ex|breakup|date|dating|single|heart)/i, ['who hurt you (I want names)', 'sending this to my ex with no context', 'single and thriving after this post', 'this is a cry for help and I hear you']],
  [/\b(3am|2am|4am|midnight|sleep|tired|insomnia)/i, ['3am posting is a lifestyle', 'go to sleep (I am also awake)', 'night owls unite 🦉', 'the 3am thoughts are thoughting']],
  [/\b(cat|dog|pet|puppy|kitten)/i, ['PET TAX. NOW.', 'I came for the pet, stayed for you', 'the pet should have their own account', 'protect this animal at all costs']],
  [/\b(travel|trip|flight|airport|beach|island|vacation)/i, ['take me with you, I fit in a suitcase', 'my passport is crying', 'the view? unreal. me at my desk? also unreal', 'adding this to the list I will never do']],
  [/\b(sad|cry|crying|depressed|lonely|tired of)/i, ['sending you the biggest hug 🤍', 'it gets better, we got you', 'you are not alone in this', 'logging on just to say we love you']],
  [/\b(win|won|winning|champion|first|record|goal)/i, ['WINNERS ONLY 🏆', 'main character arc unlocked', 'they said it couldn\'t be done (they were wrong)', 'congrats!! you earned this']],
  [/\b(game|gaming|boss|rank|ranked|clutch|controller)/i, ['gg ez', 'the clutch gene is real', 'my controller just broke in solidarity', 'skill issue (not you, me)']],
  [/\b(makeup|skincare|glow|lip|lipstick|serum)/i, ['the glow is GLOWING', 'adding to cart, emptying wallet', 'which serum??? asking for my whole face', 'flawless. no notes.']],
  [/\b(phone|laptop|tech|setup|gadget|app|ai)/i, ['setup goals, my desk is a war crime', 'but does it run games', 'specs or it didn\'t happen', 'the cable management is a love language']],
  [/\b(outfit|fit|dress|style|fashion|shoes|jacket)/i, ['the fit is FITTING', 'link to the jacket or I riot', 'fashion week who? you week', 'my closet just filed a complaint']],
  [/\b(music|song|album|sing|beat|playlist|concert)/i, ['adding to my playlist immediately', 'this song lives in my head now', 'concert when???', 'I played this 40 times already']],
];
const QUESTION_ANSWERS = {
  which: ['the first one, no debate', 'both. greed wins', 'option C: chaos', 'the second one and I will not be explaining'],
  should: ['yes. do it. today.', 'absolutely not 💀', 'the universe says yes', 'I\'m saying yes so you can blame me later'],
  who: ['me. obviously me.', 'my mom', 'whoever is reading this 🫵', 'not the one you think'],
  what: ['honestly? pizza', 'chaos', 'the vibes', 'whatever you post next'],
  any: ['YES', 'no but I respect the question', 'depends who\'s asking 👀', 'asking the real questions'],
};
const SUPERFAN_KINDS = {
  stan:    { label: 'Superfan', name: ['luv', 'stan', 'angel', 'bestie'], lines: ['day {n} of commenting first 🫶', 'better than your {prev} post and that one was PERFECT', 'I\'ve been here since {f} followers and I\'ll be here forever', 'reporting for duty, commenting on post #{n}', 'protect them at all costs, I mean it'] },
  critic:  { label: 'Top critic', name: ['honest', 'critic', 'real', 'notes'], lines: ['"{w}"? you can do better. 6/10', 'still waiting for the {prev} sequel tbh', 'solid, but your {prev} post was stronger', 'I\'ll allow it. 7/10', 'improvement. last one was a 5, this is a 7'] },
  clown:   { label: 'Class clown', name: ['lol', 'meme', 'goblin', 'chaos'], lines: ['me after reading "{w}" 🤡', 'putting "{w}" on my tombstone', 'this is my roman empire now, sorry {prev} post', 'they did it again, the absolute clowns (affectionate)', 'I laughed, I cried, I fell off my chair'] },
};
const STAR_VOICE = {
  diva:       ['cute.', 'I did this first but ok', '"{w}"? iconic of me to inspire this', 'not bad for someone with {f} followers', 'my lighting would\'ve fixed this'],
  hothead:    ['"{w}"?? be serious', 'LET\'S GOOO 🔥', 'this goes hard ngl', 'nah this is crazy 😭', 'who\'s gonna tell them'],
  sweetheart: ['this is so you 🥹', 'love the "{w}" part so much', 'proud of you!!', 'sending love from my couch 🤍', 'this made my whole day'],
  strategist: ['solid {n} content. the "{w}" angle works', 'numbers will be good on this', 'smart timing', 'clean execution', 'noted. good post.'],
  wildcard:   ['"{w}" 😈', 'I\'m screenshotting this for later', 'interesting choice', '👁️👄👁️', 'this is either genius or a cry for help'],
};
const STAR_BACK = {
  nice:  { diva: ['I know. but thank you', 'you have taste'], hothead: ['appreciate you fr 🔥', 'real one'], sweetheart: ['you\'re the sweetest 🥹', 'stop I\'m blushing'], strategist: ['thanks, appreciated', 'good eye'], wildcard: ['who sent you 👀', 'ok bestie'] },
  funny: { diva: ['…okay that was funny', 'I\'ll allow it'], hothead: ['LMAOOO', 'I\'m crying 😭'], sweetheart: ['hahaha you\'re so funny', '😂😂'], strategist: ['ha. good one', 'fair'], wildcard: ['funnier than my last album', 'I\'m stealing this joke'] },
  promo: { diva: ['no.', 'do not use my comments for ads'], hothead: ['bro is advertising in MY replies', 'blocked (jk) (not jk)'], sweetheart: ['good luck with your page!', 'aw I\'ll check it out'], strategist: ['not the place', 'nice try'], wildcard: ['lol the audacity', 'I respect the hustle'] },
  troll: { diva: ['who is this', 'sweetie no'], hothead: ['say that to my face', 'you want smoke?'], sweetheart: ['that\'s not very nice 😔', 'hope your day gets better'], strategist: ['ratio\'d by facts', 'anyway'], wildcard: ['😂 you\'re funny', 'pinning this'] },
};
const BRAND_BANTER = [
  ['windys', 'mcdougals', 'we would have made this post fresher', 'at least our ice cream machine… never mind'],
  ['starbux', 'cocakola', 'this post pairs well with a latte', 'and an ice-cold Kola'],
  ['nikey', 'redbully', 'just did it', 'and gave it wings (legally not)'],
  ['pear', 'tezla', 'shot on Pear', 'and delivered by Tezla eventually'],
  ['netflux', 'amazin', 'renewing this post for season 2', 'and shipping season 3 by tomorrow'],
  ['duolinguo', 'windys', 'nice post. now do your Spanish lesson 🦉', 'even the owl is roasting people now?'],
];
/* Best format on each platform when you cross-post */
const CROSS_FORMAT = { pix: (f) => (FORMATS[f] && FORMATS[f].video ? 'reel' : 'photo'), chirp: (f) => (f === 'poll' || f === 'thread' || f === 'take' || f === 'meme' ? f : 'take'), clipz: () => 'short', tube: () => 'vlog' };
FORMATS.poll = { p: 'chirp', name: 'Poll', e: 7, reach: 1.15, skill: 'creativity', eng: 1.6 };
const SPIN_PRIZES = [
  { k: 'energy', label: '+35 energy', w: 3 }, { k: 'money', label: 'Cash drop', w: 3 }, { k: 'followers', label: '+3% followers', w: 2 },
  { k: 'boost', label: 'Algorithm boost', w: 2 }, { k: 'tea', label: 'Fresh tea', w: 1.5 }, { k: 'stress', label: 'Spa day (−25 stress)', w: 2 },
  { k: 'mystery', label: 'Mystery event', w: 1 }, { k: 'nothing', label: 'Nothing lol', w: 1 },
];
