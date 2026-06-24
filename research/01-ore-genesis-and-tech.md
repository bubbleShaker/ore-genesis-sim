# 調査まとめ: 鉱石の成因とシミュレーション技術選定

作成日: 2026-06-25

## 1. 鉱石はどう生まれるか（成因プロセス）

鉱物・鉱石が生まれる物理プロセスは大きく3系統。

### マグマ成因（magmatic）
マグマが冷却する過程で鉱物が**晶出**し、早期結晶が重力で底に沈んで濃集する。
硫化物の液相不混和（liquid immiscibility）で銅・ニッケル・白金が分離・沈降することもある。
- 例: 磁鉄鉱(Fe₃O₄)、クロム鉄鉱、白金族

### 熱水成因（hydrothermal）— 最も一般的
マグマで熱せられた水が金属を溶かして運び、**冷却・pH変化・沸騰・酸化**で析出する。
割れ目に沿って鉱脈（vein）を作る。
- 例: 石英(SiO₂)脈、自然金、黄銅鉱(CuFeS₂)、蛍石(CaF₂)

### 堆積・変成成因
水からの沈殿、または既存鉱物が温度圧力変化で再結晶する。
- 例: 方解石(CaCO₃)、ガーネット、緑柱石

### 物理的核心
いずれも本質は **過飽和 / 過冷却 → 結晶核生成（nucleation） → 結晶成長（growth）**。
成長は結晶構造の対称性に従って異方的になり、**ファセット（平面）**を持つ結晶形になる。

## 2. 計算機での近似手法

| 手法 | 特徴 | 採否 |
|---|---|---|
| Phase-field 法（Allen-Cahn PDE） | 物理的に厳密。界面追跡が要らない | 重い。将来の厳密版で検討 |
| 反応拡散系（Gray-Scott） | 有機的な核生成・成長パターン。GPUと相性◎ | **採用**（教育・視覚用途） |
| 結晶成長セルオートマトン（CA） | 対称性に応じた異方成長・ファセット再現 | **採用**（鉱物ごとの結晶形） |

参考:
- Gibson et al., *Physically Derived Rules for Simulating Faceted Crystal Growth using Cellular Automata* (arXiv:0807.2616)
- Amanda Ghassaei, WebGL Gray-Scott Reaction Diffusion Shader

## 3. 実行形態: ローカル vs Web

| 観点 | ローカル(Python) | Web(ブラウザ+GPU) |
|---|---|---|
| 共有しやすさ | ✗ 環境構築必要 | ◎ URL を開くだけ |
| GPU結晶成長計算 | △ 別途設定 | ◎ ping-pong texture で高速 |
| 厳密PDE数値解 | ◎ 科学ライブラリ豊富 | △ |
| インタラクティブ可視化 | △ | ◎ |

→ 本プロジェクトは「見て・触って理解する」教育用途のため **Web（ブラウザ + WebGL2）** を採用。
GitHub Pages 公開とも相性が良い。WebGPU は将来の高速化余地として残す。

## 4. 対象鉱物（成因の代表3種から開始）

| 鉱物 | 化学式 | 成因 | 結晶系/対称性 | 色 |
|---|---|---|---|---|
| 石英 Quartz | SiO₂ | 熱水 | 六方 | 無色〜白 |
| 磁鉄鉱 Magnetite | Fe₃O₄ | マグマ | 等軸（八面体） | 黒・金属光沢 |
| 方解石 Calcite | CaCO₃ | 堆積・熱水 | 三方（菱面体） | 白〜半透明 |

後続フェーズで黄鉄鉱・自然金・黄銅鉱などへ拡張する。

## 出典
- https://sandatlas.org/hydrothermal-processes/
- https://en.wikipedia.org/wiki/Ore_genesis
- https://arxiv.org/pdf/0807.2616
- https://github.com/amandaghassaei/ReactionDiffusionShader
- https://dl.acm.org/doi/10.1145/3730567.3764504
