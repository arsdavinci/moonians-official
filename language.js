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
    '音楽の操作':'Music controls', '音楽の操作を開く':'Open music controls', '音楽の操作を閉じる':'Close music controls', '音楽プレーヤーを開く':'Open music player', '再生中の音楽プレーヤーを開く':'Open music player — playing', '音楽':'Music',
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
    'ムーニアンズTV。らんぴょんとぴょんぴー':'Moonians TV — Ranpyon and Pyonpy', 'ホバーで音なしプレビュー':'Hover for a silent preview', '最新動画を音声付きで再生する':'Play the latest video with sound', '再生ボタンで音を出す':'Press Play for sound', 'ムーニアンズTVの最新動画':'The latest from Moonians TV', 'YouTubeで最新動画を見る ↗':'Watch the latest videos on YouTube ↗', '音なしでプレビュー中':'Previewing without sound', 'プレビューを準備中…':'Getting the preview ready…', '動画を読み込めませんでした。YouTubeでご覧ください。':'The video couldn’t load. Please watch on YouTube.', '再生ボタンで動画をご覧ください。':'Press Play to watch the video.',
    '月灯ふんわり亭のグッズショップを開く':'Open the Tsukiakari Funwari-tei merch shop', '月灯ふんわり亭。らんぴょんとぴょんぴーのグッズ販売':'Tsukiakari Funwari-tei — Ranpyon and Pyonpy merchandise',
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
  Object.assign(copy, {
    '3Dアニメ':'3D Anime', '宇宙船コックピット':'Star cockpit', 'セクション':'Sections',
    '窓の外に銀河と惑星が広がる、パステルカラーの宇宙船コックピット':'A pastel spaceship cockpit with a galaxy and planets outside the window.',
    '新月':'New Moon', '三日月':'Waxing Crescent', '上弦の月':'First Quarter', '十三夜月':'Waxing Gibbous', '満月':'Full Moon', '居待月':'Waning Gibbous', '下弦の月':'Last Quarter', '有明月':'Waning Crescent',
    '低重力モード、発動！月の重力は、地球の6分の1やで。':'Low-gravity mode on! The Moon has one sixth of Earth’s gravity.',
    '宇宙船のコックピットでラーメンを食べる、3Dアニメのらんぴょんとぴょんぴー':'Ranpyon and Pyonpy in 3D, eating ramen in their spaceship cockpit.',
    'ムーニアンズ、':'Moonians,', '3Dアニメになる。':'now in 3D anime.', '第1話「宇宙ラーメン」公開中。':'Episode 1, “Space Ramen”, is out now.', 'つづきのお話も、準備中。':'More stories are on the way.',
    'ムーニアンズ 3Dアニメ｜月の内側から、宇宙のお話を。':'Moonians 3D Anime | Space stories from inside the Moon.',
    '街へ戻る':'Back to the city', 'ムーニアンズの':'Moonians', '3Dアニメ劇場。':'3D Anime Theater.',
    'らんぴょんとぴょんぴーが、3Dアニメになりました。':'Ranpyon and Pyonpy are now 3D-animated.', '月と宇宙の、ちいさなお話を少しずつ。':'Little stories from the Moon and beyond, one at a time.',
    '第1話を観る':'Watch episode 1', '公開中のお話':'Now playing', '宇宙ラーメン':'Space Ramen', '第1話':'Episode 1', '公開中':'Now showing', '準備中':'Coming soon',
    '宇宙船のコックピットに流れてきた、あのメロディー。':'A familiar melody drifts into the cockpit.', '窓の外には、宇宙ラーメンの屋台。':'Outside the window: a space ramen stall.', '「やっぱ宇宙ラーメンがいちばんやで！」':'“Nothing beats space ramen!”',
    '約18秒 ／ 音声あり':'About 18 sec / with sound', '第1話「宇宙ラーメン」を再生する':'Play episode 1, “Space Ramen”', '第1話「宇宙ラーメン」':'Episode 1, “Space Ramen”',
    'これからのお話':'Coming up next', '次のお話を、月でつくっています。':'The next stories are being made on the Moon.', '公開したら、ここに並びます。':'They’ll appear here once they’re out.',
    '第2話':'Episode 2', '第3話':'Episode 3', '第4話':'Episode 4', 'タイトル未定':'Title to be announced', '制作中のお話。もう少し待っててな。':'In production. Hang tight a little longer.',
    'キャスト':'Cast', '3Dのふたり':'The duo in 3D', '3Dアニメのらんぴょん。銀色の帽子とうさぎ耳、紫の瞳':'Ranpyon in 3D, with a silver cap, rabbit ears and purple eyes.', '3Dアニメのぴょんぴー。銀色の帽子をかぶった白いうさぎ':'Pyonpy in 3D, a white rabbit in a silver cap.',
    '新しいお話は、YouTubeとSNSでもお知らせします。':'New episodes will also be announced on YouTube and social media.',
    '公開中の':'Now', 'エピソード':'showing', 'これからの':'Coming', 'お話':'soon', '3Dの':'The duo', 'ふたり':'in 3D', 'YouTubeチャンネルを開く ↗':'Open our YouTube channel ↗',
    'らんぴょんとぴょんぴーの3Dアニメ劇場。第1話「宇宙ラーメン」公開中。つづきのお話も準備中です。':'The Ranpyon and Pyonpy 3D anime theater. Episode 1, “Space Ramen”, is out now, with more on the way.',
    'らんぴょんの設定資料を見る':'See Ranpyon’s model sheet', 'ぴょんぴーの設定資料を見る':'See Pyonpy’s model sheet',
    'らんぴょんのキャラクターモデルシート。衣装の三面図と、ディテールの解説。':'Ranpyon’s character model sheet: three views of the outfit, with detail callouts.',
    'ぴょんぴーのキャラクターモデルシート。9つの表情と、三面図。':'Pyonpy’s character model sheet: nine expressions and three views.',
    'らんぴょんのキャラクターモデルシート。ホログラムの衣装を前・横・後ろから見た三面図':'Ranpyon’s character model sheet, showing the holographic outfit from the front, side and back.',
    'ぴょんぴーのキャラクターモデルシート。9つの表情と、側面・正面・背面の三面図':'Pyonpy’s character model sheet, with nine expressions and side, front and back views.',
    'ムーニアンズ らんぴょんのサイン':'Signature of Ranpyon from Moonians',
    '月面のコックピット':'The lunar cockpit', '月面のコックピット。':'the lunar cockpit.',
    '窓の外には、月の大地と星の海。':'Outside the windows: the lunar plains and a sea of stars.', '二人の一日は、ここからはじまる。':'Every day for the two of them starts right here.',
    '今日も、':'Today, too,', '地球と交信中。':'we’re talking to Earth.', 'ホログラムの向こうに、きみの街。':'Beyond the holograms is your city.', '笑いの電波を、月から地球へ。':'Sending laughs from the Moon to Earth.',
    'さあ、':'Now,', '月の内側へ。':'into the inner Moon.', 'この先に、二人が暮らす街がある。':'Just ahead is the city where they live.', 'そのままスクロールして、進んでな。':'Keep scrolling and come on in.',
    '月面のコックピットに座るらんぴょんと、ひざの上のぴょんぴー。まわりにホログラムの画面が浮かんでいる':'Ranpyon seated in the lunar cockpit with Pyonpy on his lap, surrounded by floating holographic screens.',
    '3Dモデルを読み込めなかったみたい。ページを開き直してみてね。':'The 3D model didn’t load. Try opening the page again.',
    '3Dのぴょんぴー。ドラッグで回転できます':'Pyonpy in 3D. Drag to rotate.', '3Dモデルを読み込み中…':'Loading the 3D model…',
    'ぴょんぴー先輩を、':'Take Pyonpy', 'ぐるっと一周。':'for a full spin.', 'ドラッグでくるくる回して、':'Drag to spin him around,', 'ボタンで動かしてみてな。':'and use the buttons to make him move.',
    'ぴょんぴーの動き':'Pyonpy’s moves', 'おしゃべり':'Talk', 'やったー！':'Cheer!', 'ジャンプ':'Jump', 'あるく':'Walk', 'はしる':'Run', 'ツッコミ':'Punchline',
    'からくりぴょんぴー 制作日記｜ムーニアンズ':'Karakuri Pyonpy Build Log | Moonians', 'からくりぴょんぴー 制作日記':'Karakuri Pyonpy build log',
    'ぴょんぴーを、腹話術の人形のように動かしたい。からくりぴょんぴーができるまでの制作日記。':'We want Pyonpy to move like a ventriloquist’s puppet. A build log of Karakuri Pyonpy.',
    'からくりぴょんぴー':'Karakuri Pyonpy', '制作日記。':'Build Log.', '制作日記':'Build log',
    'ぴょんぴーを、腹話術の人形みたいに動かしたい。':'We want Pyonpy to move like a ventriloquist’s puppet.',
    '目も、口も、舌も。手元の仕掛けで動く「からくりぴょんぴー」を、いま作っています。':'Eyes, mouth and tongue, all worked by hand. We’re building “Karakuri Pyonpy” right now.',
    '制作中':'In progress', '3Dプリント ＋ 糸とトリガー':'3D printing + strings and a trigger',
    '3Dプリントで作った、からくりぴょんぴーの顔。紫の目と舌、青い鼻先がついている':'The 3D-printed face of Karakuri Pyonpy, with purple eyes and tongue and a blue muzzle.',
    'できるまでの':'How it’s', 'きろく':'coming together', '新しい記録ほど、上に並びます。':'Newest entries are at the top.',
    'つぎの記録':'Next entry', '直したパーツが組み上がったら、ここに書きます。もう少し待っててな。':'We’ll write here once the revised parts are assembled. Hang tight.',
    '修正メモ':'Revision notes', '直したいところを、書き込んだ。':'Marking up what to fix.',
    '動かしてみて気になったところを、写真に赤ペンでメモ。まぶたの固定と、トリガーのかたさが次の課題です。':'After trying it out, we marked the photos in red. Next up: securing the eyelids and easing the stiff trigger.',
    '顔の写真に、まぶたの固定とトリガーについて赤ペンで書き込んだメモ':'A photo of the face with red notes about securing the eyelids and the trigger.',
    '頭の内側の写真に、固定してほしい場所を赤ペンで書き込んだメモ':'A photo of the inside of the head with red notes on where to secure parts.',
    '頭の内側の写真に、パーツの固定について赤ペンで書き込んだメモ':'A photo of the inside of the head with red notes about fixing the parts in place.',
    '糸を通すパーツの写真に、赤ペンで書き込んだメモ':'A photo of the string guide with red notes.',
    'なかみ':'Inside', '頭の中は、こうなってる。':'What’s inside the head.',
    '白い頭の内側に、目と口を動かすための紫と青のパーツ。糸を引くと、仕掛けが動きます。':'Inside the white head are purple and blue parts that move the eyes and mouth. Pull the string and the mechanism moves.',
    'からくりぴょんぴーの顔。紫の目と舌、青い鼻先':'The face of Karakuri Pyonpy: purple eyes and tongue, blue muzzle.',
    '頭の内側。目の裏のパーツと、持ち手につながる青いトリガー':'Inside the head: the parts behind the eyes and the blue trigger leading to the grip.',
    '頭の内側のアップ。茶色い糸が左右のパーツをつないでいる':'A close-up inside the head, with a brown string linking the left and right parts.',
    '頭の下から出た糸の先に、指をかける白い輪がついている':'A string coming out under the head, ending in a white finger ring.',
    '試作':'Prototype', '顔のからくり、はじめての試作。':'The first prototype of the face mechanism.',
    '3Dプリントした頭に、目と舌のパーツを組み込みました。まずは手で動かして、表情を確認。':'Eye and tongue parts fitted into a 3D-printed head. First, moving it by hand to check the expressions.',
    'からくりぴょんぴーの試作を、手に持って回して見せる動画（音声なし）':'A silent video turning the Karakuri Pyonpy prototype in hand.', '12秒 ／ 音声なし':'12 sec / no sound',
    '写真を大きく表示':'Enlarged photo', 'からくりぴょんぴー、':'Karakuri Pyonpy,', 'ただいま制作中。':'now in the making.',
    '腹話術の人形みたいに動くぴょんぴー。':'A Pyonpy that moves like a ventriloquist’s puppet.', 'できるまでの記録を、少しずつ。':'Follow the build, bit by bit.',
    'からくりぴょんぴーの分解図':'Exploded view of Karakuri Pyonpy', 'からくりぴょんぴーの顔の3Dモデル。スクロールすると部品が組み上がります':'A 3D model of Karakuri Pyonpy’s face. Scroll to assemble the parts.',
    '顔の中身は、':'Inside the face:', '33個のパーツ。':'33 parts.', '設計データを、部品ごとにバラバラにしてみました。':'We pulled the design data apart, part by part.', 'スクロールすると、組み上がっていきます。':'Scroll, and it comes together.',
    '内側の仕掛けから、':'From the inner mechanism,', 'ひとつずつ。':'one piece at a time.', '目を動かすパーツ、口を開けるパーツ。':'Parts that move the eyes, parts that open the mouth.', '最後に、白い頭がかぶさります。':'Last of all, the white head closes over them.',
    'これが、':'This is', 'からくりぴょんぴーの顔。':'the face of Karakuri Pyonpy.', '「中をのぞく」を押すと、':'Press “Look inside”', '組み上がった中の仕掛けが透けて見えます。':'to see the assembled mechanism through the shell.',
    '中をのぞく':'Look inside',
    'ムーニアンズは、':'Moonians: a', 'のコンビ。':'duo.', 'サイバー系':'cyber-style', '宇宙漫才':'space-manzai', '月と地球':'Moon-and-Earth',
    '月と地球の風景':'Scenes from the Moon and Earth', '前の風景':'Previous scene', '次の風景':'Next scene',
    'これまでのお話':'The story so far', '月の内側には、街がある。':'Inside the Moon, there is a city.', '三日月大使館で出会った、':'Ranpyon and Pyonpy', 'らんぴょんとぴょんぴー。':'met at the Crescent Embassy.',
    '笑いと愛で、':'To link the Moon and Earth', '月と地球をつなぐために。':'with laughter and love,', '二人は、地球へやってきた。':'the two of them came to Earth.',
    'つづきができたら、ここに書きます。もう少し待っててな。':'We’ll write here when there’s more to show. Hang tight.',
    'ムーニアンズの、':'Moonians’', '愉快な仲間たち。':'merry friends.',
    'らんぴょんとぴょんぴーは、三日月大使館の大使。':'Ranpyon and Pyonpy are ambassadors of the Crescent Embassy.',
    '月と地球のかけ橋になるために、みんなを笑顔にできる芸人の道を選びました。':'To bridge the Moon and Earth, they chose comedy, the path that makes everyone smile.',
    'そんな二人のまわりには、こんな仲間たちがいます。':'And these are the friends around them.',
    'うさ耳つきのホログラムのキャップとヘッドホンを着けた、ピンクの髪のDJらむね':'DJ Ramune, with pink hair, headphones and a holographic cap with rabbit ears.',
    'らんぴょんの妹':'Ranpyon’s sister', 'DJらむね':'DJ Ramune', 'らんぴょんの妹。月でDJをしています。':'Ranpyon’s younger sister, and a DJ on the Moon.',
    '事務所は、歌とダンスのアイドルとして売り出したい。でも本人が歌いたいのは、かっこいいラップだけ。しぶしぶ踊りながら、地球でのデビューを夢見ています。':'Her agency wants a singing, dancing idol. She only wants to rap cool songs. She dances, reluctantly, and dreams of debuting on Earth.',
    '歌手 / DJ':'Singer / DJ', '月生まれ・月育ち':'Born and raised on the Moon',
    'DJらむねのキャラクターモデルシート。三面図と、6つの表情。':'DJ Ramune’s character model sheet: three views and six expressions.',
    'DJらむねのキャラクターモデルシート。正面・横・後ろの三面図と表情の一覧':'DJ Ramune’s character model sheet, with front, side and back views and a set of expressions.',
    'DJらむねの設定資料を見る':'See DJ Ramune’s model sheet', '設定資料を見る':'See the model sheet',
    'ホログラムのキャップと上着を着た、大きなたれ耳のピンクのうさぎ、ピーティープティ':'PTPUTY, a pink rabbit with big floppy ears in a holographic cap and jacket.',
    'らむねの相方':'Ramune’s partner', 'ピーティープティ':'PTPUTY',
    'ニックネームは「PT」。DJらむねの相方で、親友。好きなのは、ぴょんぴー。身長はおよそ45cm。':'Nickname: PT. DJ Ramune’s partner and best friend. Likes: Pyonpy. About 45 cm tall.',
    'ピーティープティのキャラクターモデルシート。四面図と、ディテール。':'PTPUTY’s character model sheet: four views and details.',
    'ピーティープティのキャラクターモデルシート。正面・斜め・横・後ろの図とディテール':'PTPUTY’s character model sheet, with front, three-quarter, side and back views and details.',
    '星空のようなローブを着て、三日月の飾りをつけ、マイクを持って微笑むザ・ルーヴァ・セレス':'Za-Luva Seles, smiling with a microphone, in a starry robe with a crescent ornament.',
    '二人の上司':'Their boss', 'ザ・ルーヴァ・セレス':'Za-Luva Seles',
    '三日月大使館（クレッセントエンバシー）の偉い人。らんぴょんとぴょんぴーの上司です。胸には三日月、手にはマイク。二人の地球での活動を、おだやかな笑顔で見守っています。':'A senior figure at the Crescent Embassy, and Ranpyon and Pyonpy’s boss. A crescent on the chest, a microphone in hand, watching over their work on Earth with a gentle smile.',
    'ホログラムの長い手足と大きな前歯をもつ、薄紫のぬいぐるみ、もげら':'Mogera, a pale purple plush with long holographic limbs and big front teeth.',
    'なぞの仲間':'Mystery friend', 'もげら':'Mogera',
    'ホログラムの長い手足と、大きな前歯がトレードマーク。いつも両手をあげて、ごきげん。くわしいことは、まだ謎に包まれています。':'Known for long holographic limbs and big front teeth. Always cheerful, arms in the air. The rest is still a mystery.',
    'ミントグリーンの毛並みに、つぎはぎと光るパーツをつけた、舌を出すゾンビバニー':'Zombie Bunny, with mint-green fur, stitches and glowing parts, sticking out its tongue.',
    '名前は調査中':'Name under investigation', 'ゾンビバニー':'Zombie Bunny',
    'ミントグリーンの毛並みに、つぎはぎと舌ぺろ。耳には宇宙人のチャーム、体には光るパーツ。ちょっとこわいけど、どこかにくめないやつ。':'Mint-green fur, stitches and a cheeky tongue. Alien charms on the ears, glowing parts on the body. A little scary, but hard to dislike.',
    'うさ耳のついた丸い頭に、にっこり顔の画面がある小さなロボット、ヤナビス':'Yanabisu, a small robot with rabbit ears and a smiling face on its screen.', '人工知能':'Artificial intelligence', 'ヤナビス':'Yanabisu',
    '月の人工知能。ムーニアン語を地球の言葉に訳してくれる、二人のたよれる通訳です。うさ耳と、にっこり顔の画面がめじるし。':'The Moon’s AI. It turns the Moonian language into Earth’s words, a reliable interpreter for the two. Look for the rabbit ears and the smiling screen.',
    '翻訳酸素カプセルから聞こえる声の主。ぴょんぴーのムーニアン語を、日本語に同時翻訳してくれる人工知能です。':'The voice from the translation oxygen capsule: an AI that interprets Pyonpy’s Moonian into Japanese in real time.',
    '名前の由来':'Where the name comes from',
    '開発者に「You Are Not A Very Intelligent System（あんまり賢くないシステムやな）」と言われたのを、自分の名前だと勘違い。その頭文字が、正式名称「Y.A.N.A.V.I.S」になりました。':'Its developer once snapped, “You Are Not A Very Intelligent System.” It took that for its name, and the initials became the official one: Y.A.N.A.V.I.S.',
    'ヤナビスのキャラクターモデルシート。四面図と、6つの表情。':'Yanabisu’s character model sheet: four views and six expressions.', 'ヤナビスのキャラクターモデルシート。正面・横・後ろ・斜めの図と、6種類の表情':'Yanabisu’s character model sheet, with front, side, back and three-quarter views and six expressions.',
    'ぴょんぴーの大冒険｜ムーニアンズのゲーム':'Pyonpy’s Big Adventure | The Moonians Game',
    'ムーニアンズのアクションゲーム「ぴょんぴーの大冒険 〜ワライスターをとりもどせ〜」。ブラウザで無料で遊べます。6つの星、全35ステージ。':'The Moonians action game “Pyonpy’s Big Adventure: Bring Back the Warai Star”. Free to play in your browser. Six planets, 35 stages.',
    'ぴょんぴーの大冒険':'Pyonpy’s Big Adventure', '〜ワライスターをとりもどせ〜':'Bring Back the Warai Star', 'ぴょんぴーの大冒険のキービジュアル':'Key visual of Pyonpy’s Big Adventure',
    '宇宙じゅうの“笑い”をうばった魔王から、6つのかけらを取りもどせ。':'A Demon Lord has stolen the universe’s laughter. Win back the six shards.',
    'ムーニアンズのアクションゲームが、ブラウザで遊べます。':'The Moonians action game, playable in your browser.',
    'いますぐあそぶ':'Play now', '無料 ／ インストール不要':'Free / nothing to install', 'ゲームの概要':'Game overview',
    '横スクロールアクション':'Side-scrolling action', 'PC ／ iPhone ／ iPad':'PC / iPhone / iPad', '自動セーブ':'Auto-save',
    'ものがたり':'The story', 'ネタ合わせをする、らんぴょんとぴょんぴー':'Ranpyon and Pyonpy rehearsing their act',
    'お笑いコンビ「ムーニアンズ」は、宇宙最大の舞台『銀河お笑いフェス』を3日後にひかえていた。':'The comedy duo Moonians were three days away from the biggest stage in the universe: the Galactic Comedy Fes.',
    'そのとき、夜空がまっくろにそまる。魔王が、宇宙じゅうの“笑い”をうばってしまったのだ。笑いのエネルギー『ワライスター』は6つにくだかれ、6つの星へ。':'Then the night sky turned pitch black. A Demon Lord had stolen all the laughter in the universe. The Warai Star, the energy of laughter, was shattered into six shards and carried off to six planets.',
    'らんぴょんは、ツッコミを思い出せなくなって動けない。なぜか平気だったぴょんぴーが、ヤナビスの案内で宇宙へ飛び出す。':'Ranpyon can’t remember how to deliver a comeback and can’t move. Pyonpy, somehow unaffected, heads out into space with Yanabisu as guide.',
    '「ほな、ちょっと宇宙すくってくるわ！」':'“Right then, I’ll just pop out and save the universe!”',
    '登場':'The', 'キャラクター':'characters', '銀色の帽子をかぶった白いうさぎ、ぴょんぴー':'Pyonpy, a white rabbit in a silver cap', '主人公':'Hero',
    'ムーニアンズのボケ担当。なぜか一人だけ笑いをうばわれなかった。柿ピーを食べれば百人力。光線銃を手に、6つの星をめぐる。':'The funny one of Moonians. Somehow the only one whose laughter wasn’t stolen. A handful of kaki-pea snacks gives him the strength of a hundred. Ray gun in hand, he travels six planets.',
    'ゲームに登場するらんぴょん':'Ranpyon as he appears in the game', '相方':'Partner',
    'ムーニアンズのツッコミ担当。笑いをうばわれて「なんでやねん」が出てこない。かけらがもどるたび、少しずつツッコミを思い出していく。':'The straight man of Moonians. With his laughter stolen, the comeback line won’t come out. Each shard returned brings a little more of it back.',
    'ゲームに登場するヤナビス':'Yanabisu as it appears in the game', '道案内':'Guide',
    '翻訳酸素カプセルの人工知能。翻訳だけでなく、道案内もしてくれる。ぴょんぴーといるうちに、関西弁がうつってきた。':'The AI in the translation oxygen capsule. It translates, and it also shows the way. It has started picking up Pyonpy’s Kansai accent.',
    'ゲームに登場するザ・ルーヴァ・セレス':'Za-Luva Seles as he appears in the game', '司令':'Commander',
    '三日月大使館のボス。緊急指令を出して、ぴょんぴーを送り出す。フェスの楽屋をおさえたまま、帰りを待っている。':'The boss of the Crescent Embassy. He issues the emergency order and sends Pyonpy off, keeping the festival dressing room booked until he returns.',
    '6つの星と、':'Six planets and', 'ボスたち':'their bosses', 'かけらを持ち去った、魔王の手下たち。':'The Demon Lord’s minions who carried off the shards.', '星ごとに、しかけも変わります。':'Every planet has its own tricks.',
    '月あめ平原':'Moon Candy Field', '火星ネオンコロニー':'Mars Neon Colony', 'クリスタル氷星':'Crystal Ice Planet', '星の海':'Star Ocean', 'リングメカ工場':'Ring Mecha Factory', '魔王星':'Demon Star',
    '月あめキング':'Moon Candy King', 'ドーム司令官':'Dome Commander', 'クリスタルイエティ':'Crystal Yeti', 'マンタクイーン':'Manta Queen', 'ロボットキング':'Robot King', '魔王スターオーバーロード':'Star Overlord',
    'ボス：月あめキング':'Boss: Moon Candy King', 'ボス：ドーム司令官':'Boss: Dome Commander', 'ボス：クリスタルイエティ':'Boss: Crystal Yeti', 'ボス：マンタクイーン':'Boss: Manta Queen', 'ボス：ロボットキング':'Boss: Robot King', 'ボス：魔王スターオーバーロード':'Boss: Star Overlord',
    '6つの星がならぶ、ゲームのワールドマップ':'The game’s world map, with its six planets',
    'あそび':'How to', 'かた':'play', 'うごき':'Action', 'キーボード':'Keyboard', 'タッチ ／ パッド':'Touch / pad', '移動':'Move', 'ダッシュ':'Dash', '光線銃':'Ray gun', '装備・合体':'Equip / merge', 'ポーズ':'Pause', '十字キー':'D-pad',
    '敵は上からふむとピヨる。そのすきに光線銃でたおそう。':'Stomp enemies from above to stun them, then finish them with the ray gun.',
    '同じ光線銃を2つ集めると、合体して強くなる。':'Collect two of the same ray gun and they merge into a stronger one.',
    '階段をのぼると「空ルート」。カギを取ると、ゴール前の宝箱が開く。':'Climb the stairs for the sky route. Grab the key to open the chest before the goal.',
    'iPhoneは、Safariで開いて「ホーム画面に追加」するとアプリのように遊べます。':'On iPhone, open it in Safari and choose “Add to Home Screen” to play it like an app.',
    'ゲームをはじめる':'Start the game', 'ゲーム':'Game', 'ぴょんぴーの大冒険、':'Pyonpy’s Big Adventure', 'あそべます。':'is ready to play.',
    'うばわれた“笑い”を取りもどせ。':'Win back the stolen laughter.', 'ブラウザで無料のアクションゲーム。':'A free action game in your browser.',
    '月あめ平原':'Moon Candy Field',
    '月あめキング':'Moon Candy King',
    'ふわふわ月あめ王国の王さま':'King of the Fluffy Moon Candy Kingdom',
    '「ふわふわ月あめは、ぜんぶぼくの王国だよ！」':'“All the fluffy moon candy is my kingdom!”',
    'あまえんぼうで、よくばり。でも根はやさしい。':'Spoiled and greedy, but kind at heart.',
    '月あめ、おひるね、ほめられること':'Moon candy, naps, being praised',
    '歯みがき、半分こ':'Brushing teeth, sharing half',
    'だじゃれ。くだらないほど笑う。':'Puns. The sillier, the harder he laughs.',
    '火星ネオンコロニー':'Mars Neon Colony',
    'ドーム司令官':'Dome Commander',
    '火星ネオンコロニーの司令官':'Commander of Mars Neon Colony',
    '「笑いなど、ネオンのこやしで十分だ！」':'“Laughter is only good for powering the neon!”',
    'まじめで、がんこ。効率が大好き。':'Serious and stubborn. Loves efficiency.',
    'ネオンの点検、時間どおりの行進、節電':'Neon inspections, marching on time, saving power',
    'ひまな時間、アドリブ':'Free time, ad-libs',
    '笑わないつもりだが、不意打ちに弱い。':'Means not to laugh, but a surprise gets him.',
    'クリスタル氷星':'Crystal Ice Planet',
    'クリスタルイエティ':'Crystal Yeti',
    'クリスタル氷星の守り神':'Guardian of the Crystal Ice Planet',
    '「きみも、キラキラに固めてあげる。」':'“I’ll freeze you into something sparkly, too.”',
    '無口で、はずかしがりや。':'Quiet and shy.',
    'きらきらしたもの、しずかな夜、かき氷':'Sparkly things, quiet nights, shaved ice',
    'あつい場所、大きな音':'Hot places, loud noises',
    'こらえているうちに、顔がゆるんでしまう。':'Tries to hold it in, and the face gives way.',
    '星の海':'Star Ocean',
    'マンタクイーン':'Manta Queen',
    '星の海の女王':'Queen of the Star Ocean',
    '「泡にして、しずめてあげるわ。」':'“I’ll turn you to bubbles and sink you.”',
    '気品があって、おっとり。じつは、さみしがりや。':'Graceful and easy-going. Secretly lonely.',
    '真珠、泡の音楽、お客さま':'Pearls, bubble music, guests',
    'かわいた場所、いそがされること':'Dry places, being hurried',
    '泡といっしょに、ぷくぷく笑いがこみあげる。':'Laughter bubbles up along with the bubbles.',
    'リングメカ工場':'Ring Mecha Factory',
    'ロボットキング':'Robot King',
    'リングメカ工場の工場長':'Head of the Ring Mecha Factory',
    '「ワライ、フヨウ。ハグルマニ マキコマレナ！」':'“LAUGHTER: NOT REQUIRED. GET CAUGHT IN THE GEARS!”',
    '計算どおりが大好き。「笑い」のデータを持っていなかった。':'Loves it when things go to plan. Had no data on “laughter”.',
    '歯車、定時、アップデート':'Gears, clocking off on time, updates',
    '水、想定外':'Water, the unexpected',
    'インストール後は、定時になると笑う。':'Once installed, laughs right on schedule.',
    '魔王星':'Demon Star',
    '魔王スターオーバーロード':'Star Overlord',
    '魔王星の大魔王':'Great Demon Lord of the Demon Star',
    '「笑いなど、宇宙から消えてしまえばよいのだ！」':'“Let laughter vanish from the universe!”',
    'いばっているが、じつはとても傷つきやすい。':'Acts mighty, but is easily hurt.',
    'ひとりの夜、こっそり書いているネタ帳':'Nights alone, a secret notebook of jokes',
    'しーんとした空気、スベること':'Dead silence, a joke falling flat',
    'くだらないだじゃれ。':'Silly puns.',
    'ムーンゼリー':'Moon Jelly',
    '「ぷるっ？　それ、ちょうだい！」':'“Wobble? Gimme that!”',
    '好奇心いっぱい。動くものを見ると追いかけてしまう。':'Full of curiosity. Chases anything that moves.',
    'サボテンドーム':'Cactus Dome',
    '「止まれー！　ここは火星ドームだぞ！」':'“Halt! This is the Mars Dome!”',
    '短気だけど、すぐ忘れる。司令官にあこがれている。':'Short-tempered, but forgets fast. Looks up to the Commander.',
    'クリスタルフラッフ':'Crystal Fluff',
    '「つるつるーっ！　つかまえてみな！」':'“Whee, slippery! Catch me if you can!”',
    'すばしっこくて、いたずら好き。すべる氷の上が大得意。':'Quick and mischievous. Right at home on slippery ice.',
    'マンタっこ':'Baby Manta',
    '「ぷくぷく〜、あそぼ〜！」':'“Blub blub, let’s play!”',
    '人なつっこい。あそんでいるつもりで、ついてくる。':'Friendly. Follows you around, thinking it’s a game.',
    'メカボット':'Mecha Bot',
    '「シンニュウシャ、ハッケン。ピピッ。」':'“INTRUDER DETECTED. BEEP BEEP.”',
    'まじめな働きもの。たまにフリーズする。':'A hard worker. Freezes up now and then.',
    'デモインプ':'Demon Imp',
    '「へへーん、魔王さまに言いつけるぞ！」':'“Heh heh, I’m telling the Demon Lord!”',
    'なまいきだけど、こわがり。魔王のネタ帳をこっそり読んでいる。':'Cheeky but easily scared. Secretly reads the Demon Lord’s joke notebook.',
    '性格':'Personality',
    '好きなもの':'Likes',
    'にがてなもの':'Dislikes',
    '笑いのツボ':'What makes them laugh',
    'くわしく見る':'More',
    'すみか':'Home',
    '6つの星の、':'The folk of',
    '住人たち':'the six planets',
    '行く手をはばむ、ちいさな敵たち。':'The little foes who stand in your way.',
    '上からふむと、ピヨります。':'Stomp them from above and they go dizzy.',
    'からくり日記':'Build log', 'ホーム':'Home', 'ページ':'Pages', '6つの星':'6 planets', '全35ステージ':'35 stages', 'キャラクターとあそびかたを見る ↗':'See the characters and how to play ↗',
    'プレイ動画。押すとゲームがはじまります':'Gameplay movie. Press to start the game.', '▶ いますぐあそぶ':'▶ Play now',
    'ムーニアンズ 制作ラボ｜からくりと電子工作の記録':'Moonians Lab | Build logs of puppets and electronics',
    'ムーニアンズの制作ラボ。翻訳酸素カプセル01と、からくりぴょんぴーができるまでの記録。':'The Moonians Lab: build logs of Translation Oxygen Capsule 01 and Karakuri Pyonpy.',
    'ムーニアンズ 制作ラボ':'Moonians Lab',
    'ムーニアンズ':'Moonians',
    '制作ラボ。':'Lab.',
    '月の道具を、地球の工具でつくる。':'Making Moon gear with Earth tools.',
    'からくり、電子工作、3Dプリント。つくっている途中を、そのまま記録しています。':'Puppets, electronics, 3D printing. Recorded as it happens, work in progress and all.',
    '翻訳酸素カプセル01':'Translation Oxygen Capsule 01',
    '基板を、ぴったり収める。':'Fitting the boards.',
    'カプセルの中に基板を合わせていく。削って、やすって、もっと密着。':'Fitting the circuit boards inside the capsule. Grind, sand, and get it closer.',
    '横幅は完璧。上を削って、もっと密着。':'Width: perfect. Shave the top for a tighter fit.',
    '便利な代償に、めちゃうるさい。':'The price of convenience: it’s really loud.',
    'やすりすり。':'Sanding, sanding.',
    'よき！':'Nice!',
    'ぴったし。今日はここまで。':'A perfect fit. That’s it for today.',
    'スピーカーと、光るところ。':'Speakers, and the parts that glow.',
    '声が出るスピーカーと、音に合わせて光るLEDを仕込む。':'Installing the speaker for the voice and the LEDs that light up with the sound.',
    '音に合わせて、ココとココとココが光る（うまくいけば）。':'These spots light up with the sound (if all goes well).',
    'スピーカー部分の完成が見えて来た。':'The speaker section is taking shape.',
    'すぽっとはめる。隙間はパテでどーにかなる。':'Pops right in. Putty will take care of the gaps.',
    'ここに↑':'Right here ↑',
    'ここにLED入ってます。':'The LEDs go in here.',
    '芸術家モード。':'Artist mode.',
    'パーツのかたちを、手でつくりこむ。':'Shaping the parts by hand.',
    '今から芸術家モードなので返信できません。急用はお電話で。':'Entering artist mode. Can’t reply. Call if it’s urgent.',
    'ええ感じなった。':'Looking good.',
    'かわええのでけた。':'Made a cute one.',
    '配線と、テスト。':'Wiring and testing.',
    '絶縁して、色を塗って、音と光を確かめる。':'Insulate, paint, then check the sound and light.',
    'ここに絶縁体つけて、染めQで色塗り。':'Insulation goes here, then a coat of spray dye.',
    '液体絶縁チューブ持ってるホスト、この世で俺だけ説。':'Theory: I’m the only host in the world carrying liquid electrical tape.',
    'Bluetooth音響＆LED、テスト合格。':'Bluetooth audio and LEDs: test passed.',
    'LEDの付いた緑の基板を、カプセルの前で手に持っている写真':'A hand holding a green LED board in front of the capsule',
    '翻訳酸素カプセル':'Translation Oxygen Capsule',
    'ぴょんぴーのムーニアン語を、地球の言葉へ。':'Turning Pyonpy’s Moonian into Earth’s words.',
    'ヤナビスの声が出る、あのカプセルを作っています。':'We’re building the capsule that Yanabisu’s voice comes from.',
    'Bluetooth音響 ＋ 音に合わせて光るLED':'Bluetooth audio + sound-reactive LEDs',
    'つづきを、制作中。':'More in progress.',
    'まだ続きがあります。できたら、ここに足していきます。':'There is more to come. New clips will be added here.',
    '制作ラボ、':'The Lab is',
    'ただいま稼働中。':'up and running.',
    '翻訳酸素カプセルと、からくりぴょんぴー。':'The translation capsule and Karakuri Pyonpy.',
    'できるまでの記録を、少しずつ。':'Follow the build, bit by bit.',
    '制作ラボ':'Lab',
    '白い樹脂で囲ったスピーカーとLEDを、横から見た写真':'A side view of the speaker and LEDs, framed in white resin',
    '荒い手作り感。カバー被せるからいーの。':'Rough and handmade. It’s fine, a cover goes over it.',
    '雑！':'Sloppy!',
    '同じ物を作る作業、刺激なくて嫌。':'Making the same thing twice. No thrill. Not a fan.',
    '両耳完成。あとは配線つないで、あれしてこれして。':'Both ears done. Now to hook up the wiring, and this, and that.',
    '今日はここまで。準備して仕事行きます。':'That’s it for today. Getting ready for work.',
    '長さ足りんくて諦めかけて、でも繋げた。':'The wire was too short. Nearly gave up. Connected it anyway.',
    'LEDテスト2。完璧やん。':'LED test 2. Perfect.',
    '24h駆動可の最強バッテリーと最強スピーカーで、音の問題解決。':'A battery good for 24 hours and a mighty speaker: sound problem solved.',
    '耳のカバーを、縫う。':'Sewing the ear covers.',
    'あとは耳のカバーさえ作れば完成。型紙を切って、ミシンで縫う。':'Only the ear covers are left. Cut the pattern, then sew it on the machine.',
    '後は耳のカバーさえ作れば完成。':'Just the ear covers to go, and it’s done.',
    '何ができるかな。':'What will this turn into?',
    'らんぴょんカラーで、かわゆい。':'Ranpyon colours. So cute.',
    'ぺたぺた。':'Stick, stick.',
    'えー感じに縫えた。':'Sewn up nicely.',
    '完成した翻訳酸素カプセルと、その横で話すらんぴょんの動画':'A video of the finished Translation Oxygen Capsule, with Ranpyon talking beside it',
    '完成':'Complete',
    'これが、':'This is',
    '完成形。':'the finished one.',
    'ぴょんぴーは、地球の言葉が話せなかった。だから、かわりにこの翻訳機をつくった。':'Pyonpy couldn’t speak Earth’s languages. So we built this translator instead.',
    'ぴょんぴーがこの中に入れば、地球のみんなと会話ができる。カプセルから聞こえる声は、人工知能ヤナビス。':'With Pyonpy inside, he can talk with everyone on Earth. The voice from the capsule is the AI, Yanabisu.',
    '「地球の空気、ホンマまずいわ」':'“Earth’s air really tastes awful.”',
    '約15秒 ／ 音声あり':'About 15 sec / with sound',
    'ヤナビスの声が出る、あのカプセルをつくりました。':'We built the capsule that Yanabisu’s voice comes from.',
    '記録は、まだつづく。':'The log goes on.',
    '完成までの記録には、まだ続きがあります。ここに足していきます。':'There is more of the build to show. It will be added here.',
    'まずは、デザインから。':'Design comes first.',
    'R-1予選に向けて、02を設計。画面の中に、ぴょんぴーが映る。':'Designing 02 for the R-1 preliminaries. Pyonpy appears on the screen inside.',
    'R-1予選に向けて、翻訳酸素カプセル02、製作中。':'Building Translation Oxygen Capsule 02 for the R-1 preliminaries.',
    '画面の中のぴょんぴーと三日月大使館のロゴが入った、カプセル02のデザイン画':'The design for Capsule 02, with Pyonpy on the screen and the Crescent Embassy logo',
    'デザイン完成。':'Design complete.',
    'まずは紙で。':'Paper first.',
    '画面を、取り付ける。':'Mounting the screen.',
    '本体に穴を開けて、取り外せる金具でモニターを固定する。':'Drilling the body and fixing the monitor with a removable mount.',
    '取り外し式。':'Removable.',
    'くるくる。':'Twist, twist.',
    'ガーガー。':'Whirr, whirr.',
    'ネジネジ。':'Screw, screw.',
    'ぎゅっぎゅ。':'Tighten, tighten.',
    '電飾ピカピカ。':'Lights, flashing.',
    '窓のまわりに電飾を貼り、ホースを通し、ロゴを切り出す。':'Lights around the window, hoses fitted, logos cut out.',
    '貼り貼り。':'Stick, stick.',
    'ぶうぉーぶうぉー。':'Whoosh, whoosh.',
    'ぐいぐい。':'Push, push.',
    'ギリギリまで作業する猛者。':'Working right up to the wire.',
    'そして、本番へ。':'And then, showtime.',
    '徹夜で仕上げて、2時間後にはR-1予選の舞台。':'Finished after an all-nighter, on the R-1 preliminary stage two hours later.',
    '徹夜で仕上げた。2時間後にはR-1予選。':'Finished it overnight. R-1 preliminaries in two hours.',
    'R-1グランプリ2022の予選の舞台。机の上のカプセル02と、その横に立つらんぴょん':'The R-1 Grand Prix 2022 preliminary stage, with Capsule 02 on a desk and Ranpyon standing beside it',
    'R-1予選、無事終わったー。緊張したけど楽しかった。':'R-1 preliminaries: done! Nervous, but it was fun.',
    '01から、さらに進化。':'A step up from 01.',
    '後ろのお客さんにも、見やすく、聞こえやすく。':'Easier to see and hear, even from the back row.',
    '大きく、':'Bigger,',
    'もっと聞こえる。':'and louder.',
    '翻訳酸素カプセルは、02でさらに進化しました。サイズが大きくなり、音量も大きくなりました。':'The Translation Oxygen Capsule evolved again with 02. It got bigger, and it got louder.',
    '後ろの席のお客さんにも、ぴょんぴーが見やすく、声が聞こえやすくなっています。':'Even from the back seats, Pyonpy is easier to see and easier to hear.',
    '大型化 ＋ 音量アップ':'Larger body + more volume',
    'R-1グランプリ2022 予選':'R-1 Grand Prix 2022 preliminaries',
    '翻訳酸素カプセル02':'Translation Oxygen Capsule 02',
    'ぴょんぴーの大冒険のタイトルロゴと、月面を跳ぶぴょんぴー':'The Pyonpy’s Big Adventure title logo, with Pyonpy leaping over the Moon',
    '宇宙に浮かぶラーメン屋台の宇宙船':'A ramen-stall spaceship floating in space', '3Dアニメ劇場':'3D Anime Theater'
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
