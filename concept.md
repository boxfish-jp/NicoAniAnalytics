# ニコ動の再生数 (1月1日のリリースまではこっちのみ)
# ニコ生の来場者数とタイムシフト予約数を取得

# やること
2023-autumnコレクションのドキュメントにアニメを登録しまくる方式に変更。

## 現在
スクレイピング部とAPI部を完全に分離する途中。
channelURLは2023-autumn-ChListコレクションのドキュメントIDから取得することに、
そこから、channelURLを使って、スクレイピングするが、このとき動画urlに重複があるので、はじく必要がある。
また、この動画urlは2023-autumn-ChListに格納する。

すでにDBに習得済みの動画は、追加しない。

## 1230夜やること

チャンネルのurlを取得するコードのリファクタリング。
スクレイピング時の負荷軽減のため、インターバルを設定。
> 上記2つで ChListのDBは完成。
firestoreのルールを設定。


2023-autumnのDBを作成。

## 仕様
https://anime.nicovideo.jp/period/now.html?from=nanime_header

↓

各項目に対して
- タイトル: <h2 class="gDySc">悪役令嬢レベル99～私は裏ボスですが魔王ではありません～</h2>
- 画像: <div class="_3ke9H"><img src="/assets/images/detail/akuyakulv99-anime_S.jpg" alt="悪役令嬢レベル99～私は裏ボスですが魔王ではありません～" width="300" height="168" loading="lazy"></div>
> 画像のurlの末尾のSをLに変えると大きい画像が取得できる。

- チャンネルの有無: <div class="J9hxP"><!----></div>
> チャンネルがある場合は上記のdivに中身がある。

- チャンネルurl: <a href="/detail/ishura-anime/index.html?from=nanime_2024-winter_list" class="_2R1vQ">
> detail/{chennelId}/index.html

- 概要: <p class="_bV14">くるよ、不運が。いいね！最高だ！！触れた人々に不幸な事故をもたらす不運“アンラック”な少女・風子。その特異な体質から一度は死を覚悟した風子の前に、絶対に死ねない不死の体を持つ“アンデッド”のアンディが現れる。
彼は風子の力で“本当の死”を得るため、彼女と行動を共にすることに。しかし、アンディと風子のような異能の力を持つ【否定者】を狙う謎の組織“ユニオン”が2人の前に現れる。これは、二人が最高の死を見つけるお話。</p>

チャンネルのリンク
https://ch.nicovideo.jp/ichigoproduction/video

チャンネルのurl: 引数から取得

動画Idとサムネ: <a href="https://www.nicovideo.jp/watch/so42407832" class="thumb_video thumb_150 wide"><img src="https://nicovideo.cdn.nimg.jp/thumbnails/42407832/42407832.26646123"><span class="purchase_type" title=""><span class="inner ppv all_pay"></span></span><span class="badge last_res" title="ドロドロになれそう ワシも王貞治と同じ年 ぐぬぬ ヒエッ おまえやー チョロイン チョロくて草 デレた いい笑顔 ラスト見納めや2023/0 23:42グッバイ 厄介オタの資質しか感 今日は歩いて帰るしん 本当に最高の...">ドロドロになれそう ワシも王貞治と同じ年 ぐぬぬ ヒエッ おまえやー チョロイン チョロくて草 デレた いい笑顔 ラスト見納めや2023/0 23:42グッバイ 厄介オタの資質しか感 今日は歩いて帰るしん 本当に最高の...</span><span class="badge br length" title="23:09">23:09</span></a>


description, postDate, update, title, viewer, mylist,comment
<div class="item_right">
    <h6 class="title">
        <a href="https://www.nicovideo.jp/watch/so42407832" title="【推しの子】 第11話「アイドル」">【推しの子】 第11話「アイドル」</a>
    </h6>
    <ul class="counts">
        <li class="view ">
            <label>再生</label>
            <var>293,243</var>
        </li>
        <li class="comment ">
            <label>コメント</label>
            <var>34,154</var>
        </li>
        <li class="mylist ">
            <label>マイリスト</label>
            <a href="https://www.nicovideo.jp/openlist/so42407832" target="_blank" title="この動画を登録している公開マイリスト一覧"><var>225</var></a>
        </li>
    </ul>
    <p class="description">
        ついにステージに立ったB小町。MEMちょ目当ての客が詰めかける中、ルビーは亡きアイを思わせる笑顔で観客を魅了する。だが、かなを応援するサイリウムの光は...
    </p>
    <p class="time">
        <time>
            <var title="2023/06/29 23:00">
            2023-06-29 23:00
            </var>
        </time>
    </p>
</div>