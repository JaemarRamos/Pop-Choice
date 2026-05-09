const movies = [
  {
    title: "The Shawshank Redemption",
    year: 1994,
    director: "Frank Darabont",
    genres: ["Drama"],
    runtime: "2h 22m",
    mood_tags: ["hopeful", "inspiring", "emotional", "uplifting", "profound"],
    description: "A wrongfully imprisoned man forges an unbreakable friendship and finds hope in the darkest place imaginable. A timeless story about perseverance, human connection, and the indomitable spirit.",
    why_watch: "The most life-affirming film ever made.",
    embedText: "The Shawshank Redemption 1994. Drama. Hopeful inspiring emotional uplifting profound friendship perseverance hope redemption injustice human spirit prison. A story about finding hope when everything is taken from you. Perfect for feeling inspired, needing emotional uplift, or craving a deeply human story."
  },
  {
    title: "The Dark Knight",
    year: 2008,
    director: "Christopher Nolan",
    genres: ["Action", "Crime", "Thriller"],
    runtime: "2h 32m",
    mood_tags: ["intense", "thrilling", "dark", "complex", "adrenaline"],
    description: "Batman faces the Joker, a chaotic criminal mastermind who pushes Gotham to the brink. A gripping moral thriller disguised as a superhero film.",
    why_watch: "The greatest superhero film ever made — and much more.",
    embedText: "The Dark Knight 2008. Action Crime Thriller. Intense thrilling dark complex adrenaline superhero batman joker chaos moral dilemma. A film for those who crave edge-of-seat tension, complex villains, and moral questions. Perfect when feeling intense, excited for action, or wanting something that makes you think."
  },
  {
    title: "Interstellar",
    year: 2014,
    director: "Christopher Nolan",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    runtime: "2h 49m",
    mood_tags: ["mind-blowing", "emotional", "epic", "profound", "adventurous"],
    description: "A former pilot travels through a wormhole in search of a new home for humanity, confronting the limits of space, time, and love. A breathtaking emotional sci-fi epic.",
    why_watch: "Will make you feel tiny and infinite at the same time.",
    embedText: "Interstellar 2014. Sci-Fi Drama Adventure. Mind-blowing emotional epic profound adventurous space time love wormhole humanity survival. Perfect for those who want their mind expanded, feel adventurous, want to explore big questions about life and love, or crave something epic and emotional."
  },
  {
    title: "Forrest Gump",
    year: 1994,
    director: "Robert Zemeckis",
    genres: ["Drama", "Romance", "Comedy"],
    runtime: "2h 22m",
    mood_tags: ["nostalgic", "heartwarming", "emotional", "uplifting", "life-affirming"],
    description: "A kind-hearted man from Alabama witnesses and participates in defining moments of American history. A warm, funny, and deeply moving story about life's unexpected journey.",
    why_watch: "Life is like a box of chocolates — this film reminds you why that's beautiful.",
    embedText: "Forrest Gump 1994. Drama Romance Comedy. Nostalgic heartwarming emotional uplifting life-affirming history kindness love friendship. Perfect for feeling nostalgic, wanting something heartwarming, needing a reminder that life is beautiful, or wanting to laugh and cry at the same time."
  },
  {
    title: "Inception",
    year: 2010,
    director: "Christopher Nolan",
    genres: ["Sci-Fi", "Action", "Thriller"],
    runtime: "2h 28m",
    mood_tags: ["mind-bending", "thrilling", "complex", "intense", "imaginative"],
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea. A layered puzzle-box thriller that rewards every rewatch.",
    why_watch: "You will not stop thinking about it for days.",
    embedText: "Inception 2010. Sci-Fi Action Thriller. Mind-bending thrilling complex intense imaginative dreams heist puzzle layers reality. Perfect when you want your mind blown, love complex stories, are in an imaginative or curious mood, or want something that keeps you guessing until the last second."
  },
  {
    title: "The Matrix",
    year: 1999,
    director: "The Wachowskis",
    genres: ["Sci-Fi", "Action"],
    runtime: "2h 16m",
    mood_tags: ["mind-bending", "thrilling", "cool", "action-packed", "philosophical"],
    description: "A programmer discovers reality is a simulation and joins a rebellion against the machines that created it. A revolutionary sci-fi action film that changed cinema forever.",
    why_watch: "The coolest film ever made.",
    embedText: "The Matrix 1999. Sci-Fi Action. Mind-bending thrilling cool action-packed philosophical reality simulation rebellion chosen one kung fu. Perfect for an action-packed night, wanting something philosophical, feeling like you need to see the world differently, or just wanting to watch something undeniably cool."
  },
  {
    title: "Good Will Hunting",
    year: 1997,
    director: "Gus Van Sant",
    genres: ["Drama"],
    runtime: "2h 6m",
    mood_tags: ["emotional", "inspiring", "heartfelt", "profound", "character-driven"],
    description: "A mathematical genius working as a janitor at MIT resists his own potential until a therapist helps him confront his past. A raw, beautiful film about self-worth and human connection.",
    why_watch: "Will make you want to call someone you love.",
    embedText: "Good Will Hunting 1997. Drama. Emotional inspiring heartfelt profound character-driven genius self-worth trauma healing friendship therapy. Perfect for an emotional night, needing inspiration, wanting a character-driven story, feeling introspective, or craving something that touches the heart deeply."
  },
  {
    title: "La La Land",
    year: 2016,
    director: "Damien Chazelle",
    genres: ["Romance", "Musical", "Drama"],
    runtime: "2h 8m",
    mood_tags: ["dreamy", "romantic", "bittersweet", "nostalgic", "beautiful"],
    description: "A jazz musician and an aspiring actress fall in love in Los Angeles while chasing their dreams. A gorgeous, bittersweet musical about love, ambition, and the roads not taken.",
    why_watch: "The most beautiful heartbreak you'll ever experience.",
    embedText: "La La Land 2016. Romance Musical Drama. Dreamy romantic bittersweet nostalgic beautiful jazz love dreams ambition Los Angeles. Perfect for a romantic mood, wanting something visually stunning and musical, feeling nostalgic or dreamy, or when you want to cry beautifully over love and lost dreams."
  },
  {
    title: "Parasite",
    year: 2019,
    director: "Bong Joon-ho",
    genres: ["Thriller", "Drama", "Dark Comedy"],
    runtime: "2h 12m",
    mood_tags: ["thrilling", "dark", "suspenseful", "shocking", "clever"],
    description: "A poor family schemes their way into working for a wealthy household — with devastating consequences. A genre-defying masterpiece about class, greed, and desperation.",
    why_watch: "You will genuinely not see any of it coming.",
    embedText: "Parasite 2019. Thriller Drama Dark Comedy. Thrilling dark suspenseful shocking clever class inequality greed social commentary twist. Perfect when you want to be completely surprised, love clever plotting, are in the mood for something dark and smart, or want a film that makes you think about society."
  },
  {
    title: "Get Out",
    year: 2017,
    director: "Jordan Peele",
    genres: ["Horror", "Thriller"],
    runtime: "1h 44m",
    mood_tags: ["scary", "tense", "suspenseful", "thought-provoking", "shocking"],
    description: "A young Black man visiting his white girlfriend's family uncovers something horrifying. A masterful horror film that doubles as a sharp social commentary.",
    why_watch: "Scary, smart, and unforgettable.",
    embedText: "Get Out 2017. Horror Thriller. Scary tense suspenseful thought-provoking shocking social commentary racism horror terror dread. Perfect for a scary night, wanting something that makes you jump and think, craving psychological horror with substance, or wanting a film that stays with you long after."
  },
  {
    title: "Amélie",
    year: 2001,
    director: "Jean-Pierre Jeunet",
    genres: ["Romance", "Comedy", "Fantasy"],
    runtime: "2h 2m",
    mood_tags: ["whimsical", "feel-good", "romantic", "quirky", "charming"],
    description: "A shy Parisian waitress devotes herself to improving others' lives through whimsical interventions while neglecting her own happiness. Pure cinematic magic.",
    why_watch: "Makes Paris look even more magical and life feel worth living.",
    embedText: "Amélie 2001. Romance Comedy Fantasy. Whimsical feel-good romantic quirky charming Paris love kindness imagination fantasy. Perfect for a happy or whimsical mood, wanting to feel joy and warmth, a romantic evening, or when life feels mundane and you need some magic."
  },
  {
    title: "About Time",
    year: 2013,
    director: "Richard Curtis",
    genres: ["Romance", "Drama", "Fantasy"],
    runtime: "2h 3m",
    mood_tags: ["heartwarming", "life-affirming", "romantic", "emotional", "uplifting"],
    description: "A man discovers he can travel in time and uses this gift to find love — only to learn the real secret to happiness. The most quietly beautiful film about appreciating life.",
    why_watch: "Will make you want to live every day more fully.",
    embedText: "About Time 2013. Romance Drama Fantasy. Heartwarming life-affirming romantic emotional uplifting time travel love family appreciation. Perfect for wanting to feel good about life, a romantic mood, craving something that makes you appreciate the present, or when you need a warm emotional hug from a film."
  },
  {
    title: "The Grand Budapest Hotel",
    year: 2014,
    director: "Wes Anderson",
    genres: ["Comedy", "Adventure", "Mystery"],
    runtime: "1h 39m",
    mood_tags: ["quirky", "fun", "stylish", "witty", "adventurous"],
    description: "A legendary concierge and his protégé become embroiled in a murder mystery across a fictional European republic. Wes Anderson at his most delightful.",
    why_watch: "The most stylish film ever made — every frame is a painting.",
    embedText: "The Grand Budapest Hotel 2014. Comedy Adventure Mystery. Quirky fun stylish witty adventurous murder mystery Europe concierge heist. Perfect when you want something funny and unique, are in a playful mood, love stylish filmmaking, or want a light adventure with sharp wit."
  },
  {
    title: "Mad Max: Fury Road",
    year: 2015,
    director: "George Miller",
    genres: ["Action", "Sci-Fi"],
    runtime: "2h",
    mood_tags: ["adrenaline", "explosive", "intense", "epic", "exhilarating"],
    description: "In a post-apocalyptic wasteland, a woman rebel and a drifter team up to flee a tyrannical ruler. Two hours of non-stop, breathtaking action filmmaking.",
    why_watch: "The greatest action film of the 21st century.",
    embedText: "Mad Max Fury Road 2015. Action Sci-Fi. Adrenaline explosive intense epic exhilarating post-apocalyptic car chase survival rebellion non-stop action. Perfect for maximum adrenaline, an excited or restless mood, wanting pure spectacle and excitement, or when you just want to be blown away by incredible action."
  },
  {
    title: "John Wick",
    year: 2014,
    director: "Chad Stahelski",
    genres: ["Action", "Thriller"],
    runtime: "1h 41m",
    mood_tags: ["adrenaline", "cool", "stylish", "intense", "action-packed"],
    description: "A retired hitman seeks vengeance after criminals kill his dog and steal his car. Slickly choreographed action with a surprising emotional core.",
    why_watch: "The most stylish, satisfying action film in years.",
    embedText: "John Wick 2014. Action Thriller. Adrenaline cool stylish intense action-packed assassin revenge vengeance choreography. Perfect for pure action enjoyment, a hyped-up or intense mood, wanting stylish filmmaking with incredible fight sequences, or just wanting to watch someone very competent do their job."
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    director: "Peter Ramsey, Rodney Rothman, Bob Persichetti",
    genres: ["Animation", "Action", "Sci-Fi"],
    runtime: "1h 57m",
    mood_tags: ["fun", "inspiring", "exciting", "uplifting", "energetic"],
    description: "A Brooklyn teen discovers he's not the only Spider-Man and must step up to save the multiverse. Visually revolutionary and emotionally powerful — the best superhero film made.",
    why_watch: "Will make you feel like anyone can wear the mask.",
    embedText: "Spider-Man Into the Spider-Verse 2018. Animation Action Sci-Fi. Fun inspiring exciting uplifting energetic teenager superhero multiverse animation. Perfect for feeling inspired, wanting high energy fun, a family-friendly but genuinely great film, or when you need a reminder that anyone can be a hero."
  },
  {
    title: "Soul",
    year: 2020,
    director: "Pete Docter",
    genres: ["Animation", "Drama", "Comedy"],
    runtime: "1h 40m",
    mood_tags: ["profound", "emotional", "life-affirming", "thoughtful", "beautiful"],
    description: "A jazz musician on the cusp of his dream gig gets lost between life and death. Pixar's most philosophical film — a meditation on what makes life worth living.",
    why_watch: "Will completely change how you think about your life.",
    embedText: "Soul 2020. Animation Drama Comedy. Profound emotional life-affirming thoughtful beautiful jazz music meaning purpose existence what makes life worth living. Perfect for a reflective mood, feeling lost or unmotivated, wanting something that makes you think about life's meaning, or craving deep emotional beauty."
  },
  {
    title: "Your Name",
    year: 2016,
    director: "Makoto Shinkai",
    genres: ["Animation", "Romance", "Fantasy"],
    runtime: "1h 52m",
    mood_tags: ["emotional", "romantic", "beautiful", "bittersweet", "dreamy"],
    description: "Two teenagers from different parts of Japan mysteriously begin swapping bodies, and gradually fall in love. Achingly beautiful animation with a story that will break and heal your heart.",
    why_watch: "The most beautiful love story you've never experienced before.",
    embedText: "Your Name 2016. Animation Romance Fantasy. Emotional romantic beautiful bittersweet dreamy body-swapping love story Japan animation yearning connection. Perfect for a romantic or dreamy mood, wanting something emotionally beautiful, anime fans and newcomers alike, or when you want to cry beautiful tears over love."
  },
  {
    title: "Eternal Sunshine of the Spotless Mind",
    year: 2004,
    director: "Michel Gondry",
    genres: ["Romance", "Sci-Fi", "Drama"],
    runtime: "1h 48m",
    mood_tags: ["melancholic", "romantic", "thought-provoking", "bittersweet", "intimate"],
    description: "After a painful breakup, a couple undergoes a procedure to erase each other from their memories. A heartbreaking, tender exploration of love, loss, and memory.",
    why_watch: "The most honest film about love and heartbreak ever made.",
    embedText: "Eternal Sunshine of the Spotless Mind 2004. Romance Sci-Fi Drama. Melancholic romantic thought-provoking bittersweet intimate love loss memory heartbreak relationship. Perfect for a melancholic or reflective mood, processing feelings about love or loss, wanting something intimate and emotionally complex, or when you want to feel deeply."
  },
  {
    title: "A Quiet Place",
    year: 2018,
    director: "John Krasinski",
    genres: ["Horror", "Thriller", "Sci-Fi"],
    runtime: "1h 30m",
    mood_tags: ["tense", "scary", "suspenseful", "thrilling", "intense"],
    description: "A family struggles to survive in a post-apocalyptic world inhabited by blind monsters with an acute sense of hearing. Masterfully tense filmmaking with genuine heart.",
    why_watch: "You will hold your breath for 90 minutes.",
    embedText: "A Quiet Place 2018. Horror Thriller Sci-Fi. Tense scary suspenseful thrilling intense silence monsters survival family horror. Perfect for a scary movie night, wanting edge-of-seat tension, craving survival horror with emotional stakes, or when you want a film that makes silence genuinely terrifying."
  },
  {
    title: "The Pursuit of Happyness",
    year: 2006,
    director: "Gabriele Muccino",
    genres: ["Drama", "Biography"],
    runtime: "1h 57m",
    mood_tags: ["inspiring", "emotional", "uplifting", "motivating", "hopeful"],
    description: "Based on the true story of Chris Gardner, a struggling salesman who takes custody of his son and faces homelessness while pursuing a dream career. A deeply moving story of perseverance.",
    why_watch: "Will make you believe anything is possible if you never give up.",
    embedText: "The Pursuit of Happyness 2006. Drama Biography. Inspiring emotional uplifting motivating hopeful perseverance poverty single father dream success struggle. Perfect when you need motivation, feeling down or hopeless, want to be moved by true human determination, or craving an inspiring story about never giving up."
  },
  {
    title: "Superbad",
    year: 2007,
    director: "Greg Mottola",
    genres: ["Comedy"],
    runtime: "1h 53m",
    mood_tags: ["hilarious", "nostalgic", "fun", "energetic", "lighthearted"],
    description: "Two inseparable best friends make one last attempt to be cool before going to different colleges. One of the funniest films ever made, with a surprisingly tender heart.",
    why_watch: "You will laugh until it hurts.",
    embedText: "Superbad 2007. Comedy. Hilarious nostalgic fun energetic lighthearted high school friendship teenagers coming-of-age drinking party. Perfect for pure laughter, a fun night with friends or solo, when you want to feel nostalgic about youth, or when you just need to laugh and not think too hard."
  },
  {
    title: "The Intouchables",
    year: 2011,
    director: "Olivier Nakache, Éric Toledano",
    genres: ["Drama", "Comedy", "Biography"],
    runtime: "1h 52m",
    mood_tags: ["uplifting", "heartwarming", "funny", "life-affirming", "joyful"],
    description: "An unlikely friendship forms between a wealthy quadriplegic and his street-smart caregiver from the projects. One of the most joyful and heartwarming films ever made.",
    why_watch: "Impossible to watch without smiling.",
    embedText: "The Intouchables 2011. Drama Comedy Biography. Uplifting heartwarming funny life-affirming joyful friendship disability class difference unlikely bond France. Perfect for feeling good, wanting something that makes you laugh and cry, needing emotional warmth, or craving an uplifting story about how friendship transcends all differences."
  },
  {
    title: "Arrival",
    year: 2016,
    director: "Denis Villeneuve",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    runtime: "1h 56m",
    mood_tags: ["mind-bending", "emotional", "profound", "quiet", "thought-provoking"],
    description: "A linguist is recruited to communicate with extraterrestrial visitors and discovers something profound about time, language, and love. Quietly devastating sci-fi.",
    why_watch: "The film that will rewire how you think about time.",
    embedText: "Arrival 2016. Sci-Fi Drama Mystery. Mind-bending emotional profound quiet thought-provoking aliens language time love grief. Perfect for a quiet thoughtful mood, wanting something intellectually and emotionally powerful, loving slow-burn sci-fi with real depth, or when you want to be genuinely moved and surprised."
  },
  {
    title: "Everything Everywhere All at Once",
    year: 2022,
    director: "Daniel Kwan, Daniel Scheinert",
    genres: ["Sci-Fi", "Comedy", "Action", "Drama"],
    runtime: "2h 19m",
    mood_tags: ["wild", "emotional", "mind-bending", "joyful", "chaotic"],
    description: "A middle-aged Chinese-American laundromat owner must connect with parallel universe versions of herself to save existence. The most bonkers, heartfelt, and human film in recent memory.",
    why_watch: "Will make you cry over googly eyes and love everything.",
    embedText: "Everything Everywhere All at Once 2022. Sci-Fi Comedy Action Drama. Wild emotional mind-bending joyful chaotic multiverse family love motherhood absurd funny tears. Perfect when you want something truly unlike anything else, a mix of laughing and crying, feel chaotic or overwhelmed, or want a film that celebrates existence itself."
  }
];

module.exports = movies;
