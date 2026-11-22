export type Language = "ja" | "en";
type Topic = {
  slug: string;
  icon: string;
  title: string;
  summary: string;
  steps: [string, string][];
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
        ["鍵を受け取る", "確認後、受け取り場所と暗証番号が予約チャットに届きます。現地でPopulifeのキーボックスを開け、ポーチごと鍵を取り出してボックスを閉めます。"],
        ["出発の準備をする", "鍵を電波遮断ポーチから出して車を解錠します。ポーチは返却時まで保管してください。DriveShareアプリで出発前の車両状態を確認・記録してから出発します。"]
      ]
    },
    {
      slug: "roof", icon: "mdi:car-convertible", title: "屋根を開ける・閉める",
      summary: "操作前に周囲を確認し、メーターの完了表示までスイッチを保持します。",
      steps: [
        ["平らで上と後ろが広い場所に停める", "完全に停車し、シフトをPに入れて駐車ブレーキをかけます。屋根とトランクが動く範囲に壁・天井・人がいないことを確認し、同乗者にも手を車内に入れてもらいます。"],
        ["トランクを確認する", "ラゲージカバーを所定の位置に固定します。カバーの上や屋根の収納スペースに荷物がないことを確認し、トランクをしっかり閉めます。"],
        ["開けるとき", "エンジンをかけた状態で、ルーフスイッチのOPEN側を押し続けます。メーターに「完了」と表示され、ブザーが鳴ったら手を離します。"],
        ["閉めるとき", "周囲をもう一度確認し、ルーフスイッチのCLOSE側を引き続けます。「完了」の表示とブザーを確認してから手を離します。"]
      ],
      note: "途中で止まったり、完了表示が出なかったりした場合は停車したまま、メーターの表示を予約チャットでオーナーにお知らせください。"
    },
    {
      slug: "bluetooth", icon: "mdi:bluetooth", title: "Bluetoothで音楽を聴く",
      summary: "停車中にスマートフォンと車のオーディオを接続します。",
      steps: [
        ["車を登録待ちにする", "停車中にナビのオーディオ設定を開き、Bluetoothオーディオ機器を追加する項目を選びます。"],
        ["スマートフォンで車を選ぶ", "iPhoneは「設定」→「Bluetooth」。Androidは「設定」→「接続済みのデバイス」などから新しい機器を探します。車載画面に表示された機器名と同じものを選びます。"],
        ["接続して音楽を流す", "確認コードが表示されたら両方の画面を照合し、登録を承認します。車の音源をBluetoothオーディオに切り替え、スマートフォンで曲を再生します。連絡先の共有は不要です。"],
        ["返却前に自分の登録を削除する", "車側で自分のスマートフォンの登録を削除します。スマートフォン側でもこの車の登録を解除できます。他の利用者の機器はそのままにしてください。"]
      ],
      note: "機器名が見つからない場合や登録がいっぱいの場合は、停車したままナビに表示された内容を予約チャットでお知らせください。"
    },
    {
      slug: "return", icon: "mdi:parking", title: "車を返す",
      summary: "ハイオク満タン、鍵の返却、写真3枚の送信で完了です。",
      steps: [
        ["ハイオクで満タンにする", "給油したら「ハイオク」の表記が読めるようにレシートを撮影します。停車中に、燃料計が満タンを示す写真も撮ります。"],
        ["指定の場所に駐車する", "予約チャットに記載の区画に停め、屋根と窓を閉めます。Bluetoothの自分の登録と忘れ物を確認し、エンジンを切ります。車両状態はDriveShareアプリの返却手順で記録します。"],
        ["車を施錠して鍵を戻す", "車から降りて施錠し、鍵を電波遮断ポーチに入れてキーボックスに戻します。戻した状態を写真に撮り、ボックスを閉じてロックを確認します。暗証番号が写真に写り込まないようご注意ください。"],
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
        ["Collect the key", "After the call, check your booking chat for the pickup location and access code. Open the Populife key box, take out the pouch containing the key and close the box."],
        ["Get ready to drive", "Remove the key from its signal-blocking pouch to unlock the car. Keep the pouch for your return. Record the condition of the car in the DriveShare app before setting off."]
      ]
    },
    {
      slug: "roof", icon: "mdi:car-convertible", title: "Open or close the roof",
      summary: "Check the clearance, then hold the roof switch until the car signals completion.",
      steps: [
        ["Park on level ground", "Stop completely, select P and apply the parking brake. Leave clearance above and behind the car. Check for walls, ceilings and people, and ask passengers to keep their hands inside."],
        ["Check the luggage compartment", "Secure the luggage cover in its designated position. Clear the top of the cover and the roof storage area, then close the boot fully."],
        ["To open", "With the engine running, press and hold the OPEN side of the roof switch. Release it when the instrument display reads 完了 (complete) and you hear the beep."],
        ["To close", "Check the clearance again. Pull and hold the CLOSE side of the switch. Wait for the completion message and beep before releasing it."]
      ],
      note: "If the roof stops partway or the completion message does not appear, stay parked. Tell the owner what the instrument display says in your booking chat."
    },
    {
      slug: "bluetooth", icon: "mdi:bluetooth", title: "Play music via Bluetooth",
      summary: "Pair your phone with the car audio system while parked.",
      steps: [
        ["Start pairing on the car", "While parked, open the audio settings on the navigation unit and select the option to add a Bluetooth audio device."],
        ["Find the car on your phone", "On iPhone, open Settings → Bluetooth. On Android, open Settings → Connected devices (or similar) and search for a new device. Select the name shown on the car screen."],
        ["Connect and play music", "If a code appears, check that it matches on both screens, then confirm pairing. Select Bluetooth audio as the car’s audio source and play a track on your phone. You can decline contact sharing."],
        ["Remove your pairing before return", "Delete your own phone from the car’s paired devices. You can also forget the car on your phone. Leave other devices as they are."]
      ],
      note: "If you cannot find the device or the list is full, stay parked and tell the owner what you see in the booking chat."
    },
    {
      slug: "return", icon: "mdi:parking", title: "Return the car",
      summary: "Fill up with premium petrol, return the key and send three photos.",
      steps: [
        ["Fill the tank with premium petrol", "Photograph the receipt with the fuel grade ハイオク (premium) clearly visible. While parked, take a photo of the fuel gauge showing full."],
        ["Park in the designated space", "Use the space specified in your booking chat. Close the roof and windows, remove your Bluetooth pairing, check for belongings and switch off the engine. Follow the return condition check in the DriveShare app."],
        ["Lock the car and return the key", "Get out and lock the car. Put the key in the signal-blocking pouch and place it in the key box. Photograph it in place, keeping the access code out of the picture. Close the box and check that it is locked."],
        ["Confirm the return", "Attach the three photos below in your DriveShare booking chat and send a message saying you have returned the car."]
      ],
      checklist: ["Fuel gauge showing full", "Receipt showing ハイオク (premium petrol)", "Pouch containing the key back in the key box"]
    }
  ]
};
