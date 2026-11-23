export type Language = "ja" | "en";
export const guidePhotos = {
  "key-box-location": { width: 840, height: 572, ja: "レクサスの左後輪と、その後ろのフェンス下部にある黒いキーボックス", en: "Rear left wheel of the Lexus and the black key box low on the fence behind it" },
  "parking-position": { width: 586, height: 687, ja: "左前方から見た18番区画。車体の左側が白線に沿い、フロントバンパーが手前の白線の内側に収まっている", en: "Space 18 seen from the front left, with the car alongside the left line and its nose inside the front line" },
  "key-box": { width: 310, height: 595, ja: "Populifeキーボックス正面のテンキー", en: "Keypad on the front of the Populife key box" },
  "key-pouch": { width: 217, height: 443, ja: "開いたキーボックスに電波遮断ポーチを収めた状態", en: "Signal-blocking pouch placed inside the open key box" },
  "luggage-cover": { width: 635, height: 682, ja: "トランク内を仕切るラゲージカバーと端の取り付け部", en: "Luggage cover across the boot and its mounting point" },
  "roof-switch": { width: 493, height: 355, ja: "運転席右側のルーフスイッチ。上にCLOSE、下にOPENの表示", en: "Roof switch to the right of the steering wheel, marked CLOSE above and OPEN below" },
  "aux-receiver": { width: 720, height: 751, ja: "センターコンソール内でケーブルにつながった黒いANKERレシーバー", en: "Black ANKER receiver connected by cable inside the centre console" },
  "full-gauge": { width: 312, height: 233, ja: "速度計の下にある燃料計。針が右端のFを指している", en: "Fuel gauge below the speedometer with the needle at F on the right" },
  "premium-receipt": { width: 284, height: 56, ja: "給油レシートの油種欄に印字された「ENEOSハイオク」", en: "Fuel receipt showing ENEOS ハイオク, meaning premium petrol" },
} as const;

type Topic = {
  slug: string;
  icon: string;
  title: string;
  summary: string;
  pickupMethods?: [string, string][];
  steps: [string, string, (keyof typeof guidePhotos)[]?][];
  note?: string;
  checklist?: string[];
};

export const topics: Record<Language, Topic[]> = {
  ja: [
    {
      slug: "pickup", icon: "mdi:key-outline", title: "車を受け取る",
      summary: "受け取り方法は予約チャットでお知らせします。オーナーが東京に不在のときはリモートで対応します。",
      pickupMethods: [
        ["対面で受け取る場合", "到着したら、ご自身で鍵を取り出して車を開け、DriveShareアプリで前・後ろ・左・右の4方向を撮影してください。撮影が終わったらオーナーに連絡し、対面またはビデオ通話で、オーナーが運転する方全員の顔と免許証原本の写真を照合します。"],
        ["リモートで受け取る場合", "予約後、オーナーがDriveShareの予約チャットにLINEリンクを送ります。WhatsAppをご希望の場合はチャットでお知らせください。事前または当日の鍵の受け取り前にビデオ通話を行い、運転する方全員の顔と免許証原本の写真を照合します。確認後に暗証番号を受け取り、現地で鍵を取り出して車を開け、DriveShareアプリで車の前後左右を撮影してください。"]
      ],
      steps: [
        ["18番区画のキーボックスを見つける", "レクサスの左側（助手席側）を後輪まで進んでください。左後輪の後ろ、フェンスの下のほうに黒いキーボックスがあります。", ["key-box-location"]],
        ["鍵だけを取り出して車を開ける", "予約チャットで案内された暗証番号でキーボックスを開けます。鍵をポーチから出し、空のポーチはボックスの中に戻してください。ボックスを閉じてロックを確かめ、鍵で車を開けます。", ["key-box", "key-pouch"]],
        ["DriveShareで車の前後左右を撮影する", "18番区画では、後部を撮影するスペースを作るため、周囲の安全を確認して車をゆっくり少し前に出してください。完全に停車し、シフトをPに入れて駐車ブレーキをかけてから車を降ります。DriveShareアプリの案内に沿って、車の前・後ろ・左・右を1枚ずつ撮影してください。対面受け取りの方は、4枚を撮り終えたらオーナーに連絡して本人確認を受けてください。"],
        ["「保険適用中」を確認して出発する", "車の前後左右の撮影と、オーナーによる運転者全員の免許証確認が両方終わったら、DriveShareアプリを開いてください。ステータスが「保険適用中」に変わったことを確認してから出発してください。"]
      ]
    },
    {
      slug: "roof", icon: "mdi:car-convertible", title: "屋根を開ける・閉める",
      summary: "操作前に周囲を確認し、メーターの完了表示までスイッチを保持します。",
      steps: [
        ["平らで上と後ろが広い場所に停める", "完全に停車し、シフトをPに入れて駐車ブレーキをかけます。屋根とトランクが動く範囲に壁・天井・人がいないことを確認し、同乗者にも手を車内に入れてもらいます。"],
        ["トランクを確認する", "ラゲージカバーを所定の位置に固定します。カバーの上や屋根の収納スペースに荷物がないことを確認し、トランクをしっかり閉めます。", ["luggage-cover"]],
        ["開けるとき", "エンジンをかけた状態で、運転席右側のルーフスイッチのOPEN側を押し続けます。メーターに「完了」と表示され、ブザーが鳴ったら手を離します。", ["roof-switch"]],
        ["閉めるとき", "周囲をもう一度確認し、ルーフスイッチのCLOSE側を引き続けます。「完了」の表示とブザーを確認してから手を離します。"]
      ],
      note: "途中で止まったり、完了表示が出なかったりした場合は停車したまま、メーターの表示を予約チャットでオーナーにお知らせください。"
    },
    {
      slug: "bluetooth", icon: "mdi:bluetooth", title: "Bluetoothで音楽を聴く",
      summary: "スマートフォンをセンターコンソール内のANKERレシーバーにつなぎ、車のAUX入力で音楽を聴きます。",
      steps: [
        ["オーディオの音源をAUXにする", "停車中に車のオーディオで「AUX」を選びます。センターコンソール内にある、ANKERと書かれた黒い機器がBluetoothの接続先です。ケーブルはつないだままにしてください。", ["aux-receiver"]],
        ["「Soundsync A3352」を選ぶ", "iPhoneは「設定」→「Bluetooth」、AndroidはBluetoothの設定を開き、機器一覧で「Soundsync A3352」を選びます。表示されないときはレシーバーの電源ボタンを確認してください。赤は電源OFFです。電源を入れて、もう一度機器を検索します。レシーバーの説明書はセンターコンソールの中にあります。"],
        ["音が出ることを確かめる", "スマートフォンで曲を再生し、車のスピーカーから音が出たら音量を調整します。"],
        ["スマートフォンを充電する", "車内にUSB Type-CとLightningの充電ケーブルが各1本あります。スマートフォンの端子に合う方をお使いください。"],
        ["返却時に接続を解除する", "スマートフォンのBluetooth設定でレシーバーとの接続を解除します。"]
      ],
      note: "接続先が分からない場合は、停車したまま予約チャットでオーナーにご連絡ください。音が出ないときは、車の音源がAUXか、スマートフォンがレシーバーに接続されているかを確認してください。"
    },
    {
      slug: "car-wash", icon: "mdi:car-wash", title: "洗車をするとき",
      summary: "ガソリンスタンドなどの洗車機を使えます。普段の汚れなら、600円程度の水洗いコースで十分です。",
      steps: [
        ["右後ろのアンテナを外す", "車体右後ろのアンテナは逆ネジです。手でゆっくり緩めて取り外し、洗車が終わるまで車内に置いてください。"],
        ["洗車機で水洗いする", "屋根と窓を完全に閉め、ドアミラーをたたみ、ワイパーをOFFにしてください。洗車機には車の前から入り、水洗いコースを選びます。"],
        ["洗車後にアンテナを戻す", "走り出す前に、アンテナを右後ろの元の位置に取り付け、ドアミラーを開いてください。"]
      ]
    },
    {
      slug: "smoking", icon: "mdi:smoking", title: "喫煙するとき",
      summary: "車内で喫煙するときは、必ず外気導入にして、窓を少し開けてください。",
      steps: [
        ["外気導入を確認する", "吸い始める前に、エアコンが「外気導入」になっていることを確認してください。「内気循環」になっていたら、「外気導入」に切り替えます。"],
        ["窓を少し開ける", "吸い始める前に窓を少し開け、喫煙中はそのままにしてください。"]
      ]
    },
    {
      slug: "return", icon: "mdi:parking", title: "車を返す",
      summary: "ハイオク満タン、鍵の返却、写真3枚の送信で完了です。",
      steps: [
        ["ハイオクで満タンにする", "給油したら「ハイオク」の表記が読めるようにレシートを撮影します。停車中に、燃料計が満タンを示す写真も撮ります。", ["premium-receipt", "full-gauge"]],
        ["左の白線に沿って18番区画にバックで停める", "車体の左側面を左の白線に沿わせます。区画に合わせると少し斜めに見えます。後方を確認し、後輪がブロックの輪止めにそっと触れるまでゆっくり下がってください。降車後、前端が手前の白線から出ておらず、後端も含めて車全体が枠内に収まっていることを確認します。", ["parking-position"]],
        ["降車前に車内を確認する", "屋根と窓を閉め、スマートフォンのBluetooth接続を解除します。忘れ物を確認してエンジンを切り、車両状態をDriveShareアプリの返却手順で記録してください。"],
        ["車を施錠して鍵を戻す", "車を施錠し、キーボックスを開けます。中に置いてある電波遮断ポーチに鍵を入れ、ボックスに戻してください。戻した状態を写真に撮り、ボックスを閉じてロックを確認します。暗証番号が写真に写り込まないようご注意ください。", ["key-pouch"]],
        ["予約チャットで返却を知らせる", "下の写真3枚をDriveShareの予約チャットに添付し、「返却しました」と送信してください。"]
      ],
      checklist: ["満タンの燃料計", "「ハイオク」の表記が読める給油レシート", "鍵入りのポーチをボックスに戻した状態"]
    }
  ],
  en: [
    {
      slug: "pickup", icon: "mdi:key-outline", title: "Pick up the car",
      summary: "Your booking chat will tell you which pickup method to use. When the owner is away from Tokyo, pickup is remote.",
      pickupMethods: [
        ["In-person pickup", "On arrival, collect the key yourself, unlock the car and use the DriveShare app to photograph the front, back, left side and right side. Once the photos are done, contact the owner. Meet in person or by video so the owner can match each driver’s face to the photo on their original driving licence."],
        ["Remote pickup", "After booking, the owner sends a LINE link in your DriveShare chat. Ask there if you prefer WhatsApp. Join a video call in advance or on pickup day before collecting the key. Have each driver’s original licence ready for the face check. After verification, you receive the code. Collect the key, unlock the car and take all four photos in the DriveShare app."]
      ],
      steps: [
        ["Find the key box at space 18", "Walk along the left (passenger) side of the Lexus to the rear wheel. Look low on the fence just behind that wheel for the black key box.", ["key-box-location"]],
        ["Take the key and leave the pouch in the box", "Open the box with the code from your booking chat. Remove the key from the pouch and put the empty pouch back inside the box. Close the box, check that it is locked and use the key to unlock the car.", ["key-box", "key-pouch"]],
        ["Photograph all four sides in DriveShare", "In space 18, you need to pull forward a little to make room to photograph the rear. Check that the area is clear, then ease the car forward. Stop fully, shift into P and apply the parking brake before getting out. Follow the prompts in the DriveShare app to take one photo of each side: front, rear, left and right. For in-person pickup, contact the owner for the licence check once you have taken all four photos."],
        ["Check the insurance status before setting off", "Once you have taken all four photos and the owner has checked every driver’s licence, check the status in the DriveShare app. Wait until it shows 「保険適用中」 (insurance active) before leaving the car park."]
      ]
    },
    {
      slug: "roof", icon: "mdi:car-convertible", title: "Open or close the roof",
      summary: "Check the clearance, then hold the roof switch until the car signals completion.",
      steps: [
        ["Park on level ground", "Stop completely, select P and apply the parking brake. Leave clearance above and behind the car. Check for walls, ceilings and people, and ask passengers to keep their hands inside."],
        ["Check the luggage compartment", "Secure the luggage cover in its designated position. Clear the top of the cover and the roof storage area, then close the boot fully.", ["luggage-cover"]],
        ["To open", "With the engine running, press and hold the OPEN side of the roof switch to the right of the steering wheel. Release it when the instrument display reads 完了 (complete) and you hear the beep.", ["roof-switch"]],
        ["To close", "Check the clearance again. Pull and hold the CLOSE side of the switch. Wait for the completion message and beep before releasing it."]
      ],
      note: "If the roof stops partway or the completion message does not appear, stay parked. Tell the owner what the instrument display says in your booking chat."
    },
    {
      slug: "bluetooth", icon: "mdi:bluetooth", title: "Play music via Bluetooth",
      summary: "Pair your phone with the ANKER receiver in the centre console and play music through the AUX input.",
      steps: [
        ["Select AUX on the car stereo", "While parked, select AUX as the audio source. Look inside the centre console for the black receiver marked ANKER. Leave its cables connected.", ["aux-receiver"]],
        ["Select Soundsync A3352", "On iPhone, open Settings → Bluetooth. On Android, open Bluetooth settings. Select Soundsync A3352. If it does not appear, check the receiver’s power button. Red means the receiver is off. Turn it on and search again on your phone. The receiver manual is inside the centre console."],
        ["Check the sound", "Play a track on your phone. When you hear it through the car speakers, adjust the volume."],
        ["Charge your phone", "The car has two charging cables, one USB-C and one Lightning. Use the one that fits your phone."],
        ["Disconnect before return", "Open Bluetooth settings on your phone and disconnect from the receiver."]
      ],
      note: "If you are unsure which device to select, stay parked and contact the owner in your booking chat. If there is no sound, check that the stereo is set to AUX and your phone is connected to the receiver."
    },
    {
      slug: "car-wash", icon: "mdi:car-wash", title: "Wash the car",
      summary: "You can use an automatic car wash at a petrol station. A basic water-only wash (水洗い), around ¥600, is enough for everyday dirt.",
      steps: [
        ["Remove the rear-right antenna", "The antenna at the rear right of the car has a reverse thread. Gently unscrew it by hand and leave it inside the car during the wash."],
        ["Use the water-only wash", "Close the roof and windows fully, fold in the door mirrors and switch the wipers off. Enter the car wash front first and select the water-only programme."],
        ["Refit the antenna after the wash", "Before driving away, screw the antenna back into its mount at the rear right and unfold the door mirrors."]
      ]
    },
    {
      slug: "smoking", icon: "mdi:smoking", title: "Smoking in the car",
      summary: "If you smoke in the car, always use fresh-air mode and keep a window slightly open.",
      steps: [
        ["Check the fresh-air setting", "Before lighting up, check the climate controls. If recirculation (内気循環) is on, switch to fresh-air mode (外気導入)."],
        ["Open a window slightly", "Open a window a little before lighting up and leave it open while you smoke."]
      ]
    },
    {
      slug: "return", icon: "mdi:parking", title: "Return the car",
      summary: "Fill up with premium petrol, return the key and send three photos.",
      steps: [
        ["Fill the tank with premium petrol", "Photograph the receipt with the fuel grade ハイオク (premium) clearly visible. While parked, take a photo of the fuel gauge showing full.", ["premium-receipt", "full-gauge"]],
        ["Reverse into space 18 along the left white line", "Align the left side of the car with the left white line. The car will look slightly angled. Check behind you and reverse slowly until the rear tyres gently touch the concrete wheel stop. Once out of the car, check that the nose is inside the front white line and the entire car, including the rear, is inside the bay.", ["parking-position"]],
        ["Check the cabin before leaving", "Close the roof and windows, disconnect your phone, check for belongings and switch off the engine. Record the condition of the car in the DriveShare app."],
        ["Lock the car and return the key", "Get out and lock the car. Open the key box, put the key into the signal-blocking pouch stored inside, then put the pouch back in the box. Photograph it in place, keeping the access code out of the picture. Close the box and check that it is locked.", ["key-pouch"]],
        ["Confirm the return", "Attach the three photos below in your DriveShare booking chat and send a message saying you have returned the car."]
      ],
      checklist: ["Fuel gauge showing full", "Receipt showing ハイオク (premium petrol)", "Pouch containing the key back in the key box"]
    }
  ]
};
