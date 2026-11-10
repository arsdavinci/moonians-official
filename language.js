'use strict';
(() => {
  const copy = {
    'ムーニアンズ｜月の内側へ、ようこそ。':'Moonians | Welcome to the inner Moon.',
    '本文へ進む':'Skip to content',
    '今日も、地球と交信中。':'Connecting with Earth, every day.',
    'ムーニアンズ ホーム':'Moonians home', 'ムーニアンズ':'Moonians',
    'メインナビゲーション':'Main navigation', 'この世界のこと':'Our world', '仲間たち':'Meet us', '街のおたより':'Moon letters', '活動の記録':'Our story', 'SNSで会おう':'Connect',
    '月の内部都市へようこそ':'Welcome to the city inside the Moon',
    'ムーニアンズが暮らす月の内部都市。パステルの建物とうさぎのロボットが並び、星とネオンが光る街':'The Moonians’ city inside the Moon, with pastel buildings, rabbit robots, stars and glowing neon.',
    '月の内側へ、':'Welcome to', 'ようこそ。':'the inner Moon.',
    '月の中には、こんな街がある。':'There’s a whole city inside the Moon.',
    'らんぴょんとぴょんぴーが暮らす、':'Come into Ranpyon and Pyonpy’s world,', 'かわいい未来へ。':'where the future is a little cuter.',
    '街の探索をはじめる':'Explore the city', 'BGMプレーヤー':'Theme music player',
    '地球のみんな、':'Hello, people of Earth.', '会いたかったで！':'We’ve missed you!',
    'ぼくらはムーニアンズ':'We Are Moonians', 'ぼくらはム〜ニアンズ':'We Are Moonians',
    '音楽はまだ再生していません。':'Music is not playing yet.', '音楽を再生する':'Play music', '再生':'Play', '音楽を停止する':'Stop music', '停止':'Stop',
    '音楽を一時停止する':'Pause music', '一時停止':'Pause', '曲の再生位置':'Playback position', 'ミュートする':'Mute', 'ミュートを解除する':'Unmute', '音量':'Volume',
    '音楽と、月の街を。 / LOOP':'EXPLORE WITH MUSIC / LOOP', '配信で聴く ↗':'Stream the song ↗',
    '音楽の操作':'Music controls', '音楽の操作を閉じる':'Close music controls', '音楽プレーヤーを開く':'Open music player', '再生中の音楽プレーヤーを開く':'Open music player — playing', '音楽':'Music',
    '音楽を流してもいい？':'Shall we play some music?', 'テーマソング「ぼくらはムーニアンズ」を':'Enjoy our theme song, “We Are Moonians”,', '聴きながら、月の街を楽しもう。':'while you explore our city on the Moon.',
    'はい、音楽と楽しむ':'Yes, play the music', 'いいえ、音楽なしで':'No, explore without music', '後からプレーヤーで再生・停止・音量を変更できます。':'You can play, stop or adjust the volume later.',
    '再生中 — 音楽と、月の街を。':'Playing — explore the Moon with music.', '停止中 — 再生ボタンで、いつでも。':'Stopped — press Play whenever you like.', '一時停止中 — 続きから再生できます。':'Paused — pick up where you left off.', '音楽を読み込んでいます…':'Loading the music…', '再生ボタンを押すと音楽が始まります。':'Press Play to start the music.', '音楽を読み込めませんでした。再生ボタンでもう一度お試しください。':'The music couldn’t load. Press Play to try again.',
    '月の内部都市':'Inner Moon City', '眺める風景を選ぶ':'Choose a view', '歌舞月町':'Kabukitsukicho', '月のスタジオ':'Lunar Studio', 'この世界のことへ進む':'Discover our world',
    '地球を愛で満たそう':'Fill the Earth with love', '地球を愛で満たそう。':'Fill the Earth with love.',
    'ここは、':'Step into', 'ムーニアンズの世界。':'the Moonians’ world.', 'ムーニアンズの住む、月の内部のパステル色の都市':'The pastel city inside the Moon, home to the Moonians', '☾ 月の内部都市 / INNER MOON CITY':'☾ HOME INSIDE THE MOON',
    '月生まれ、月育ち。':'Born and raised on the Moon.', '月の内側には、':'Inside the Moon,', 'こんな暮らしがある。':'a whole life awaits.',
    'パステルの建物、きらめくネオン。':'Pastel buildings. Shimmering neon.', 'ここは、月の内部に広がる都市。':'A city hidden inside the Moon.', 'らんぴょんとぴょんぴーが暮らす世界です。':'This is the world Ranpyon and Pyonpy call home.',
    '「ムーニアン＝月人」たち、ムーニアンズ。':'We’re Moonians — people of the Moon.', '三日月大使館で出会った二人が、':'We met at the Crescent Embassy,', '笑いと愛で、月と地球をつなぎます。':'and connect the Moon and Earth through laughter and love.',
    '三日月大使館のシンボル':'The Crescent Embassy emblem', '二人の出会いの場所、三日月大使館。':'The Crescent Embassy is where we first met.', '月と地球をつなぐ物語は、ここから。':'Our story between the Moon and Earth begins here.', 'かわいい未来で、きみを待ってる。':'We’re waiting for you in a cuter future.',
    'サイバー系 × 宇宙漫才':'Cyber style × cosmic comedy', 'ファンの名前は「ムーニー」':'Our fans are called “Moonies”', 'ムーニアン語、ときどき地球語。':'Moonian, with a little Earth language.',
    'この街の、':'Meet your', '仲間たち。':'Moon friends.', 'はじめまして。':'It’s lovely to meet you.', 'きみのことも、教えてな。':'Tell us a little about yourself, too.',
    'シルバーの衣装と、うさぎ耳の帽子を着けたらんぴょん':'Ranpyon in a silver outfit and rabbit-eared hat', 'ツッコミ担当':'The straight man', 'らんぴょん':'Ranpyon',
    '地球人とムーニアンのハーフ。':'Half Earthling, half Moonian.', '自分の「好き」を形にする、クリエイターなツッコミ担当。':'A creator who brings his passions to life — and keeps the comedy on track.', '7月21日':'July 21', '造形・3DCG・映像・デザイン':'Sculpture, 3D CG, video & design', 'らんぴょんをもっと知る':'More about Ranpyon',
    '好きなこと・得意なこと':'Passions & skills', 'コスプレ':'Cosplay', '造形':'Sculpture', '映像クリエイト':'Video creation', '絵':'Drawing', 'デザイン':'Design', '英会話':'English conversation', 'こんな人':'Personality',
    '完璧主義者で、スーパーポジティブ。ちょっと変わり者で、超幸運人間。頑固で、負けず嫌いな一面も。':'A perfectionist, an optimist and a bit of an eccentric. Incredibly lucky, sometimes stubborn, and always competitive.', 'お笑いの原点':'Where the laughter began',
    '憧れの芸人は、もう中学生さん。もう中学生さんのネタにインスパイアされて、自分でもネタを作るように。':'His comedy hero is Mou Chugakusei, whose work inspired him to start writing his own comedy.', '「もう中学生さんと一緒に仕事がしたい」という思いが、NSCに入学したきっかけです。':'The dream of working with Mou Chugakusei was what brought him to NSC comedy school.',
    '地球でのプロフィール':'Life on Earth', '吉本興業所属・東京NSC27期。阿波弁と関西弁を交えた言葉で、地球のみんなと交流しています。':'Represented by Yoshimoto Kogyo; Tokyo NSC class 27. He connects with Earthlings through a lively mix of Awa and Kansai dialects.', '吉本公式プロフィール ↗':'Official Yoshimoto profile ↗',
    '未来の街で笑顔を見せるぴょんぴー':'Pyonpy smiling in a futuristic city', 'ボケ担当':'The comic', 'ぴょんぴー':'Pyonpy', '超ポジティブで、みんなの兄貴分。':'An endless optimist and everyone’s big brother.', '月と地球を笑いでつなぐ、もふもふのボケ担当。':'Our fluffy comic connects the Moon and Earth through laughter.', '4月22日':'April 22', 'シルバーバレー / Silver Valley':'Silver Valley, the Moon', '東京・新宿':'Shinjuku, Tokyo', 'ムーニアンズで地球のM-1を獲る！':'Win Earth’s M-1 Grand Prix as Moonians!', 'ぴょんぴーをもっと知る':'More about Pyonpy',
    '月から、地球へ':'From the Moon to Earth', '月面都市「シルバーバレー」（Silver Valley）出身。現在は東京・新宿を拠点に、相方のらんぴょんとムーニアンズとして芸人活動中。':'Born in the lunar city of Silver Valley. Now based in Shinjuku, Tokyo, performing comedy as Moonians alongside his partner Ranpyon.',
    '好きなもの・趣味':'Favorite things & hobbies', '地球のお笑いとギャグ集めが大好き。ギャンブルも趣味で、麻雀・パチンコ・スロット・競馬を楽しみます。好きな馬は、パンサラッサ。':'Loves Earth comedy and collecting jokes. His hobbies also include mahjong, pachinko, slots and horse racing. His favorite racehorse is Panthalassa.',
    '好きな食べもの・飲みもの':'Favorite food & drinks', '月見バーガー':'Tsukimi burgers', '餃子':'Gyoza', 'ハイボール':'Highballs', '得意なこと':'Special talents', 'モノマネ':'Impressions', '即興コント':'Improv sketches', '大喜利':'Comedy wordplay', '性格':'Personality',
    'ムーニアンズで、いつか地球のM-1を獲ること！':'Someday, win Earth’s M-1 Grand Prix as Moonians!', 'そして、月と地球を笑いでつなぐこと。':'And bring the Moon and Earth together through laughter.', 'ぴょんぴーに聞いてみた':'Ask Pyonpy', 'なんで地球に来たの？':'Why did you come to Earth?',
    '「地球には面白いヤツがぎょうさんおるって聞いてな！相方のらんぴょんとお笑いで勝負しに来てん！」':'“I heard Earth was full of funny people! Ranpyon and I came to give them a run for their money!”',
    '月と地球で一番違うと思ったことは？':'What’s the biggest difference between the Moon and Earth?', '「ツッコミの速さやな！月はのんびりやから地球のスピード感に毎回ビックリやで！」':'“The speed of the comebacks! Life on the Moon is so relaxed, Earth’s pace surprises me every time!”', '新宿でどこが好き？':'Where do you like to go in Shinjuku?', '「歌舞伎町！ネオンと人の多さ、ちょっと月のナイトシティ思い出すねん」':'“Kabukicho! All that neon and all those people remind me of our night city on the Moon.”', '好きな・憧れの芸人さんは？':'Who’s your comedy hero?', 'もう中学生さん。':'Mou Chugakusei.',
    '月との交信':'Connecting with the Moon', 'フルネームは、クリサリアス・ピョン・ピ。三日月大使館では、らんぴょんの先輩。ムーニアン語は、翻訳酸素カプセルと人工知能「ヤナビス」を通して地球の言葉へ。':'His full name is Chrysalis Pyon Pi. He is Ranpyon’s senior at the Crescent Embassy. His Moonian speech reaches Earthlings through a translation oxygen capsule and the AI “Yanabis”.', 'Instagramで会う ↗':'Meet Pyonpy on Instagram ↗', '☾ 月でのプロフィールと、地球での活動。それぞれの物語を楽しんでね。':'☾ Our lunar characters and our lives on Earth — enjoy both sides of the story.',
    '街からの、':'Letters from', 'おたより。':'our little city.', '最新の投稿はSNSへ ↗':'Latest updates on social ↗', 'ネオンの街で一緒に過ごすらんぴょんとぴょんぴー':'Ranpyon and Pyonpy together in a neon-lit city', '二人の日常':'Our everyday moments', '地球で見つけた、':'Little treasures', 'とっておきの瞬間。':'found on Earth.', '街の光も、二人の笑顔も。':'City lights and shared smiles.', 'ムーニアンズのフォトアルバムへ。':'Take a peek at the Moonians photo album.', '歌舞月町の街に立つぴょんぴーとらんぴょん':'Pyonpy and Ranpyon in Kabukitsukicho', '動画で会おう':'Watch our videos', 'ムーニアンズTV':'Moonians TV', '二人の世界を、もっと近くで。':'Get a little closer to our world.', 'YouTubeチャンネルはこちら。':'Find us on YouTube.', 'テーマソング':'Our theme song', 'by ぴょんぴー':'by Pyonpy', '音楽でも、地球とつながろう。':'Music brings us closer to Earth.', '配信サービスでテーマ曲を聴く。':'Listen to our theme song on streaming services.',
    '月と地球の、':'Memories of', 'アルバム。':'the Moon and Earth.', '写真をタップして、のぞいてみて。':'Tap a photo and take a closer look.', 'ムーニアンズが暮らす月の内部都市。パステルの光が満ちる、二人のふるさと。':'The city inside the Moon. A home filled with pastel light, where the Moonians live.', 'ムーニアンズが暮らす月の内部都市の全景':'A panorama of the Moonians’ city inside the Moon',
    'Xのプロフィールを開く：@ranpyon_moonian':'Open X profile: @ranpyon_moonian', 'Xの先頭の固定投稿：拡張現実とお笑いを組み合わせたARライブのサムネイル':'The first pinned X post: an AR comedy live show thumbnail', 'Instagramのプロフィールを開く：@pyonpy_moonians':'Open Instagram profile: @pyonpy_moonians', 'Instagramの先頭の投稿：スマートフォンを持つぴょんぴー':'The first Instagram post: Pyonpy holding a smartphone', 'TikTokのプロフィールを開く：@moonians0422':'Open TikTok profile: @moonians0422', 'TikTokの先頭の固定動画：五条先生に好きな芸人を聞くムーニアンズのサムネイル':'The first pinned TikTok video: Moonians asking Gojo about his favorite comedian',
    '地球での、':'Our adventures', '活動の記録。':'here on Earth.', '笑って、出会って、また一歩。':'New laughs, new friends, one step at a time.', '二人の足あとをたどろう。':'Follow our journey.', 'テレビ、ライブ、配信。':'TV, live shows and streams.', '地球で重ねてきた、':'The Moonians story,', 'ムーニアンズの物語。':'one day on Earth at a time.', '公式プロフィール ↗':'Official profile ↗',
    '京都国際映画祭 × イオンモール':'Kyoto International Film Festival × AEON MALL', 'スペシャルお笑いライブ':'Special comedy live show', 'イオンモールKYOTOで、らんぴょんがトークコーナーのMCとして出演。ニューヨーク、コロコロチキチキペッパーズと共演。':'Ranpyon hosted a talk segment at AEON MALL KYOTO, appearing alongside New York and Korokoro Chikichiki Peppers.', 'FANYの公演レポート ↗':'FANY event report ↗', 'NSC大ライブTOKYO2022 決勝進出':'NSC Big Live TOKYO 2022 finalist', 'らんぴょん名義で、予選2部のお客さま票枠から決勝へ。会場は銀座ブロッサム。':'Performing as Ranpyon, he reached the final through the audience vote in preliminary group 2 at Ginza Blossom.', 'FANYの大会レポート ↗':'FANY competition report ↗',
    'これまでのテレビ・ライブ・配信の記録':'Earlier TV, live shows & streams', '参考記事に記録された、結成からの歩み。':'Early milestones documented in reference articles.', '「クセすごGP」出演との記録':'Reported appearance on “Kusesugo GP”', '「わずかなじかん」／新宿ブリーカー':'“Wazuka na Jikan” / Shinjuku Breaker', 'ことわざネタを披露':'Performed a sketch about proverbs', '吉本SHOWROOM道 配信ライブ第3回ファンルーム編 優勝との記録':'Reported winner of Yoshimoto SHOWROOM-do live stream, Fan Room edition #3', '「SHOWROOM道」／渋谷SHOWROOMスタジオ':'“SHOWROOM-do” / Shibuya SHOWROOM Studio', 'NSC東京卒業':'Graduated from NSC Tokyo', '「お披露目会」／ルミネtheよしもと':'Debut showcase / Lumine the Yoshimoto', '翻訳機ネタを披露':'Performed a translator-themed sketch', 'TBS「バナナサンド」出演との記録':'Reported appearance on TBS “Banana Sand”', 'ムーニアンズ結成':'Moonians formed', '参考記事を見る ↗':'Read the reference article ↗', 'この欄は参考記事に基づく記録です。テレビの詳細な放送日・正式番組名などは、番組や主催者の発表で確認できた情報から補足します。':'This archive is based on reference articles. Exact broadcast dates and official program names will be added when confirmed by broadcasters or organizers.',
    '次は、どこで':'Where shall we', '会おう？':'meet next?', '動画で笑ったり、日常をのぞいたり。':'Share a laugh. Drop into our everyday life.', 'きみの好きな場所で、ムーニアンズとつながろう。':'Connect with Moonians wherever you feel at home.', 'らんぴょん / 投稿を読む':'Ranpyon / Updates & thoughts', 'ぴょんぴー / 写真と日常':'Pyonpy / Photos & daily life', 'ムーニアンズTV / 動画を観る':'Moonians TV / Watch videos', 'ムーニアンズ / ショート動画':'Moonians / Short videos', '公式SNSをまとめてチェック':'All our official social links', '二人の配信ルームへ':'Join our live stream', 'グッズと音楽':'Merch & music', '♧ 月灯ふんわり亭のグッズ ↗':'♧ Tsukiakari Funwari-tei merch ↗', '♫ テーマソングを聴く ↗':'♫ Listen to our theme song ↗', '地球人のみなさん、':'To all our friends on Earth,', 'これからも、よろしゅうな。':'let’s keep laughing together.', 'ページの先頭へ':'Back to the top', 'ページの先頭へ戻る':'Return to the top', 'プロフィール・活動記録の参考資料':'Profile & activity sources',
    'フォトアルバム':'Photo album', '写真を閉じる':'Close photo', '閉じる ×':'Close ×', '前の写真':'Previous photo', '次の写真':'Next photo',
    '街を楽しむメニュー':'Explore the city', '街のガイド':'City guide', '夜の街に切り替える':'Switch to night', '昼の街に切り替える':'Switch to day', '夜の街へ':'Night mode', '昼の街へ':'Day mode', '画面の動きを抑える':'Reduce motion', '画面の動きを再開する':'Enable motion', '動きを抑える':'Less motion', '動きを楽しむ':'More motion', 'パスポート':'Passport',
    '月の内側に広がる街へ':'Visit the city inside the Moon', 'らんぴょんとぴょんぴーに会う':'Meet Ranpyon and Pyonpy', '写真・動画・テーマソング':'Photos, videos and our theme song', 'アルバム':'Photo album', '二人の日常を大きな写真で':'Our everyday life in pictures', '地球での出演と活動の足あと':'Appearances and adventures on Earth', 'いつもの場所で、つながろう':'Find us on your favorite platform',
    'ガイドを閉じる':'Close city guide', 'どこへ、行こう？':'Where shall we go?', '街の行き先を検索':'Search the city', 'キャラクター、写真、SNS…':'Characters, photos, social…', 'その行き先は、まだ見つからないみたい。別の言葉で探してみてね。':'We couldn’t find that destination. Try another word.', 'Tabで行き先を選択 / Enterで移動 / Escで閉じる':'Tab to choose / Enter to go / Esc to close',
    'パスポートを閉じる':'Close passport', 'きみも、ムーニー。':'You’re a Moonie, too.', '街の6つの場所をめぐって、':'Visit six places around the city', 'きみだけの思い出を集めよう。':'and collect your own memories.', '記念パスポートを保存':'Save your souvenir passport', 'スタンプは、このブラウザーに保存されます。':'Your stamps are saved in this browser.', '訪問済み':'Visited', '未訪問':'Not visited', '街めぐり、完了！またいつでも遊びに来てな。':'City tour complete! Come back anytime.', '次の思い出を見つけに行こう。':'Let’s find your next memory.', '6つの思い出がそろった！パスポートをのぞいてみて。':'All six memories collected! Take a look at your passport.', 'スタンプを受け取ったよ。':'Stamp collected.', '月の内側で出会った、きみだけの思い出。':'Your own memories from inside the Moon.', '風景を読み込めなかったみたい。もう一度選んでみてね。':'That view couldn’t load. Please try again.',
    'ムーニアンズが暮らす月の内部都市。パステルの建物とうさぎのロボットが並ぶ街':'The Moonians’ city inside the Moon, with pastel buildings and rabbit robots', '歌舞月町。ピンクとミントのネオンがきらめく街':'Kabukitsukicho, a city glowing with pink and mint neon', '月面を見渡す窓とホログラムの端末がある月のスタジオ':'A lunar studio with a window over the Moon and holographic terminals',
    'らんぴょんに話しかける':'Talk to Ranpyon', 'ぴょんぴーに話しかける':'Talk to Pyonpy', 'もうひとこと、聞いてみる':'Hear another message',
    'よう来てくれたな！月の内側の街、ゆっくり見ていってな。':'So glad you’re here! Take your time exploring our city inside the Moon.', 'ぴょんぴーがボケたら、ツッコむのが僕の仕事やで。':'When Pyonpy says something silly, it’s my job to bring him back down to Earth!', '月と地球の架け橋に。きみとも、友達になれたらええな。':'A bridge between the Moon and Earth. I’d love to be your friend, too.', 'もう中学生さんと一緒に仕事がしたくて、NSCに入ったんや。':'I joined NSC because I wanted to work with Mou Chugakusei.',
    '地球には面白いヤツがぎょうさんおるって聞いてな！相方のらんぴょんとお笑いで勝負しに来てん！':'I heard Earth was full of funny people! Ranpyon and I came to give them a run for their money!', 'ツッコミの速さやな！月はのんびりやから地球のスピード感に毎回ビックリやで！':'The speed of the comebacks! Life on the Moon is so relaxed, Earth’s pace surprises me every time!', '歌舞伎町！ネオンと人の多さ、ちょっと月のナイトシティ思い出すねん':'Kabukicho! All that neon and all those people remind me of our night city on the Moon.', '好きな芸人さんは、もう中学生さん。':'My favorite comedian is Mou Chugakusei.', 'ムーニアンズで、いつか地球のM-1を獲ること！月と地球を笑いでつなぐこと。':'Someday, win Earth’s M-1 Grand Prix as Moonians! And connect the Moon and Earth through laughter.',
    'らんぴょんとぴょんぴーのムーニアンズ。月からやってきた二人の世界、プロフィール、出演・活動記録、動画、音楽、SNSが集まる公式ホームページ。':'The official home of Moonians, Ranpyon and Pyonpy. Discover their world inside the Moon, profiles, appearances, videos, music and social links.', 'かわいい未来で、きみを待ってる。ムーニアンズの街へようこそ。':'We’re waiting for you in a cuter future. Welcome to the Moonians’ city.'
  };
  Object.assign(copy, {
    'ムーニアンズTVのタイトルロゴ':'Moonians TV title logo', '地球のふしぎを、二人と一緒に。':'Explore Earth’s curiosities with us.', 'YouTubeチャンネルを開く':'Open our YouTube channel', '動画を再生する：ことわざクイズ':'Play video: a quiz on proverbs', 'あなたは何問正解できる？実在する面白いことわざクイズ！':'How many can you get right? A quiz on real, surprising proverbs!', 'この画面で動画を再生':'Play here', 'YouTubeでこの動画を見る ↗':'Watch this video on YouTube ↗', 'ムーニアンズTVの動画プレーヤー':'Moonians TV video player',
    '参考資料｜ムーニアンズ':'Sources | Moonians', '← ムーニアンズの街へ戻る':'← Back to the Moonians’ city',
    'ムーニアンズの世界観と、地球での活動を紹介するために参照した公開資料です。キャラクターの出身・誕生日などの設定は、所属事務所の芸歴プロフィールと区別して紹介しています。':'These public sources inform our introduction to the Moonians’ world and activities on Earth. Character details, such as lunar origins and birthdays, are presented separately from professional agency profiles.',
    '本人提供のプロフィール・SNS':'Profiles & social links supplied by Moonians',
    'ぴょんぴーの出身地・現在地・趣味・好み・特技・性格・目標・Q&A、らんぴょんの制作分野・人物像・NSC入学のきっかけ、および現在のSNSリンクは、2026年11月10日に本人から提供された情報を反映しています。':'Pyonpy’s origins, current location, interests, favorites, talents, personality, goals and Q&A; Ranpyon’s creative work, personality and reason for joining NSC; and the current social links reflect information supplied directly by Moonians on November 10, 2026.',
    '所属・プロフィール':'Agency & profile', '吉本興業：ムーニアンズ らんぴょん':'Yoshimoto Kogyo: Moonians Ranpyon', '— 所属、東京NSC27期、趣味・特技。':'— Agency, Tokyo NSC class 27, hobbies and talents.',
    '公式の公演・大会レポート':'Official event & competition reports', 'FANY Magazine：NSC大ライブTOKYO2022のレポート':'FANY Magazine: NSC Big Live TOKYO 2022 report', '（2022年3月2日）— らんぴょんの予選2部お客さま票枠からの決勝進出。':'(March 2, 2022) — Ranpyon’s progression to the final through the audience vote in preliminary group 2.', 'FANY Magazine：京都国際映画祭 × イオンモールの公演レポート':'FANY Magazine: Kyoto International Film Festival × AEON MALL event report', '（2022年10月23日）— 2022年10月16日のらんぴょんのMC出演。':'(October 23, 2022) — Ranpyon’s appearance as MC on October 16, 2022.',
    '世界観・初期の活動記録':'Worldbuilding & early activities', 'EverybodyWiki「ムーニアンズ」':'EverybodyWiki: Moonians', 'Enpedia「ムーニアンズ」':'Enpedia: Moonians', '— 結成、世界観設定、誕生日、テレビ・ライブ・配信の初期記録。':'— Formation, worldbuilding, birthdays and early TV, live show and streaming records.', '— 同内容の参照と外部リンクの確認。':'— Cross-reference for the same information and external links.',
    '百科事典の記述は、個々の番組・公演の公式発表による確認が完了していない項目を含みます。これらは活動記録内の「参考記事に記録された、結成からの歩み」にまとめています。年齢のレベルなど、現在の値が確定していない情報は掲載していません。':'The encyclopedia entries include items not yet independently confirmed through official program or event announcements. These appear in the early milestones archive. Details with no confirmed current value, such as age levels, are omitted.',
    '担当は2026年11月10日の本人確認に基づき、らんぴょんがツッコミ、ぴょんぴーがボケとして紹介しています。':'Their roles follow direct confirmation on November 10, 2026: Ranpyon is the straight man (tsukkomi), and Pyonpy is the comic (boke).',
    '百科事典本文の転載ではなく、事実項目と世界観をもとに当サイト向けに紹介文を作成しています。参考元の各記事には、それぞれの執筆者・履歴および利用条件が表示されています。':'The introductions were written for this website using factual details and worldbuilding, rather than reproducing encyclopedia articles. Each source article lists its own authors, revision history and terms of use.',
    'ぴょんぴー「ぼくらはム〜ニアンズ」配信ページ':'Pyonpy: “We Are Moonians” streaming page', '— テーマ曲への案内。歌詞は転載していません。':'— Link to the theme song. Lyrics are not reproduced.', '写真・ビジュアル':'Photos & visuals',
    'ムーニアンズ本人から提供されたロゴ、キャラクタービジュアル、写真・世界観画像を使用しています。月の内部都市の画像と「ムーニアンズが暮らす月の内部の都市」という説明は、本人からの提供に基づきます。':'The logos, character visuals, photos and worldbuilding images were supplied by Moonians. The image of the inner lunar city and its description as the Moonians’ home were also supplied directly.', '資料確認日：2026年11月10日':'Sources checked: November 10, 2026'
  });
  function resolveLanguage(saved, languages, requested) {
    if (requested === 'ja' || requested === 'en') return requested;
    if (saved === 'ja' || saved === 'en') return saved;
    return (languages || []).map(value => value.toLowerCase().split('-')[0]).find(value => value === 'ja' || value === 'en') || 'ja';
  }
  let saved;
  try { saved = localStorage.getItem('moonians.language'); } catch { /* Private browsing still works. */ }
  let language = resolveLanguage(saved, navigator.languages || [navigator.language], new URL(location.href).searchParams.get('lang'));
  document.documentElement.lang = language;
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const reverse = new Map(Object.entries(copy).map(([ja,en]) => [en,ja]));
  const t = value => language === 'en' ? copy[value] || value : value;
  window.MoonLanguage = {t, resolveLanguage, get current() { return language; }};
  const trackedAttributes = ['aria-label','alt','placeholder','title','data-caption','content'];
  function localizeText(node) {
    if (!node.parentElement || node.parentElement.closest('script,style,[data-language-switch]')) return;
    const raw = node.nodeValue;
    const text = raw.trim();
    let record = originals.get(node);
    if (!record || (raw !== record.ja && raw !== record.en)) {
      const ja = copy[text] ? text : reverse.get(text);
      if (!ja) return;
      const prefix = raw.slice(0, raw.indexOf(text));
      const suffix = raw.slice(raw.indexOf(text) + text.length);
      // Japanese line breaks need a word boundary when English text reflows.
      const separator = !suffix && node.nextSibling?.nodeType === 1 && node.nextSibling.matches('br,span,small,b,strong') ? ' ' : '';
      record = {ja:prefix + ja + suffix, en:prefix + copy[ja] + suffix + separator};
      originals.set(node, record);
    }
    if (raw !== record[language]) node.nodeValue = record[language];
  }
  function localizeElement(el) {
    if (el.closest('[data-language-switch]')) return;
    let records = attributes.get(el);
    if (!records) { records = {}; attributes.set(el, records); }
    for (const key of trackedAttributes) {
      const value = el.getAttribute(key);
      if (value === null) continue;
      let record = records[key];
      if (!record || (value !== record.ja && value !== record.en)) {
        const ja = copy[value] ? value : reverse.get(value);
        if (!ja) continue;
        record = {ja,en:copy[ja]}; records[key] = record;
      }
      if (value !== record[language]) el.setAttribute(key, record[language]);
    }
  }
  function walk(node) {
    if (node.nodeType === 3) { localizeText(node); return; }
    if (node.nodeType !== 1 || node.matches('script,style,[data-language-switch]')) return;
    localizeElement(node);
    for (const child of node.childNodes) walk(child);
  }
  function updateBrand() {
    document.querySelectorAll('.brand img').forEach(img => {
      img.src = language === 'en' ? 'assets/logo-english.png?v=20261110-12' : 'assets/logo.png?v=20261110-11';
      img.width = language === 'en' ? 1024 : 2421;
      img.height = language === 'en' ? 352 : 833;
    });
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    document.querySelectorAll('[data-language-link]').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('lang', language);
      link.href = url.href;
    });
  }
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(walk);
      else walk(record.target);
    }
    observe();
  });
  function observe() { observer.observe(document.documentElement, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:trackedAttributes}); }
  function setLanguage(next) {
    if (next !== 'ja' && next !== 'en') return;
    language = next;
    document.documentElement.lang = language;
    try { localStorage.setItem('moonians.language', language); } catch { /* Optional preference. */ }
    const url = new URL(location.href); url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
    observer.disconnect();
    walk(document.documentElement);
    updateBrand();
    observe();
    document.dispatchEvent(new CustomEvent('moonians:languagechange'));
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
    walk(document.documentElement);
    updateBrand();
    observe();
  });
})();
