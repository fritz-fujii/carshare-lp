export type Language = "ja" | "en";
export const guidePhotos = {
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
  steps: [string, string, (keyof typeof guidePhotos)[]?][];
  note?: string;
  checklist?: string[];
};

export const topics: Record<Language, Topic[]> = {
  ja: [
    {
      slug: "pickup", icon: "mdi:key-outline", title: "車を受け取る",
      summary: "予約チャットでの連絡から、鍵を受け取って出発するまで。",
      steps: [
        ["予約チャットで通話の日時を決める", "予約成立後、オーナーがDriveShareの予約チャットにLINEのリンクを送ります。WhatsAppをご希望の場合は、そのチャットでお知らせください。"],
        ["ビデオ通話で免許証を確認する", "貸出前または当日の鍵の受け取り前に通話します。運転する方全員が免許証の原本を用意し、オーナーとお互いの顔と免許証を画面越しに確認します。"],
        ["鍵を受け取る", "確認後、受け取り場所と暗証番号が予約チャットに届きます。現地でPopulifeのキーボックスを開け、ポーチごと鍵を取り出してボックスを閉めます。", ["key-box"]],
        ["出発の準備をする", "鍵を電波遮断ポーチから出して車を解錠します。ポーチは返却時まで保管してください。DriveShareアプリで出発前の車両状態を確認・記録してから出発します。", ["key-pouch"]]
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
        ["スマートフォンをレシーバーに接続する", "iPhoneは「設定」→「Bluetooth」、Androidは「設定」→「接続済みのデバイス」などを開きます。レシーバーをペアリング待ちにして、スマートフォンでレシーバーの機器名を選びます。"],
        ["音が出ることを確かめる", "スマートフォンで曲を再生し、車のスピーカーから音が出たら音量を調整します。"],
        ["返却時に接続を解除する", "スマートフォンのBluetooth設定でレシーバーとの接続を解除します。"]
      ],
      note: "接続先が分からない場合は、停車したまま予約チャットでオーナーにご連絡ください。音が出ないときは、車の音源がAUXか、スマートフォンがレシーバーに接続されているかを確認してください。"
    },
    {
      slug: "return", icon: "mdi:parking", title: "車を返す",
      summary: "ハイオク満タン、鍵の返却、写真3枚の送信で完了です。",
      steps: [
        ["ハイオクで満タンにする", "給油したら「ハイオク」の表記が読めるようにレシートを撮影します。停車中に、燃料計が満タンを示す写真も撮ります。", ["premium-receipt", "full-gauge"]],
        ["指定の場所に駐車する", "予約チャットに記載の区画に停め、屋根と窓を閉めます。スマートフォンのBluetooth接続を解除し、忘れ物を確認して、エンジンを切ります。車両状態はDriveShareアプリの返却手順で記録します。"],
        ["車を施錠して鍵を戻す", "車から降りて施錠し、鍵を電波遮断ポーチに入れてキーボックスに戻します。戻した状態を写真に撮り、ボックスを閉じてロックを確認します。暗証番号が写真に写り込まないようご注意ください。", ["key-pouch"]],
        ["予約チャットで返却を知らせる", "下の写真3枚をDriveShareの予約チャットに添付し、「返却しました」と送信してください。"]
      ],
      checklist: ["満タンの燃料計", "「ハイオク」の表記が読める給油レシート", "鍵入りのポーチをボックスに戻した状態"]
    }
  ],
  en: [
    {
      slug: "pickup", icon: "mdi:key-outline", title: "Pick up the car",
      summary: "Arrange a video call, collect the key and check the car before setting off.",
      steps: [
        ["Arrange your video call", "After booking, the owner sends you their LINE link in your DriveShare booking chat. If you prefer WhatsApp, tell the owner in that chat."],
        ["Have your original licence ready", "Join the video call before pickup day or on the day before collecting the key. The owner and everyone who will drive, including additional drivers, show each other their faces and original driving licences."],
        ["Collect the key", "After the call, check your booking chat for the pickup location and access code. Open the Populife key box, take out the pouch containing the key and close the box.", ["key-box"]],
        ["Get ready to drive", "Remove the key from its signal-blocking pouch to unlock the car. Keep the pouch for your return. Record the condition of the car in the DriveShare app before setting off.", ["key-pouch"]]
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
        ["Pair your phone with the receiver", "On iPhone, open Settings → Bluetooth. On Android, open Settings → Connected devices or the equivalent menu. Put the receiver in pairing mode and select its device name on your phone."],
        ["Check the sound", "Play a track on your phone. When you hear it through the car speakers, adjust the volume."],
        ["Disconnect before return", "Open Bluetooth settings on your phone and disconnect from the receiver."]
      ],
      note: "If you are unsure which device to select, stay parked and contact the owner in your booking chat. If there is no sound, check that the stereo is set to AUX and your phone is connected to the receiver."
    },
    {
      slug: "return", icon: "mdi:parking", title: "Return the car",
      summary: "Fill up with premium petrol, return the key and send three photos.",
      steps: [
        ["Fill the tank with premium petrol", "Photograph the receipt with the fuel grade ハイオク (premium) clearly visible. While parked, take a photo of the fuel gauge showing full.", ["premium-receipt", "full-gauge"]],
        ["Park in the designated space", "Use the space specified in your booking chat. Close the roof and windows, disconnect your phone from the Bluetooth receiver, check for belongings and switch off the engine. Follow the return condition check in the DriveShare app."],
        ["Lock the car and return the key", "Get out and lock the car. Put the key in the signal-blocking pouch and place it in the key box. Photograph it in place, keeping the access code out of the picture. Close the box and check that it is locked.", ["key-pouch"]],
        ["Confirm the return", "Attach the three photos below in your DriveShare booking chat and send a message saying you have returned the car."]
      ],
      checklist: ["Fuel gauge showing full", "Receipt showing ハイオク (premium petrol)", "Pouch containing the key back in the key box"]
    }
  ]
};
